"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSession, updateSession, type SessionRow } from "@/app/actions/sessions";
import { getMyGroupsSimple } from "@/app/actions/groups";
import { toast } from "@/hooks/use-toast";
import { formatINR, signOf } from "@/lib/format";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  date: z.string().min(1, "Date is required"),
  venue: z.string().optional(),
  game_type: z.enum(["cash", "tournament", "sit_and_go"]),
  stakes: z.string().optional(),
  buy_in: z.number({ error: "Enter a valid amount" }).min(1, "Buy-in must be at least ₹1"),
  cash_out: z.number({ error: "Enter a valid amount" }).min(0, "Cash-out can't be negative"),
  duration_hours: z.number().min(0).max(24).optional(),
  duration_mins: z.number().min(0).max(59).optional(),
  notes: z.string().optional(),
  group_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Helpers ────────────────────────────────────────────────────────────────────
const GAME_OPTIONS = [
  { value: "cash",        label: "Cash Game"   },
  { value: "tournament",  label: "Tournament"  },
  { value: "sit_and_go",  label: "Sit & Go"    },
];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sessionToDefaults(s: SessionRow): FormValues {
  const d = new Date(s.date);
  return {
    date: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`,
    venue:          s.venue    ?? "",
    game_type:      s.game_type,
    stakes:         s.stakes   ?? "",
    buy_in:         s.buy_in,
    cash_out:       s.cash_out,
    duration_hours: s.duration_minutes ? Math.floor(s.duration_minutes / 60) : undefined,
    duration_mins:  s.duration_minutes ? s.duration_minutes % 60 : undefined,
    notes:          s.notes ?? "",
  };
}

// ── Component ──────────────────────────────────────────────────────────────────
interface SessionFormProps {
  trigger: React.ReactNode;
  session?: SessionRow;
}

export function SessionForm({ trigger, session }: SessionFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [myGroups, setMyGroups] = React.useState<{ id: string; name: string }[]>([]);
  const isEdit = !!session;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: session
      ? sessionToDefaults(session)
      : { date: todayStr(), game_type: "cash", buy_in: undefined, cash_out: undefined },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        session
          ? sessionToDefaults(session)
          : { date: todayStr(), game_type: "cash", buy_in: undefined, cash_out: undefined }
      );
      // Fetch groups when dialog opens
      getMyGroupsSimple().then(setMyGroups).catch(() => {});
    }
  }, [open, session, reset]);

  // Live P&L preview
  const buyIn   = watch("buy_in")   ?? 0;
  const cashOut = watch("cash_out") ?? 0;
  const pl      = (Number(cashOut) || 0) - (Number(buyIn) || 0);
  const hasPL   = Number(buyIn) > 0 || Number(cashOut) > 0;

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      try {
        if (isEdit && session) {
          await updateSession(session.id, data);
          toast({ title: "Session updated", variant: "success" });
        } else {
          await createSession(data);
          toast({
            title: "Session logged!",
            description: `${signOf(pl)}${formatINR(pl)}`,
            variant: "success",
          });
        }
        setOpen(false);
      } catch {
        toast({ title: "Something went wrong", variant: "error" });
      }
    });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        // Prevent closing the dialog while submission is in flight
        if (!isPending) setOpen(v);
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
        />

        {/*
          Panel:
          - Mobile  → bottom sheet (slides up from bottom, full-width, top corners rounded)
          - Desktop → centred modal (sm: and above)
        */}
        <Dialog.Content
          className={[
            "fixed z-50 flex flex-col",
            // ── Mobile: bottom sheet ──────────────────────────────────────────
            "bottom-0 left-0 right-0",
            "rounded-t-[var(--radius-xl)]",
            "max-h-[92dvh]",
            // ── Desktop: centred modal ────────────────────────────────────────
            "sm:bottom-auto sm:left-1/2 sm:right-auto",
            "sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
            "sm:w-[480px]",
            "sm:rounded-[var(--radius-xl)]",
          ].join(" ")}
          style={{
            background:  "var(--color-bg-elevated)",
            border:      "1px solid var(--color-border)",
            boxShadow:   "0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0 sm:px-6 sm:py-5"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <Dialog.Title
              className="text-base font-bold"
              style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
            >
              {isEdit ? "Edit Session" : "Log Session"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                disabled={isPending}
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center transition-colors disabled:opacity-40"
                style={{ color: "var(--color-text-muted)", background: "var(--color-bg-subtle)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <form id="session-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">

              {/* Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="sf-date">Date <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                <Input id="sf-date" type="date" {...register("date")} error={!!errors.date} />
                {errors.date && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{errors.date.message}</p>}
              </div>

              {/* Game Type + Stakes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Game Type <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                  <Select
                    value={watch("game_type")}
                    onValueChange={(v) => setValue("game_type", v as FormValues["game_type"])}
                    options={GAME_OPTIONS}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sf-stakes">Stakes</Label>
                  <Input id="sf-stakes" placeholder="e.g. 1/2, 2/5" {...register("stakes")} />
                </div>
              </div>

              {/* Venue */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="sf-venue">Venue</Label>
                <Input id="sf-venue" placeholder="e.g. Kings Club, Home Game" {...register("venue")} />
              </div>

              {/* Buy-in / Cash-out */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sf-buyin">Buy-in (₹) <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                  <Input
                    id="sf-buyin"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="5000"
                    {...register("buy_in", { valueAsNumber: true })}
                    error={!!errors.buy_in}
                  />
                  {errors.buy_in && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{errors.buy_in.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sf-cashout">Cash-out (₹) <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                  <Input
                    id="sf-cashout"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="7500"
                    {...register("cash_out", { valueAsNumber: true })}
                    error={!!errors.cash_out}
                  />
                  {errors.cash_out && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{errors.cash_out.message}</p>}
                </div>
              </div>

              {/* P&L Preview */}
              {hasPL && (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)]"
                  style={{
                    background: pl > 0 ? "rgba(34,197,94,0.08)" : pl < 0 ? "rgba(239,68,68,0.08)" : "var(--color-bg-subtle)",
                    border: `1px solid ${pl > 0 ? "rgba(34,197,94,0.2)" : pl < 0 ? "rgba(239,68,68,0.2)" : "var(--color-border)"}`,
                  }}
                >
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Session P&L</span>
                  <span
                    className="text-base font-bold"
                    style={{
                      color: pl > 0 ? "var(--color-success)" : pl < 0 ? "var(--color-danger)" : "var(--color-text-muted)",
                      fontFamily: "var(--font-primary)",
                    }}
                  >
                    {signOf(pl)}{formatINR(Math.abs(pl))}
                  </span>
                </div>
              )}

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <Label>Duration</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      placeholder="0"
                      {...register("duration_hours", { valueAsNumber: true })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--color-text-muted)" }}>hrs</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="0"
                      {...register("duration_mins", { valueAsNumber: true })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--color-text-muted)" }}>min</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="sf-notes">Notes (optional)</Label>
                <Textarea
                  id="sf-notes"
                  placeholder="How did the session go? Key hands, reads, mistakes…"
                  {...register("notes")}
                />
              </div>

              {/* Group (optional) */}
              {myGroups.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Label>Group (optional)</Label>
                  <Select
                    value={watch("group_id") ?? "none"}
                    onValueChange={(v) => setValue("group_id", v === "none" ? undefined : v)}
                    options={[
                      { value: "none", label: "No group" },
                      ...myGroups.map((g) => ({ value: g.id, label: g.name })),
                    ]}
                    placeholder="Tag to a group…"
                  />
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 px-5 py-4 shrink-0 sm:px-6"
            style={{
              borderTop: "1px solid var(--color-border)",
              // Extra bottom padding on mobile so the footer clears the home indicator
              paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
            }}
          >
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              type="submit"
              form="session-form"
              variant="primary"
              size="lg"
              loading={isPending}
              disabled={isPending}
              className="flex-1"
            >
              {isEdit ? "Save Changes" : "Log Session"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
