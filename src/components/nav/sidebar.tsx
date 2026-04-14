"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Wallet,
  Users,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bankroll", href: "/bankroll", icon: Wallet },
  { label: "Groups", href: "/groups", icon: Users },
  { label: "Hand History", href: "/hand-history", icon: BookOpen },
];

// ── Sidebar ────────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside
      className="hidden lg:flex flex-col w-[220px] shrink-0 h-screen sticky top-0"
      style={{
        background: "var(--color-bg-surface)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[64px] shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--color-gold)", boxShadow: "0 0 16px rgba(212,175,55,0.35)" }}
        >
          <span
            className="text-sm font-extrabold leading-none"
            style={{ color: "#080808", fontFamily: "var(--font-primary)" }}
          >
            O
          </span>
        </div>
        <span
          className="text-lg font-extrabold tracking-widest"
          style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}
        >
          OUTS
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors group"
              style={{
                background: isActive ? "rgba(212,175,55,0.1)" : "transparent",
                color: isActive ? "var(--color-gold)" : "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user + sign out */}
      <div className="px-3 pb-4 pt-3 flex flex-col gap-1" style={{ borderTop: "1px solid var(--color-border)" }}>
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors"
          style={{
            background: pathname === "/profile" ? "rgba(212,175,55,0.1)" : "transparent",
            color: pathname === "/profile" ? "var(--color-gold)" : "var(--color-text-secondary)",
          }}
        >
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? "Avatar"}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: "var(--color-gold)", color: "#080808" }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)", lineHeight: 1.2 }}>
              {user?.firstName ?? "You"}
            </p>
            <p className="text-[11px] truncate" style={{ color: "var(--color-text-muted)" }}>
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
          <User className="w-3.5 h-3.5 shrink-0 opacity-50" />
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-colors w-full text-left"
          style={{ color: "var(--color-text-muted)" }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
