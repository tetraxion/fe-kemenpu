"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { useId, useState } from "react";

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
import { api, errorMessage, MAX_UPLOAD_BYTES } from "@/lib/api";
import { formatInteger } from "@/lib/format";

const RESULT_ROWS = [
  { key: "ditambah", label: "Laporan baru ditambahkan" },
  { key: "diubah", label: "Laporan diperbarui" },
  { key: "dibatalkan", label: "Laporan dibatalkan" },
  { key: "tidak_berubah", label: "Tidak berubah" },
] as const;

type Source = "folder" | "upload";

/** Returns null when the file can be sent. */
function fileProblem(file: File | null): string | null {
  if (!file) {
    return null;
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return "Berkas harus berformat Excel (.xlsx).";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Ukuran berkas melebihi 10 MB.";
  }
  return null;
}

export function FollowUpImport() {
  const queryClient = useQueryClient();
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<Source>("folder");
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.importFollowUp(source === "upload" && file ? file : undefined),
    // every query depends on the reports
    onSuccess: () => queryClient.invalidateQueries(),
  });

  function handleOpenChange(next: boolean) {
    // closing mid-import would drop the result
    if (!next && mutation.isPending) {
      return;
    }
    setOpen(next);
    if (!next) {
      mutation.reset();
      setSource("folder");
      setFile(null);
    }
  }

  function chooseSource(next: Source) {
    setSource(next);
    // the file input is remounted empty
    setFile(null);
    mutation.reset();
  }

  const problem = source === "upload" ? fileProblem(file) : null;
  const cannotSend = source === "upload" && (!file || problem !== null);

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
            Menambahkan laporan periode berikutnya, lalu menghitung ulang kondisi terkini dan prioritas. Aman diulang:
            impor kedua dengan berkas yang sama tidak mengubah apa pun.
          </DialogDescription>
        </DialogHeader>

        {mutation.isSuccess ? null : (
          <fieldset disabled={mutation.isPending} className="flex flex-col gap-2">
            <legend className="mb-2 text-[13px] font-semibold">Sumber berkas</legend>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-checked:border-brand-2 has-checked:bg-brand-2-light">
              <input
                type="radio"
                name={`${fieldId}-source`}
                className="mt-0.5 size-4 accent-brand-2"
                checked={source === "folder"}
                onChange={() => chooseSource("folder")}
              />
              <span className="text-[13px] leading-normal">
                <span className="font-semibold">Berkas di folder data server</span>
                <span className="block text-muted-foreground">
                  Membaca <code className="text-foreground">laporan_susulan.xlsx</code> yang sudah ada di server.
                </span>
              </span>
            </label>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-checked:border-brand-2 has-checked:bg-brand-2-light">
              <input
                type="radio"
                name={`${fieldId}-source`}
                className="mt-0.5 size-4 accent-brand-2"
                checked={source === "upload"}
                onChange={() => chooseSource("upload")}
              />
              <span className="text-[13px] leading-normal">
                <span className="font-semibold">Unggah berkas dari komputer ini</span>
                <span className="block text-muted-foreground">
                  Excel (.xlsx) dengan kolom yang sama, paling besar 10 MB.
                </span>
              </span>
            </label>

            {source === "upload" ? (
              <div className="flex flex-col gap-1.5 pt-1">
                <label htmlFor={`${fieldId}-file`} className="text-[13px] font-semibold">
                  Berkas laporan
                </label>
                <input
                  id={`${fieldId}-file`}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  aria-invalid={problem !== null}
                  aria-describedby={problem ? `${fieldId}-problem` : undefined}
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    mutation.reset();
                  }}
                  className="w-full cursor-pointer rounded-lg border border-input bg-card text-[13px] file:mr-3 file:h-11 file:cursor-pointer file:border-0 file:border-r file:border-input file:bg-muted file:px-3 file:font-semibold file:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-severe md:file:h-10"
                />
                {problem ? (
                  <p id={`${fieldId}-problem`} className="text-[13px] text-severe">
                    {problem}
                  </p>
                ) : null}
              </div>
            ) : null}
          </fieldset>
        )}

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
            <Button disabled={mutation.isPending || cannotSend} onClick={() => mutation.mutate()}>
              {mutation.isPending ? "Mengimpor..." : mutation.isError ? "Coba lagi" : "Impor sekarang"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
