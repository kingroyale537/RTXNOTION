import { Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./editor.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Voltaic – Collaborative Workspace",
    template: "%s | Voltaic",
  },
  description:
    "A self-hosted, real-time collaborative workspace for your team – create pages, share knowledge, and work together.",
  keywords: ["voltaic", "workspace", "collaboration", "notes", "knowledge base"],
  authors: [{ name: "Voltaic" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Voltaic",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Voltaic",
    description: "Real-time collaborative workspace for your team",
    siteName: "Voltaic",
  },
};

import { MacTitlebar } from "@/components/desktop/MacTitlebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <MacTitlebar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
