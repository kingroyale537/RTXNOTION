// components/workspace/InviteAccept.tsx
// Client component: shows invite details and accept/login buttons.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { Role } from "@prisma/client";
import toast from "react-hot-toast";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin", EDITOR: "Editor", VIEWER: "Viewer",
};

interface Props {
  token: string;
  workspace: { id: string; name: string; logo: string | null; slug: string };
  invitedBy: { name: string | null; image: string | null };
  role: Role;
  isAuthenticated: boolean;
}

export function InviteAccept({ token, workspace, invitedBy, role, isAuthenticated }: Props) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);

  async function acceptInvite() {
    setIsAccepting(true);
    try {
      const res = await fetch(`/api/invites/${token}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Failed to join"); return; }
      toast.success(`Joined ${workspace.name}!`);
      router.push(`/${workspace.slug}`);
    } catch { toast.error("Something went wrong"); }
    finally { setIsAccepting(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5 text-center">
          {/* Workspace avatar */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-3xl mb-5">
            {workspace.logo ?? "🏢"}
          </div>

          <h1 className="text-2xl font-bold mb-2">
            You&apos;re invited to join
          </h1>
          <p className="text-xl font-semibold text-primary mb-1">{workspace.name}</p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
            <Users className="h-4 w-4" />
            <span>as</span>
            <Badge variant="secondary">{ROLE_LABEL[role]}</Badge>
          </div>

          {invitedBy.name && (
            <div className="flex items-center justify-center gap-2 mb-8 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">{getInitials(invitedBy.name)}</AvatarFallback>
              </Avatar>
              <span>Invited by <strong className="text-foreground">{invitedBy.name}</strong></span>
            </div>
          )}

          {isAuthenticated ? (
            <Button
              onClick={acceptInvite}
              disabled={isAccepting}
              className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/25"
              id="accept-invite-btn"
            >
              {isAccepting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Joining…</>
              ) : (
                `Join ${workspace.name}`
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/25"
                onClick={() => router.push(`/auth/login?callbackUrl=/invite/${token}`)}
                id="login-to-join-btn"
              >
                Sign in to join
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-sm"
                onClick={() => router.push(`/auth/register?callbackUrl=/invite/${token}`)}
              >
                Create account & join
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
