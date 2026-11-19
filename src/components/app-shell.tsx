"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { FollowUpImport } from "@/components/follow-up-import";
import { ImportGate, useHealth } from "@/components/import-gate";
import { SideNav } from "@/components/side-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const STATUS: Record<string, { label: string; tone: string }> = {
  siap: { label: "Data siap", tone: "bg-good-light text-good" },
  memuat: { label: "Mengimpor data", tone: "bg-minor-light text-minor" },
  gagal: { label: "Impor gagal", tone: "bg-severe-light text-severe" },
};

function DataStatus() {
  const health = useHealth();
  const status = health.data ? STATUS[health.data.status] : undefined;
  const shown = status ?? (health.isError ? { label: "Server tidak terhubung", tone: "bg-severe-light text-severe" } : null);
  if (!shown) {
    return null;
  }
  return (
    <span role="status" className={cn("inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold", shown.tone)}>
      {shown.label}
    </span>
  );
}

/** Application frame after the SIMRS dashboard: navy sidebar, white header, page body. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ready = useHealth().data?.status === "siap";

  return (
    <div className="flex min-h-dvh bg-background">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand"
      >
        Lewati ke isi halaman
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">
        <SideNav />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 gap-0 border-0 bg-sidebar p-0 text-sidebar-foreground" showCloseButton={false}>
          <SheetTitle className="sr-only">Menu utama</SheetTitle>
          <SheetDescription className="sr-only">Pindah ke halaman lain.</SheetDescription>
          <SideNav onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Buka menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand lg:hidden">Kondisi Jaringan Irigasi</span>
          <div className="hidden flex-1 lg:block" />
          <DataStatus />
          {ready ? <FollowUpImport /> : null}
        </header>

        <main id="konten" tabIndex={-1} className="flex min-w-0 flex-1 flex-col outline-none">
          <ImportGate>{children}</ImportGate>
        </main>
      </div>
    </div>
  );
}
