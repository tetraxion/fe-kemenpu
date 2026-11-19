const numberFormat = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integerFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** 1874.05 becomes "1.874,05". */
export function formatDecimal(value: number): string {
  return numberFormat.format(value);
}

export function formatInteger(value: number): string {
  return integerFormat.format(value);
}

/** "2026-08-14" becomes "14 Agu 2026". Anything that is not a date is shown as written. */
export function formatDate(value: string | null): string {
  if (!value) {
    return "Tanpa tanggal";
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

/** Escapes text placed into HTML that Leaflet renders (popups, tooltips). */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
