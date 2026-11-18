/**
 * OrderTimeline: timeline 8 tahap pesanan (PRD §8.8) beserta waktu WITA tahap yang
 * sudah lewat. Tahap berjalan ditandai; "perlu revisi" menggantikan label "Cek desain".
 */
import { cn } from "@/lib/cn";
import { formatDateTimeWita } from "@/lib/format";
import { STATUS_LABEL, TIMELINE_STEPS, type StatusName } from "@/lib/domain/order-status";
import type { OrderView } from "@/server/services/order-view-service";

/** Memetakan status pesanan ke tahap timeline yang sedang berjalan. */
function currentStepOf(status: StatusName): StatusName {
  if (status === "perlu_revisi") return "cek_desain";
  if (status === "kedaluwarsa" || status === "dibatalkan") return "menunggu_pembayaran";
  return status;
}

export function OrderTimeline({ order }: { order: OrderView }) {
  const current = currentStepOf(order.status);
  const currentIndex = TIMELINE_STEPS.indexOf(current);

  /** Waktu pertama kali pesanan masuk ke tahap tertentu (dari log). */
  const timeOf = (step: StatusName) => order.logs.find((log) => log.status === step)?.changedAt;

  return (
    <ol className="flex flex-col">
      {TIMELINE_STEPS.map((step, index) => {
        const done = index < currentIndex || order.status === "selesai";
        const active = index === currentIndex && order.status !== "selesai";
        const label = active && order.status === "perlu_revisi" ? "Perlu revisi" : STATUS_LABEL[step];
        const time = timeOf(step);
        return (
          <li key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink text-xs font-bold",
                  done && "bg-success text-white",
                  active && "bg-accent text-white shadow-hard-sm",
                  !done && !active && "bg-surface text-ink-muted",
                )}
                aria-hidden
              >
                {done ? "✓" : index + 1}
              </span>
              {index < TIMELINE_STEPS.length - 1 && <span className={cn("w-0.5 flex-1", done ? "bg-ink" : "bg-line")} />}
            </div>
            <div className="pb-6">
              <p className={cn("text-sm font-semibold", !done && !active && "text-ink-muted")}>
                {label}
                {active && <span className="ml-2 text-xs text-accent">· tahap berjalan</span>}
              </p>
              {time && (done || active) && <p className="text-xs text-ink-muted">{formatDateTimeWita(time)}</p>}
              {step === "dikirim" && order.resi && (done || active) && (
                <p className="text-xs font-semibold">{order.courier} · resi {order.resi}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
