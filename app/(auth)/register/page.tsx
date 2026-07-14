// app/(auth)/register/page.tsx
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

import { Zap } from "lucide-react";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 text-[#f3f4f6]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-amber-400 shadow-lg mb-4">
            <Zap className="h-7 w-7 fill-current" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create your workspace</h1>
          <p className="text-muted-foreground">Free forever. No credit card required.</p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
