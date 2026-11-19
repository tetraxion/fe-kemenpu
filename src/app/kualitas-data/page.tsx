import type { Metadata } from "next";

import { QualityView } from "@/components/quality/quality-view";

export const metadata: Metadata = { title: "Kualitas data" };

export default function QualityPage() {
  return <QualityView />;
}
