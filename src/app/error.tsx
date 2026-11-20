"use client";

import { PageBody } from "@/components/page-body";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageBody>
      <PageHeader
        title="Halaman gagal ditampilkan"
        description="Terjadi kesalahan saat menampilkan halaman ini. Data di server tidak berubah."
      />
      <Button className="self-start" onClick={reset}>
        Muat ulang halaman ini
      </Button>
    </PageBody>
  );
}
