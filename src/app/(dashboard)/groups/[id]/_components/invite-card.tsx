"use client";

import * as React from "react";
import { Copy, Share2, Check } from "lucide-react";

interface Props {
  inviteCode: string;
  groupName: string;
}

export function InviteCard({ inviteCode, groupName }: Props) {
  const [copied, setCopied] = React.useState(false);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${inviteCode}`
      : `/join/${inviteCode}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the text
    }
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({
        title: `Join ${groupName} on Outs`,
        text: `You've been invited to join ${groupName}. Use code: ${inviteCode}`,
        url: inviteUrl,
      });
    } else {
      copyLink();
    }
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] p-4 sm:p-5"
      style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
    >
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>
        Invite others
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Invite code badge */}
        <div
          className="flex items-center justify-center px-4 py-2.5 rounded-[var(--radius-md)] shrink-0"
          style={{ background: "var(--color-bg-subtle)", border: "1px solid var(--color-border)" }}
        >
          <span
            className="text-xl font-extrabold tracking-[0.3em]"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-primary)" }}
          >
            {inviteCode}
          </span>
        </div>

        {/* Link preview */}
        <div
          className="flex-1 px-3 py-2 rounded-[var(--radius-md)] text-xs truncate"
          style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
        >
          {typeof window !== "undefined" ? inviteUrl : `/join/${inviteCode}`}
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-colors"
            style={{
              background: copied ? "rgba(34,197,94,0.15)" : "var(--color-bg-subtle)",
              color: copied ? "var(--color-success)" : "var(--color-text-primary)",
              border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "var(--color-border)"}`,
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={shareLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-colors sm:hidden"
            style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
