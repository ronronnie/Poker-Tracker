"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setFieldErrors({});

    if (fullName.trim().length < 2) {
      setFieldErrors({ fullName: "Name must be at least 2 characters" });
      return;
    }
    if (password.length < 8) {
      setFieldErrors({ password: "Password must be at least 8 characters" });
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsPending(true);

    try {
      const result = await signUp.create({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" ") || undefined,
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/dashboard?welcome=1";
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const firstError = clerkError.errors?.[0];
      if (firstError?.message.toLowerCase().includes("password")) {
        setFieldErrors({ password: "Password doesn't meet requirements. Try a stronger one." });
      } else if (firstError?.message.toLowerCase().includes("email")) {
        setFieldErrors({ email: "This email is already in use or invalid." });
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2
          className="text-2xl font-extrabold mb-2"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
        >
          Create your account
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-secondary)" }}>
          Start tracking your poker journey
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={!!fieldErrors.fullName}
            required
          />
          {fieldErrors.fullName && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>{fieldErrors.fullName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!fieldErrors.email}
            required
          />
          {fieldErrors.email && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>{fieldErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!fieldErrors.password}
            required
          />
          {fieldErrors.password ? (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>{fieldErrors.password}</p>
          ) : (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Min. 8 characters with one uppercase letter and number.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!fieldErrors.confirmPassword}
            required
          />
          {fieldErrors.confirmPassword && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <div id="clerk-captcha" />

        <Button type="submit" size="lg" variant="primary" loading={isPending} className="w-full mt-1">
          {isPending ? "Creating account…" : "Create Account"}
        </Button>

        <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
          By signing up you agree to our{" "}
          <span className="underline cursor-default">Terms of Service</span> and{" "}
          <span className="underline cursor-default">Privacy Policy</span>.
        </p>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Already have an account?</span>
        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
      </div>

      <Link href="/login" className="block">
        <Button type="button" size="lg" variant="secondary" className="w-full">Sign In</Button>
      </Link>
    </div>
  );
}

