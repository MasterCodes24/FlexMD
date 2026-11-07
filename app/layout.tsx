import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import ConditionalShell from "../src/components/layout/ConditionalShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClinicFlow AI",
  description: "Less paperwork. More time for patients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
          <ConditionalShell>{children}</ConditionalShell>
        </Suspense>
      </body>
    </html>
  );
}
