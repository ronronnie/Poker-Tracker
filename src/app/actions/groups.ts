"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { groups, groupMembers, sessions, profiles } from "@/lib/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

// ── Invite code ────────────────────────────────────────────────────────────────
function generateInviteCode(): string {
  // Avoids visually confusable chars (0/O, 1/I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Create ─────────────────────────────────────────────────────────────────────
export async function createGroup(data: { name: string; description?: string }): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const inviteCode = generateInviteCode();

  const [group] = await db
    .insert(groups)
    .values({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      created_by: userId,
      invite_code: inviteCode,
    })
    .returning({ id: groups.id });

  await db.insert(groupMembers).values({
    group_id: group.id,
    user_id: userId,
    role: "admin",
  });

  revalidatePath("/groups");
  return group.id;
}

// ── Join by invite code ────────────────────────────────────────────────────────
export async function joinGroupByCode(
  inviteCode: string
): Promise<{ groupId: string; alreadyMember: boolean }> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [group] = await db
    .select()
    .from(groups)
    .where(
      and(
        eq(groups.invite_code, inviteCode.toUpperCase().trim()),
        eq(groups.is_active, true)
      )
    )
    .limit(1);

  if (!group) throw new Error("Invalid or expired invite code.");

  const [existing] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.group_id, group.id), eq(groupMembers.user_id, userId)))
    .limit(1);

  if (existing) return { groupId: group.id, alreadyMember: true };

  await db.insert(groupMembers).values({
    group_id: group.id,
    user_id: userId,
    role: "member",
  });

  return { groupId: group.id, alreadyMember: false };
}

// ── Leave group ────────────────────────────────────────────────────────────────
export async function leaveGroup(groupId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const allMembers = await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.group_id, groupId));

  const admins = allMembers.filter((m) => m.role === "admin");
  const isOnlyAdmin = admins.length === 1 && admins[0].user_id === userId;

  if (isOnlyAdmin && allMembers.length > 1) {
    throw new Error("Promote another member to admin before leaving.");
  }

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.group_id, groupId), eq(groupMembers.user_id, userId)));

  // Auto-delete group if last member left
  if (allMembers.length === 1) {
    await db.delete(groups).where(eq(groups.id, groupId));
  }

  revalidatePath("/groups");
}

// ── Remove member (admin only) ─────────────────────────────────────────────────
export async function removeGroupMember(groupId: string, targetUserId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [caller] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.group_id, groupId), eq(groupMembers.user_id, userId)))
    .limit(1);

  if (!caller || caller.role !== "admin") throw new Error("Only admins can remove members.");

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (group?.created_by === targetUserId) throw new Error("The group creator cannot be removed.");

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.group_id, groupId), eq(groupMembers.user_id, targetUserId)));

  revalidatePath(`/groups/${groupId}`);
}

// ── Update member role (admin only) ───────────────────────────────────────────
export async function updateMemberRole(
  groupId: string,
  targetUserId: string,
  role: "admin" | "member"
): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [caller] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.group_id, groupId), eq(groupMembers.user_id, userId)))
    .limit(1);

  if (!caller || caller.role !== "admin") throw new Error("Only admins can change roles.");

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (group?.created_by === targetUserId) throw new Error("Cannot change the creator's role.");

  await db
    .update(groupMembers)
    .set({ role })
    .where(and(eq(groupMembers.group_id, groupId), eq(groupMembers.user_id, targetUserId)));

  revalidatePath(`/groups/${groupId}`);
}

// ── Delete group (creator only) ────────────────────────────────────────────────
export async function deleteGroup(groupId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!group || group.created_by !== userId) throw new Error("Only the creator can delete this group.");

  await db.delete(groups).where(eq(groups.id, groupId));
  revalidatePath("/groups");
}

// ── Queries ────────────────────────────────────────────────────────────────────

export interface GroupCard {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string | null;
  createdBy: string;
  myRole: "admin" | "member";
  memberCount: number;
  myNetPL: number;
  mySessions: number;
}

export async function getMyGroups(): Promise<GroupCard[]> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const memberships = await db
    .select({ groupId: groupMembers.group_id, myRole: groupMembers.role })
    .from(groupMembers)
    .where(eq(groupMembers.user_id, userId));

  if (memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.groupId);

  const [groupList, memberCounts, sessionStats] = await Promise.all([
    db.select().from(groups).where(inArray(groups.id, groupIds)),
    db
      .select({ groupId: groupMembers.group_id, count: sql<number>`COUNT(*)::int` })
      .from(groupMembers)
      .where(inArray(groupMembers.group_id, groupIds))
      .groupBy(groupMembers.group_id),
    db
      .select({
        groupId: sessions.group_id,
        netPL: sql<string>`COALESCE(SUM(cash_out - buy_in), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(sessions)
      .where(and(eq(sessions.user_id, userId), inArray(sessions.group_id, groupIds)))
      .groupBy(sessions.group_id),
  ]);

  return groupList.map((g) => {
    const m = memberships.find((x) => x.groupId === g.id);
    const c = memberCounts.find((x) => x.groupId === g.id);
    const s = sessionStats.find((x) => x.groupId === g.id);
    return {
      id: g.id,
      name: g.name,
      description: g.description,
      inviteCode: g.invite_code,
      createdBy: g.created_by,
      myRole: (m?.myRole ?? "member") as "admin" | "member",
      memberCount: c?.count ?? 0,
      myNetPL: parseFloat(s?.netPL ?? "0"),
      mySessions: s?.count ?? 0,
    };
  });
}

export interface LeaderboardEntry {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
  role: "admin" | "member";
  joinedAt: Date;
  sessions: number;
  netPL: number;
  wins: number;
  bestSession: number;
}

export interface GroupDetails {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string | null;
  createdBy: string;
  myRole: "admin" | "member";
  myUserId: string;
  memberCount: number;
  totalSessions: number;
  totalBuyIn: number;
  leaderboard: LeaderboardEntry[];
}

export async function getGroupDetails(groupId: string): Promise<GroupDetails | null> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!group) return null;

  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.group_id, groupId), eq(groupMembers.user_id, userId)))
    .limit(1);
  if (!membership) return null;

  const memberList = await db
    .select({
      userId: groupMembers.user_id,
      role: groupMembers.role,
      joinedAt: groupMembers.joined_at,
      fullName: profiles.full_name,
      avatarUrl: profiles.avatar_url,
      email: profiles.email,
    })
    .from(groupMembers)
    .innerJoin(profiles, eq(groupMembers.user_id, profiles.id))
    .where(eq(groupMembers.group_id, groupId));

  const [sessionStats, groupAgg] = await Promise.all([
    db
      .select({
        userId: sessions.user_id,
        sessionCount: sql<number>`COUNT(*)::int`,
        netPL: sql<string>`COALESCE(SUM(cash_out - buy_in), 0)`,
        wins: sql<number>`COUNT(*) FILTER (WHERE cash_out > buy_in)::int`,
        bestSession: sql<string>`COALESCE(MAX(cash_out - buy_in), 0)`,
      })
      .from(sessions)
      .where(eq(sessions.group_id, groupId))
      .groupBy(sessions.user_id),
    db
      .select({
        totalSessions: sql<number>`COUNT(*)::int`,
        totalBuyIn: sql<string>`COALESCE(SUM(buy_in), 0)`,
      })
      .from(sessions)
      .where(eq(sessions.group_id, groupId)),
  ]);

  const leaderboard: LeaderboardEntry[] = memberList
    .map((m) => {
      const s = sessionStats.find((x) => x.userId === m.userId);
      return {
        userId: m.userId,
        fullName: m.fullName,
        avatarUrl: m.avatarUrl,
        email: m.email,
        role: m.role as "admin" | "member",
        joinedAt: m.joinedAt,
        sessions: s?.sessionCount ?? 0,
        netPL: parseFloat(s?.netPL ?? "0"),
        wins: s?.wins ?? 0,
        bestSession: parseFloat(s?.bestSession ?? "0"),
      };
    })
    .sort((a, b) => b.netPL - a.netPL);

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    inviteCode: group.invite_code,
    createdBy: group.created_by,
    myRole: membership.role as "admin" | "member",
    myUserId: userId,
    memberCount: memberList.length,
    totalSessions: groupAgg[0]?.totalSessions ?? 0,
    totalBuyIn: parseFloat(groupAgg[0]?.totalBuyIn ?? "0"),
    leaderboard,
  };
}

// ── Simple list for session form dropdown ─────────────────────────────────────
export async function getMyGroupsSimple(): Promise<{ id: string; name: string }[]> {
  const { userId } = await auth();
  if (!userId) return [];

  return db
    .select({ id: groups.id, name: groups.name })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.group_id, groups.id))
    .where(eq(groupMembers.user_id, userId));
}
