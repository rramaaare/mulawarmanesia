"use client";
/**
 * SettingsForm: dua baris pengaturan (kapasitas produksi dan batas waktu bayar) untuk superadmin.
 * Ini komponen client karena fungsi `buildBody` tidak boleh dikirim dari komponen server;
 * halaman server cukup mengirim angka awalnya.
 */
import { NumberRow } from "./NumberRow";

const URL = "/api/admin/pengaturan";

interface SettingsFormProps {
  weeklyCapacity: number;
  paymentDeadlineHours: number;
}

export function SettingsForm({ weeklyCapacity, paymentDeadlineHours }: SettingsFormProps) {
  return (
    <>
      <NumberRow
        label="Kapasitas produksi per minggu"
        hint="Dipakai meter kapasitas di dashboard."
        initial={weeklyCapacity}
        unit="plain"
        suffix="pcs"
        url={URL}
        buildBody={(value) => ({ weeklyCapacity: value, paymentDeadlineHours })}
      />
      <NumberRow
        label="Batas waktu bayar"
        hint="Pesanan yang belum dibayar menjadi kedaluwarsa setelah waktu ini."
        initial={paymentDeadlineHours}
        unit="plain"
        suffix="jam"
        url={URL}
        buildBody={(value) => ({ weeklyCapacity, paymentDeadlineHours: value })}
      />
    </>
  );
}
