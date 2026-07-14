// app/api/waitlist/route.ts
// POST /api/waitlist - Subscribe to early access waitlist

import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Res, parseBody, ApiError } from "@/lib/api-helpers";
import fs from "fs";
import path from "path";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody<{ email: string }>(req);
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) {
      return Res.error(parsed.error.issues[0].message, 422);
    }

    const { email } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();
    let savedEntry = null;
    let savedToDb = false;

    // 1. Attempt to save to the database via Prisma
    try {
      const existing = await prisma.waitlistEntry.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return Res.error("This email is already on the waitlist!", 400);
      }

      savedEntry = await prisma.waitlistEntry.create({
        data: { email: cleanEmail },
      });
      savedToDb = true;
    } catch (dbError) {
      console.warn("[Waitlist API] DB storage failed, falling back to JSON file:", dbError);
    }

    // 2. Fallback to local JSON file if DB failed
    if (!savedToDb) {
      const dataDir = path.join(process.cwd(), "data");
      const filePath = path.join(dataDir, "waitlist.json");

      // Ensure directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      let entries: Array<{ id: string; email: string; createdAt: string }> = [];
      if (fs.existsSync(filePath)) {
        try {
          const fileData = fs.readFileSync(filePath, "utf-8");
          entries = JSON.parse(fileData);
        } catch (jsonErr) {
          console.error("[Waitlist API] Failed to parse waitlist.json", jsonErr);
        }
      }

      // Check duplicate in JSON file
      const alreadyExists = entries.some((e) => e.email.toLowerCase() === cleanEmail);
      if (alreadyExists) {
        return Res.error("This email is already on the waitlist!", 400);
      }

      const newEntry = {
        id: `waitlist_${Math.random().toString(36).slice(2, 11)}`,
        email: cleanEmail,
        createdAt: new Date().toISOString(),
      };

      entries.push(newEntry);
      fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf-8");
      savedEntry = newEntry;
    }

    return Res.created(savedEntry);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
