import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LeadIQ - AI-Powered Lead Qualification Platform",
  description: "Transform your sales pipeline with AI-driven lead scoring, intelligent insights, and automated qualification. The enterprise sales intelligence platform that closes more deals.",
  keywords: ["AI lead qualification", "sales intelligence", "lead scoring", "CRM", "sales automation"],
  openGraph: {
    title: "LeadIQ - AI-Powered Lead Qualification",
    description: "Close 3x more deals with AI-driven lead intelligence",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
