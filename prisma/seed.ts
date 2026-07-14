// prisma/seed.ts
// Populates the database with a demo workspace, admin user, and sample pages.

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@voltaic.com" },
    update: {},
    create: {
      name: "Alex Admin",
      email: "admin@voltaic.com",
      password: passwordHash,
      color: "#6366f1",
      emailVerified: new Date(),
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@voltaic.com" },
    update: {},
    create: {
      name: "Emma Editor",
      email: "editor@voltaic.com",
      password: passwordHash,
      color: "#ec4899",
      emailVerified: new Date(),
    },
  });

  // ── Workspace ─────────────────────────────────────────────────────────────
  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-team" },
    update: {},
    create: {
      name: "Acme Team",
      slug: "acme-team",
      description: "Our shared knowledge hub",
      logo: "🏢",
      ownerId: admin.id,
      settings: {
        create: {
          allowPublicPages: true,
          allowMemberInvites: true,
        },
      },
    },
  });

  // ── Members ───────────────────────────────────────────────────────────────
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: admin.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: admin.id, role: Role.ADMIN },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: editor.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: editor.id, role: Role.EDITOR },
  });

  // ── Sample page tree ──────────────────────────────────────────────────────
  const gettingStarted = await prisma.page.create({
    data: {
      title: "Getting Started",
      emoji: "🚀",
      iconType: "EMOJI",
      iconValue: "🚀",
      workspaceId: workspace.id,
      createdById: admin.id,
      sortOrder: 1,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Voltaic! 🚀" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is your collaborative workspace. Start creating pages, invite team members, and build your knowledge base.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Quick Start" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Create a new page with the + button in the sidebar" }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Use / to trigger the block command menu" }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Invite teammates via Settings → Members" }] }],
              },
            ],
          },
        ],
      },
    },
  });

  const engineering = await prisma.page.create({
    data: {
      title: "Engineering",
      emoji: "⚙️",
      iconType: "EMOJI",
      iconValue: "⚙️",
      workspaceId: workspace.id,
      createdById: admin.id,
      sortOrder: 2,
      content: { type: "doc", content: [{ type: "paragraph" }] },
    },
  });

  // Child page under Engineering
  await prisma.page.create({
    data: {
      title: "Tech Stack",
      emoji: "🛠️",
      iconType: "EMOJI",
      iconValue: "🛠️",
      workspaceId: workspace.id,
      parentId: engineering.id,
      createdById: admin.id,
      sortOrder: 1,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Tech Stack" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Our current technology choices and rationale." }],
          },
        ],
      },
    },
  });

  await prisma.page.create({
    data: {
      title: "Design System",
      emoji: "🎨",
      iconType: "EMOJI",
      iconValue: "🎨",
      workspaceId: workspace.id,
      createdById: admin.id,
      sortOrder: 3,
      content: { type: "doc", content: [{ type: "paragraph" }] },
    },
  });

  console.log("✅ Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("Demo credentials:");
  console.log("  Admin  → admin@voltaic.com / password123");
  console.log("  Editor → editor@voltaic.com / password123");
  console.log("  Workspace slug: acme-team");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
