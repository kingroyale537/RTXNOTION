// app/onboarding/page.tsx
// First-time user setup: choose usage category and create their first workspace.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import {
  Loader2,
  ArrowRight,
  Briefcase,
  Home,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

type UsageType = "work" | "personal" | "school";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<1 | 2>(1);
  const [usageType, setUsageType] = useState<UsageType | null>(null);
  const [improveAi, setImproveAi] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(true);

  const userName = session?.user?.name ?? "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", slug: "", description: "", logo: "🏢" },
  });

  const name = watch("name");

  // Auto-generate slug from name
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue("name", val);
    setValue("slug", slugify(val) || "my-workspace");
  }

  // Choose preset suggestion based on category choice
  function selectCategory(category: UsageType) {
    setUsageType(category);
    
    let suggestedName = "";
    let suggestedLogo = "🏢";
    let suggestedDesc = "";

    if (category === "work") {
      suggestedName = userName ? `${userName}'s Work Space` : "Work Workspace";
      suggestedLogo = "💼";
      suggestedDesc = "Our team's internal knowledge base and task tracker";
    } else if (category === "personal") {
      suggestedName = userName ? `${userName}'s Personal Space` : "My Personal Space";
      suggestedLogo = "🏡";
      suggestedDesc = "Organizing my thoughts, reading lists, and daily journals";
    } else if (category === "school") {
      suggestedName = userName ? `${userName}'s Study Hub` : "Class Space";
      suggestedLogo = "🎓";
      suggestedDesc = "Keeping track of lecture notes, exams, and research papers";
    }

    setValue("name", suggestedName);
    setValue("slug", slugify(suggestedName) || "my-workspace");
    setValue("description", suggestedDesc);
    setValue("logo", suggestedLogo);
  }

  async function onSubmit(data: CreateWorkspaceInput) {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          usageType,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to create workspace");
        return;
      }
      toast.success("Workspace created! 🎉");
      router.push(`/${data.slug}`);
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#191919] text-[#f3f4f6] p-4 select-none">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in flex flex-col items-center">
        {/* Lightbulb Logo Indicator */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl mb-4 text-yellow-500 animate-pulse">
            💡
          </div>
          {/* Progress indicators */}
          <div className="flex gap-2 w-28 h-1 bg-[#2e2e2e] rounded-full overflow-hidden">
            <div
              className={`h-full bg-primary transition-all duration-500 ease-out ${
                step === 1 ? "w-1/2" : "w-full"
              }`}
            />
          </div>
        </div>

        {step === 1 ? (
          <div className="w-full text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              How do you want to use RTX Notion?
            </h1>
            <p className="text-gray-400 text-sm mb-8">This helps customize your experience</p>

            <div className="space-y-4 mb-8">
              {/* Card 1: Work */}
              <button
                type="button"
                onClick={() => selectCategory("work")}
                className={`w-full flex items-start gap-4 p-5 rounded-xl border text-left transition-all duration-200 outline-none ${
                  usageType === "work"
                    ? "bg-[#2c2c2c] border-primary shadow-lg shadow-primary/5"
                    : "bg-[#252525] border-[#333333] hover:border-[#444444] hover:bg-[#282828]"
                }`}
              >
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">For work</h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Track projects, company goals, meeting notes
                  </p>
                </div>
              </button>

              {/* Card 2: Personal */}
              <button
                type="button"
                onClick={() => selectCategory("personal")}
                className={`w-full flex items-start gap-4 p-5 rounded-xl border text-left transition-all duration-200 outline-none ${
                  usageType === "personal"
                    ? "bg-[#2c2c2c] border-primary shadow-lg shadow-primary/5"
                    : "bg-[#252525] border-[#333333] hover:border-[#444444] hover:bg-[#282828]"
                }`}
              >
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  <Home className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">For personal life</h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Write better, think more clearly, stay organized
                  </p>
                </div>
              </button>

              {/* Card 3: School */}
              <button
                type="button"
                onClick={() => selectCategory("school")}
                className={`w-full flex items-start gap-4 p-5 rounded-xl border text-left transition-all duration-200 outline-none ${
                  usageType === "school"
                    ? "bg-[#2c2c2c] border-primary shadow-lg shadow-primary/5"
                    : "bg-[#252525] border-[#333333] hover:border-[#444444] hover:bg-[#282828]"
                }`}
              >
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">For school</h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Keep notes, research, and tasks in one place
                  </p>
                </div>
              </button>
            </div>

            {/* Step 1 continue button */}
            <Button
              onClick={() => setStep(2)}
              disabled={!usageType}
              className="w-full h-12 text-sm font-semibold gap-2 mb-8 bg-primary text-white hover:bg-primary/95 disabled:bg-[#2c2c2c] disabled:text-gray-500"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>

            {/* Checkboxes from the mockup */}
            <div className="border-t border-[#2e2e2e] pt-6 space-y-4 text-left">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={improveAi}
                  onChange={(e) => setImproveAi(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-gray-900"
                />
                <div className="text-xs">
                  <span className="font-medium text-gray-300 group-hover:text-white transition">
                    Improve AI for your workspace
                  </span>
                  <p className="text-gray-500 mt-1">
                    Get better answers and early access to AI features by sharing workspace data. By participating in LEAP, you agree to the{" "}
                    <span className="underline hover:text-gray-300">terms</span>.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={marketingAgreed}
                  onChange={(e) => setMarketingAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-gray-900"
                />
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition">
                  I agree to RTX Notion marketing communications
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Create your workspace</h1>
              <p className="text-gray-400 text-sm mt-2">
                This workspace will be customized for your{" "}
                <span className="text-primary font-semibold capitalize">{usageType}</span> usage
              </p>
            </div>

            <div className="bg-[#222222] border border-[#333333] rounded-2xl p-8 shadow-xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Logo and Name */}
                <div className="flex items-center gap-4">
                  <div className="text-5xl select-none cursor-default bg-[#2d2d2d] w-16 h-16 rounded-xl border border-[#3e3e3e] flex items-center justify-center">
                    {watch("logo")}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="ws-name" className="text-gray-300 text-sm">
                      Workspace name
                    </Label>
                    <Input
                      id="ws-name"
                      placeholder="e.g. Workspace"
                      className="mt-1.5 h-11 bg-[#2c2c2c] border-[#3e3e3e] text-white focus:border-primary placeholder:text-gray-500"
                      {...register("name")}
                      onChange={handleNameChange}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>
                </div>

                {/* Workspace Slug */}
                <div className="space-y-1.5">
                  <Label htmlFor="ws-slug" className="text-gray-300 text-sm">
                    Workspace URL
                  </Label>
                  <div className="flex items-center mt-1.5">
                    <span className="flex h-11 items-center rounded-l-md border border-r-0 border-[#3e3e3e] bg-[#2d2d2d] px-3 text-sm text-gray-400 select-none">
                      rtxnotion.app/
                    </span>
                    <Input
                      id="ws-slug"
                      className="rounded-l-none h-11 bg-[#2c2c2c] border-[#3e3e3e] text-white focus:border-primary"
                      {...register("slug")}
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
                  )}
                </div>

                {/* Workspace Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="ws-desc" className="text-gray-300 text-sm">
                    Workspace Description <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    id="ws-desc"
                    placeholder="Short description of this workspace"
                    className="h-11 bg-[#2c2c2c] border-[#3e3e3e] text-white focus:border-primary placeholder:text-gray-500"
                    {...register("description")}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-12 flex-1 border-[#3e3e3e] text-gray-300 hover:bg-[#2d2d2d] hover:text-white"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 flex-1 font-semibold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
                    disabled={isSubmitting || !name}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                    ) : (
                      <>Create Workspace <Sparkles className="h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
