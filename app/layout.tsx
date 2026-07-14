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
    default: "Voltaic – Collaborative Workspace",
    template: "%s | Voltaic",
  },
  description:
    "A self-hosted, real-time collaborative workspace for your team – create pages, share knowledge, and work together.",
  keywords: ["voltaic", "workspace", "collaboration", "notes", "knowledge base"],
  authors: [{ name: "Voltaic" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Voltaic",
    description: "Real-time collaborative workspace for your team",
    siteName: "Voltaic",
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
