/**
 * Halaman Pesanan Berhasil ("/pesanan-berhasil/MLW-xxxx?token=...") - desain "Group (2)".
 * Berisi konfirmasi, nomor pesanan (bisa disalin/diunduh), dan tiga langkah berikutnya.
 * Halaman ini hanya "berhasil" bila SERVER sudah mencatat pembayaran (bukan karena URL-nya dibuka).
 */
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckoutHeader } from "@/components/ui/CheckoutHeader";
import { cn } from "@/lib/cn";
import { formatDateTimeWita } from "@/lib/format";
import { ClearDraft } from "@/features/order/ClearDraft";
import { OrderNumberBox } from "@/features/order/OrderNumberBox";
import { getOrderByToken, type OrderView } from "@/server/services/order-view-service";

export const dynamic = "force-dynamic";

/** Seberapa jauh pesanan: 1 = sedang cek desain, 2 = sudah masuk produksi (indeks langkah berjalan). */
function currentStepIndex(order: OrderView): number {
  return ["produksi", "qc", "siap_kirim", "dikirim", "selesai"].includes(order.status) ? 2 : 1;
}

/** Tiga langkah berikutnya yang tampil di kartu. */
function nextSteps(order: OrderView) {
  const paidAt = order.logs.find((log) => log.status === "dibayar")?.changedAt;
  return [
    { title: "Dibayar", text: paidAt ? formatDateTimeWita(paidAt) : "Pembayaran tercatat" },
    { title: "Cek desain", text: "Admin memeriksa file logo, sekitar 1 hari kerja" },
    { title: "Produksi", text: "Potong → jahit → bordir, 10–14 hari kerja" },
  ];
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { code } = await params;
  const { token = "" } = await searchParams;
  const order = await getOrderByToken(code, token).catch(() => null);
  if (!order) notFound();
  const paid = order.amountPaid > 0;
  const current = currentStepIndex(order);
  const steps = nextSteps(order);

  return (
    <>
      <CheckoutHeader step={4} />
      <main className="flex-1 px-4 py-6 md:py-8">
        {paid && <ClearDraft />}
        <Card className="mx-auto flex max-w-[640px] flex-col gap-4 !p-5 shadow-hard-lg md:gap-5 md:!p-7">
          {paid ? (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-card border-2 border-ink bg-pastel-mint shadow-hard-sm md:h-12 md:w-12 md:rounded-control" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5 9-10" />
                </svg>
              </span>
              <div>
                <h1 className="text-[28px] font-medium md:text-4xl">Pesanan berhasil</h1>
                <p className="mt-2 text-base text-ink-soft md:text-sm">
                  Pembayaran sudah kami terima. Simpan nomor pesananmu di bawah untuk melacak status produksi.
                </p>
              </div>

              <OrderNumberBox
                code={order.code}
                token={token}
                title={`${order.item.product} ${order.item.categoryName} · ${order.item.totalPcs} pcs`}
                total={order.total}
                amountPaid={order.amountPaid}
              />

              <div>
                <h2 className="mb-3 text-xl font-semibold md:text-base md:font-medium">Yang terjadi selanjutnya</h2>
                <ol className="flex flex-col">
                  {steps.map((step, index) => {
                    const done = index < current;
                    const active = index === current;
                    return (
                      <li key={step.title} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                              done && "border-accent bg-accent text-white",
                              active && "border-ink bg-ink text-white shadow-[3px_3px_0_0_#c12822]",
                              !done && !active && "border-line text-ink-muted",
                            )}
                            aria-hidden
                          >
                            {done ? "✓" : index + 1}
                          </span>
                          {index < steps.length - 1 && <span className={cn("w-0.5 flex-1", done ? "bg-accent" : "bg-line")} />}
                        </div>
                        <div className="pb-4">
                          <p className={cn("text-base font-semibold md:text-sm", !done && !active && "text-ink-muted")}>{step.title}</p>
                          <p className="text-sm text-ink-muted md:text-xs">{step.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href={`/status/${order.code}?token=${token}`} size="lg" className="w-full sm:w-auto">Lacak pesanan →</Button>
                <Button href="/" variant="secondary" size="lg" className="w-full sm:w-auto">Kembali ke beranda</Button>
              </div>
              <p className="text-xs text-ink-muted">Simpan nomor pesanan. Kamu memerlukannya bersama nomor WhatsApp untuk melacak.</p>
            </>
          ) : (
            <>
              <Alert tone="warning" title="Pembayaran belum tercatat">
                Jika kamu sudah membayar, tunggu beberapa saat lalu muat ulang halaman ini.
              </Alert>
              <Button href={`/pembayaran/${order.code}?token=${token}`} className="w-fit">Kembali ke pembayaran →</Button>
            </>
          )}
        </Card>
      </main>
    </>
  );
}
