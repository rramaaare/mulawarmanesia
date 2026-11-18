"use client";
/**
 * PaymentApp: halaman Pembayaran (desain "Group (1)").
 * Alur: server sudah membuatkan tagihan QRIS -> pelanggan boleh mengganti metode (tagihan baru
 * dibuat, atau tagihan lama dipakai ulang) -> halaman menampilkan kode QR / nomor VA + hitung mundur
 * -> pelanggan membayar (di demo: lewat Simulator Gateway) -> webhook mengubah status di server
 * -> halaman ini memeriksa status tiap 5 detik (maks. 2 menit) lalu pindah ke "Pesanan berhasil".
 * Status pembayaran HANYA dipercaya dari server, bukan dari browser.
 */
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { cn } from "@/lib/cn";
import { DP_RATE } from "@/lib/domain/constants";
import { formatDateTimeWita, formatRupiah } from "@/lib/format";
import type { OrderView } from "@/server/services/order-view-service";
import { downloadSvgAsPng } from "./qr-download";
import { QrFrame } from "./QrFrame";

type Method = "qris" | "va" | "ewallet";

/** Pilihan metode pembayaran yang tampil. */
const METHODS: { id: Method; title: string; text: string; right: string }[] = [
  { id: "qris", title: "QRIS", text: "GoPay, OVO, DANA, ShopeePay, m-banking", right: "Tanpa biaya" },
  { id: "va", title: "Virtual Account", text: "BCA · BNI · BRI · Mandiri", right: "Pilih bank" },
  { id: "ewallet", title: "E-wallet", text: "OVO · DANA · GoPay · ShopeePay", right: "Pilih" },
];

/** Pilihan e-wallet. */
const WALLETS = ["OVO", "DANA", "GoPay", "ShopeePay"];

/** Langkah-langkah cara bayar untuk tiap metode. */
function stepsFor(method: Method, amount: number): string[] {
  const check = `Periksa nominal ${formatRupiah(amount)}, lalu bayar.`;
  if (method === "va") return ["Buka aplikasi atau ATM bank pilihanmu.", "Pilih menu transfer ke Virtual Account lalu masukkan nomor di samping.", check];
  if (method === "ewallet") return ["Pilih e-wallet yang kamu pakai.", "Tekan tombol bayar; kamu diarahkan ke aplikasinya untuk konfirmasi.", check];
  return ["Buka aplikasi bank atau e-wallet.", "Pindai kode QR di samping.", check];
}

/** Data tagihan dari server. */
export interface Ticket {
  gatewayRef: string;
  method: Method;
  amount: number;
  instruction: string;
}

/** Mengubah milidetik menjadi "hh:mm:ss". */
function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

/** Memberi spasi tiap 4 digit agar nomor VA mudah dibaca. */
function groupDigits(value: string): string {
  return value.replace(/(.{4})/g, "$1 ").trim();
}

interface PaymentAppProps {
  initialOrder: OrderView;
  token: string;
  /** Tagihan awal (QRIS) yang dibuat server saat halaman dibuka; null jika gagal dibuat. */
  initialTicket: Ticket | null;
  /** Waktu server saat halaman dibuat (ms). Dipakai sebagai nilai awal jam agar server dan browser menampilkan hitung mundur yang sama. */
  serverNow: number;
  /** Hasil dari simulator gateway sebelumnya: "gagal" atau "kedaluwarsa". */
  notice?: "gagal" | "kedaluwarsa";
}

export function PaymentApp({ initialOrder, token, initialTicket, serverNow, notice }: PaymentAppProps) {
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(initialOrder);
  const [ticket, setTicket] = useState<Ticket | null>(initialTicket);
  const [method, setMethod] = useState<Method>(initialTicket?.method ?? "qris");
  const [switching, setSwitching] = useState(false); // sedang membuat tagihan untuk metode baru
  const [loadError, setLoadError] = useState(!initialTicket); // gagal membuat tagihan (V11)
  const [polling, setPolling] = useState(Boolean(initialTicket)); // sedang memeriksa pembayaran (V08)
  const [busy, setBusy] = useState(false); // tombol "Saya sudah bayar" sedang memeriksa
  const [message, setMessage] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(serverNow); // awalnya waktu server; berjalan tiap detik setelah halaman terbuka
  const [wallet, setWallet] = useState<string>(WALLETS[0]); // e-wallet yang dipilih

  // Alamat situs: kosong di server, terisi di browser (tanpa memicu peringatan hydration)
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );

  const expiresAt = new Date(order.expiresAt).getTime();
  const expired = order.status === "kedaluwarsa" || (order.paymentState === "belum_bayar" && now >= expiresAt);
  const amountDue = order.amountPaid > 0 ? order.total - order.amountPaid : order.paymentScheme === "DP50" ? Math.round(order.total * DP_RATE) : order.total;
  const schemeLabel = order.amountPaid > 0 ? "Pelunasan" : order.paymentScheme === "DP50" ? "DP 50%" : "Lunas";
  const methodInfo = METHODS.find((item) => item.id === method) ?? METHODS[0];
  // Isi QR = alamat simulator gateway, jadi QR yang dipindai dari ponsel membuka halaman bayar demo
  const qrValue = ticket && origin ? `${origin}/gateway/${ticket.gatewayRef}?code=${order.code}&token=${token}` : "";
  const gatewayHref = ticket ? `/gateway/${ticket.gatewayRef}?code=${order.code}&token=${token}` : "#";

  /** Membaca ulang status pesanan dari server. Mengembalikan true jika uang sudah tercatat. */
  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${order.code}?token=${token}`, { cache: "no-store" }).then((r) => r.json());
      if (!response.ok) return false;
      setOrder(response.data);
      return response.data.paymentState !== "belum_bayar" && response.data.amountPaid > initialOrder.amountPaid;
    } catch {
      return false;
    }
  }, [order.code, token, initialOrder.amountPaid]);

  // Detik berjalan untuk hitung mundur
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Selama ada tagihan: periksa status tiap 5 detik, maksimal 2 menit
  useEffect(() => {
    if (!ticket || !polling) return;
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      if (await refresh()) {
        clearInterval(timer);
        router.push(`/pesanan-berhasil/${order.code}?token=${token}`);
      } else if (attempts >= 24) {
        clearInterval(timer);
        setPolling(false);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [ticket, polling, refresh, router, order.code, token]);

  /** Ganti metode: minta server membuat (atau memakai ulang) tagihan untuk metode itu. */
  async function selectMethod(next: Method) {
    if (next === method && ticket) return;
    setMethod(next);
    setSwitching(true);
    setLoadError(false);
    setMessage(undefined);
    try {
      const response = await fetch(`/api/orders/${order.code}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: next }),
      }).then((r) => r.json());
      if (response.ok) {
        setTicket(response.data);
        setPolling(true);
        toast.success("Tagihan dibuat. Silakan selesaikan pembayaran.");
      } else {
        setTicket(null);
        setLoadError(true);
        toast.error(response.message ?? "Tagihan belum bisa dibuat. Coba lagi.");
      }
    } catch {
      setTicket(null);
      setLoadError(true);
      toast.error("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setSwitching(false);
    }
  }

  /** Tombol "Saya sudah bayar": periksa ke server saat ini juga. */
  async function handlePaid() {
    setBusy(true);
    setMessage(undefined);
    if (await refresh()) {
      toast.success("Pembayaran diterima. Terima kasih!");
      router.push(`/pesanan-berhasil/${order.code}?token=${token}`);
      return;
    }
    setMessage("Pembayaran belum kami terima. Tunggu beberapa saat; halaman ini memeriksa otomatis.");
    setPolling(true);
    setBusy(false);
  }

  /** Menyalin nomor Virtual Account. */
  async function copyInstruction() {
    if (!ticket) return;
    try {
      await navigator.clipboard.writeText(ticket.instruction);
      setCopied(true);
      toast.success("Nomor Virtual Account disalin.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Tidak bisa menyalin. Salin nomornya secara manual.");
    }
  }

  /** Mengunduh kode QR sebagai PNG. */
  function downloadQr() {
    const svg = qrRef.current?.querySelector("svg");
    if (svg) downloadSvgAsPng(svg, `${method}-${order.code}.png`);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-8">
      <div>
        <h1 className="text-4xl font-medium md:text-5xl">Pembayaran</h1>
        <p className="mt-2 text-ink-soft">Pesanan {order.code} · dibuat {formatDateTimeWita(order.createdAt)}</p>
      </div>

      {loadError && !expired && <Alert tone="danger" title="Halaman pembayaran gagal dibuka">[!] Halaman pembayaran gagal dibuka. Coba lagi atau pilih metode lain.</Alert>}
      {notice === "gagal" && <Alert tone="danger" title="Pembayaran ditolak">[!] Pembayaran ditolak oleh penyedia. Coba metode lain.</Alert>}
      {notice === "kedaluwarsa" && <Alert tone="warning" title="Kode pembayaran kedaluwarsa">Kode sebelumnya sudah tidak berlaku. Kami membuatkan kode baru di bawah.</Alert>}

      {expired ? (
        <>
          <Alert tone="danger" title="Waktu pembayaran habis">[!] Waktu pembayaran habis. Ulangi pesanan; desainmu tetap tersimpan di editor.</Alert>
          <Button href="/editor" className="w-fit">Ulangi pesanan →</Button>
        </>
      ) : (
        <>
          <Alert tone="info" title="Menunggu pembayaran">
            Selesaikan sebelum {formatDateTimeWita(order.expiresAt)}. Status berubah otomatis setelah pembayaran diterima.
            {polling && <span role="status" className="mt-1 block font-semibold text-ink">Memeriksa pembayaran…</span>}
          </Alert>

          <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
            <div className="flex min-w-0 flex-col gap-6">
              {/* Hitung mundur */}
              <Card tone="butter">
                <p className="text-sm">Sisa waktu pembayaran</p>
                <p className="mt-1 text-6xl font-medium tracking-tight tabular-nums md:text-7xl" aria-live="off">{formatCountdown(expiresAt - now)}</p>
              </Card>

              {/* Metode pembayaran */}
              <Card>
                <h2 className="mb-4 text-2xl font-medium">Metode pembayaran</h2>
                <div className="flex flex-col gap-3" role="radiogroup" aria-label="Metode pembayaran">
                  {METHODS.map((item) => (
                    <ChoiceCard
                      key={item.id}
                      name="metode"
                      value={item.id}
                      checked={method === item.id}
                      onChange={() => void selectMethod(item.id)}
                      title={item.title}
                      text={item.text}
                      right={item.right}
                    />
                  ))}
                </div>
              </Card>

              {/* Kode pembayaran: QR (QRIS), nomor (VA), atau pilihan aplikasi (e-wallet) */}
              <Card>
                <h2 className="mb-5 text-2xl font-medium">Bayar dengan {methodInfo.title}</h2>
                {switching || !ticket ? (
                  <p className="text-sm text-ink-muted" role="status">{loadError ? "Kode pembayaran belum tersedia." : "Membuat kode pembayaran…"}</p>
                ) : (
                  <div className="flex flex-col gap-6 sm:flex-row">
                    {/* QRIS: kode QR yang dipindai */}
                    {method === "qris" && (
                      <div ref={qrRef}>{qrValue ? <QrFrame value={qrValue} /> : <div className="h-[192px] w-[192px] rounded-card border-2 border-ink bg-white" />}</div>
                    )}
                    {/* Virtual Account: nomor yang disalin / diketik di aplikasi bank */}
                    {method === "va" && (
                      <div className="flex w-full max-w-xs shrink-0 flex-col justify-center gap-2 rounded-card border-2 border-ink bg-white p-4 sm:w-auto">
                        <p className="text-xs text-ink-muted">Nomor Virtual Account</p>
                        <p className="text-xl font-semibold tracking-wide tabular-nums">{groupDigits(ticket.instruction)}</p>
                        <Button variant="secondary" size="sm" onClick={copyInstruction} className="w-fit">{copied ? "Tersalin ✓" : "Salin nomor"}</Button>
                      </div>
                    )}
                    {/* E-wallet: memilih aplikasi (tanpa QR), lalu diarahkan ke aplikasinya */}
                    {method === "ewallet" && (
                      <div className="grid w-full shrink-0 grid-cols-2 gap-3 self-start sm:w-64" role="radiogroup" aria-label="Pilih e-wallet">
                        {WALLETS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            role="radio"
                            aria-checked={wallet === item}
                            onClick={() => setWallet(item)}
                            className={cn(
                              "rounded-control border-2 px-3 py-2.5 text-sm font-semibold transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                              wallet === item ? "border-accent bg-accent-subtle shadow-hard-accent-sm" : "border-ink bg-surface shadow-hard-sm",
                            )}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-3">
                      <ol className="flex flex-col gap-2 text-sm">
                        {stepsFor(method, ticket.amount).map((step, index) => (
                          <li key={step}>{index + 1}. {step}</li>
                        ))}
                      </ol>
                      <div className="flex flex-wrap gap-3 pt-1">
                        {method === "qris" && <Button variant="secondary" size="sm" onClick={downloadQr}>Unduh kode QR</Button>}
                        {method === "ewallet" ? (
                          <Button href={gatewayHref} size="md">Bayar dengan {wallet} →</Button>
                        ) : (
                          <Button href={gatewayHref} variant="secondary" size="sm">Buka simulator gateway (demo)</Button>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted">
                        {method === "qris" && "Demo: memindai QR dengan ponsel membuka halaman bayar tiruan. Tombol simulator melakukan hal yang sama di perangkat ini."}
                        {method === "va" && "Demo: tombol simulator meniru transfer ke nomor Virtual Account di atas."}
                        {method === "ewallet" && "Demo: tombol bayar membuka halaman simulator sebagai pengganti aplikasi e-wallet."}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Ringkasan */}
            <Card className="flex flex-col gap-4 lg:sticky lg:top-24">
              <h2 className="text-xl font-medium">Ringkasan</h2>
              <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 text-sm">
                <dt className="text-ink-muted">Nomor pesanan</dt>
                <dd className="text-right">{order.code}</dd>
                <dt className="text-ink-muted">Produk</dt>
                <dd className="text-right">{order.item.product} {order.item.categoryName} × {order.item.totalPcs}</dd>
                <dt className="text-ink-muted">Skema</dt>
                <dd className="text-right">{schemeLabel}</dd>
              </dl>
              <div className="flex items-end justify-between gap-4 border-t-2 border-ink pt-4">
                <span className="text-sm font-semibold">Total dibayar</span>
                <span className="text-3xl font-medium text-accent">{formatRupiah(ticket?.amount ?? amountDue)}</span>
              </div>
              <Button variant="dark" size="lg" onClick={handlePaid} disabled={busy || !ticket} className="w-full">
                {busy ? "Memeriksa…" : "Saya sudah bayar →"}
              </Button>
              {message && <p role="status" className="text-xs font-semibold text-danger">{message}</p>}
              <p className="text-xs text-ink-muted">Bukti bayar tidak perlu dikirim. Status diperbarui otomatis oleh sistem pembayaran.</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
