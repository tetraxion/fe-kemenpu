import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kondisi Jaringan Irigasi",
    template: "%s · Kondisi Jaringan Irigasi",
  },
  description:
    "Peta kondisi jaringan irigasi, dampak hilir tiap bangunan, prioritas pemeliharaan, dan temuan kualitas data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
