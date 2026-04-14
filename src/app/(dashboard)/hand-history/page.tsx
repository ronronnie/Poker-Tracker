import * as React from "react";
import { BookOpen, Plus } from "lucide-react";
import { getHands } from "@/app/actions/hand-history";
import { HandCard } from "./_components/hand-card";
import { LogHandWizard } from "./_components/log-hand-wizard";
import { HandFilters } from "./_components/hand-filters";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{ gameType?: string; result?: string }>;
}

export default async function HandHistoryPage({ searchParams }: PageProps) {
  const { gameType = "all", result = "all" } = await searchParams;

  const hands = await getHands({
    gameType: gameType !== "all" ? gameType : undefined,
    result: result !== "all" ? result : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
        >
          Hand History
        </h1>
        <LogHandWizard
          trigger={
            <Button variant="primary" size="md" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Hand
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <HandFilters gameType={gameType} result={result} />

      {/* List */}
      {hands.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-[var(--radius-lg)]"
          style={{ background: "var(--color-bg-surface)", border: "1px dashed var(--color-border)" }}
        >
          <BookOpen className="w-10 h-10 mb-3" style={{ color: "var(--color-text-muted)" }} />
          <p className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
            No hands logged yet
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
            Start building your hand history to improve your game.
          </p>
          <LogHandWizard
            trigger={
              <Button variant="primary" size="md" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Log Your First Hand
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hands.map((hand) => (
            <HandCard key={hand.id} hand={hand} />
          ))}
        </div>
      )}
    </div>
  );
}
