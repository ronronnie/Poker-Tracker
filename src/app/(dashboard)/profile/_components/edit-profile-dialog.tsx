"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "@/hooks/use-toast";

interface Props {
  currentName:     string | null;
  currentUsername: string | null;
}

export function EditProfileDialog({ currentName, currentUsername }: Props) {
  const [open, setOpen]         = React.useState(false);
  const [isPending, start]      = React.useTransition();
  const [name, setName]         = React.useState(currentName     ?? "");
  const [username, setUsername] = React.useState(currentUsername ?? "");

  // Sync with latest saved values when dialog opens
  React.useEffect(() => {
    if (open) {
      setName(currentName     ?? "");
      setUsername(currentUsername ?? "");
    }
  }, [open, currentName, currentUsername]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        await updateProfile({ full_name: name, username });
        toast({ title: "Profile updated", variant: "success" });
        setOpen(false);
      } catch (err) {
        toast({
          title: err instanceof Error ? err.message : "Failed to update",
          variant: "error",
        });
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!isPending) setOpen(v); }}>
      <Dialog.Trigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Pencil className="w-3.5 h-3.5" />
          Edit Profile
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
        />
        <Dialog.Content
          className={[
            "fixed z-50 flex flex-col",
            "bottom-0 left-0 right-0 rounded-t-[var(--radius-xl)] max-h-[90dvh]",
            "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[420px] sm:rounded-[var(--radius-xl)]",
          ].join(" ")}
          style={{
            background:  "var(--color-bg-elevated)",
            border:      "1px solid var(--color-border)",
            boxShadow:   "0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <Dialog.Title
              className="text-base font-bold"
              style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
            >
              Edit Profile
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                disabled={isPending}
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center disabled:opacity-40"
                style={{ color: "var(--color-text-muted)", background: "var(--color-bg-subtle)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-name">Full Name</Label>
              <Input
                id="ep-name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ep-username">
                Username{" "}
                <span style={{ color: "var(--color-text-muted)" }}>(optional)</span>
              </Label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  @
                </span>
                <Input
                  id="ep-username"
                  placeholder="yourhandle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="pl-7"
                />
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Lowercase letters, numbers and underscores only.
              </p>
            </div>

            <div
              className="flex gap-3 pt-1"
              style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom))" }}
            >
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                loading={isPending}
                disabled={isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
