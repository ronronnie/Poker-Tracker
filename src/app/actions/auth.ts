"use server";

import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

/**
 * Called on every dashboard layout render.
 * Ensures a profile row exists in our DB for this Clerk user.
 * Captures email + full name from Clerk on first write.
 * Safe to call repeatedly — onConflictDoNothing() is a no-op on subsequent calls.
 */
export async function ensureProfile() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const firstName = clerkUser?.firstName ?? "";
  const lastName = clerkUser?.lastName ?? "";
  const full_name = [firstName, lastName].filter(Boolean).join(" ") || null;
  const avatar_url = clerkUser?.imageUrl ?? null;

  await db
    .insert(profiles)
    .values({
      id: userId,
      email,
      full_name,
      avatar_url,
      currency: "INR",
      subscription_tier: "free",
      subscription_status: "active",
    })
    .onConflictDoNothing();
}
