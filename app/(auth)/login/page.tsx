// app/(auth)/login/page.tsx
// Login page – email/password + OAuth buttons in a clean, Notion-style layout.

import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in to RTX Notion" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-16 text-[#050505]">
      <div className="relative w-full max-w-[400px] space-y-8">
        {/* Notion-style Logo */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[12px] bg-black text-white font-black text-3xl shadow-sm mb-6 select-none font-sans">
            N
          </div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-[#050505] leading-none">
            Your AI workspace.
          </h1>
          <p className="text-[#64748b] mt-3 text-[16px] font-medium">
            Log in to your RTX Notion account
          </p>
        </div>

        {/* The clean Login Form */}
        <LoginForm />

        {/* Sign up prompt */}
        <p className="text-center text-sm text-[#64748b] pt-2">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-semibold text-[#2563eb] hover:underline transition">
            Create one free
          </a>
        </p>
      </div>
    </div>
  );
}
