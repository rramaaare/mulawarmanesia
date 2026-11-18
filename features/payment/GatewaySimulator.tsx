"use client";
/**
 * GatewaySimulator: halaman "gateway palsu" untuk demo. Tombolnya meminta server
 * mengirim webhook ber-tanda-tangan (sukses / gagal / kedaluwarsa) lewat jalur yang
 * sama dengan webhook payment gateway sungguhan.
 */
import { toast } from "@/lib/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Result = "sukses" | "gagal" | "kedaluwarsa";

interface GatewaySimulatorProps {
  gatewayRef: string;
  orderCode: string;
  token: string;
}

export function GatewaySimulator({ gatewayRef, orderCode, token }: GatewaySimulatorProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  /** Mengirim hasil pembayaran ke server, lalu kembali ke halaman yang sesuai. */
  async function send(status: Result) {
    setBusy(true);
    setError(undefined);
    const response = await fetch("/api/payments/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gatewayRef, status }),
    }).then((r) => r.json());
    setBusy(false);
    if (!response.ok) {
      setError(response.message);
      toast.error(response.message ?? "Gagal memproses pembayaran.");
      return;
    }
    if (status === "sukses") toast.success("Pembayaran berhasil.");
    else toast.error(status === "gagal" ? "Pembayaran ditolak." : "Tagihan dikedaluwarsakan.");
    router.push(status === "sukses" ? `/pesanan-berhasil/${orderCode}?token=${token}` : `/pembayaran/${orderCode}?token=${token}&hasil=${status}`);
  }

  return (
    <Card className="mx-auto flex max-w-md flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Simulator payment gateway</p>
      <h1 className="text-2xl font-semibold">Selesaikan pembayaran</h1>
      <p className="text-sm text-ink-soft">Ini halaman tiruan untuk demo. Referensi: <span className="font-mono">{gatewayRef}</span></p>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button size="lg" onClick={() => send("sukses")} disabled={busy}>Bayar sukses</Button>
      <Button variant="secondary" onClick={() => send("gagal")} disabled={busy}>Tolak pembayaran</Button>
      <Button variant="secondary" onClick={() => send("kedaluwarsa")} disabled={busy}>Kedaluwarsakan</Button>
    </Card>
  );
}
