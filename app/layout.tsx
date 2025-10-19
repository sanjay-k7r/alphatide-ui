import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Alphatide - AI Financial Trading Assistant",
  description: "Your edge in options trading with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
