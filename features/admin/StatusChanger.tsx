"use client";
/**
 * StatusChanger: kartu "Ubah status" di detail pesanan (desain "Detail pesanan").
 * Hanya menawarkan status yang BOLEH berikutnya (lib/domain/order-status.ts).
 *  - Saat "Cek desain": dua tombol langsung, "Setujui & mulai produksi" (minta konfirmasi karena
 *    desain dikunci) dan "Minta revisi" (wajib alasan 10-300 karakter yang dikirim ke pelanggan).
 *  - Tahap lain: pilih status berikutnya + catatan, lalu simpan. "Dikirim" wajib kurir + nomor resi.
 * Server tetap memeriksa ulang semua aturan.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { allowedNextStatuses, STATUS_LABEL, type StatusName } from "@/lib/domain/order-status";
import { callAdminApi } from "./admin-api";

export function StatusChanger({ code, current }: { code: string; current: StatusName }) {
  const router = useRouter();
  const options = allowedNextStatuses(current);
  const isDesignCheck = current === "cek_desain";
  const [target, setTarget] = useState<StatusName | "">("");
  const [note, setNote] = useState("");
  const [courier, setCourier] = useState("");
  const [resi, setResi] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Mengirim perubahan status ke server lalu memuat ulang data halaman. */
  async function submit(status: StatusName) {
    setSaving(true);
    setErrors({});
    setMessage(undefined);
    const result = await callAdminApi(`/api/admin/orders/${code}/status`, "PATCH", {
      status,
      note: note || undefined,
      courier: courier || undefined,
      resi: resi || undefined,
    }, `Status diubah menjadi ${STATUS_LABEL[status]}.`);
    setSaving(false);
    setConfirming(false);
    if (!result.ok) {
      setErrors(result.fields ?? {});
      if (!result.fields) setMessage(result.message);
      return;
    }
    setTarget("");
    setNote("");
    router.refresh();
  }

  if (options.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-medium">Ubah status</h2>
        <p className="mt-2 text-sm text-ink-muted">Status {STATUS_LABEL[current].toLowerCase()} tidak bisa diubah lagi.</p>
      </Card>
    );
  }

  const needsReason = target === "perlu_revisi";
  return (
    <Card className="flex flex-col gap-4 !p-5">
      <div>
        <h2 className="text-xl font-medium">Ubah status</h2>
        <p className="mt-1 text-xs text-ink-muted">Status hanya bisa maju. Cek desain dan Perlu revisi boleh bolak-balik.</p>
      </div>
      {message && <Alert tone="danger">{message}</Alert>}

      {/* Tahap selain "Cek desain": pilih status berikutnya */}
      {!isDesignCheck && (
        <Field label="Status pesanan" required hint="Perubahan dicatat dengan waktu WITA.">
          {(props) => (
            <SelectInput {...props} value={target} onChange={(event) => { setTarget(event.target.value as StatusName); setErrors({}); }}>
              <option value="">Pilih status berikutnya</option>
              {options.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
            </SelectInput>
          )}
        </Field>
      )}

      {/* Kurir + resi saat dikirim */}
      {target === "dikirim" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kurir" required error={errors.courier}>
            {(props) => <TextInput {...props} error={errors.courier} value={courier} placeholder="JNE / J&T / SiCepat" onChange={(event) => setCourier(event.target.value)} />}
          </Field>
          <Field label="Nomor resi" required error={errors.resi}>
            {(props) => <TextInput {...props} error={errors.resi} value={resi} onChange={(event) => setResi(event.target.value)} />}
          </Field>
        </div>
      )}

      <Field
        label={needsReason ? "Alasan revisi (dikirim ke pelanggan)" : "Catatan internal"}
        error={errors.note}
        hint={needsReason ? `${note.length}/300 karakter` : `Hanya terlihat admin. ${note.length}/300`}
      >
        {(props) => <TextArea {...props} error={errors.note} value={note} maxLength={300} onChange={(event) => setNote(event.target.value)} />}
      </Field>

      {isDesignCheck ? (
        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" onClick={() => setConfirming(true)} disabled={saving}>Setujui &amp; mulai produksi →</Button>
          <Button variant="secondary" size="lg" onClick={() => void submit("perlu_revisi")} disabled={saving}>Minta revisi</Button>
        </div>
      ) : (
        <Button
          size="lg"
          disabled={saving || target === ""}
          onClick={() => (target === "produksi" ? setConfirming(true) : target && void submit(target))}
        >
          {saving ? "Menyimpan…" : "Simpan status"}
        </Button>
      )}

      <Modal open={confirming} title="Mulai produksi?" onClose={() => setConfirming(false)}>
        <p className="mb-5 text-sm text-ink-soft">Setelah status menjadi Produksi, desain dikunci dan tidak bisa direvisi.</p>
        <div className="modal-actions flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirming(false)}>Batal</Button>
          <Button onClick={() => void submit("produksi")}>Ya, mulai produksi</Button>
        </div>
      </Modal>
    </Card>
  );
}
