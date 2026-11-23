"use client";
/**
 * DesignDownloadButton: tombol "Unduh desain (PNG)" di detail pesanan admin. Menggambar ulang
 * pratinjau desain (depan & belakang, lengkap dengan warna, motif, logo, dan teks) menjadi satu PNG.
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";
import { downloadOrderDesign } from "./design-export";

export function DesignDownloadButton({ code, title }: { code: string; title: string }) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await downloadOrderDesign({ code, title });
      toast.success(`Desain ${code} diunduh.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Desain gagal diunduh. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" onClick={() => void handleClick()} disabled={busy}>
      {busy ? "Menyiapkan…" : "Unduh desain (PNG)"}
    </Button>
  );
}
