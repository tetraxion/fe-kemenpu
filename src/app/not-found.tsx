import Link from "next/link";

import { PageBody } from "@/components/page-body";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageBody>
      <PageHeader title="Halaman tidak ditemukan" description="Alamat yang dibuka tidak ada di aplikasi ini." />
      <Link href="/" className={buttonVariants({ className: "self-start" })}>
        Buka peta jaringan
      </Link>
    </PageBody>
  );
}
