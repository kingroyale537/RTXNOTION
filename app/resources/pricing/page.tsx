"use client";

// app/resources/pricing/page.tsx
// Pricing landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";



export default function PricingPage() {
  const plans = [
    {
      name: "Personal",
      price: "$0",
      period: "forever",
      desc: "For individuals looking to organize notes, write documents, and manage tasks.",
      features: [
        "Unlimited nesting pages",
        "Collaborative block-based editor",
        "Prisma database backend sync",
        "Native Passkey biometrics support",
        "Standard search indexing",
      ],
      cta: "Get started free",
      link: "/register",
      popular: false,
    },
    {
      name: "Workspace Pro",
      price: "$10",
      period: "per user / month",
      desc: "For collaborative teams looking to centralize wikis, manage databases, and track sprints.",
      features: [
        "Everything in Personal plan",
        "Unlimited workspace members",
        "Slack & Google Workspace connectors",
        "Granular teamspace permissions",
        "30-day page version histories",
        "Priority email support",
      ],
      cta: "Try Pro free",
      link: "/register",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact sales",
      desc: "For large organizations requiring security controls, audit logs, and custom agreements.",
      features: [
        "Everything in Workspace Pro plan",
        "SAML SSO & corporate callback domains",
        "Dedicated workspace presence servers",
        "Unlimited version histories archive",
        "99.9% uptime SLA guarantee",
        "24/7 dedicated support representative",
      ],
      cta: "Contact Sales",
      link: "/register",
      popular: false,
    },
  ];

  return (
    <MarketingPageLayout
      badge="Resources"
      title="Pricing"
      subtitle="Plans for teams of all sizes."
      description="Choose the right plan to centralize your wikis, documents, and projects. Start for free and upgrade as your team grows."
      gradientFrom="from-[#ec4899]"
      gradientTo="to-[#a855f7]"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl bg-[#111] border ${
              plan.popular ? "border-indigo-500 shadow-indigo-500/5 shadow-2xl relative" : "border-[#202020]"
            } flex flex-col justify-between space-y-6`}
          >
            {plan.popular && (
              <span className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white font-bold uppercase tracking-wider text-[9px] px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-white text-lg">{plan.name}</h4>
                <p className="text-xs text-[#94a3b8] mt-1">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
                <span className="text-xs text-[#64748b]">/ {plan.period}</span>
              </div>

              <Separator />

              <ul className="space-y-2.5 text-xs text-[#94a3b8]">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href={plan.link} className="w-full">
              <Button
                className={`w-full h-10 font-bold rounded-xl text-xs gap-1.5 transition ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-white/5 hover:bg-white/10 text-white border border-[#2d2d2d]"
                }`}
              >
                {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </MarketingPageLayout>
  );
}

function Separator() {
  return <div className="w-full border-t border-[#202020]" />;
}
