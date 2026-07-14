// app/(auth)/sso-callback/page.tsx
// Corporate SSO authentication redirect screen wrapped in Suspense boundary.

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ShieldCheck, ArrowRightLeft } from "lucide-react";

function SsoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain") || "enterprise";
  const [step, setStep] = useState(0);

  const logs = [
    `Initiating OIDC Handshake for ${domain}...`,
    `Redirected to Okta Enterprise Provider...`,
    `Verifying user authorization token...`,
    `Handshake successful! Provisioning session...`,
  ];

  useEffect(() => {
    if (step < logs.length - 1) {
      const timer = setTimeout(() => setStep((s) => s + 1), 600);
      return () => clearTimeout(timer);
    } else {
      // Execute mock authentication callback
      const timer = setTimeout(async () => {
        const result = await signIn("credentials", {
          email: `${domain.toLowerCase().replace(/[^a-z]/g, "")}-sso-mock@voltaic.com`,
          password: "mock-password-123",
          redirect: false,
        });
        if (result?.error) {
          router.push("/login?error=SSOFailed");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, domain, logs.length, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191919] text-[#f3f4f6] px-4">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-[#222222] border border-[#2a2a2a] text-center space-y-6 shadow-2xl">
        <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/25 mx-auto">
          <ArrowRightLeft className="h-6 w-6 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Connecting to Corporate SSO
          </h1>
          <p className="text-xs text-gray-400">
            Sign-On service authorized by <span className="text-gray-200 font-semibold">{domain}</span>
          </p>
        </div>

        {/* Dynamic Log Feed */}
        <div className="bg-[#151515] p-3 rounded-lg border border-[#2a2a2a] min-h-[90px] flex flex-col justify-center items-start text-left space-y-1.5 font-mono text-[10px] text-gray-400">
          {logs.slice(0, step + 1).map((log, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx === step && step < logs.length - 1 ? (
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              )}
              <span className={idx === step ? "text-blue-400 font-bold" : "text-gray-300"}>
                {log}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-500">
          Voltaic SSO utilizes enterprise SAML 2.0 / OIDC integrations.
        </p>
      </div>
    </div>
  );
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#191919] text-[#f3f4f6]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    }>
      <SsoCallbackContent />
    </Suspense>
  );
}
