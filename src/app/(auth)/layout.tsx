import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outs",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left panel — decorative (hidden on mobile) ─────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)" }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--color-gold) 1px, transparent 1px),
                              linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glowing orb */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
        />

        {/* Card suit decorations */}
        <div className="absolute top-12 right-16 text-7xl opacity-[0.06] select-none" aria-hidden>♠</div>
        <div className="absolute bottom-16 left-12 text-8xl opacity-[0.06] select-none" aria-hidden>♣</div>
        <div className="absolute top-1/4 left-10 text-5xl opacity-[0.05] select-none" aria-hidden>♥</div>
        <div className="absolute bottom-1/3 right-10 text-6xl opacity-[0.05] select-none" aria-hidden>♦</div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-start max-w-md px-12">

          {/* Logo — Bricolage Grotesque */}
          <div className="mb-10 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-gold)", boxShadow: "0 0 24px rgba(212,175,55,0.4)" }}
            >
              <span
                className="text-lg leading-none font-extrabold"
                style={{ color: "#080808", fontFamily: "var(--font-primary)" }}
              >
                O
              </span>
            </div>
            <span
              className="text-2xl font-extrabold tracking-widest"
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}
            >
              OUTS
            </span>
          </div>

          {/* Tagline — Bricolage Grotesque */}
          <h1
            className="text-4xl xl:text-5xl font-extrabold leading-tight mb-5"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
          >
            Track every<br />
            <span style={{ color: "var(--color-gold)" }}>hand.</span>{" "}
            Every<br />
            <span style={{ color: "var(--color-gold)" }}>session.</span>
          </h1>

          {/* Body copy — DM Sans */}
          <p
            className="text-base leading-relaxed mb-10"
            style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}
          >
            Your complete poker journal. Log sessions, manage your bankroll,
            and study your game — all in one place.
          </p>

          {/* Stats strip — mixed */}
          <div className="flex gap-8">
            {[
              { value: "100%", label: "Manual control" },
              { value: "Live", label: "Cash game focus" },
              { value: "INR", label: "Native support" },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="text-xl font-bold mb-1"
                  style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}
                >
                  {s.value}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-8"
        style={{ background: "var(--color-bg-base)" }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-gold)", boxShadow: "0 0 20px rgba(212,175,55,0.4)" }}
          >
            <span
              className="text-base leading-none font-extrabold"
              style={{ color: "#080808", fontFamily: "var(--font-primary)" }}
            >
              O
            </span>
          </div>
          <span
            className="text-xl font-extrabold tracking-widest"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}
          >
            OUTS
          </span>
        </div>

        {/* Form card */}
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
