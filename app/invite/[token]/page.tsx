// app/invite/[token]/page.tsx
// Public invite landing page – shows workspace info, prompts login or accept.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InviteAccept } from "@/components/workspace/InviteAccept";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Join Workspace" };

interface Props { params: { token: string } }

export default async function InvitePage({ params }: Props) {
  // Fetch invite preview (public)
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/invites/${params.token}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Invalid invite</h1>
          <p className="text-muted-foreground">This invite link has expired or been revoked.</p>
          <a href="/login" className="text-primary underline mt-4 block">Sign in instead</a>
        </div>
      </div>
    );
  }

  const { data } = await res.json();
  const session = await getServerSession(authOptions);

  return (
    <InviteAccept
      token={params.token}
      workspace={data.workspace}
      invitedBy={data.invitedBy}
      role={data.role}
      isAuthenticated={!!session}
    />
  );
}
