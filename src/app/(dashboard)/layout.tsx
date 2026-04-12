import { ensureProfile } from "@/app/actions/auth";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileNav } from "@/components/nav/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure a DB profile exists for this Clerk user (no-op if already created)
  await ensureProfile();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main scrollable content area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
          style={{ paddingBottom: "calc(64px + 1.5rem)" }} // room for mobile nav
        >
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation ─────────────────────────────────────────── */}
      <MobileNav />
    </div>
  );
}
