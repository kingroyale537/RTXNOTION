// components/modals/ShareModal.tsx
// Notion-style share modal supporting public publishing and granular member permissions.

"use client";

import { useEffect, useState } from "react";
import { Lock, Globe, Link, Copy, Users, Loader2, X, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUIStore } from "@/store/uiStore";
import { usePageStore } from "@/store/pageStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Role } from "@prisma/client";
import toast from "react-hot-toast";

interface Props {
  workspaceSlug: string;
}

interface PagePermission {
  id: string;
  pageId: string;
  userId: string;
  role: Role;
}

interface WorkspaceMember {
  userId: string;
  role: Role;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function ShareModal({ workspaceSlug }: Props) {
  const { sharePageId, setSharePageId } = useUIStore();
  const { currentPage, updateCurrentPageMeta } = usePageStore();

  const [isPublished, setIsPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);

  useEffect(() => {
    if (!sharePageId) return;

    // Set initial publish state from active page metadata
    if (currentPage && currentPage.id === sharePageId) {
      setIsPublished(currentPage.isPublished);
    }

    // Fetch page permission overrides
    async function fetchPermissions() {
      setIsLoadingPerms(true);
      try {
        const res = await fetch(`/api/pages/${sharePageId}/permissions`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setPermissions(json.data.permissions || []);
        setMembers(json.data.members || []);
      } catch {
        toast.error("Failed to load permissions list");
      } finally {
        setIsLoadingPerms(false);
      }
    }

    fetchPermissions();
  }, [sharePageId, currentPage]);

  const handlePublishToggle = async () => {
    if (!sharePageId) return;
    setIsPublishing(true);
    try {
      const nextPublishState = !isPublished;
      const res = await fetch(`/api/pages/${sharePageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextPublishState }),
      });
      if (!res.ok) throw new Error();

      setIsPublished(nextPublishState);
      updateCurrentPageMeta({ isPublished: nextPublishState });
      toast.success(nextPublishState ? "Page published to the web!" : "Page unpublished successfully.");
    } catch {
      toast.error("Could not update publishing status.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/public/pages/${sharePageId}`;
      navigator.clipboard.writeText(url);
      toast.success("Public link copied to clipboard!");
    }
  };

  const handleRoleChange = async (userId: string, role: Role | "DEFAULT") => {
    if (!sharePageId) return;
    try {
      const targetRole = role === "DEFAULT" ? null : role;
      const res = await fetch(`/api/pages/${sharePageId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: targetRole }),
      });
      if (!res.ok) throw new Error();

      // Update state
      if (targetRole === null) {
        setPermissions((prev) => prev.filter((p) => p.userId !== userId));
      } else {
        setPermissions((prev) => {
          const exists = prev.some((p) => p.userId === userId);
          if (exists) {
            return prev.map((p) => (p.userId === userId ? { ...p, role: targetRole } : p));
          } else {
            return [...prev, { id: "temp", pageId: sharePageId, userId, role: targetRole }];
          }
        });
      }
      toast.success("Permissions updated successfully.");
    } catch {
      toast.error("Failed to update user permissions override.");
    }
  };

  return (
    <Dialog open={!!sharePageId} onOpenChange={(open) => !open && setSharePageId(null)}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#1c1c1c] border border-[#2a2a2a] text-[#f3f4f6]">
        <DialogHeader className="p-4 border-b border-[#2a2a2a] bg-[#191919] flex-row items-center justify-between">
          <DialogTitle className="text-sm font-bold text-white flex items-center gap-1.5">
            <Users className="h-4 w-4 text-blue-400" />
            <span>Share & Permissions</span>
          </DialogTitle>
        </DialogHeader>

        {/* ── Section: Publish to Web ─────────────────────────────────────── */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              <Globe className="h-4 w-4 text-purple-400 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-gray-200">Publish to Web</span>
                <span className="text-[10px] text-gray-500 max-w-[280px]">
                  Anyone with the link can view. Search engines can index if public.
                </span>
              </div>
            </div>

            <Button
              onClick={handlePublishToggle}
              disabled={isPublishing}
              size="sm"
              variant={isPublished ? "outline" : "default"}
              className={isPublished ? "bg-transparent text-red-400 border border-red-500/20 hover:bg-red-950/20 text-xs h-8 font-semibold" : "bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 font-semibold"}
            >
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
          </div>

          {isPublished && (
            <div className="flex items-center gap-1.5 bg-[#191919] border border-[#2a2a2a] rounded-lg p-2 mt-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/public/pages/${sharePageId}` : ""}
                className="flex-1 bg-transparent text-[11px] font-mono outline-none text-gray-400 truncate"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyLink}
                className="h-7 px-2 text-[10px] hover:bg-[#2c2c2c] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                <Copy className="h-3 w-3" /> Copy link
              </Button>
            </div>
          )}
        </div>

        <Separator className="bg-[#2a2a2a]" />

        {/* ── Section: Manage Access Overrides ────────────────────────────── */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Workspace Members Access</span>
          </div>

          <div className="max-h-[220px] overflow-y-auto space-y-2 mt-1">
            {isLoadingPerms ? (
              <div className="flex items-center justify-center py-10 gap-1 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-xs">Loading members...</span>
              </div>
            ) : members.length > 0 ? (
              members.map((member) => {
                const userOverride = permissions.find((p) => p.userId === member.userId);
                const currentRoleValue = userOverride ? userOverride.role : "DEFAULT";

                return (
                  <div key={member.userId} className="flex items-center justify-between p-1 rounded-lg hover:bg-[#222]/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                        {member.user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-200 truncate">
                          {member.user.name || "Workspace Member"}
                        </span>
                        <span className="text-[9px] text-gray-500 truncate">
                          {member.user.email}
                        </span>
                      </div>
                    </div>

                    <select
                      value={currentRoleValue}
                      onChange={(e) => handleRoleChange(member.userId, e.target.value as any)}
                      className="bg-[#222] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-[10px] text-gray-300 outline-none cursor-pointer focus:border-blue-500"
                    >
                      <option value="DEFAULT">Default (Workspace: {member.role})</option>
                      <option value="VIEWER">Viewer Override</option>
                      <option value="EDITOR">Editor Override</option>
                      <option value="ADMIN">Admin Override</option>
                    </select>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-6 text-gray-500 gap-1.5">
                <ShieldAlert className="h-4 w-4 text-yellow-500" />
                <span className="text-xs">No active members found.</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
