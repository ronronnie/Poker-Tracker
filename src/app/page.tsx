import Link from "next/link";

const SUITS = [
  { symbol: "♠", top: "8%",  left: "6%",  size: "5rem",  opacity: 0.07, delay: "0s",    duration: "14s" },
  { symbol: "♥", top: "14%", left: "88%", size: "3.5rem", opacity: 0.06, delay: "2s",    duration: "18s" },
  { symbol: "♣", top: "72%", left: "4%",  size: "6rem",  opacity: 0.07, delay: "1s",    duration: "16s" },
  { symbol: "♦", top: "78%", left: "91%", size: "4rem",  opacity: 0.06, delay: "3s",    duration: "20s" },
  { symbol: "♠", top: "42%", left: "2%",  size: "2.5rem", opacity: 0.04, delay: "0.5s", duration: "22s" },
  { symbol: "♥", top: "55%", left: "94%", size: "3rem",  opacity: 0.05, delay: "4s",    duration: "17s" },
  { symbol: "♣", top: "25%", left: "92%", size: "2rem",  opacity: 0.04, delay: "1.5s",  duration: "19s" },
  { symbol: "♦", top: "88%", left: "45%", size: "2.5rem", opacity: 0.04, delay: "2.5s", duration: "21s" },
  { symbol: "♠", top: "5%",  left: "50%", size: "2rem",  opacity: 0.03, delay: "3.5s",  duration: "15s" },
  { symbol: "♥", top: "90%", left: "12%", size: "3rem",  opacity: 0.05, delay: "0.8s",  duration: "23s" },
];

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#080808" }}
    >
      {/* ── Subtle grid ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      {/* ── Radial glow ─────────────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)",
        }}
      />

      {/* ── Floating card suits ──────────────────────────────────────────── */}
      <style>{`
        @keyframes floatSuit {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-18px) rotate(4deg); }
          66%       { transform: translateY(10px) rotate(-3deg); }
        }
      `}</style>
      {SUITS.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute select-none pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            opacity: s.opacity,
            color: i % 2 === 0 ? "#D4AF37" : "#ffffff",
            animation: `floatSuit ${s.duration} ease-in-out ${s.delay} infinite`,
          }}
        >
          {s.symbol}
        </span>
      ))}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--color-gold)",
              boxShadow: "0 0 32px rgba(212,175,55,0.45)",
            }}
          >
            <span
              className="text-xl leading-none font-extrabold"
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

        {/* Hero headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
        >
          Track every{" "}
          <span style={{ color: "var(--color-gold)" }}>hand.</span>
          <br />
          Every{" "}
          <span style={{ color: "var(--color-gold)" }}>session.</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-base sm:text-lg leading-relaxed mb-12 max-w-lg"
          style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}
        >
          Your complete poker journal. Log sessions, manage your bankroll,
          and study your game — all in one place.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-[var(--radius-md)] text-base font-bold transition-all duration-200"
            style={{
              background: "var(--color-gold)",
              color: "#080808",
              fontFamily: "var(--font-primary)",
              boxShadow: "0 0 24px rgba(212,175,55,0.3)",
            }}
            onMouseEnter={undefined}
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-[var(--radius-md)] text-base font-bold transition-all duration-200"
            style={{
              background: "transparent",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-primary)",
            }}
          >
            Sign In
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="flex items-center gap-10 mt-16 pt-10"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {[
            { value: "100%", label: "Manual control" },
            { value: "Live", label: "Cash game focus" },
            { value: "INR", label: "Native support" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span
                className="text-xl font-bold"
                style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}
              >
                {s.value}
              </span>
              <span
                className="text-xs mt-1"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
