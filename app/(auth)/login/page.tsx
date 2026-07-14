// app/(auth)/login/page.tsx
// Login page – email/password + OAuth buttons in a clean, Voltaic-style layout.

import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Zap } from "lucide-react";

export const metadata: Metadata = { title: "Log in to Voltaic" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-16 text-[#050505]">
      <div className="relative w-full max-w-[400px] space-y-8">
        {/* Voltaic-style Logo */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[12px] bg-black text-amber-400 select-none shadow-sm mb-6">
            <Zap className="h-7 w-7 fill-current" />
          </div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-[#050505] leading-none">
            Your AI workspace.
          </h1>
          <p className="text-[#64748b] mt-3 text-[16px] font-medium">
            Log in to your Voltaic account
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
