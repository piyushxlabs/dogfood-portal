import type { Metadata } from "next";
import "./globals.css";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";

export const metadata: Metadata = {
  title: "Dogfood 2026 Hackathon Portal",
  description: "Autonomous, air-gapped submission and judging platform for Hackathon Raptors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100 min-h-screen">
        {/* Evaluator Persona Switcher */}
        <div className="fixed top-3 right-4 z-50">
          <PersonaSwitcher />
        </div>
        {children}
      </body>
    </html>
  );
}
