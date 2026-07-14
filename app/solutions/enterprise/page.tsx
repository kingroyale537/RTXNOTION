"use client";

// app/solutions/enterprise/page.tsx
// Enterprise solutions landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { ShieldCheck, Building2, Key, Users, BookOpen, Clock } from "lucide-react";



export default function EnterprisePage() {
  const features = [
    {
      icon: Key,
      title: "SAML 2.0 & OIDC Single Sign-On",
      description: "Secure workspace logins using corporate Okta, Azure AD, or Google Workspace email domains.",
    },
    {
      icon: ShieldCheck,
      title: "Advanced Permissions & RBAC",
      description: "Set granular workspace security profiles. Separate viewer access from editors and admin configurations.",
    },
    {
      icon: Clock,
      title: "Detailed Compliance Audit Logs",
      description: "Monitor login activity, data exports, member invites, and workspace modifications in real-time.",
    },
    {
      icon: Building2,
      title: "Dedicated Deployment Support",
      description: "Self-host Voltaic on private AWS or GCP environments with direct setup support from core engineers.",
    },
    {
      icon: Users,
      title: "Isolated Workspace Presence",
      description: "Deploy private WebSocket collaboration nodes to meet strict security and document routing guidelines.",
    },
    {
      icon: BookOpen,
      title: "99.9% Uptime SLA Guarantees",
      description: "Rest easy with premium SLAs, dedicated cluster hosting options, and 24/7 technical assistance.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Solutions"
      title="Voltaic for Enterprise"
      subtitle="Secure, collaborative, enterprise-grade."
      description="Equip your organization with a collaborative workspace that keeps data secure. Voltaic Enterprise offers SAML SSO integrations, role permissions controls, and audit trails."
      gradientFrom="from-[#4f46e5]"
      gradientTo="to-[#a855f7]"
      features={features}
    />
  );
}
