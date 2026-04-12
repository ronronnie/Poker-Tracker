"use client";

import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Crown, Medal, MoreVertical, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { removeGroupMember, updateMemberRole, leaveGroup, deleteGroup } from "@/app/actions/groups";
import { toast } from "@/hooks/use-toast";
import { formatINR, signOf } from "@/lib/format";
import type { GroupDetails, LeaderboardEntry } from "@/app/actions/groups";

// ── Rank medal ────────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-4 h-4" style={{ color: "#FFD700" }} />;
  if (rank === 2) return <Medal className="w-4 h-4" style={{ color: "#C0C0C0" }} />;
  if (rank === 3) return <Medal className="w-4 h-4" style={{ color: "#CD7F32" }} />;
  return <span className="text-xs font-bold w-4 text-center" style={{ color: "var(--color-text-muted)" }}>{rank}</span>;
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name, avatarUrl, size = 36 }: { name: string | null; avatarUrl: string | null; size?: number }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={name ?? ""} width={size} height={size} className="rounded-full object-cover shrink-0" />;
  }
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
      style={{ width: size, height: size, background: "var(--color-gold)", color: "#080808" }}
    >
      {initials}
    </div>
  );
}

// ── Leaderboard tab ───────────────────────────────────────────────────────────
function LeaderboardTab({
  leaderboard,
  currentUserId,
  totalSessions,
}: {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  totalSessions: number;
}) {
  if (totalSessions === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>No sessions in this group yet</p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Tag a session to this group from Bankroll → Log Session.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {leaderboard.map((entry, i) => {
        const rank = i + 1;
        const isMe = entry.userId === currentUserId;
        const plColor = entry.netPL > 0
          ? "var(--color-success)"
          : entry.netPL < 0
          ? "var(--color-danger)"
          : "var(--color-text-muted)";
        const winRate = entry.sessions > 0 ? Math.round((entry.wins / entry.sessions) * 100) : 0;

        return (
          <div
            key={entry.userId}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)]"
            style={{
              background: isMe ? "rgba(212,175,55,0.06)" : "var(--color-bg-elevated)",
              border: `1px solid ${isMe ? "rgba(212,175,55,0.2)" : "var(--color-border)"}`,
            }}
          >
            {/* Rank */}
            <div className="w-5 flex items-center justify-center shrink-0">
              <RankBadge rank={rank} />
            </div>

            {/* Avatar */}
            <Avatar name={entry.fullName} avatarUrl={entry.avatarUrl} size={34} />

            {/* Name + stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                  {entry.fullName || entry.email.split("@")[0]}
                </p>
                {isMe && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(212,175,55,0.15)", color: "var(--color-gold)" }}>
                    You
                  </span>
                )}
                {entry.role === "admin" && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(212,175,55,0.08)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {entry.sessions} session{entry.sessions !== 1 ? "s" : ""} · {winRate}% win rate
              </p>
            </div>

            {/* P&L */}
            <div className="text-right shrink-0">
              <p className="text-sm font-bold" style={{ color: plColor, fontFamily: "var(--font-primary)" }}>
                {entry.sessions > 0 ? `${signOf(entry.netPL)}${formatINR(entry.netPL)}` : "—"}
              </p>
              {entry.sessions > 0 && entry.bestSession > 0 && (
                <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  Best: +{formatINR(entry.bestSession)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Members tab ────────────────────────────────────────────────────────────────
function MembersTab({
  group,
  currentUserId,
}: {
  group: GroupDetails;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  async function handleRemove(targetUserId: string) {
    setPending(targetUserId);
    try {
      await removeGroupMember(group.id, targetUserId);
      toast({ title: "Member removed", variant: "default" });
      router.refresh();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed", variant: "error" });
    } finally {
      setPending(null);
    }
  }

  async function handleRoleChange(targetUserId: string, role: "admin" | "member") {
    setPending(targetUserId);
    try {
      await updateMemberRole(group.id, targetUserId, role);
      toast({ title: role === "admin" ? "Promoted to admin" : "Demoted to member", variant: "success" });
      router.refresh();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed", variant: "error" });
    } finally {
      setPending(null);
    }
  }

  async function handleLeave() {
    try {
      await leaveGroup(group.id);
      toast({ title: "Left group", variant: "default" });
      router.push("/groups");
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed", variant: "error" });
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    try {
      await deleteGroup(group.id);
      toast({ title: "Group deleted", variant: "default" });
      router.push("/groups");
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed", variant: "error" });
    }
  }

  const isAdmin = group.myRole === "admin";
  const isCreator = group.createdBy === currentUserId;

  return (
    <div className="flex flex-col gap-2">
      {group.leaderboard.map((member) => {
        const isMe = member.userId === currentUserId;
        const isTarget = pending === member.userId;
        const canManage = isAdmin && !isMe && group.createdBy !== member.userId;

        return (
          <div
            key={member.userId}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-lg)]"
            style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
          >
            <Avatar name={member.fullName} avatarUrl={member.avatarUrl} size={36} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                  {member.fullName || member.email.split("@")[0]}
                </p>
                {isMe && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.15)", color: "var(--color-gold)" }}>You</span>
                )}
                {member.role === "admin" && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.08)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>Admin</span>
                )}
                {group.createdBy === member.userId && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "var(--color-text-muted)" }}>Creator</span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date(member.joinedAt))}
              </p>
            </div>

            {/* Actions dropdown */}
            {(canManage || isMe) && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    disabled={isTarget}
                    className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center transition-colors disabled:opacity-40"
                    style={{ color: "var(--color-text-muted)", background: "var(--color-bg-subtle)" }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={4}
                    className="z-50 min-w-[160px] overflow-hidden rounded-[var(--radius-md)] p-1"
                    style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                  >
                    {canManage && (
                      <>
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)] cursor-pointer outline-none"
                          style={{ color: "var(--color-text-primary)" }}
                          onSelect={() => handleRoleChange(member.userId, member.role === "admin" ? "member" : "admin")}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-bg-subtle)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {member.role === "admin" ? "Remove admin" : "Make admin"}
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="my-1 h-px" style={{ background: "var(--color-border)" }} />
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)] cursor-pointer outline-none"
                          style={{ color: "var(--color-danger)" }}
                          onSelect={() => handleRemove(member.userId)}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          Remove member
                        </DropdownMenu.Item>
                      </>
                    )}
                    {isMe && (
                      <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)] cursor-pointer outline-none"
                        style={{ color: "var(--color-danger)" }}
                        onSelect={handleLeave}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <LogOut className="w-4 h-4" /> Leave group
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
        );
      })}

      {/* Delete group (creator only) */}
      {isCreator && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-[var(--radius-md)] transition-colors"
            style={{ color: "var(--color-danger)" }}
          >
            <Trash2 className="w-4 h-4" />
            Delete this group
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function GroupTabs({ group }: { group: GroupDetails }) {
  return (
    <Tabs.Root defaultValue="leaderboard">
      <Tabs.List
        className="flex gap-1 p-1 rounded-[var(--radius-md)] mb-4"
        style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
      >
        {[
          { value: "leaderboard", label: "Leaderboard" },
          { value: "members", label: `Members (${group.memberCount})` },
        ].map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors"
            style={{
              fontFamily: "var(--font-secondary)",
            }}
            data-tab={tab.value}
          >
            <style>{`
              [data-state="active"][data-tab="${tab.value}"] {
                background: var(--color-bg-base);
                color: var(--color-text-primary);
              }
              [data-state="inactive"][data-tab="${tab.value}"] {
                background: transparent;
                color: var(--color-text-muted);
              }
            `}</style>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="leaderboard">
        <LeaderboardTab
          leaderboard={group.leaderboard}
          currentUserId={group.myUserId}
          totalSessions={group.totalSessions}
        />
      </Tabs.Content>

      <Tabs.Content value="members">
        <MembersTab group={group} currentUserId={group.myUserId} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
