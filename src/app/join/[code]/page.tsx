import { redirect } from "next/navigation";
import Link from "next/link";
import { joinGroupByCode } from "@/app/actions/groups";
import { ensureProfile } from "@/app/actions/auth";

// params is a Promise in Next.js 16
interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: PageProps) {
  const { code } = await params;

  // Ensure profile exists before joining — users coming straight from an invite
  // link may not have hit the dashboard layout yet (which normally calls this).
  await ensureProfile();

  try {
    const { groupId, alreadyMember } = await joinGroupByCode(code);
    // Redirect to the group — Next.js redirect throws internally so this always runs
    redirect(`/groups/${groupId}${alreadyMember ? "?joined=exists" : "?joined=1"}`);
  } catch (err: unknown) {
    // redirect() itself throws — re-throw it
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;

    const message =
      err instanceof Error ? err.message : "This invite link is invalid or has expired.";

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--color-bg-base)" }}
      >
        <div
          className="w-full max-w-sm rounded-[var(--radius-xl)] p-8 text-center"
          style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            ✕
          </div>
          <h1
            className="text-lg font-bold mb-2"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
          >
            Invalid Invite
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            {message}
          </p>
          <Link
            href="/groups"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold"
            style={{ background: "var(--color-gold)", color: "#080808" }}
          >
            Go to Groups
          </Link>
        </div>
      </div>
    );
  }
}
