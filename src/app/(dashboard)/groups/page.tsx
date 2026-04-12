import Link from "next/link";
import { Plus, Users, LogIn } from "lucide-react";
import { getMyGroups, type GroupCard } from "@/app/actions/groups";
import { CreateGroupDialog } from "./_components/create-group-dialog";
import { JoinGroupDialog } from "./_components/join-group-dialog";
import { Button } from "@/components/ui/button";
import { formatINR, signOf } from "@/lib/format";

// ── Group card ────────────────────────────────────────────────────────────────
function GroupCardUI({ group }: { group: GroupCard }) {
  const plColor = group.myNetPL > 0
    ? "var(--color-success)"
    : group.myNetPL < 0
    ? "var(--color-danger)"
    : "var(--color-text-muted)";

  return (
    <Link
      href={`/groups/${group.id}`}
      className="flex flex-col gap-4 p-5 rounded-[var(--radius-lg)] transition-colors group"
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold truncate" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>
            {group.name}
          </h3>
          {group.description && (
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
              {group.description}
            </p>
          )}
        </div>
        {group.myRole === "admin" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(212,175,55,0.15)", color: "var(--color-gold)", border: "1px solid rgba(212,175,55,0.3)" }}>
            ADMIN
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Members</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: "var(--color-text-primary)" }}>{group.memberCount}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Sessions</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: "var(--color-text-primary)" }}>{group.mySessions}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>My P&L</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: plColor }}>
            {group.mySessions > 0 ? `${signOf(group.myNetPL)}${formatINR(group.myNetPL)}` : "—"}
          </p>
        </div>
      </div>

      {/* Enter caret */}
      <div className="flex items-center justify-end">
        <span className="text-xs font-medium" style={{ color: "var(--color-gold)" }}>
          Enter →
        </span>
      </div>
    </Link>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: "var(--color-bg-elevated)" }}>
        <Users className="w-6 h-6" style={{ color: "var(--color-text-muted)" }} />
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>No groups yet</p>
      <p className="text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
        Create a group or join one with an invite code.
      </p>
      <div className="flex gap-3">
        <JoinGroupDialog trigger={<Button variant="secondary" size="sm" className="gap-2"><LogIn className="w-4 h-4" />Join</Button>} />
        <CreateGroupDialog trigger={<Button variant="primary" size="sm" className="gap-2"><Plus className="w-4 h-4" />Create</Button>} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function GroupsPage() {
  const myGroups = await getMyGroups();

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold truncate" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>Groups</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {myGroups.length === 0 ? "No groups yet." : `${myGroups.length} group${myGroups.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <JoinGroupDialog trigger={<Button variant="secondary" size="sm" className="gap-2"><LogIn className="w-4 h-4" /><span className="hidden sm:inline">Join</span></Button>} />
          <CreateGroupDialog trigger={<Button variant="primary" size="sm" className="gap-2"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Create Group</span><span className="sm:hidden">Create</span></Button>} />
        </div>
      </div>

      {myGroups.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myGroups.map((g) => <GroupCardUI key={g.id} group={g} />)}
        </div>
      )}
    </>
  );
}
