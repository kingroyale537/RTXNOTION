"use client";

// app/resources/help/page.tsx
// Help Center landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { Search, HelpCircle, Key, Users, BookOpen, MessageSquare } from "lucide-react";



export default function HelpCenterPage() {
  const faqs = [
    {
      q: "How does real-time collaboration work in Voltaic?",
      a: "Voltaic uses Yjs CRDT technology backed by a WebSocket server. When multiple users open the same page, edits sync seamlessly character-by-character, and users see each other's live cursor selections.",
    },
    {
      q: "Can I self-host Voltaic on my company servers?",
      a: "Yes! Voltaic is designed as a self-hosted workspace package. You can configure your local PostgreSQL database, setup NextAuth credentials, and launch it in Docker containers easily.",
    },
    {
      q: "What security features are supported for enterprise SSO?",
      a: "We support SAML 2.0 and OpenID Connect (OIDC) integrations (e.g. Okta, Azure AD, Microsoft accounts) enabling corporate users to sign-on with custom workspace email domains.",
    },
    {
      q: "How do I configure integrations like Slack and Google Drive?",
      a: "Navigate to settings panel, choose Integrations, click Connect, and authorise. Integration statuses are saved in your Prisma database schema and tokens are encrypted.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Resources"
      title="Help Center"
      subtitle="Find answers and guides."
      description="Need help getting started, configuring database fields, setting up workspace roles, or self-hosting? Explore our search directory and detailed FAQ guides below."
      gradientFrom="from-[#06b6d4]"
      gradientTo="to-[#3b82f6]"
    >
      {/* Dynamic Search Box Mock */}
      <div className="max-w-xl mx-auto mb-16 relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#64748b]">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          placeholder="Search docs, tutorials, and configurations..."
          className="w-full h-12 pl-12 pr-4 bg-[#111111] border border-[#2a2a2a] focus:border-[#4f46e5] text-sm text-white placeholder-gray-500 rounded-xl outline-none transition"
        />
      </div>

      {/* FAQ Lists */}
      <div className="max-w-3xl mx-auto space-y-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 justify-center">
          <HelpCircle className="h-5 w-5 text-indigo-400" /> Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-[#111] border border-[#202020] space-y-2 text-left">
              <h4 className="font-bold text-white text-sm">{faq.q}</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingPageLayout>
  );
}
