"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-6 overflow-y-auto bg-sidebar px-4 py-5 text-sidebar-foreground">
      <div className="flex flex-col gap-1 px-2.5">
        <span className="text-base leading-tight font-semibold">Kondisi Jaringan Irigasi</span>
        <span className="text-xs leading-normal text-sidebar-muted">Pemeliharaan aset irigasi</span>
      </div>

      <nav aria-label="Menu utama" className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] leading-snug transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                active ? "bg-sidebar-primary font-semibold" : "hover:bg-sidebar-accent active:bg-sidebar-accent/70",
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
