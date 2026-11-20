import { ClipboardCheck, ListOrdered, Map, Ruler, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Peta jaringan", icon: Map },
  { href: "/prioritas", label: "Prioritas pemeliharaan", icon: ListOrdered },
  { href: "/rekap-saluran", label: "Rekap panjang saluran", icon: Ruler },
  { href: "/kualitas-data", label: "Kualitas data", icon: ClipboardCheck },
];
