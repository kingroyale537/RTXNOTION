// app/(auth)/login/page.tsx
// Login page – email/password + OAuth buttons in a clean, Notion-style layout.

import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in to RTX Notion" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="relative w-full max-w-[400px] space-y-6 animate-fade-in">
        {/* Notion-style Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-foreground text-background font-bold text-2xl shadow-sm mb-4 select-none">
            N
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Your AI workspace.
          </h1>
          <p className="text-muted-foreground mt-1 text-[15px] sm:text-base">
            Log in to your RTX Notion account
          </p>
        </div>

        {/* The clean Login Form */}
        <LoginForm />

        {/* Sign up prompt */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-semibold text-primary hover:underline transition-colors">
            Create one free
          </a>
        </p>
      </div>
    </div>
  );
}
