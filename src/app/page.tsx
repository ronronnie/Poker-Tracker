"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";

// ── Floating suit config ───────────────────────────────────────────────────────
const HERO_SUITS = [
  { symbol: "♠", top: "8%",  left: "6%",  size: "5rem",   opacity: 0.07, delay: "0s",    dur: "14s", gold: true  },
  { symbol: "♥", top: "14%", left: "88%", size: "3.5rem",  opacity: 0.06, delay: "2s",    dur: "18s", gold: false },
  { symbol: "♣", top: "72%", left: "4%",  size: "6rem",   opacity: 0.07, delay: "1s",    dur: "16s", gold: false },
  { symbol: "♦", top: "78%", left: "91%", size: "4rem",   opacity: 0.06, delay: "3s",    dur: "20s", gold: true  },
  { symbol: "♠", top: "42%", left: "2%",  size: "2.5rem", opacity: 0.04, delay: "0.5s",  dur: "22s", gold: false },
  { symbol: "♥", top: "55%", left: "94%", size: "3rem",   opacity: 0.05, delay: "4s",    dur: "17s", gold: false },
  { symbol: "♣", top: "25%", left: "92%", size: "2rem",   opacity: 0.04, delay: "1.5s",  dur: "19s", gold: true  },
  { symbol: "♦", top: "88%", left: "45%", size: "2.5rem", opacity: 0.04, delay: "2.5s",  dur: "21s", gold: false },
  { symbol: "♠", top: "5%",  left: "50%", size: "2rem",   opacity: 0.03, delay: "3.5s",  dur: "15s", gold: true  },
  { symbol: "♥", top: "90%", left: "12%", size: "3rem",   opacity: 0.05, delay: "0.8s",  dur: "23s", gold: false },
];

// ── Scroll-triggered visibility hook ──────────────────────────────────────────
function useInView<T extends Element = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ── Animated wrapper ───────────────────────────────────────────────────────────
function FadeIn({
  children, delay = 0, direction = "up", className = "", style = {},
}: {
  children: ReactNode; delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string; style?: React.CSSProperties;
}) {
  const { ref, visible } = useInView();
  const offsets: Record<string, string> = {
    up: "translateY(36px)", left: "translateX(-36px)",
    right: "translateX(36px)", none: "none",
  };
  return (
    <div
      ref={ref} className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : offsets[direction],
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Animated counter ───────────────────────────────────────────────────────────
function Counter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const { ref, visible } = useInView<HTMLSpanElement>();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 80));
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      setCount(cur);
      if (cur >= target) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

// ── Section pill label ─────────────────────────────────────────────────────────
function Label({ children }: { children: ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 tracking-widest uppercase"
      style={{
        background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)",
        color: "var(--color-gold)", fontFamily: "var(--font-secondary)",
      }}
    >
      {children}
    </div>
  );
}

// ── Bullet point ───────────────────────────────────────────────────────────────
function Bullet({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(212,175,55,0.15)" }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-gold)" }} />
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}>
        {children}
      </p>
    </div>
  );
}

// ── Feature card ───────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, delay = 0 }: {
  icon: ReactNode; title: string; description: string; delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        className="rounded-2xl p-6 h-full cursor-default"
        style={{
          background: hovered ? "rgba(212,175,55,0.04)" : "#0d0d0d",
          border: `1px solid ${hovered ? "rgba(212,175,55,0.3)" : "var(--color-border)"}`,
          transform: hovered ? "translateY(-5px)" : "none",
          boxShadow: hovered ? "0 20px 48px rgba(0,0,0,0.5)" : "none",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-xl"
          style={{ background: "rgba(212,175,55,0.1)" }}
        >
          {icon}
        </div>
        <h3
          className="text-base font-bold mb-2"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}
        >
          {description}
        </p>
      </div>
    </FadeIn>
  );
}

// ── Mock session card ──────────────────────────────────────────────────────────
function SessionCard({ gameType, stakes, date, duration, buyIn, cashOut, profit, isWin, delay = 0 }: {
  gameType: string; stakes: string; date: string; duration: string;
  buyIn: number; cashOut: number; profit: number; isWin: boolean; delay?: number;
}) {
  return (
    <FadeIn delay={delay} direction="right">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "#0d0d0d",
          border: "1px solid var(--color-border)",
          borderLeft: `3px solid ${isWin ? "#22c55e" : "#ef4444"}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>
              {gameType} · {stakes}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
              {date} · {duration}
            </div>
          </div>
          <span
            className="text-base font-bold"
            style={{ color: isWin ? "#22c55e" : "#ef4444", fontFamily: "var(--font-primary)" }}
          >
            {isWin ? "+" : "-"}₹{profit.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="h-px w-full mb-3" style={{ background: "var(--color-border)" }} />
        <div className="flex justify-between text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
          <span>Buy-in: ₹{buyIn.toLocaleString("en-IN")}</span>
          <span>Cash-out: ₹{cashOut.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </FadeIn>
  );
}

// ── Mock hole card ─────────────────────────────────────────────────────────────
function HoleCard({ rank, suit, red = false }: { rank: string; suit: string; red?: boolean }) {
  return (
    <div
      className="inline-flex flex-col items-center justify-center rounded-lg"
      style={{
        width: "50px", height: "66px",
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}
    >
      <span className="text-lg font-bold leading-none" style={{ color: red ? "#ef4444" : "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>
        {rank}
      </span>
      <span className="text-base leading-none mt-0.5" style={{ color: red ? "#ef4444" : "var(--color-text-primary)" }}>
        {suit}
      </span>
    </div>
  );
}

// ── Mock hand card ─────────────────────────────────────────────────────────────
function HandCard({ cards, position, result, amount, delay = 0 }: {
  cards: { rank: string; suit: string; red?: boolean }[];
  position: string; result: "won" | "lost"; amount: number; delay?: number;
}) {
  const streets = ["Pre", "Flop", "Turn", "River"];
  const active = result === "won" ? 4 : 2;
  return (
    <FadeIn delay={delay} direction="left">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "#0d0d0d",
          border: "1px solid var(--color-border)",
          borderLeft: `3px solid ${result === "won" ? "#22c55e" : "#ef4444"}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-2">
            {cards.map((c, i) => <HoleCard key={i} {...c} />)}
          </div>
          <div className="text-right">
            <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>{position}</div>
            <div className="text-sm font-bold" style={{ color: result === "won" ? "#22c55e" : "#ef4444", fontFamily: "var(--font-primary)" }}>
              {result === "won" ? "+" : "-"}₹{amount.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {streets.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: i < active ? (i === 0 ? "var(--color-gold)" : "#22c55e") : "rgba(255,255,255,0.1)" }}
                />
                <span className="text-[10px]" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>{s}</span>
              </div>
              {i < streets.length - 1 && (
                <div className="h-px w-8 mb-4" style={{ background: i < active - 1 ? "rgba(34,197,94,0.35)" : "var(--color-border)" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// ── Bankroll SVG chart ─────────────────────────────────────────────────────────
function BankrollChart() {
  const { ref, visible } = useInView<HTMLDivElement>();
  const pts = [[0,180],[80,165],[160,158],[240,135],[300,118],[360,95],[420,80],[500,55],[580,32],[620,20]];
  const line = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    return `${d} C ${px + 40} ${py} ${x - 40} ${y} ${x} ${y}`;
  }, "");
  const fill = `${line} L 620 200 L 0 200 Z`;
  return (
    <div ref={ref} className="w-full">
      <svg viewBox="0 0 620 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <defs>
          <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#gFill)" />
        <path
          d={line}
          stroke="url(#gLine)" strokeWidth="2.5" strokeLinecap="round"
          pathLength="1"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: visible ? 0 : 1,
            transition: "stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        />
        {pts.filter((_, i) => i % 2 === 0).map(([x, y], i) => (
          <circle
            key={i} cx={x} cy={y} r="4" fill="#D4AF37"
            style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${0.8 + i * 0.1}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

// ── Group leaderboard ─────────────────────────────────────────────────────────
function GroupLeaderboard() {
  const members = [
    { name: "Ronold Anthony", init: "R", profit: 12500, win: true },
    { name: "Aneesh",         init: "A", profit: 8200,  win: true },
    { name: "Devanshi",       init: "D", profit: 3100,  win: true },
    { name: "Ironfist",       init: "I", profit: 2400,  win: false },
  ];
  return (
    <FadeIn direction="right">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0d0d0d", border: "1px solid var(--color-border)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>Bangalore Crew</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>4 members · This month</div>
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: "rgba(212,175,55,0.1)", color: "var(--color-gold)", border: "1px solid rgba(212,175,55,0.2)", fontFamily: "var(--font-secondary)" }}
          >
            Live
          </span>
        </div>
        {members.map((m, i) => (
          <div
            key={m.name}
            className="flex items-center px-5 py-4 gap-3"
            style={{ borderBottom: i < members.length - 1 ? "1px solid var(--color-border)" : "none" }}
          >
            <span className="text-xs font-medium w-4" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>{i + 1}.</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "rgba(212,175,55,0.12)", color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}
            >
              {m.init}
            </div>
            <span className="flex-1 text-sm" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-secondary)" }}>{m.name}</span>
            <span
              className="text-sm font-bold"
              style={{ color: m.win ? "#22c55e" : "#ef4444", fontFamily: "var(--font-primary)" }}
            >
              {m.win ? "+" : "-"}₹{m.profit.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

// ── Gold divider ───────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
      <span className="mx-4 text-base opacity-40" style={{ color: "var(--color-gold)" }}>♦</span>
      <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <div style={{ background: "#080808", overflowX: "hidden" }}>
      <style>{`
        @keyframes floatSuit {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33%       { transform: translateY(-18px) rotate(4deg); }
          66%       { transform: translateY(10px) rotate(-3deg); }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(8px); opacity: 1; }
        }
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 24px rgba(212,175,55,0.3); }
          50%       { box-shadow: 0 0 44px rgba(212,175,55,0.65); }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          1 — HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: "800px", height: "800px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 62%)",
          }}
        />
        {/* Floating suits */}
        {HERO_SUITS.map((s, i) => (
          <span
            key={i} aria-hidden
            className="absolute select-none pointer-events-none"
            style={{
              top: s.top, left: s.left, fontSize: s.size,
              opacity: s.opacity, color: s.gold ? "#D4AF37" : "#ffffff",
              animation: `floatSuit ${s.dur} ease-in-out ${s.delay} infinite`,
            }}
          >
            {s.symbol}
          </span>
        ))}

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-gold)", animation: "goldPulse 3s ease-in-out infinite" }}
            >
              <span className="text-xl font-extrabold leading-none" style={{ color: "#080808", fontFamily: "var(--font-primary)" }}>O</span>
            </div>
            <span className="text-2xl font-extrabold tracking-widest" style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}>
              OUTS
            </span>
          </div>

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

          <p
            className="text-base sm:text-lg leading-relaxed mb-12 max-w-lg"
            style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}
          >
            Your complete poker journal. Log sessions, manage your bankroll, and study your game — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-3.5 rounded-[var(--radius-md)] text-base font-bold"
              style={{ background: "var(--color-gold)", color: "#080808", fontFamily: "var(--font-primary)", boxShadow: "0 0 28px rgba(212,175,55,0.35)" }}
            >
              Get Started — Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-3.5 rounded-[var(--radius-md)] text-base font-bold"
              style={{ background: "transparent", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", fontFamily: "var(--font-primary)" }}
            >
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-10 mt-16 pt-10" style={{ borderTop: "1px solid var(--color-border)" }}>
            {[
              { value: "100%", label: "Manual control" },
              { value: "Live", label: "Cash game focus" },
              { value: "INR", label: "Native support" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-xl font-bold" style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}>{s.value}</span>
                <span className="text-xs mt-1" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 flex flex-col items-center gap-1.5" style={{ animation: "bounceDown 2s ease-in-out infinite" }}>
          <span className="text-[11px]" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>Scroll</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7l5 5 5-5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2 — FEATURES OVERVIEW
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "var(--color-bg-elevated)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <Label>Everything you need</Label>
              <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>
                Built for serious players
              </h2>
              <p className="text-base mt-4 max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}>
                Every feature in Outs is designed around one goal — helping you understand and improve your poker game.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard delay={0}   icon={<span>⏱</span>} title="Session Tracker"    description="Log every cash game session with buy-in, cash-out, duration, stakes, game type and notes." />
            <FeatureCard delay={100} icon={<span>📈</span>} title="Bankroll Manager"   description="Visualise your bankroll over time with a running P&L graph and key session statistics." />
            <FeatureCard delay={200} icon={<span>🃏</span>} title="Hand History"        description="Log hands with a custom card-picker keyboard — hole cards, positions, streets, results." />
            <FeatureCard delay={300} icon={<span>👥</span>} title="Groups"              description="Create invite-only groups, compare stats with your regular crew, and track who's up." />
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ════════════════════════════════════════════════════════════════════
          3 — SESSION TRACKING
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#080808" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <FadeIn direction="left">
              <Label>Session Tracker</Label>
              <h2
                className="text-3xl sm:text-4xl font-extrabold mb-5 leading-tight"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
              >
                Every session.<br />
                <span style={{ color: "var(--color-gold)" }}>Down to the minute.</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}>
                Log cash game sessions in seconds. Track buy-ins, cash-outs, duration, stakes, game type, and notes — all in one place.
              </p>
              <div className="flex flex-col gap-4">
                <Bullet>NL Hold'em, PLO or any variant you play</Bullet>
                <Bullet>Duration tracked automatically or entered manually</Bullet>
                <Bullet>Attach notes to capture key table moments</Bullet>
                <Bullet>Assign sessions to groups for shared tracking</Bullet>
              </div>
            </FadeIn>
          </div>
          {/* Mock cards */}
          <div className="flex flex-col gap-4">
            <SessionCard delay={0}   gameType="NL Hold'em" stakes="2/5"  date="Apr 14"  duration="3h 20m" buyIn={2000} cashOut={4500} profit={2500}  isWin={true}  />
            <SessionCard delay={120} gameType="PLO"        stakes="1/2"  date="Apr 12"  duration="5h 10m" buyIn={3000} cashOut={1800} profit={1200}  isWin={false} />
            <SessionCard delay={240} gameType="NL Hold'em" stakes="5/10" date="Apr 10"  duration="2h 45m" buyIn={5000} cashOut={9200} profit={4200}  isWin={true}  />
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ════════════════════════════════════════════════════════════════════
          4 — BANKROLL
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "var(--color-bg-elevated)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <Label>Bankroll Manager</Label>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>
                Watch your bankroll{" "}
                <span style={{ color: "var(--color-gold)" }}>grow.</span>
              </h2>
              <p className="text-base max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}>
                A running graph of every session. See wins, losses, and the overall trend at a glance. Your edge, visualised.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div
              className="rounded-2xl p-6 sm:p-8 mb-8"
              style={{ background: "#0d0d0d", border: "1px solid var(--color-border)", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>Total profit</div>
                  <div className="text-2xl font-bold" style={{ color: "#22c55e", fontFamily: "var(--font-primary)" }}>
                    +₹<Counter target={24300} />
                  </div>
                </div>
                <div
                  className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)", fontFamily: "var(--font-secondary)" }}
                >
                  ↑ 18% this month
                </div>
              </div>
              <BankrollChart />
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Sessions played", target: 24, suffix: "" },
              { label: "Win rate",        target: 71, suffix: "%" },
              { label: "Best session",    target: 9200, prefix: "₹" },
              { label: "Hours logged",    target: 148, suffix: "h" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 80}>
                <div
                  className="rounded-xl p-5 text-center"
                  style={{ background: "#0d0d0d", border: "1px solid var(--color-border)" }}
                >
                  <div className="text-2xl font-bold mb-1" style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}>
                    <Counter target={s.target} prefix={s.prefix ?? ""} suffix={s.suffix} />
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ════════════════════════════════════════════════════════════════════
          5 — HAND HISTORY
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#080808" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mock hands */}
          <div className="flex flex-col gap-4 order-2 lg:order-1">
            <HandCard delay={0}   cards={[{ rank:"A", suit:"♠" }, { rank:"K", suit:"♥", red:true }]}  position="BTN" result="won"  amount={2400} />
            <HandCard delay={150} cards={[{ rank:"Q", suit:"♥", red:true }, { rank:"Q", suit:"♦", red:true }]} position="CO"  result="lost" amount={1800} />
            <HandCard delay={300} cards={[{ rank:"J", suit:"♠" }, { rank:"T", suit:"♠" }]}             position="SB"  result="won"  amount={3600} />
          </div>
          {/* Text */}
          <div className="order-1 lg:order-2">
            <FadeIn direction="right">
              <Label>Hand History</Label>
              <h2
                className="text-3xl sm:text-4xl font-extrabold mb-5 leading-tight"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
              >
                Study every{" "}
                <span style={{ color: "var(--color-gold)" }}>decision.</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}>
                Log hands with a custom card-picker keyboard built for speed. Capture hole cards, positions, street-by-street actions, and the result — with the detail that actually matters.
              </p>
              <div className="flex flex-col gap-4">
                <Bullet>Custom 52-card grid picker for fast hole card entry</Bullet>
                <Bullet>Log pre-flop, flop, turn, and river separately</Bullet>
                <Bullet>Record pot size, result, and hand notes</Bullet>
                <Bullet>Export your full hand history to Excel anytime</Bullet>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <GoldDivider />

      {/* ════════════════════════════════════════════════════════════════════
          6 — GROUPS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "var(--color-bg-elevated)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <FadeIn direction="left">
              <Label>Groups</Label>
              <h2
                className="text-3xl sm:text-4xl font-extrabold mb-5 leading-tight"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
              >
                Compete with{" "}
                <span style={{ color: "var(--color-gold)" }}>your crew.</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}>
                Create an invite-only group for your regular game. Everyone tracks their own sessions and you get a shared leaderboard that updates automatically.
              </p>
              <div className="flex flex-col gap-4">
                <Bullet>Generate a one-click invite link to add members</Bullet>
                <Bullet>Live leaderboard ranked by total profit</Bullet>
                <Bullet>Each member owns their own data and privacy</Bullet>
                <Bullet>Filter stats by time period across the group</Bullet>
              </div>
            </FadeIn>
          </div>
          {/* Leaderboard */}
          <GroupLeaderboard />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          7 — FINAL CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-36 px-6 overflow-hidden" style={{ background: "#080808" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: "700px", height: "700px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 62%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
          <FadeIn>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 mx-auto"
              style={{ background: "var(--color-gold)", animation: "goldPulse 3s ease-in-out infinite" }}
            >
              <span className="text-2xl font-extrabold leading-none" style={{ color: "#080808", fontFamily: "var(--font-primary)" }}>O</span>
            </div>
            <h2
              className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6"
              style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)", textWrap: "balance" } as React.CSSProperties}
            >
              Ready to level up{" "}
              <span style={{ color: "var(--color-gold)" }}>your game?</span>
            </h2>
            <p
              className="text-base sm:text-lg leading-relaxed mb-10 max-w-lg"
              style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}
            >
              Join players already tracking their sessions on Outs. Free to use, built for Indian cash games.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-[var(--radius-md)] text-base font-bold"
                style={{ background: "var(--color-gold)", color: "#080808", fontFamily: "var(--font-primary)", boxShadow: "0 0 36px rgba(212,175,55,0.4)" }}
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-[var(--radius-md)] text-base font-bold"
                style={{ background: "transparent", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", fontFamily: "var(--font-primary)" }}
              >
                Sign In
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid var(--color-border)" }}>
        <p className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
          © 2026 Outs · Built for the Indian poker community.
        </p>
      </footer>
    </div>
  );
}
