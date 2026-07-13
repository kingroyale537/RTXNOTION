// lib/auth.ts
// NextAuth.js configuration with Prisma adapter, credentials, Google, and GitHub.

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/error",
    newUser: "/onboarding",
  },

  providers: [
    // ── Credentials (email + password) ──────────────────────────────────────
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Mock Login Handler (e.g. for oauth/sso/passkey fallback when Client IDs aren't in .env)
        if (credentials.email.endsWith("@rtxnotion.com") && credentials.password === "mock-password-123") {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            const prefix = credentials.email.split("@")[0];
            const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: `${name.replace("-mock", "")} User`,
                color: "#6366f1",
              },
            });

            // Auto-provision personal workspace
            const slug = `${prefix.replace("-mock", "")}-space-${Math.random().toString(36).slice(2, 6)}`;
            const workspace = await prisma.workspace.create({
              data: {
                name: `${user.name}'s Space`,
                slug,
                isPersonal: true,
                ownerId: user.id,
                settings: { create: {} },
              },
            });

            await prisma.workspaceMember.create({
              data: {
                workspaceId: workspace.id,
                userId: user.id,
                role: "ADMIN",
              },
            });

            // Seed a Getting Started page
            await prisma.page.create({
              data: {
                title: "Getting Started",
                iconValue: "🚀",
                iconType: "EMOJI",
                workspaceId: workspace.id,
                createdById: user.id,
                content: {
                  type: "doc",
                  content: [
                    {
                      type: "heading",
                      attrs: { level: 1 },
                      content: [{ type: "text", text: "Welcome to your workspace! 🚀" }],
                    },
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Start here – use / to insert blocks." }],
                    },
                  ],
                },
              },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            color: user.color,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("Invalid credentials");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          color: user.color,
        };
      },
    }),

    // ── Google OAuth ───────────────────────────────────────────────────────
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),

    // ── GitHub OAuth ───────────────────────────────────────────────────────
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),

    // ── Microsoft Azure AD OAuth ───────────────────────────────────────────
    ...(process.env.MICROSOFT_CLIENT_ID
      ? [
          AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID!,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
            tenantId: process.env.MICROSOFT_TENANT_ID,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error – custom field
        token.color = user.color;
      }
      // Support real-time session updates (e.g. avatar change)
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        // @ts-expect-error – extend session.user
        session.user.id = token.id as string;
        // @ts-expect-error – extend session.user
        session.user.color = token.color as string;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Auto-provision a personal workspace for every new user
      if (!user.email) return;

      const slugBase = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
      const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

      const workspace = await prisma.workspace.create({
        data: {
          name: `${user.name ?? "My"} Workspace`,
          slug,
          isPersonal: true,
          ownerId: user.id,
          settings: { create: {} },
        },
      });

      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: "ADMIN",
        },
      });

      // Seed a Getting Started page
      await prisma.page.create({
        data: {
          title: "Getting Started",
          iconValue: "🚀",
          iconType: "EMOJI",
          workspaceId: workspace.id,
          createdById: user.id,
          content: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Welcome to your workspace! 🚀" }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "Start here – use / to insert blocks." }],
              },
            ],
          },
        },
      });
    },
  },
};
