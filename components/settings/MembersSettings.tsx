// components/settings/MembersSettings.tsx
// Members tab: list members with role badges, invite form, active invite links.

"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Copy, Link2, Plus, Trash2, Shield, Eye, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageBreadcrumb } from "@/components/page/PageBreadcrumb";
import { Separator } from "@/components/ui/separator";
import { getInitials, cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import toast from "react-hot-toast";

const ROLE_META: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  ADMIN:  { label: "Admin",  icon: Shield, color: "text-violet-500" },
  EDITOR: { label: "Editor", icon: Pencil, color: "text-blue-500"   },
  VIEWER: { label: "Viewer", icon: Eye,    color: "text-green-500"  },
};

interface Member {
  id: string; userId: string; role: Role; joinedAt: Date;
  user: { id: string; name: string | null; email: string | null; image: string | null; color: string };
}
interface Invite {
  id: string; token: string; role: Role; email: string | null; expiresAt: Date; useCount: number; maxUses: number | null;
  invitedBy: { name: string | null };
}
interface Props {
  workspace: { id: string; name: string; slug: string; ownerId: string };
  members: Member[];
  invites: Invite[];
  currentUserId: string;
  currentUserRole: Role;
  workspaceSlug: string;
}

export function MembersSettings({ workspace, members: initialMembers, invites: initialInvites, currentUserId, currentUserRole, workspaceSlug }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [inviteRole, setInviteRole] = useState<Role>("EDITOR");
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  const isAdmin = currentUserRole === "ADMIN";

  async function changeRole(userId: string, role: Role) {
    try {
      await fetch(`/api/workspaces/${workspace.id}/members?userId=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, role } : m));
      toast.success("Role updated");
    } catch { toast.error("Failed to update role"); }
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      await fetch(`/api/workspaces/${workspace.id}/members?userId=${userId}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      toast.success("Member removed");
    } catch { toast.error("Failed to remove member"); }
  }

  async function createInvite() {
    setIsCreatingInvite(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: inviteRole, expiresInDays: 7 }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      setInvites((prev) => [json.data, ...prev]);
      navigator.clipboard.writeText(json.data.inviteUrl);
      toast.success("Invite link copied to clipboard!");
    } catch { toast.error("Failed to create invite"); }
    finally { setIsCreatingInvite(false); }
  }

  function copyInviteLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

  return (
    <div className="flex flex-col h-full">
      <PageBreadcrumb workspaceId={workspace.id} workspaceSlug={workspaceSlug} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Members</h1>
            <p className="text-muted-foreground mt-1">
              Manage who has access to <strong>{workspace.name}</strong>
            </p>
          </div>

          {/* Invite new member */}
          {isAdmin && (
            <div className="bg-card border border-border rounded-xl p-5 mb-8">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" /> Invite via link
              </h2>
              <div className="flex items-center gap-3">
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                  <SelectTrigger className="w-36 h-9" id="invite-role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={createInvite} disabled={isCreatingInvite} className="h-9 gap-2" id="create-invite-btn">
                  <Plus className="h-4 w-4" />
                  {isCreatingInvite ? "Creating…" : "Create & copy link"}
                </Button>
              </div>

              {/* Active invite links */}
              {invites.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active invite links</p>
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{ROLE_META[invite.role].label} access</p>
                        <p className="text-xs text-muted-foreground">
                          Expires {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                          {invite.maxUses && ` · ${invite.useCount}/${invite.maxUses} uses`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyInviteLink(invite.token)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Separator className="mb-6" />

          {/* Members list */}
          <h2 className="font-semibold mb-4">{members.length} members</h2>
          <div className="space-y-1">
            {members.map((member) => {
              const RoleIcon = ROLE_META[member.role].icon;
              const isOwner = member.userId === workspace.ownerId;
              const isSelf = member.userId === currentUserId;

              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={member.user.image ?? ""} />
                    <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: member.user.color }}>
                      {getInitials(member.user.name ?? member.user.email ?? "?")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm flex items-center gap-1.5">
                      {member.user.name ?? member.user.email}
                      {isOwner && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Owner</Badge>}
                      {isSelf && <span className="text-[10px] text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && !isOwner ? (
                      <Select value={member.role} onValueChange={(v) => changeRole(member.userId, v as Role)}>
                        <SelectTrigger className={cn("h-8 w-28 text-xs", ROLE_META[member.role].color)}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={cn("text-xs gap-1", ROLE_META[member.role].color)}>
                        <RoleIcon className="h-3 w-3" />
                        {ROLE_META[member.role].label}
                      </Badge>
                    )}

                    {isAdmin && !isOwner && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeMember(member.userId)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
