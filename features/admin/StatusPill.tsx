/**
 * StatusPill: label status pesanan berbentuk pil berwarna (selalu berisi teks, bukan hanya warna).
 * Satu tempat untuk warna tiap status, dipakai di dashboard, daftar pesanan, dan detail pesanan.
 */
import { cn } from "@/lib/cn";
import { STATUS_LABEL, type StatusName } from "@/lib/domain/order-status";

/** Warna pil untuk tiap status. */
const STYLES: Record<StatusName, string> = {
  menunggu_pembayaran: "bg-surface text-ink",
  kedaluwarsa: "bg-subtle text-ink-muted",
  dibayar: "bg-pastel-blue text-ink",
  cek_desain: "bg-pastel-butter text-ink",
  perlu_revisi: "bg-accent text-white",
  produksi: "bg-ink text-white",
  qc: "bg-pastel-peach text-ink",
  siap_kirim: "bg-pastel-mint text-ink",
  dikirim: "bg-pastel-blue text-ink",
  selesai: "bg-pastel-mint text-ink",
  dibatalkan: "bg-accent-subtle text-accent",
};

export function StatusPill({ status, prefix }: { status: StatusName; prefix?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border-2 px-3 py-0.5 text-xs font-semibold",
        status === "dibatalkan" ? "border-accent" : "border-ink",
        STYLES[status],
      )}
    >
      {prefix}
      {STATUS_LABEL[status]}
    </span>
  );
}
