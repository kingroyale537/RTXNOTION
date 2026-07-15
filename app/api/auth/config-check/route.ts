import { NextResponse } from "next/server";

export async function GET() {
  const isGoogleConfigured =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== "google-client-id-placeholder" &&
    !process.env.GOOGLE_CLIENT_ID.includes("placeholder");

  const isGithubConfigured =
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_ID !== "github-client-id-placeholder" &&
    !process.env.GITHUB_CLIENT_ID.includes("placeholder");

  const isMicrosoftConfigured =
    process.env.MICROSOFT_CLIENT_ID &&
    process.env.MICROSOFT_CLIENT_ID !== "microsoft-client-secret-placeholder" &&
    !process.env.MICROSOFT_CLIENT_ID.includes("placeholder");

  return NextResponse.json({
    google: !!isGoogleConfigured,
    github: !!isGithubConfigured,
    microsoft: !!isMicrosoftConfigured,
  });
}
