"use client";
/**
 * TrackingForm: form Lacak Pesanan (nomor pesanan + nomor WhatsApp).
 * Pesan error SAMA untuk "tidak ada" dan "WA salah" agar nomor tidak bisa ditebak.
 * Berhasil -> pindah ke halaman status dengan token rahasia.
 */
import { toast } from "@/lib/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/Field";
import { trackingSchema } from "@/lib/validation/tracking-admin";

export function TrackingForm() {
  const router = useRouter();
  const [values, setValues] = useState({ code: "", whatsapp: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  /** Validasi di browser, lalu tanya server. */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(undefined);
    const parsed = trackingSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const response = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then((r) => r.json());
    setLoading(false);
    if (!response.ok) {
      setMessage(response.message);
      toast.error(response.message ?? "Pesanan tidak ditemukan.");
      return;
    }
    router.push(`/status/${response.data.code}?token=${response.data.token}`);
  }

  return (
    <Card className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Lacak pesanan</p>
      <h1 className="text-[28px] font-medium leading-tight md:text-4xl">Sampai mana seragammu?</h1>
      <p className="text-base text-ink-soft md:text-sm">Masukkan nomor pesanan dan nomor WhatsApp yang kamu pakai saat checkout.</p>
      {message && <Alert tone="danger">{message}</Alert>}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Nomor pesanan" required error={errors.code} hint="Contoh: MLW-2611-0042">
          {(props) => <TextInput {...props} error={errors.code} value={values.code} placeholder="MLW-2611-0042" onChange={(event) => setValues({ ...values, code: event.target.value })} />}
        </Field>
        <Field label="Nomor WhatsApp" required error={errors.whatsapp} hint="Contoh: 0812 5555 0199">
          {(props) => <TextInput {...props} error={errors.whatsapp} inputMode="tel" value={values.whatsapp} onChange={(event) => setValues({ ...values, whatsapp: event.target.value })} />}
        </Field>
        <Button type="submit" size="lg" disabled={loading}>{loading ? "Mencari…" : "Lacak →"}</Button>
      </form>
    </Card>
  );
}
