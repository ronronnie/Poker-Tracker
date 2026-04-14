"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setIsPending(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.replace("https://www.useouts.com/dashboard");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { code?: string; message: string }[] };
      const firstError = clerkError.errors?.[0];
      if (firstError?.code === "session_exists" || firstError?.message?.toLowerCase().includes("session already exists")) {
        window.location.replace("https://www.useouts.com/dashboard");
        return;
      }
      setError(firstError?.message ?? "Incorrect email or password. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h2
          className="text-2xl font-extrabold mb-2"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
        >
          Welcome back
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}>
          Sign in to your Outs account
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-[var(--radius-md)] text-sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "var(--color-danger)",
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <span
              className="text-xs cursor-default"
              style={{ color: "var(--color-text-muted)" }}
              title="Coming soon"
            >
              Forgot password?
            </span>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          variant="primary"
          loading={isPending}
          className="w-full mt-1"
        >
          {isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          New to Outs?
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
      </div>

      <Link href="/signup" className="block">
        <Button type="button" size="lg" variant="secondary" className="w-full">
          Create an account
        </Button>
      </Link>
    </div>
  );
}
