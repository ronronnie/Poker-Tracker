"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteHand } from "@/app/actions/hand-history";
import { toast } from "@/hooks/use-toast";

interface DeleteHandButtonProps {
  id: string;
}

export function DeleteHandButton({ id }: DeleteHandButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      try {
        await deleteHand(id);
        toast({ title: "Hand deleted", variant: "success" });
        router.push("/hand-history");
      } catch {
        toast({ title: "Failed to delete hand", variant: "error" });
        setConfirming(false);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {confirming && (
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          style={{
            height: "36px",
            padding: "0 14px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="flex items-center gap-1.5"
        style={{
          height: "36px",
          padding: "0 14px",
          borderRadius: "var(--radius-md)",
          background: confirming ? "var(--color-danger)" : "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.3)",
          color: confirming ? "#fff" : "var(--color-danger)",
          fontSize: "13px",
          fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.5 : 1,
          transition: "background 0.15s",
        }}
      >
        {isPending ? (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        {confirming ? "Confirm Delete" : "Delete Hand"}
      </button>
    </div>
  );
}
