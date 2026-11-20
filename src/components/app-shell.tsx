"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FollowUpImport } from "@/components/follow-up-import";
import { ImportGate, useHealth } from "@/components/import-gate";
import { SideNav } from "@/components/side-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/nav";
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
  // no room for the ready status on phones; problems still show
  const quiet = health.data?.status === "siap";
  return (
    <span
      role="status"
      className={cn("h-7 items-center rounded-md px-2.5 text-xs font-semibold", quiet ? "hidden sm:inline-flex" : "inline-flex", shown.tone)}
    >
      {shown.label}
    </span>
  );
}

function CurrentPage() {
  const pathname = usePathname();
  const item = NAV_ITEMS.find((nav) => nav.href === pathname);
  if (!item) {
    return <div className="hidden flex-1 lg:block" />;
  }
  const Icon = item.icon;
  return (
    <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-2-light text-brand-2">
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      <p className="flex min-w-0 flex-col">
        <span className="truncate text-sm leading-tight font-semibold text-brand">{item.label}</span>
        <span className="truncate text-xs text-muted-foreground">{item.hint}</span>
      </p>
    </div>
  );
}

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
          <CurrentPage />
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
