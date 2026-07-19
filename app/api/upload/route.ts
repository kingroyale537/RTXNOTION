// app/api/upload/route.ts
// POST /api/upload – upload an image or file
// Supports local storage by default; swap storageType to "s3" for production.

import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, ApiError, requireWorkspaceMember } from "@/lib/api-helpers";

// Allowed MIME types
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "IMAGE",
  "image/jpg": "IMAGE",
  "image/png": "IMAGE",
  "image/gif": "IMAGE",
  "image/webp": "IMAGE",
  "image/svg+xml": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "audio/mpeg": "AUDIO",
  "audio/ogg": "AUDIO",
  "application/pdf": "FILE",
  "text/plain": "FILE",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const workspaceId = formData.get("workspaceId") as string | null;

    if (!file) return Res.error("No file provided", 400);
    if (!workspaceId) return Res.error("workspaceId required", 400);

    // Verify user is member of target workspace with write (EDITOR) permissions
    await requireWorkspaceMember(workspaceId, user.id, "EDITOR");

    // Validate type
    const mediaType = ALLOWED_TYPES[file.type];
    if (!mediaType) return Res.error(`File type ${file.type} not allowed`, 415);

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return Res.error("File exceeds 10 MB limit", 413);
    }

    // Generate unique filename preserving extension
    const ext = path.extname(file.name);
    const storageKey = `${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", workspaceId);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, storageKey), buffer);

    // Public URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const url = `${baseUrl}/uploads/${workspaceId}/${storageKey}`;

    // Persist to DB
    const media = await prisma.media.create({
      data: {
        name: storageKey,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        storageKey: path.join("uploads", workspaceId, storageKey),
        storageType: "local",
        mediaType: mediaType as "IMAGE" | "VIDEO" | "AUDIO" | "FILE",
        workspaceId,
        uploadedById: user.id,
      },
    });

    return Res.created({ url, mediaId: media.id, name: file.name });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

