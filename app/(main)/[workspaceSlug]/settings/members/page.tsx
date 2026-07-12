// app/(main)/[workspaceSlug]/settings/members/page.tsx
// Members management page: list, role change, invite links.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MembersSettings } from "@/components/settings/MembersSettings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members" };

interface Props { params: { workspaceSlug: string } }

export default async function MembersPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceSlug },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true, color: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      invites: {
        where: { status: "PENDING", expiresAt: { gt: new Date() } },
        include: { invitedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!workspace) redirect("/dashboard");

  const member = workspace.members.find((m) => m.userId === userId);
  if (!member) redirect(`/${params.workspaceSlug}`);

  return (
    <MembersSettings
      workspace={{ id: workspace.id, name: workspace.name, slug: workspace.slug, ownerId: workspace.ownerId }}
      members={workspace.members}
      invites={workspace.invites}
      currentUserId={userId}
      currentUserRole={member.role}
      workspaceSlug={params.workspaceSlug}
    />
  );
}
