"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { CardPicker } from "@/components/hand-entry/card-picker";
import { PositionPicker } from "@/components/hand-entry/position-picker";
import { ActionPicker } from "@/components/hand-entry/action-picker";
import { Button } from "@/components/ui/button";
import { createHand, getSessionOptions, type SessionOption } from "@/app/actions/hand-history";
import { toast } from "@/hooks/use-toast";
import { ActionType, PlayerAction, PlayerSetup, HandData } from "@/lib/hand-types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface StreetActions {
  [playerId: string]: { action: ActionType | ""; amount: number | undefined };
}

interface WizardState {
  // Step 1
  date: string;
  game_type: "cash" | "tournament" | "sit_and_go";
  stakes: string;
  session_id: string;
  // Step 2
  players: PlayerSetup[];
  // Step 3 - preflop
  preflopActions: StreetActions;
  // Step 4 - flop
  flopCards: string[];
  flopActions: StreetActions;
  // Step 5 - turn
  turnCard: string[];
  turnActions: StreetActions;
  // Step 6 - river
  riverCard: string[];
  riverActions: StreetActions;
  // Step 7 - result
  showdownCards: { [playerId: string]: string[] };
  showdownWinners: { [playerId: string]: boolean };
  potTotal: number | undefined;
  heroResult: string;
  resultAmount: number | undefined;
  notes: string;
}

// ── Position order ─────────────────────────────────────────────────────────────

const POSITION_ORDER = ["SB", "BB", "UTG", "UTG+1", "LJ", "HJ", "CO", "BTN"];

function sortByPosition(players: PlayerSetup[]): PlayerSetup[] {
  return [...players].sort((a, b) => {
    const ai = POSITION_ORDER.indexOf(a.position);
    const bi = POSITION_ORDER.indexOf(b.position);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function allUsedCards(state: WizardState, excludePlayerId?: string): string[] {
  const cards: string[] = [];
  state.players.forEach((p) => {
    if (p.id !== excludePlayerId) cards.push(...p.hole_cards);
  });
  cards.push(...state.flopCards, ...state.turnCard, ...state.riverCard);
  Object.entries(state.showdownCards).forEach(([pid, c]) => {
    if (pid !== excludePlayerId) cards.push(...c);
  });
  return cards;
}

function playersFoldedInStreet(actions: StreetActions, players: PlayerSetup[]): Set<string> {
  const folded = new Set<string>();
  players.forEach((p) => {
    if (actions[p.id]?.action === "fold") folded.add(p.id);
  });
  return folded;
}

function activePlayers(players: PlayerSetup[], ...streetActions: StreetActions[]): PlayerSetup[] {
  const foldedIds = new Set<string>();
  for (const sa of streetActions) {
    players.forEach((p) => {
      if (sa[p.id]?.action === "fold") foldedIds.add(p.id);
    });
  }
  return players.filter((p) => !foldedIds.has(p.id));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
      {children}
    </label>
  );
}

function NativeInput({
  id, type = "text", value, onChange, placeholder, min, max, className, style, required,
}: {
  id?: string; type?: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; min?: string | number; max?: string | number;
  className?: string; style?: React.CSSProperties; required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      required={required}
      className={className}
      style={{
        width: "100%",
        height: "44px",
        padding: "0 12px",
        borderRadius: "var(--radius-md)",
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-primary)",
        fontSize: "14px",
        outline: "none",
        ...style,
      }}
    />
  );
}

// ── Player sub-form ────────────────────────────────────────────────────────────

interface AddPlayerFormProps {
  usedPositions: string[];
  usedCards: string[];
  onAdd: (p: PlayerSetup) => void;
  onCancel: () => void;
  hasHero: boolean;
}

function AddPlayerForm({ usedPositions, usedCards, onAdd, onCancel, hasHero }: AddPlayerFormProps) {
  const [name, setName] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [isHero, setIsHero] = React.useState(!hasHero);
  const [holeCards, setHoleCards] = React.useState<string[]>([]);

  function submit() {
    if (!name.trim() || !position) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      position,
      is_hero: isHero,
      hole_cards: holeCards,
    });
  }

  return (
    <div
      className="flex flex-col gap-3 p-3 rounded-[var(--radius-md)]"
      style={{ background: "var(--color-bg-primary)", border: "1px solid var(--color-border)" }}
    >
      <SectionLabel>New Player</SectionLabel>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Name</FieldLabel>
        <NativeInput value={name} onChange={setName} placeholder="Player name" />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ap-hero"
          checked={isHero}
          onChange={(e) => setIsHero(e.target.checked)}
          style={{ accentColor: "var(--color-gold)", width: "16px", height: "16px" }}
        />
        <label htmlFor="ap-hero" className="text-sm" style={{ color: "var(--color-text-secondary)", cursor: "pointer" }}>
          Mark as Me (Hero)
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Position</FieldLabel>
        <PositionPicker value={position} onChange={setPosition} usedPositions={usedPositions} />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Hole Cards (optional — 2 max)</FieldLabel>
        <CardPicker
          selected={holeCards}
          max={2}
          onChange={setHoleCards}
          usedCards={usedCards}
        />
      </div>

      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1, height: "36px", borderRadius: "var(--radius-md)", fontSize: "13px",
            background: "transparent", border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)", cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim() || !position}
          style={{
            flex: 2, height: "36px", borderRadius: "var(--radius-md)", fontSize: "13px",
            fontWeight: 600, background: "var(--color-gold)", border: "none",
            color: "#080808", cursor: !name.trim() || !position ? "not-allowed" : "pointer",
            opacity: !name.trim() || !position ? 0.5 : 1,
          }}
        >
          Add Player
        </button>
      </div>
    </div>
  );
}

// ── Street action row ──────────────────────────────────────────────────────────

function StreetActionRow({
  player, streetActions, onUpdate,
}: {
  player: PlayerSetup;
  streetActions: StreetActions;
  onUpdate: (pid: string, action: ActionType | "", amount: number | undefined) => void;
}) {
  const current = streetActions[player.id] ?? { action: "", amount: undefined };
  const needsAmount = ["bet", "raise", "call", "all_in"].includes(current.action);

  return (
    <div className="flex flex-col gap-2 py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded"
          style={{
            background: player.is_hero ? "rgba(212,175,55,0.15)" : "var(--color-bg-subtle)",
            color: player.is_hero ? "var(--color-gold)" : "var(--color-text-muted)",
            border: `1px solid ${player.is_hero ? "rgba(212,175,55,0.3)" : "var(--color-border)"}`,
          }}
        >
          {player.position}
        </span>
        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          {player.name}
          {player.is_hero && (
            <span className="ml-1 text-xs" style={{ color: "var(--color-gold)" }}>(you)</span>
          )}
        </span>
      </div>
      <ActionPicker
        value={current.action as ActionType | ""}
        onChange={(a) => onUpdate(player.id, a, current.amount)}
      />
      {needsAmount && (
        <input
          type="number"
          min={0}
          placeholder="Amount (₹)"
          value={current.amount ?? ""}
          onChange={(e) => onUpdate(player.id, current.action as ActionType, e.target.value ? parseFloat(e.target.value) : undefined)}
          style={{
            width: "140px",
            height: "36px",
            padding: "0 10px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            fontSize: "14px",
          }}
        />
      )}
    </div>
  );
}

// ── Mini card display ──────────────────────────────────────────────────────────

function MiniCard({ code }: { code: string }) {
  const rank = code.slice(0, -1);
  const suit = code.slice(-1);
  const suitInfo: Record<string, { sym: string; color: string }> = {
    s: { sym: "♠", color: "#e2e8f0" },
    h: { sym: "♥", color: "#ef4444" },
    d: { sym: "♦", color: "#ef4444" },
    c: { sym: "♣", color: "#22c55e" },
  };
  const info = suitInfo[suit] ?? { sym: suit, color: "var(--color-text-muted)" };
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "42px",
        borderRadius: "4px",
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        fontSize: "11px",
        fontWeight: 700,
        color: info.color,
        gap: "1px",
        lineHeight: 1,
      }}
    >
      <span>{rank}</span>
      <span style={{ fontSize: "10px" }}>{info.sym}</span>
    </span>
  );
}

// ── Main Wizard ────────────────────────────────────────────────────────────────

interface LogHandWizardProps {
  trigger: React.ReactNode;
}

const TOTAL_STEPS = 7;

const GAME_LABELS: Record<string, string> = {
  cash: "Cash",
  tournament: "Tournament",
  sit_and_go: "Sit & Go",
};

const RESULT_OPTIONS = [
  { value: "observed", label: "Observed", color: "#6b7280" },
  { value: "won",      label: "Won",      color: "#22c55e" },
  { value: "lost",     label: "Lost",     color: "#ef4444" },
  { value: "split",    label: "Split",    color: "#D4AF37" },
];

function initState(): WizardState {
  return {
    date: todayStr(),
    game_type: "cash",
    stakes: "",
    session_id: "",
    players: [],
    preflopActions: {},
    flopCards: [],
    flopActions: {},
    turnCard: [],
    turnActions: {},
    riverCard: [],
    riverActions: {},
    showdownCards: {},
    showdownWinners: {},
    potTotal: undefined,
    heroResult: "",
    resultAmount: undefined,
    notes: "",
  };
}

export function LogHandWizard({ trigger }: LogHandWizardProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [state, setState] = React.useState<WizardState>(initState);
  const [showAddPlayer, setShowAddPlayer] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [sessions, setSessions] = React.useState<SessionOption[]>([]);
  const [stepError, setStepError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setState(initState());
      setStep(1);
      setShowAddPlayer(false);
      setStepError("");
      getSessionOptions().then(setSessions).catch(() => {});
    }
  }, [open]);

  const sorted = sortByPosition(state.players);
  const heroPlayer = state.players.find((p) => p.is_hero);

  // Players active going into each street
  const flopPlayers = activePlayers(sorted, state.preflopActions);
  const turnPlayers = activePlayers(sorted, state.preflopActions, state.flopActions);
  const riverPlayers = activePlayers(sorted, state.preflopActions, state.flopActions, state.turnActions);
  const showdownEligible = activePlayers(sorted, state.preflopActions, state.flopActions, state.turnActions, state.riverActions);

  function updateStreetActions(street: keyof Pick<WizardState, "preflopActions" | "flopActions" | "turnActions" | "riverActions">) {
    return (pid: string, action: ActionType | "", amount: number | undefined) => {
      setState((prev) => ({
        ...prev,
        [street]: { ...prev[street], [pid]: { action, amount } },
      }));
    };
  }

  function validateStep(): string {
    if (step === 1 && !state.date) return "Date is required.";
    if (step === 2) {
      if (state.players.length < 2) return "Add at least 2 players.";
      const positions = state.players.map((p) => p.position);
      if (new Set(positions).size !== positions.length) return "Each player must have a unique position.";
    }
    return "";
  }

  function goNext() {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setStepError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  function skipToResult() {
    setStep(TOTAL_STEPS);
    setStepError("");
  }

  function buildHandData(): HandData {
    function buildActions(sa: StreetActions, players: PlayerSetup[]): PlayerAction[] {
      return sortByPosition(players)
        .filter((p) => sa[p.id]?.action)
        .map((p) => ({
          player_id: p.id,
          player_name: p.name,
          position: p.position,
          is_hero: p.is_hero,
          action: sa[p.id].action as ActionType,
          amount: sa[p.id].amount,
        }));
    }

    const data: HandData = {
      players: sorted,
      preflop: { actions: buildActions(state.preflopActions, sorted) },
    };

    if (state.flopCards.length > 0 || buildActions(state.flopActions, flopPlayers).length > 0) {
      data.flop = { cards: state.flopCards, actions: buildActions(state.flopActions, flopPlayers) };
    }
    if (state.turnCard.length > 0 || buildActions(state.turnActions, turnPlayers).length > 0) {
      data.turn = { cards: state.turnCard, actions: buildActions(state.turnActions, turnPlayers) };
    }
    if (state.riverCard.length > 0 || buildActions(state.riverActions, riverPlayers).length > 0) {
      data.river = { cards: state.riverCard, actions: buildActions(state.riverActions, riverPlayers) };
    }

    const showdownPlayers = showdownEligible
      .filter((p) => state.showdownCards[p.id]?.length > 0 || state.showdownWinners[p.id])
      .map((p) => ({
        player_id: p.id,
        player_name: p.name,
        position: p.position,
        hole_cards: state.showdownCards[p.id] ?? p.hole_cards,
        is_winner: state.showdownWinners[p.id] ?? false,
      }));
    if (showdownPlayers.length > 0) data.showdown = showdownPlayers;

    return data;
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        const handData = buildHandData();
        const heroCards = heroPlayer?.hole_cards?.length ? heroPlayer.hole_cards : undefined;

        await createHand({
          date: state.date,
          game_type: state.game_type,
          stakes: state.stakes || undefined,
          session_id: state.session_id || undefined,
          hero_position: heroPlayer?.position || undefined,
          hero_hole_cards: heroCards,
          result: state.heroResult || undefined,
          result_amount: state.resultAmount,
          pot_total: state.potTotal,
          notes: state.notes || undefined,
          hand_data: handData,
        });

        toast({ title: "Hand logged!", variant: "success" });
        setOpen(false);
        router.refresh();
      } catch {
        toast({ title: "Something went wrong", variant: "error" });
      }
    });
  }

  // ── Render steps ─────────────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <SectionLabel>Hand Info</SectionLabel>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Date *</FieldLabel>
              <NativeInput
                type="date"
                value={state.date}
                onChange={(v) => setState((s) => ({ ...s, date: v }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Game Type</FieldLabel>
              <div className="flex gap-2">
                {(["cash", "tournament", "sit_and_go"] as const).map((gt) => (
                  <button
                    key={gt}
                    type="button"
                    onClick={() => setState((s) => ({ ...s, game_type: gt }))}
                    style={{
                      flex: 1,
                      height: "36px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: state.game_type === gt ? "var(--color-gold)" : "var(--color-bg-subtle)",
                      border: `1px solid ${state.game_type === gt ? "var(--color-gold)" : "var(--color-border)"}`,
                      color: state.game_type === gt ? "#080808" : "var(--color-text-secondary)",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                  >
                    {GAME_LABELS[gt]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Stakes</FieldLabel>
              <NativeInput
                value={state.stakes}
                onChange={(v) => setState((s) => ({ ...s, stakes: v }))}
                placeholder="e.g. 1/2, 2/5"
              />
            </div>

            {sessions.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Link to Session (optional)</FieldLabel>
                <select
                  value={state.session_id}
                  onChange={(e) => setState((s) => ({ ...s, session_id: e.target.value }))}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    fontSize: "14px",
                  }}
                >
                  <option value="">No session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.date).toLocaleDateString("en-IN")} —{" "}
                      {s.venue ?? GAME_LABELS[s.game_type]}
                      {s.stakes ? ` (${s.stakes})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-4">
            <SectionLabel>Players ({state.players.length})</SectionLabel>

            {state.players.length === 0 && !showAddPlayer && (
              <div
                className="py-6 text-center rounded-[var(--radius-md)]"
                style={{ background: "var(--color-bg-subtle)", border: "1px dashed var(--color-border)" }}
              >
                <User className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--color-text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No players yet. Add at least 2.</p>
              </div>
            )}

            {/* Player list */}
            {sorted.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]"
                style={{ background: "var(--color-bg-subtle)", border: "1px solid var(--color-border)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: p.is_hero ? "var(--color-gold)" : "var(--color-bg-elevated)",
                    color: p.is_hero ? "#080808" : "var(--color-text-muted)",
                  }}
                >
                  {p.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {p.name}
                    {p.is_hero && (
                      <span
                        className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(212,175,55,0.15)", color: "var(--color-gold)", border: "1px solid rgba(212,175,55,0.3)" }}
                      >
                        HERO
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{p.position}</span>
                    {p.hole_cards.length > 0 && (
                      <div className="flex gap-0.5">
                        {p.hole_cards.map((c) => <MiniCard key={c} code={c} />)}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, players: prev.players.filter((pl) => pl.id !== p.id) }))}
                  style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {showAddPlayer ? (
              <AddPlayerForm
                usedPositions={state.players.map((p) => p.position)}
                usedCards={state.players.flatMap((p) => p.hole_cards)}
                hasHero={!!heroPlayer}
                onAdd={(p) => {
                  setState((prev) => ({ ...prev, players: [...prev.players, p] }));
                  setShowAddPlayer(false);
                }}
                onCancel={() => setShowAddPlayer(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowAddPlayer(true)}
                className="flex items-center justify-center gap-2"
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  background: "transparent",
                  border: "1px dashed var(--color-border)",
                  color: "var(--color-text-secondary)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Plus className="w-4 h-4" />
                Add Player
              </button>
            )}
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-4">
            <SectionLabel>Pre-flop Actions</SectionLabel>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Log each player&apos;s pre-flop action.
            </p>
            {sorted.map((p) => (
              <StreetActionRow
                key={p.id}
                player={p}
                streetActions={state.preflopActions}
                onUpdate={updateStreetActions("preflopActions")}
              />
            ))}
            <button
              type="button"
              onClick={skipToResult}
              style={{
                marginTop: "8px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Skip to Result →
            </button>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-4">
            <SectionLabel>Flop</SectionLabel>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Flop Cards (3)</FieldLabel>
              <CardPicker
                selected={state.flopCards}
                max={3}
                onChange={(c) => setState((s) => ({ ...s, flopCards: c }))}
                usedCards={allUsedCards(state).filter((c) => !state.flopCards.includes(c))}
              />
            </div>

            {flopPlayers.length > 0 && (
              <>
                <SectionLabel>Flop Actions</SectionLabel>
                {flopPlayers.map((p) => (
                  <StreetActionRow
                    key={p.id}
                    player={p}
                    streetActions={state.flopActions}
                    onUpdate={updateStreetActions("flopActions")}
                  />
                ))}
              </>
            )}

            <button
              type="button"
              onClick={skipToResult}
              style={{
                marginTop: "8px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Skip Turn &amp; River →
            </button>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col gap-4">
            <SectionLabel>Turn</SectionLabel>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Turn Card (1)</FieldLabel>
              <CardPicker
                selected={state.turnCard}
                max={1}
                onChange={(c) => setState((s) => ({ ...s, turnCard: c }))}
                usedCards={allUsedCards(state).filter((c) => !state.turnCard.includes(c))}
              />
            </div>

            {turnPlayers.length > 0 && (
              <>
                <SectionLabel>Turn Actions</SectionLabel>
                {turnPlayers.map((p) => (
                  <StreetActionRow
                    key={p.id}
                    player={p}
                    streetActions={state.turnActions}
                    onUpdate={updateStreetActions("turnActions")}
                  />
                ))}
              </>
            )}
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col gap-4">
            <SectionLabel>River</SectionLabel>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>River Card (1)</FieldLabel>
              <CardPicker
                selected={state.riverCard}
                max={1}
                onChange={(c) => setState((s) => ({ ...s, riverCard: c }))}
                usedCards={allUsedCards(state).filter((c) => !state.riverCard.includes(c))}
              />
            </div>

            {riverPlayers.length > 0 && (
              <>
                <SectionLabel>River Actions</SectionLabel>
                {riverPlayers.map((p) => (
                  <StreetActionRow
                    key={p.id}
                    player={p}
                    streetActions={state.riverActions}
                    onUpdate={updateStreetActions("riverActions")}
                  />
                ))}
              </>
            )}
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col gap-4">
            <SectionLabel>Result</SectionLabel>

            {/* Showdown */}
            {showdownEligible.length > 1 && (
              <div className="flex flex-col gap-3">
                <FieldLabel>Showdown — Reveal Cards & Winner</FieldLabel>
                {showdownEligible.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 p-3 rounded-[var(--radius-md)]"
                    style={{ background: "var(--color-bg-subtle)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {p.name}
                        <span className="ml-1 text-xs" style={{ color: "var(--color-text-muted)" }}>({p.position})</span>
                      </span>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--color-success)" }}>
                        <input
                          type="checkbox"
                          checked={state.showdownWinners[p.id] ?? false}
                          onChange={(e) => setState((prev) => ({
                            ...prev,
                            showdownWinners: { ...prev.showdownWinners, [p.id]: e.target.checked },
                          }))}
                          style={{ accentColor: "#22c55e" }}
                        />
                        Winner
                      </label>
                    </div>
                    <CardPicker
                      selected={state.showdownCards[p.id] ?? (p.hole_cards.length > 0 ? p.hole_cards : [])}
                      max={2}
                      onChange={(c) => setState((prev) => ({
                        ...prev,
                        showdownCards: { ...prev.showdownCards, [p.id]: c },
                      }))}
                      usedCards={allUsedCards(state).filter((c) => !(state.showdownCards[p.id] ?? p.hole_cards).includes(c))}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pot Total */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Pot Total (₹)</FieldLabel>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={state.potTotal ?? ""}
                onChange={(e) => setState((s) => ({ ...s, potTotal: e.target.value ? parseFloat(e.target.value) : undefined }))}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Hero result */}
            {heroPlayer && (
              <>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>My Result</FieldLabel>
                  <div className="flex gap-2 flex-wrap">
                    {RESULT_OPTIONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setState((s) => ({ ...s, heroResult: r.value }))}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "var(--radius-md)",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: state.heroResult === r.value ? r.color : "var(--color-bg-subtle)",
                          border: `1px solid ${state.heroResult === r.value ? r.color : "var(--color-border)"}`,
                          color: state.heroResult === r.value ? (r.value === "won" || r.value === "split" ? "#080808" : "#fff") : "var(--color-text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        {r.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {state.heroResult && state.heroResult !== "observed" && (
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Amount (₹)</FieldLabel>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={state.resultAmount ?? ""}
                      onChange={(e) => setState((s) => ({ ...s, resultAmount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 12px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Notes</FieldLabel>
              <textarea
                value={state.notes}
                onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
                placeholder="Key reads, mistakes, analysis…"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  fontSize: "14px",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>
          </div>
        );
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!isPending) setOpen(v); }}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
        />

        <Dialog.Content
          className={[
            "fixed z-50 flex flex-col",
            "bottom-0 left-0 right-0",
            "rounded-t-[var(--radius-xl)]",
            "max-h-[92dvh]",
            "sm:bottom-auto sm:left-1/2 sm:right-auto",
            "sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
            "sm:w-[560px]",
            "sm:max-h-[85vh]",
            "sm:rounded-[var(--radius-xl)]",
          ].join(" ")}
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <Dialog.Title
                className="text-base font-bold"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
              >
                Log Hand
              </Dialog.Title>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(212,175,55,0.1)", color: "var(--color-gold)", border: "1px solid rgba(212,175,55,0.2)" }}
              >
                {step}/{TOTAL_STEPS}
              </span>
            </div>
            <Dialog.Close asChild>
              <button
                disabled={isPending}
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
                style={{ color: "var(--color-text-muted)", background: "var(--color-bg-subtle)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Step indicator bar */}
          <div className="flex gap-1 px-5 pt-3 shrink-0">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "3px",
                  borderRadius: "2px",
                  background: i < step ? "var(--color-gold)" : "var(--color-bg-subtle)",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>

          {/* Step label */}
          <div className="px-5 pt-2 pb-0 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
              {["Hand Info", "Players", "Pre-flop", "Flop", "Turn", "River", "Result"][step - 1]}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {renderStep()}

            {stepError && (
              <p className="mt-3 text-sm" style={{ color: "var(--color-danger)" }}>{stepError}</p>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 px-5 py-4 shrink-0"
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
            }}
          >
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={isPending}
                className="flex-1"
                onClick={goBack}
              >
                Back
              </Button>
            ) : (
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="lg" disabled={isPending} className="flex-1">
                  Cancel
                </Button>
              </Dialog.Close>
            )}

            {step < TOTAL_STEPS ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={goNext}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={isPending}
                disabled={isPending}
                className="flex-1"
                onClick={handleSubmit}
              >
                Save Hand
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
