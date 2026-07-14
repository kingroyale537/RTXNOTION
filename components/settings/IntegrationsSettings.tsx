// components/settings/IntegrationsSettings.tsx
// Integrations management sheet: Slack & Google Workspace card grids.

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, ArrowRight, ShieldCheck, Trash2, Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumb } from "@/components/page/PageBreadcrumb";
import toast from "react-hot-toast";

interface Integration {
  id: string;
  provider: "slack" | "google";
  status: "CONNECTED" | "DISCONNECTED";
  connectedAt: string | null;
}

interface Props {
  workspace: { id: string; name: string; slug: string };
  workspaceSlug: string;
}

export function IntegrationsSettings({ workspace, workspaceSlug }: Props) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [revokingProvider, setRevokingProvider] = useState<string | null>(null);

  // 1. Fetch current integration connection statuses
  useEffect(() => {
    async function fetchIntegrations() {
      try {
        const res = await fetch(`/api/workspaces/${workspace.id}/integrations`);
        const json = await res.json();
        if (res.ok) {
          setIntegrations(json.data || []);
        } else {
          toast.error("Failed to load integrations settings");
        }
      } catch {
        toast.error("Network error fetching integration statuses");
      } finally {
        setIsLoading(false);
      }
    }
    fetchIntegrations();
  }, [workspace.id]);

  // Helper to retrieve integration state
  const getIntegrationState = (provider: "slack" | "google") => {
    return integrations.find((i) => i.provider === provider);
  };

  // 2. Connect integration (OAuth Routing Sequence Simulation)
  async function connectIntegration(provider: "slack" | "google") {
    setConnectingProvider(provider);
    toast.loading(`Redirecting to authorize ${provider === "slack" ? "Slack Workspace" : "Google Account"}...`, {
      id: "auth-routing",
    });

    // Simulate OAuth consent handshake & backend sync
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspace.id}/integrations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider }),
        });
        const json = await res.json();

        if (res.ok) {
          // Update local status state
          setIntegrations((prev) => {
            const listWithout = prev.filter((i) => i.provider !== provider);
            return [...listWithout, json.data];
          });
          toast.success(`Successfully connected to ${provider === "slack" ? "Slack" : "Google Workspace"}!`, {
            id: "auth-routing",
          });
        } else {
          toast.error(`Authorization failed: ${json.error}`, { id: "auth-routing" });
        }
      } catch {
        toast.error("Handshake token sync failed", { id: "auth-routing" });
      } finally {
        setConnectingProvider(null);
      }
    }, 1500);
  }

  // 3. Revoke integration access
  async function revokeIntegration(provider: "slack" | "google") {
    if (!confirm(`Are you sure you want to disconnect ${provider === "slack" ? "Slack" : "Google Workspace"}? This will revoke active API access tokens.`)) return;

    setRevokingProvider(provider);
    const toastId = toast.loading(`Revoking credentials for ${provider}...`);

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/integrations?provider=${provider}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
        toast.success(`Disconnected ${provider === "slack" ? "Slack" : "Google Workspace"} integration!`, { id: toastId });
      } else {
        toast.error("Failed to revoke access token", { id: toastId });
      }
    } catch {
      toast.error("Connection failed", { id: toastId });
    } finally {
      setRevokingProvider(null);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#191919] text-[#f3f4f6]">
      <PageBreadcrumb workspaceId={workspace.id} workspaceSlug={workspaceSlug} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">Integrations</h1>
            <p className="text-[#94a3b8] mt-1 text-sm">
              Connect Voltaic with third-party tools to sync databases, files, and workspace messages.
            </p>
          </div>

          <Separator className="bg-[#2a2a2a] mb-8" />

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              // 4. Loading Skeletons State
              <>
                <IntegrationSkeleton />
                <IntegrationSkeleton />
              </>
            ) : (
              <>
                {/* ── Slack Card ────────────────────────────────────────── */}
                <IntegrationCard
                  title="Slack"
                  description="Post page activity alerts, notifications, comments, and AI summaries directly to selected Slack channels."
                  logo={
                    <svg className="h-10 w-10 shrink-0" viewBox="0 0 120 120" fill="none">
                      <g clipPath="url(#slack-clip)">
                        <path d="M24 80a7.5 7.5 0 1 1-7.5-7.5H24V80zm0-15a7.5 7.5 0 0 1 7.5 7.5v22.5A7.5 7.5 0 0 1 24 102.5a7.5 7.5 0 0 1-7.5-7.5V72.5A7.5 7.5 0 0 1 24 65z" fill="#E01E5A"/>
                        <path d="M40 24a7.5 7.5 0 1 1 7.5 7.5V24H40zm15 0a7.5 7.5 0 0 1-7.5 7.5H24A7.5 7.5 0 0 1 16.5 24a7.5 7.5 0 0 1 7.5-7.5h31A7.5 7.5 0 0 1 55 24z" fill="#2EB67D"/>
                        <path d="M96 40a7.5 7.5 0 1 1 7.5 7.5H96V40zm0 15a7.5 7.5 0 0 1-7.5-7.5V24A7.5 7.5 0 0 1 96 16.5a7.5 7.5 0 0 1 7.5 7.5v31a7.5 7.5 0 0 1-7.5 7.5z" fill="#36C5F0"/>
                        <path d="M80 96a7.5 7.5 0 1 1-7.5-7.5V96H80zm-15 0a7.5 7.5 0 0 1 7.5-7.5h31a7.5 7.5 0 0 1 7.5 7.5a7.5 7.5 0 0 1-7.5 7.5H72.5A7.5 7.5 0 0 1 65 96z" fill="#ECB22E"/>
                      </g>
                      <defs>
                        <clipPath id="slack-clip">
                          <rect width="120" height="120" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  }
                  isConnected={!!getIntegrationState("slack")}
                  connectedAt={getIntegrationState("slack")?.connectedAt}
                  isConnecting={connectingProvider === "slack"}
                  isRevoking={revokingProvider === "slack"}
                  onConnect={() => connectIntegration("slack")}
                  onDisconnect={() => revokeIntegration("slack")}
                />

                {/* ── Google Workspace Card ────────────────────────────── */}
                <IntegrationCard
                  title="Google Workspace"
                  description="Search your company files directly within Voltaic and easily attach Drive folders inside your documents."
                  logo={
                    <svg className="h-10 w-10 shrink-0" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.53 5.53 0 0 1 8.4 13a5.53 5.53 0 0 1 5.591-5.514c2.27 0 4.184 1.296 5.093 3.19l3.826-1.503C21.365 5.578 18.006 3.3 13.99 3.3 8.358 3.3 3.8 7.64 3.8 13s4.557 9.7 10.19 9.7c5.88 0 9.78-3.955 9.78-9.786 0-.648-.057-1.125-.13-1.629H12.24z" fill="#4285F4"/>
                    </svg>
                  }
                  isConnected={!!getIntegrationState("google")}
                  connectedAt={getIntegrationState("google")?.connectedAt}
                  isConnecting={connectingProvider === "google"}
                  isRevoking={revokingProvider === "google"}
                  onConnect={() => connectIntegration("google")}
                  onDisconnect={() => revokeIntegration("google")}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card component rendering states ──────────────────────────────────────────
interface CardProps {
  title: string;
  description: string;
  logo: React.ReactNode;
  isConnected: boolean;
  connectedAt: string | null | undefined;
  isConnecting: boolean;
  isRevoking: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function IntegrationCard({
  title,
  description,
  logo,
  isConnected,
  connectedAt,
  isConnecting,
  isRevoking,
  onConnect,
  onDisconnect,
}: CardProps) {
  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#222222] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200 shadow-lg">
      <div className="space-y-4">
        {/* Branding header */}
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-[#1b1b1b] border border-[#2d2d2d] flex items-center justify-center">
            {logo}
          </div>
          {/* Success Indicator layout */}
          {isConnected && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Connected
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="font-bold text-white text-base flex items-center gap-1.5">
            {title}
          </h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#2a2a2a]/60 space-y-4">
        {isConnected ? (
          // State 2: Connected Action Layout
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748b]">
              Connected {connectedAt ? `on ${format(new Date(connectedAt), "MMM d, yyyy")}` : "recently"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={isRevoking}
              onClick={onDisconnect}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold gap-1 px-3"
            >
              {isRevoking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1" />
              )}
              Disconnect
            </Button>
          </div>
        ) : (
          // State 1: Unconnected Indigo Button
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors gap-2"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Connect Integration</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Skeletons loaders ────────────────────────────────────────────────────────
function IntegrationSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-[#222222] border border-[#2a2a2a] animate-pulse space-y-5">
      <div className="flex justify-between items-start">
        <div className="w-16 h-16 rounded-xl bg-[#2d2d2d]" />
        <div className="w-20 h-5 rounded-full bg-[#2d2d2d]" />
      </div>
      <div className="space-y-2">
        <div className="h-5 rounded bg-[#2d2d2d] w-1/3" />
        <div className="h-3 rounded bg-[#2d2d2d] w-full" />
        <div className="h-3 rounded bg-[#2d2d2d] w-5/6" />
      </div>
      <div className="pt-4 border-t border-[#2a2a2a]/60">
        <div className="h-9 rounded bg-[#2d2d2d] w-full" />
      </div>
    </div>
  );
}
