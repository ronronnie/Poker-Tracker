import { currentUser } from "@clerk/nextjs/server";
import { Trophy, Target, TrendingUp, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getProfile, getProfileStats } from "@/app/actions/profile";
import { getMyGroups } from "@/app/actions/groups";
import { EditProfileDialog } from "./_components/edit-profile-dialog";
import { SignOutButtonClient } from "./_components/sign-out-button";
import { formatINR, formatDuration, signOf } from "@/lib/format";

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-4 rounded-[var(--radius-lg)]"
      style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
    >
      <div
        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
        style={{ background: "var(--color-bg-subtle)" }}
      >
        <Icon className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </p>
        <p
          className="text-base font-bold mt-0.5 truncate"
          style={{ color: valueColor ?? "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
  const [clerkUser, profile, stats, groups] = await Promise.all([
    currentUser(),
    getProfile(),
    getProfileStats(),
    getMyGroups(),
  ]);

  if (!clerkUser) return null;

  const displayName = profile?.full_name || clerkUser.firstName
    ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ")
    : "Poker Player";
  const email    = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
  const avatarUrl = clerkUser.imageUrl;
  const memberSince = profile?.created_at
    ? new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(profile.created_at))
    : null;

  const winRate = stats.totalSessions > 0
    ? Math.round((stats.winningSessions / stats.totalSessions) * 100)
    : 0;

  const plColor = stats.netPL > 0
    ? "var(--color-success)"
    : stats.netPL < 0
    ? "var(--color-danger)"
    : "var(--color-text-muted)";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5">

      {/* ── Profile card ──────────────────────────────────────────────────── */}
      <div
        className="rounded-[var(--radius-xl)] p-5 sm:p-6"
        style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-xl font-extrabold"
              style={{ background: "var(--color-gold)", color: "#080808" }}
            >
              {initials}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-xl font-extrabold truncate"
              style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
            >
              {displayName}
            </h1>

            {profile?.username && (
              <p className="text-sm mt-0.5" style={{ color: "var(--color-gold)" }}>
                @{profile.username}
              </p>
            )}

            <p className="text-sm mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
              {email}
            </p>

            {memberSince && (
              <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                Member since {memberSince}
              </p>
            )}
          </div>

          {/* Edit button */}
          <div className="shrink-0">
            <EditProfileDialog
              currentName={profile?.full_name ?? null}
              currentUsername={profile?.username ?? null}
            />
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          All-time Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            icon={Trophy}
            label="Net P&L"
            value={
              stats.totalSessions > 0
                ? `${signOf(stats.netPL)}${formatINR(stats.netPL)}`
                : "₹0"
            }
            valueColor={stats.totalSessions > 0 ? plColor : "var(--color-text-muted)"}
          />
          <StatCard
            icon={Target}
            label="Sessions"
            value={
              stats.totalSessions > 0
                ? `${stats.totalSessions} (${winRate}% win rate)`
                : "0"
            }
          />
          <StatCard
            icon={TrendingUp}
            label="Best Session"
            value={
              stats.bestSession > 0
                ? `+${formatINR(stats.bestSession)}`
                : "—"
            }
            valueColor={stats.bestSession > 0 ? "var(--color-success)" : undefined}
          />
          <StatCard
            icon={Clock}
            label="Hours at the Table"
            value={stats.totalMinutes > 0 ? formatDuration(stats.totalMinutes) : "—"}
          />
        </div>
      </div>

      {/* ── Groups ────────────────────────────────────────────────────────── */}
      {groups.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              Your Groups
            </h2>
            {groups.length > 3 && (
              <Link href="/groups" className="text-xs font-medium" style={{ color: "var(--color-gold)" }}>
                View all
              </Link>
            )}
          </div>

          <div
            className="rounded-[var(--radius-lg)] overflow-hidden"
            style={{ border: "1px solid var(--color-border)" }}
          >
            {groups.slice(0, 3).map((g, i) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                style={{
                  background: "var(--color-bg-elevated)",
                  borderTop: i > 0 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)" }}
                >
                  {g.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                    {g.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {g.memberCount} member{g.memberCount !== 1 ? "s" : ""}
                    {g.myRole === "admin" && (
                      <span className="ml-2" style={{ color: "var(--color-gold)" }}>Admin</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {g.mySessions > 0 && (
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: g.myNetPL >= 0 ? "var(--color-success)" : "var(--color-danger)",
                      }}
                    >
                      {signOf(g.myNetPL)}{formatINR(g.myNetPL)}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Account ───────────────────────────────────────────────────────── */}
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          Account
        </h2>
        <div
          className="rounded-[var(--radius-lg)] overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
        >
          {/* Currency */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ background: "var(--color-bg-elevated)", borderBottom: "1px solid var(--color-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Currency</p>
            <span
              className="text-sm font-semibold px-2 py-0.5 rounded"
              style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)" }}
            >
              ₹ INR
            </span>
          </div>

          {/* Plan */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ background: "var(--color-bg-elevated)", borderBottom: "1px solid var(--color-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Plan</p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
            >
              FREE
            </span>
          </div>

          {/* Sign out */}
          <SignOutButtonClient />
        </div>
      </div>

    </div>
  );
}
