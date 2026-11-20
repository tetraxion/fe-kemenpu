"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SideNav({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "scrollbar-thin flex h-full flex-col gap-6 overflow-y-auto bg-sidebar py-5 text-sidebar-foreground",
        collapsed ? "px-2.5" : "px-4",
      )}
    >
      {/* the logo text is navy, so it sits on a white plate */}
      <div className={cn("flex items-center rounded-lg bg-white", collapsed ? "justify-center p-1.5" : "px-3 py-2.5")}>
        <Image
          src="/kemenpu.svg"
          alt="Kementerian Pekerjaan Umum"
          width={221}
          height={41}
          unoptimized
          priority
          // collapsed: only the emblem at the left of the lockup
          className={collapsed ? "h-8 w-[34px] object-cover object-left" : "h-8 w-auto"}
        />
      </div>

      <div className={cn("flex-col gap-1 px-2.5", collapsed ? "hidden" : "flex")}>
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
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2.5 rounded-lg py-2.5 text-[13px] leading-snug transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                active ? "bg-sidebar-primary font-semibold text-brand" : "hover:bg-sidebar-accent active:bg-sidebar-accent/70",
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span className={collapsed ? "sr-only" : "min-w-0 flex-1"}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
