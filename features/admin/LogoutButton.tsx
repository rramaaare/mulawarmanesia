"use client";
/**
 * LogoutButton: tombol keluar admin. Menampilkan dialog konfirmasi dulu; bila dikonfirmasi, menghapus
 * cookie sesi lewat API lalu kembali ke halaman login. `compact` = hanya ikon (sidebar diperkecil).
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/lib/toast";
import { OverviewIcon } from "./overview/icons";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  /** Keluar dari akun: hapus sesi di server, tampilkan toast, lalu ke halaman login. */
  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      toast.success("Kamu sudah keluar.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" aria-label="Keluar" title="Keluar" onClick={() => setOpen(true)}>
        {compact ? <OverviewIcon name="logout" className="h-4 w-4" /> : "Keluar"}
      </Button>
      <Modal open={open} title="Keluar dari akun?" onClose={() => !busy && setOpen(false)}>
        <p className="text-sm text-ink-soft">Kamu perlu masuk lagi untuk membuka panel admin.</p>
        <div className="mt-5 modal-actions flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>Batal</Button>
          <Button onClick={logout} disabled={busy}>{busy ? "Keluar…" : "Ya, keluar"}</Button>
        </div>
      </Modal>
    </>
  );
}
