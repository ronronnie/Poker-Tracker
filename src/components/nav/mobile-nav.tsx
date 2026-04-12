"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Users, BookOpen, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bankroll", href: "/bankroll", icon: Wallet },
  { label: "Groups", href: "/groups", icon: Users },
  { label: "History", href: "/hand-history", icon: BookOpen, soon: true },
  { label: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border)",
        height: "64px",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon, soon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={soon ? "#" : href}
            onClick={soon ? (e) => e.preventDefault() : undefined}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
            style={{
              color: isActive
                ? "var(--color-gold)"
                : soon
                ? "var(--color-text-muted)"
                : "var(--color-text-secondary)",
            }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
            {soon && (
              <span
                className="absolute top-1 text-[8px] font-bold px-1 rounded-full"
                style={{ background: "rgba(212,175,55,0.2)", color: "var(--color-gold-muted)" }}
              >
                •
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
