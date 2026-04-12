"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type ToastVariant = "default" | "success" | "error";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// ── Module-level singleton — call toast() from anywhere ────────────────────────
type Listener = (toasts: ToastItem[]) => void;
const listeners: Listener[] = [];
let activeToasts: ToastItem[] = [];

function emit() {
  listeners.forEach((l) => l([...activeToasts]));
}

export function toast(t: Omit<ToastItem, "id">) {
  const id = Math.random().toString(36).slice(2, 9);
  const duration = t.duration ?? 4000;
  activeToasts = [...activeToasts, { ...t, id }];
  emit();
  setTimeout(() => {
    activeToasts = activeToasts.filter((x) => x.id !== id);
    emit();
  }, duration);
}

// ── Hook used by <Toaster /> ───────────────────────────────────────────────────
export function useToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>(activeToasts);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const i = listeners.indexOf(setToasts);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);

  return toasts;
}
