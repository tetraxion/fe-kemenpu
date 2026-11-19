"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, errorMessage } from "@/lib/api";
import { formatInteger } from "@/lib/format";

const RESULT_ROWS = [
  { key: "ditambah", label: "Laporan baru ditambahkan" },
  { key: "diubah", label: "Laporan diperbarui" },
  { key: "dibatalkan", label: "Laporan dibatalkan" },
  { key: "tidak_berubah", label: "Tidak berubah" },
] as const;

/** Imports laporan_susulan.xlsx (part F) and refreshes everything derived from the reports. */
export function FollowUpImport() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: api.importFollowUp,
    // Conditions, priorities and findings all depend on the reports.
    onSuccess: () => queryClient.invalidateQueries(),
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      mutation.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <FileUp aria-hidden="true" />
        <span className="hidden sm:inline">Impor laporan susulan</span>
        <span className="sm:hidden">Impor susulan</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand">Impor laporan susulan</DialogTitle>
          <DialogDescription>
            Membaca <code className="text-foreground">laporan_susulan.xlsx</code> dari folder data, lalu menghitung
            ulang kondisi terkini dan prioritas. Aman diulang: impor kedua tidak mengubah apa pun.
          </DialogDescription>
        </DialogHeader>

        <div aria-live="polite" className="empty:hidden">
          {mutation.isSuccess ? (
            <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 rounded-lg bg-brand-2-light p-3 text-[13px]">
              {RESULT_ROWS.map((row) => (
                <div key={row.key} className="contents">
                  <dt>{row.label}</dt>
                  <dd className="text-right font-semibold">{formatInteger(mutation.data[row.key])}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {mutation.isError ? (
            <p role="alert" className="rounded-lg border border-severe/30 bg-severe-light p-3 text-[13px]">
              <span className="font-semibold text-severe">Impor gagal. </span>
              {errorMessage(mutation.error)}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{mutation.isSuccess ? "Selesai" : "Batal"}</DialogClose>
          {mutation.isSuccess ? null : (
            <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
              {mutation.isPending ? "Mengimpor..." : mutation.isError ? "Coba lagi" : "Impor sekarang"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
