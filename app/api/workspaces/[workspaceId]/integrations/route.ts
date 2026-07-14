// app/api/workspaces/[workspaceId]/integrations/route.ts
// API route to retrieve, create, and revoke third-party app connections (Slack, Google).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// RBAC Check helper
async function checkWorkspaceMember(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
  return !!membership;
}

// 1. GET: Retrieve active connectors and their status
export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const isMember = await checkWorkspaceMember(params.workspaceId, userId);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    // Retrieve active integrations
    const integrations = await prisma.integration.findMany({
      where: { workspaceId: params.workspaceId },
    });

    return NextResponse.json({ data: integrations });
  } catch (error) {
    console.error("GET integrations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. POST: Connect or update an integration connector
export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const isMember = await checkWorkspaceMember(params.workspaceId, userId);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    const body = await req.json();
    const { provider } = body;

    if (!provider || (provider !== "slack" && provider !== "google")) {
      return NextResponse.json({ error: "Invalid integration provider" }, { status: 400 });
    }

    // Simulate OAuth token exchange and upsert connection record
    const integration = await prisma.integration.upsert({
      where: {
        workspaceId_provider: {
          workspaceId: params.workspaceId,
          provider,
        },
      },
      update: {
        status: "CONNECTED",
        accessToken: `mock-token-${provider}-${Math.random().toString(36).substring(7)}`,
        connectedAt: new Date(),
      },
      create: {
        workspaceId: params.workspaceId,
        provider,
        status: "CONNECTED",
        accessToken: `mock-token-${provider}-${Math.random().toString(36).substring(7)}`,
        connectedAt: new Date(),
      },
    });

    return NextResponse.json({ data: integration });
  } catch (error) {
    console.error("POST integrations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 3. DELETE: Revoke connection access
export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const isMember = await checkWorkspaceMember(params.workspaceId, userId);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");

    if (!provider || (provider !== "slack" && provider !== "google")) {
      return NextResponse.json({ error: "Invalid integration provider" }, { status: 400 });
    }

    // Revoke by deleting the integration record
    await prisma.integration.deleteMany({
      where: {
        workspaceId: params.workspaceId,
        provider,
      },
    });

    return NextResponse.json({ message: "Revocation successful" });
  } catch (error) {
    console.error("DELETE integrations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
