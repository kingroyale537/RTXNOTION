// app/api/register/route.ts
// POST /api/register  – create a new account (credentials flow)

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Res, parseBody, ApiError } from "@/lib/api-helpers";
import { registerSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody<{ name: string; email: string; password: string }>(req);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Res.error(parsed.error.issues[0].message, 422);
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return Res.error("Email already registered", 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: { name, email, password: passwordHash, emailVerified: new Date() },
        select: { id: true, name: true, email: true, image: true, createdAt: true },
      });

      // Create personal workspace
      const slugBase = slugify(name);
      const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

      const workspace = await tx.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          slug,
          isPersonal: true,
          ownerId: newUser.id,
          settings: { create: {} },
        },
      });

      // Add as ADMIN
      await tx.workspaceMember.create({
        data: { workspaceId: workspace.id, userId: newUser.id, role: "ADMIN" },
      });

      // Seed a Getting Started page
      await tx.page.create({
        data: {
          title: "Getting Started",
          iconValue: "🚀",
          iconType: "EMOJI",
          workspaceId: workspace.id,
          createdById: newUser.id,
          sortOrder: 1,
          content: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: `Welcome, ${name}! 🚀` }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "Use / to insert blocks. Start building your knowledge base." }],
              },
            ],
          },
        },
      });

      return { user: newUser, workspace };
    });

    return Res.created(user);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
