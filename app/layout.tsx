import { Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "RTX Notion – Collaborative Workspace",
    template: "%s | RTX Notion",
  },
  description:
    "A self-hosted, real-time collaborative workspace for your team – create pages, share knowledge, and work together.",
  keywords: ["notion", "workspace", "collaboration", "notes", "knowledge base"],
  authors: [{ name: "RTX Notion" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "RTX Notion",
    description: "Real-time collaborative workspace for your team",
    siteName: "RTX Notion",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
