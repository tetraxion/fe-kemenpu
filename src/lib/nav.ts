import { ClipboardCheck, ListOrdered, Map, Ruler, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Each icon names what the page shows: a map, a ranked list, lengths, a check of the data.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Peta jaringan", icon: Map },
  { href: "/prioritas", label: "Prioritas pemeliharaan", icon: ListOrdered },
  { href: "/rekap-saluran", label: "Rekap panjang saluran", icon: Ruler },
  { href: "/kualitas-data", label: "Kualitas data", icon: ClipboardCheck },
];
