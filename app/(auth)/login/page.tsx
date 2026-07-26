// app/(auth)/login/page.tsx
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { VoltaicLogo } from "@/components/marketing/VoltaicLogo";

export const metadata: Metadata = { title: "Log in to Voltaic" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-16 text-[#050505]">
      <div className="relative w-full max-w-[400px] space-y-8">
        {/* Voltaic Logo & Headline */}
        <div className="text-center flex flex-col items-center">
          <div className="mb-6">
            <VoltaicLogo size="lg" />
          </div>
          <h1 className="text-[32px] font-black tracking-tight text-[#050505] leading-none">
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
