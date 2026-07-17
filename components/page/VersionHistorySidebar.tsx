// components/page/VersionHistorySidebar.tsx
// sliding panel from the right to view page history snapshots and restore previous content.

"use client";

import { useEffect, useState } from "react";
import { History, X, RotateCcw, Eye, Loader2, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface Props {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Version {
  id: string;
  pageId: string;
  title: string;
  authorId: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

interface DetailedVersion extends Version {
  content: any;
}

export function VersionHistorySidebar({ pageId, isOpen, onClose }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<DetailedVersion | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !pageId) return;

    async function fetchVersions() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/pages/${pageId}/versions`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setVersions(json.data || []);
      } catch {
        toast.error("Could not fetch version history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchVersions();
  }, [isOpen, pageId]);

  // Load detailed version for preview
  async function loadPreview(version: Version) {
    setIsPreviewLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/versions/${version.id}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setPreviewVersion(json.data);
    } catch {
      toast.error("Failed to load version preview");
    } finally {
      setIsPreviewLoading(false);
    }
  }

  // Restore handler
  async function handleRestore(versionId: string) {
    toast.loading("Restoring page content...", { id: "restore-version" });
    try {
      const res = await fetch(`/api/pages/${pageId}/versions/${versionId}/restore`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();

      toast.success("Page restored successfully!", { id: "restore-version" });
      onClose();
      setPreviewVersion(null);

      // Force a full reload to reset Yjs providers and update editor state
      window.location.reload();
    } catch {
      toast.error("Failed to restore page version", { id: "restore-version" });
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <aside className="w-80 border-l border-[#2a2a2a] bg-[#191919] text-[#f3f4f6] h-full flex flex-col z-40 relative animate-in slide-in-from-right duration-200">
        <header className="h-12 px-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#191919] flex-shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <History className="h-4 w-4 text-purple-400" />
            <span>Version History</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-[#2c2c2c] text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Loading history...</span>
            </div>
          ) : versions.length > 0 ? (
            versions.map((version) => (
              <div
                key={version.id}
                onClick={() => loadPreview(version)}
                className="p-3 rounded-xl border border-[#2a2a2a] hover:bg-[#2c2c2c]/40 cursor-pointer transition flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200 truncate max-w-[160px]">
                    {version.title || "Untitled"}
                  </span>
                  <span className="text-[10px] text-purple-400 font-medium font-mono">
                    {new Date(version.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-1 min-w-0">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">
                      {version.author?.name || "Unknown Author"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(version.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadPreview(version);
                    }}
                    className="h-7 px-2 text-[10px] hover:bg-[#3c3c3c] text-gray-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(version.id);
                    }}
                    className="h-7 px-2 text-[10px] hover:bg-purple-950/40 hover:text-purple-400 text-purple-400 border border-purple-500/20 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
              <History className="h-6 w-6 text-gray-600" />
              <span className="text-xs font-semibold">No version snapshots yet</span>
              <span className="text-[10px] text-gray-600">Edits auto-generate snapshots</span>
            </div>
          )}
        </div>
      </aside>

      {/* Snapshot Preview Dialog */}
      <Dialog open={!!previewVersion} onOpenChange={(open) => !open && setPreviewVersion(null)}>
        <DialogContent className="max-w-2xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f3f4f6] p-0 overflow-hidden flex flex-col h-[500px]">
          <header className="p-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#191919] flex-shrink-0">
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
                <span>Previewing Snapshot:</span>
                <span className="text-purple-400 font-semibold">
                  {previewVersion?.title || "Untitled"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-[11px] text-gray-500">
                Created on {previewVersion && new Date(previewVersion.createdAt).toLocaleString()} by {previewVersion?.author?.name || "Unknown"}
              </DialogDescription>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 font-sans text-sm text-gray-300 bg-[#161616]">
            {previewVersion?.content ? (
              <div className="space-y-4">
                {/* Parse the TipTap doc to clean readable HTML elements */}
                {Array.isArray(previewVersion.content.content) ? (
                  previewVersion.content.content.map((node: any, idx: number) => {
                    if (node.type === "heading") {
                      const Tag = `h${node.attrs?.level || 1}` as any;
                      const text = node.content?.map((c: any) => c.text).join("") || "";
                      return <Tag key={idx} className="font-bold text-white mt-4 border-b border-gray-800 pb-1">{text}</Tag>;
                    }
                    if (node.type === "paragraph") {
                      const text = node.content?.map((c: any) => c.text).join("") || "";
                      return <p key={idx} className="leading-relaxed min-h-[1rem]">{text}</p>;
                    }
                    if (node.type === "bulletList") {
                      return (
                        <ul key={idx} className="list-disc pl-5 space-y-1">
                          {node.content?.map((li: any, liIdx: number) => {
                            const text = li.content?.[0]?.content?.map((c: any) => c.text).join("") || "";
                            return <li key={liIdx}>{text}</li>;
                          })}
                        </ul>
                      );
                    }
                    return null;
                  })
                ) : (
                  <pre className="text-xs font-mono text-gray-400 overflow-x-auto p-4 bg-[#191919] rounded-lg border border-[#2a2a2a]">
                    {JSON.stringify(previewVersion.content, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <span>No preview content available</span>
              </div>
            )}
          </div>

          <footer className="p-3 border-t border-[#2a2a2a] bg-[#191919] flex items-center justify-end gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={() => setPreviewVersion(null)}
              className="text-xs h-9 hover:bg-[#2c2c2c] text-gray-400 hover:text-white"
            >
              Close Preview
            </Button>
            <Button
              onClick={() => previewVersion && handleRestore(previewVersion.id)}
              className="text-xs h-9 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restore this version
            </Button>
          </footer>
        </DialogContent>
      </Dialog>

      {isPreviewLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] p-5 rounded-xl flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            <span className="text-sm font-semibold text-white">Loading snapshot content...</span>
          </div>
        </div>
      )}
    </>
  );
}
