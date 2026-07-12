// app/onboarding/page.tsx
// First-time user setup: create their first workspace.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  async function onSubmit(data: CreateWorkspaceInput) {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white text-2xl font-bold shadow-lg shadow-primary/30 mb-4">
            R
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Set up your workspace</h1>
          <p className="text-muted-foreground mt-2">This takes 30 seconds ✨</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Emoji picker */}
            <div className="flex items-center gap-3">
              <div className="text-5xl select-none cursor-default">🏢</div>
              <div className="flex-1">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  placeholder="Acme Corp"
                  className="mt-1.5 h-11"
                  {...register("name")}
                  onChange={handleNameChange}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ws-slug">URL</Label>
              <div className="flex items-center">
                <span className="flex h-11 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">
                  rtxnotion.app/
                </span>
                <Input
                  id="ws-slug"
                  className="rounded-l-none h-11"
                  {...register("slug")}
                />
              </div>
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ws-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="ws-desc"
                placeholder="Our team's knowledge hub"
                className="h-11"
                {...register("description")}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/25 gap-2"
              disabled={isSubmitting || !name}
              id="create-workspace-btn"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              ) : (
                <>Create workspace <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
