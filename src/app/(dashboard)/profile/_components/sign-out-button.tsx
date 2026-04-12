"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export function SignOutButtonClient() {
  const { signOut } = useClerk();

  return (
    <button
      onClick={() => signOut({ redirectUrl: "/login" })}
      className="flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors"
      style={{ background: "var(--color-bg-elevated)", color: "var(--color-danger)" }}
    >
      <LogOut className="w-4 h-4 shrink-0" />
      <span className="text-sm font-medium">Sign out</span>
    </button>
  );
}
