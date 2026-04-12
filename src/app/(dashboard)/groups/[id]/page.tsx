import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getGroupDetails } from "@/app/actions/groups";
import { InviteCard } from "./_components/invite-card";
import { GroupTabs } from "./_components/group-tabs";
import { formatINR, signOf } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ joined?: string }>;
}

export default async function GroupDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const group = await getGroupDetails(id);
  if (!group) notFound();

  const joinedMsg = sp.joined === "1"
    ? "You've joined the group!"
    : sp.joined === "exists"
    ? "You're already a member."
    : null;

  return (
    <>
      {/* Back */}
      <Link href="/groups" className="inline-flex items-center gap-1 text-sm mb-5 transition-colors" style={{ color: "var(--color-text-muted)" }}>
        <ChevronLeft className="w-4 h-4" /> Groups
      </Link>

      {/* Join toast banner */}
      {joinedMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] mb-5 text-sm font-medium" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "var(--color-success)" }}>
          {joinedMsg}
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold truncate" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>
              {group.name}
            </h1>
            {group.description && (
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{group.description}</p>
            )}
          </div>
          {group.myRole === "admin" && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-1" style={{ background: "rgba(212,175,55,0.15)", color: "var(--color-gold)", border: "1px solid rgba(212,175,55,0.3)" }}>
              ADMIN
            </span>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div
        className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] mb-5"
        style={{ background: "var(--color-border)" }}
      >
        {[
          {
            label: "Members",
            value: String(group.memberCount),
            color: "var(--color-text-primary)",
          },
          {
            label: "Group Sessions",
            value: String(group.totalSessions),
            color: "var(--color-text-primary)",
          },
          {
            label: "Total Buy-in",
            value: group.totalBuyIn > 0 ? formatINR(group.totalBuyIn) : "—",
            color: "var(--color-text-primary)",
          },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center justify-center py-4 px-3 text-center" style={{ background: "var(--color-bg-elevated)" }}>
            <p className="text-base font-bold" style={{ color: s.color, fontFamily: "var(--font-primary)" }}>{s.value}</p>
            <p className="text-[11px] mt-1 uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite card */}
      {group.inviteCode && (
        <div className="mb-5">
          <InviteCard inviteCode={group.inviteCode} groupName={group.name} />
        </div>
      )}

      {/* Tabs: Leaderboard + Members */}
      <GroupTabs group={group} />
    </>
  );
}
