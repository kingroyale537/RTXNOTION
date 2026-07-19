// app/public/pages/[pageId]/page.tsx
// Public page preview route – accessible by anyone if the page has isPublished: true.

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@/components/editor/Editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="px-8 md:px-16 py-8">
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-muted"
              style={{ width: `${90 - i * 10}%`, opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      </div>
    ),
  }
);

interface Props { params: { pageId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { id: params.pageId },
    select: { title: true, iconValue: true },
  });
  return {
    title: page ? `${page.iconValue ?? ""} ${page.title || "Untitled"} - Shared via Voltaic` : "Public Page",
  };
}

export default async function PublicPageRoute({ params }: Props) {
  const page = await prisma.page.findUnique({
    where: { id: params.pageId },
    select: {
      id: true,
      title: true,
      content: true,
      emoji: true,
      iconType: true,
      iconValue: true,
      coverImage: true,
      isPublished: true,
      isArchived: true,
      workspaceId: true,
    },
  });

  // Verify page exists, is not archived, and is published
  if (!page || page.isArchived || !page.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#191919] text-[#f3f4f6] flex flex-col font-sans selection:bg-purple-500/30">
      {/* Public Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#2a2a2a]/60 bg-[#191919]/80 backdrop-blur-md px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-purple-500/20">
            V
          </div>
          <span className="text-xs font-bold text-gray-200 tracking-wide">Voltaic Workspace</span>
          <span className="text-[10px] text-gray-500 bg-[#222] border border-[#2a2a2a] px-1.5 py-0.5 rounded-full">Shared Publicly</span>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href="/"
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 bg-purple-950/20 border border-purple-500/20 hover:bg-purple-950/30 px-3 py-1.5 rounded-lg transition-all"
          >
            Create Your Workspace
          </a>
        </div>
      </header>

      {/* Main Document View */}
      <main className="flex-1 overflow-y-auto">
        {/* Cover Image */}
        <div className="relative w-full h-[180px] sm:h-[220px] bg-gradient-to-r from-purple-900/30 via-slate-900 to-indigo-900/30 overflow-hidden border-b border-[#2a2a2a]/40">
          {page.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.coverImage}
              alt="Page Cover"
              className="w-full h-full object-cover select-none"
            />
          )}
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-6 sm:px-12 md:px-16 -mt-12 relative pb-24">
          {/* Page Icon (Emoji) */}
          {page.iconValue && (
            <div className="w-20 h-20 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl flex items-center justify-center text-4xl shadow-xl select-none mb-6">
              {page.iconValue}
            </div>
          )}

          {/* Page Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mb-6">
            {page.title || "Untitled"}
          </h1>

          <hr className="border-[#2a2a2a]/60 mb-8" />

          {/* TipTap Read-Only Editor */}
          <div className="prose prose-invert max-w-none">
            <Editor
              pageId={page.id}
              workspaceId={page.workspaceId}
              initialContent={page.content as object | null}
              canEdit={false}
              socket={null}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
