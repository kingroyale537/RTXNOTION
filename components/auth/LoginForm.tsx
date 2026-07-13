// components/auth/LoginForm.tsx
// Notion-style LoginForm: credentials fields + mock OAuth/SSO/Passkey providers.

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Github, Loader2, KeyRound, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import toast from "react-hot-toast";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);

  // SSO Dialog states
  const [ssoOpen, setSsoOpen] = useState(false);
  const [ssoDomain, setSsoDomain] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  }

  // Redirect to real OAuth authentication pages (Google, GitHub, Microsoft)
  async function handleOAuth(provider: "google" | "github" | "azure-ad") {
    if (provider === "google") setIsGoogleLoading(true);
    else if (provider === "github") setIsGithubLoading(true);
    else setIsMicrosoftLoading(true);

    toast.loading(`Redirecting to ${provider === "azure-ad" ? "Microsoft" : provider} account sign-in...`, { duration: 1500 });

    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Failed to redirect to login service");
      setIsGoogleLoading(false);
      setIsGithubLoading(false);
      setIsMicrosoftLoading(false);
    }
  }

  // Fallback simulator for Passkey login using browser WebAuthn biometrics prompt
  async function handlePasskey() {
    setIsPasskeyLoading(true);
    toast.loading("Invoking biometric security key check...", { id: "passkey" });

    try {
      // Trigger native browser biometric popup (navigator.credentials)
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const options: CredentialRequestOptions = {
          publicKey: {
            challenge,
            timeout: 60000,
            rpId: window.location.hostname,
            allowCredentials: [],
            userVerification: "required",
          },
        };

        // Opens native OS prompt (fingerprint/face id/security key)
        await navigator.credentials.get(options);
      }
    } catch (err) {
      console.warn("Biometrics skipped or cancelled:", err);
    }

    // Complete sign-in
    const result = await signIn("credentials", {
      email: "passkey-mock@rtxnotion.com",
      password: "mock-password-123",
      redirect: false,
    });

    if (result?.error) {
      toast.error("Passkey validation failed", { id: "passkey" });
    } else {
      toast.success("Passkey verified!", { id: "passkey" });
      router.push("/dashboard");
      router.refresh();
    }
    setIsPasskeyLoading(false);
  }

  // Redirect to Corporate SSO simulation callbacks
  function handleSsoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ssoDomain.trim()) {
      toast.error("Please enter a valid email domain");
      return;
    }
    setSsoOpen(false);
    setIsSsoLoading(true);
    router.push(`/sso-callback?domain=${encodeURIComponent(ssoDomain)}`);
  }

  return (
    <div className="space-y-6 text-[#050505] font-sans">
      {/* Credentials Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12px] font-bold text-[#64748b]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address..."
            autoComplete="email"
            className="h-10 border-[#e2e8f0] bg-white text-[#050505] placeholder-[#94a3b8] focus-visible:ring-1 focus-visible:ring-[#2563eb] rounded-[8px]"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : (
            <p className="text-[11px] text-[#64748b]/90 leading-normal">
              Use an organization email to easily collaborate with teammates
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[12px] font-bold text-[#64748b]">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password..."
              autoComplete="current-password"
              className="h-10 pr-10 border-[#e2e8f0] bg-white text-[#050505] placeholder-[#94a3b8] focus-visible:ring-1 focus-visible:ring-[#2563eb] rounded-[8px]"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Submit/Continue Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-[#2383e2] hover:bg-[#1f75cb] text-white font-bold rounded-[8px] transition-colors border-none shadow-none text-sm"
          disabled={isSubmitting}
          id="submit-login"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Continuing…</>
          ) : (
            "Continue"
          )}
        </Button>
      </form>

      {/* Or continue with Separator */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e2e8f0]" />
        </div>
        <span className="relative bg-white px-4 text-xs font-semibold text-[#64748b]">
          or continue with
        </span>
      </div>

      {/* OAuth Social Buttons Grid */}
      <div className="space-y-3">
        {/* Row 1: Google, GitHub, Microsoft */}
        <div className="grid grid-cols-3 gap-3">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={isGoogleLoading || isSubmitting}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-gray-50 transition text-xs font-semibold text-[#050505] disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#4285F4]" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>Google</span>
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={isGithubLoading || isSubmitting}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-gray-50 transition text-xs font-semibold text-[#050505] disabled:opacity-50"
          >
            {isGithubLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-black" />
            ) : (
              <Github className="h-5 w-5 text-black" />
            )}
            <span>GitHub</span>
          </button>

          {/* Microsoft */}
          <button
            type="button"
            onClick={() => handleOAuth("azure-ad")}
            disabled={isMicrosoftLoading || isSubmitting}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-gray-50 transition text-xs font-semibold text-[#050505] disabled:opacity-50"
          >
            {isMicrosoftLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#F25022]" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none">
                <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022" />
                <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7FBA00" />
                <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00A4EF" />
                <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900" />
              </svg>
            )}
            <span>Microsoft</span>
          </button>
        </div>

        {/* Row 2: Passkey, SSO (Centered) */}
        <div className="grid grid-cols-2 gap-3 max-w-[260px] mx-auto">
          {/* Passkey */}
          <button
            type="button"
            onClick={handlePasskey}
            disabled={isPasskeyLoading || isSubmitting}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-gray-50 transition text-xs font-semibold text-[#050505] disabled:opacity-50"
          >
            {isPasskeyLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#3b82f6]" />
            ) : (
              <KeyRound className="h-5 w-5 text-gray-500" />
            )}
            <span>Passkey</span>
          </button>

          {/* SSO */}
          <button
            type="button"
            onClick={() => setSsoOpen(true)}
            disabled={isSsoLoading || isSubmitting}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-gray-50 transition text-xs font-semibold text-[#050505] disabled:opacity-50"
          >
            {isSsoLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#3b82f6]" />
            ) : (
              <Building2 className="h-5 w-5 text-gray-500" />
            )}
            <span>SSO</span>
          </button>
        </div>
      </div>

      {/* ── Corporate SSO domain input dialog ───────────────────────────── */}
      <Dialog open={ssoOpen} onOpenChange={setSsoOpen}>
        <DialogContent className="max-w-[360px] bg-white text-[#050505] border border-[#e2e8f0] p-6 rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-bold text-black flex items-center justify-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <span>Log in with SSO</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748b] pt-1">
              Enter your corporate email domain (e.g. acme.com) to authenticate via Single Sign-On.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSsoSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="sso-email" className="text-xs font-bold text-[#64748b]">
                Email domain
              </Label>
              <Input
                id="sso-email"
                type="text"
                placeholder="acme.com"
                value={ssoDomain}
                onChange={(e) => setSsoDomain(e.target.value)}
                className="h-10 border-[#e2e8f0] focus-visible:ring-1 focus-visible:ring-[#2563eb] rounded-[8px]"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-[8px]"
            >
              Continue with SSO
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
