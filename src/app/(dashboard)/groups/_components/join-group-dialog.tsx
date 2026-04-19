"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinGroupByCode } from "@/app/actions/groups";
import { toast } from "@/hooks/use-toast";

interface Props { trigger: React.ReactNode }

export function JoinGroupDialog({ trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [code, setCode] = React.useState("");
  const router = useRouter();

  function handleClose() { if (!isPending) { setOpen(false); setCode(""); } }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    startTransition(async () => {
      try {
        const { groupId, alreadyMember } = await joinGroupByCode(code);
        toast({
          title: alreadyMember ? "Already a member" : "Joined!",
          description: alreadyMember ? "You're already in this group." : "Welcome to the group.",
          variant: "success",
        });
        setOpen(false);
        setCode("");
        router.push(`/groups/${groupId}`);
      } catch (err) {
        toast({ title: "Invalid or expired invite code.", variant: "error" });
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!isPending) setOpen(v); }}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }} />
        <Dialog.Content
          className={[
            "fixed z-50 flex flex-col",
            "bottom-0 left-0 right-0 rounded-t-[var(--radius-xl)] max-h-[90dvh]",
            "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[400px] sm:rounded-[var(--radius-xl)]",
          ].join(" ")}
          style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <Dialog.Title className="text-base font-bold" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}>
              Join a Group
            </Dialog.Title>
            <Dialog.Close asChild>
              <button onClick={handleClose} disabled={isPending} className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center disabled:opacity-40" style={{ color: "var(--color-text-muted)", background: "var(--color-bg-subtle)" }}>
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="jg-code">Invite Code</Label>
              <Input
                id="jg-code"
                placeholder="e.g. ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="tracking-widest text-center text-lg font-bold uppercase"
                maxLength={8}
                required
              />
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Ask the group admin for the 6-character invite code.
              </p>
            </div>
            <div className="flex gap-3 pt-1" style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom))" }}>
              <Button type="button" variant="secondary" size="lg" className="flex-1" disabled={isPending} onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="primary" size="lg" className="flex-1" loading={isPending} disabled={!code.trim() || isPending}>
                Join Group
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
