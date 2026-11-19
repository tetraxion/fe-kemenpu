import type { Metadata } from "next";

import { PriorityView } from "@/components/priority/priority-view";

export const metadata: Metadata = { title: "Prioritas pemeliharaan" };

export default function PriorityPage() {
  return <PriorityView />;
}
