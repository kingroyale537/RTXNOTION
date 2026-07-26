// app/(auth)/register/page.tsx
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { VoltaicLogo } from "@/components/marketing/VoltaicLogo";

export const metadata: Metadata = { title: "Create Voltaic Account" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-[#050505]">
      <div className="relative w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="mb-4">
            <VoltaicLogo size="lg" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#050505]">Create your workspace</h1>
          <p className="text-muted-foreground text-sm font-medium">Free forever. No credit card required.</p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-[#2563eb] hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
