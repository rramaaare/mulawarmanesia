"use client";
/**
 * ClearDraft: komponen tanpa tampilan. Saat pembayaran sudah berhasil, draf desain
 * di browser dihapus supaya pesanan berikutnya mulai dari template kosong.
 */
import { useEffect } from "react";

export function ClearDraft() {
  useEffect(() => {
    try {
      localStorage.removeItem("mlw_draft_v1");
    } catch {
      /* penyimpanan diblokir: abaikan */
    }
  }, []);
  return null;
}
