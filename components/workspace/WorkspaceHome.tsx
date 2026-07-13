// components/workspace/WorkspaceHome.tsx
// Client-side workspace home: recent pages, quick actions, activity feed.

"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FileText, Plus, Users, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from "@/components/page/PageBreadcrumb";
import { useSocket } from "@/hooks/useSocket";
import { usePageStore } from "@/store/pageStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface RecentPage {
  id: string;
  title: string;
  iconValue: string | null;
  updatedAt: Date;
  lastEditedBy: { name: string | null; image: string | null } | null;
}

interface Props {
  workspace: { id: string; name: string; slug: string; logo: string | null; _count: { pages: number; members: number } };
  recentPages: RecentPage[];
  workspaceSlug: string;
  userId: string;
}

export function WorkspaceHome({ workspace, recentPages, workspaceSlug }: Props) {
  const router = useRouter();
  const { addPageToTree } = usePageStore();
  const { emitPageCreated } = useSocket(workspace.id);

  async function createPage() {
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id, title: "Untitled" }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const page = { ...json.data, children: [], _count: { children: 0 } };
      addPageToTree(page, null);
      emitPageCreated(page);
      router.push(`/${workspaceSlug}/${json.data.id}`);
    } catch {
      toast.error("Could not create page");
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#191919] text-[#f3f4f6]">
      <PageBreadcrumb workspaceId={workspace.id} workspaceSlug={workspaceSlug} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 md:px-16 py-16">
          {/* Hero */}
          <div className="mb-12">
            <div className="text-5xl mb-4">{workspace.logo ?? "🏢"}</div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{workspace.name}</h1>
            <p className="text-muted-foreground text-lg">
              {workspace._count.pages} pages · {workspace._count.members} members
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {[
              { icon: Plus, label: "New page", action: createPage, primary: true },
              { icon: Users, label: "Members", action: () => router.push(`/${workspaceSlug}/settings/members`) },
              { icon: Settings, label: "Settings", action: () => router.push(`/${workspaceSlug}/settings`) },
              { icon: Zap, label: "Invite team", action: () => router.push(`/${workspaceSlug}/settings/members`) },
            ].map(({ icon: Icon, label, action, primary }) => (
              <Button
                key={label}
                variant={primary ? "default" : "outline"}
                className={cn(
                  "h-14 flex flex-col gap-1 text-sm font-medium",
                  primary && "shadow-lg shadow-primary/20"
                )}
                onClick={action}
                id={`quick-${label.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Button>
            ))}
          </div>

          {/* Recent pages */}
          {recentPages.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Recently edited
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => router.push(`/${workspaceSlug}/${page.id}`)}
                    className={cn(
                      "group text-left p-4 rounded-xl border border-border bg-card",
                      "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
                      "transition-all duration-200 cursor-pointer"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 mt-0.5">
                        {page.iconValue ?? "📄"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {page.title || "Untitled"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Edited {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
                          {page.lastEditedBy?.name && ` by ${page.lastEditedBy.name}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {recentPages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">No pages yet</h3>
                <p className="text-muted-foreground text-sm">Create your first page to get started</p>
              </div>
              <Button onClick={createPage} className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Create first page
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
