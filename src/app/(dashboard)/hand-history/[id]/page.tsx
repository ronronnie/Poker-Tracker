import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getHandById } from "@/app/actions/hand-history";
import { formatINR } from "@/lib/format";
import { DeleteHandButton } from "./_components/delete-hand-button";
import { StreetSection, ShowdownSection } from "./_components/street-section";

interface PageProps {
  params: Promise<{ id: string }>;
}

const GAME_LABEL: Record<string, string> = {
  cash: "Cash Game",
  tournament: "Tournament",
  sit_and_go: "Sit & Go",
};

const SUIT_INFO: Record<string, { sym: string; color: string }> = {
  s: { sym: "♠", color: "#e2e8f0" },
  h: { sym: "♥", color: "#ef4444" },
  d: { sym: "♦", color: "#ef4444" },
  c: { sym: "♣", color: "#22c55e" },
};

function MiniCard({ code }: { code: string }) {
  const rank = code.slice(0, -1);
  const suit = code.slice(-1);
  const info = SUIT_INFO[suit] ?? { sym: suit, color: "var(--color-text-muted)" };
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "30px", height: "38px", borderRadius: "4px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", fontSize: "11px", fontWeight: 700, color: info.color, gap: "1px", lineHeight: 1 }}>
      <span>{rank}</span>
      <span style={{ fontSize: "9px" }}>{info.sym}</span>
    </span>
  );
}

const RESULT_STYLES: Record<string, { color: string; label: string }> = {
  won:      { color: "#22c55e", label: "WON" },
  lost:     { color: "#ef4444", label: "LOST" },
  split:    { color: "#D4AF37", label: "SPLIT" },
  observed: { color: "#6b7280", label: "OBSERVED" },
};


export default async function HandDetailPage({ params }: PageProps) {
  const { id } = await params;
  const hand = await getHandById(id);
  if (!hand) notFound();

  const heroId = hand.hand_data?.players?.find((p) => p.is_hero)?.id;
  const resultStyle = hand.result ? RESULT_STYLES[hand.result] : null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          href="/hand-history"
          className="inline-flex items-center gap-1.5 text-sm"
          style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Hand History
        </Link>
      </div>

      {/* Header metadata */}
      <div
        className="flex flex-col gap-3 p-4 rounded-[var(--radius-lg)]"
        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>
              {new Date(hand.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {GAME_LABEL[hand.game_type] ?? hand.game_type}
              {hand.stakes ? ` · ${hand.stakes}` : ""}
            </p>
          </div>
          {resultStyle && (
            <span
              className="text-sm font-bold px-3 py-1 rounded-full shrink-0"
              style={{ background: `${resultStyle.color}1A`, color: resultStyle.color, border: `1px solid ${resultStyle.color}44` }}
            >
              {resultStyle.label}
            </span>
          )}
        </div>

        {/* Hero info */}
        {(hand.hero_position || (hand.hero_hole_cards && hand.hero_hole_cards.length > 0)) && (
          <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
            {hand.hero_position && (
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{ background: "rgba(212,175,55,0.1)", color: "var(--color-gold)", border: "1px solid rgba(212,175,55,0.25)" }}
              >
                {hand.hero_position}
              </span>
            )}
            {hand.hero_hole_cards && hand.hero_hole_cards.length > 0 && (
              <div className="flex gap-1">
                {hand.hero_hole_cards.map((c) => <MiniCard key={c} code={c} />)}
              </div>
            )}
            {hand.result_amount != null && (
              <span
                className="ml-auto text-base font-bold"
                style={{
                  color: hand.result === "won" || hand.result === "split"
                    ? "var(--color-success)"
                    : hand.result === "lost"
                    ? "var(--color-danger)"
                    : "var(--color-text-muted)",
                }}
              >
                {hand.result === "won" || hand.result === "split" ? "+" : hand.result === "lost" ? "−" : ""}
                {formatINR(Math.abs(hand.result_amount))}
              </span>
            )}
          </div>
        )}

        {hand.pot_total != null && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Pot:</span>
            <span className="font-semibold">{formatINR(hand.pot_total)}</span>
          </div>
        )}
      </div>

      {/* Streets */}
      {hand.hand_data && (
        <div className="flex flex-col gap-3">
          <StreetSection
            title="Pre-flop"
            actions={hand.hand_data.preflop?.actions ?? []}
            heroId={heroId}
          />
          {hand.hand_data.flop && (
            <StreetSection
              title="Flop"
              communityCards={hand.hand_data.flop.cards}
              actions={hand.hand_data.flop.actions}
              heroId={heroId}
            />
          )}
          {hand.hand_data.turn && (
            <StreetSection
              title="Turn"
              communityCards={hand.hand_data.turn.cards}
              actions={hand.hand_data.turn.actions}
              heroId={heroId}
            />
          )}
          {hand.hand_data.river && (
            <StreetSection
              title="River"
              communityCards={hand.hand_data.river.cards}
              actions={hand.hand_data.river.actions}
              heroId={heroId}
            />
          )}
          {hand.hand_data.showdown && hand.hand_data.showdown.length > 0 && (
            <ShowdownSection players={hand.hand_data.showdown} />
          )}
        </div>
      )}

      {/* Notes */}
      {hand.notes && (
        <div
          className="p-4 rounded-[var(--radius-lg)]"
          style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>Notes</p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>{hand.notes}</p>
        </div>
      )}

      {/* Delete */}
      <div className="flex justify-end pb-6">
        <DeleteHandButton id={hand.id} />
      </div>
    </div>
  );
}
