import { ClipboardCheck, ListOrdered, Map, Ruler, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Peta jaringan", hint: "Saluran, bangunan, dan petak tersier", icon: Map },
  { href: "/prioritas", label: "Prioritas pemeliharaan", hint: "Bangunan diurutkan menurut skor", icon: ListOrdered },
  { href: "/rekap-saluran", label: "Rekap panjang saluran", hint: "Panjang per tingkat dan kondisi", icon: Ruler },
  { href: "/kualitas-data", label: "Kualitas data", hint: "Temuan saat data dibersihkan", icon: ClipboardCheck },
];
