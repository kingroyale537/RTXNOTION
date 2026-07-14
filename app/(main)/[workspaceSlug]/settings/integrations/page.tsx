// app/(main)/[workspaceSlug]/settings/integrations/page.tsx
// Integrations settings page loading the settings connector card grid sheet.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Integrations Settings" };

interface Props {
  params: { workspaceSlug: string };
}

export default async function IntegrationsSettingsPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      members: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!workspace) {
    redirect("/dashboard");
  }

  // Ensure user is actually a member of the workspace
  const isMember = workspace.members.some((m) => m.userId === userId);
  if (!isMember) {
    redirect(`/${params.workspaceSlug}`);
  }

  return (
    <IntegrationsSettings
      workspace={{ id: workspace.id, name: workspace.name, slug: workspace.slug }}
      workspaceSlug={params.workspaceSlug}
    />
  );
}
