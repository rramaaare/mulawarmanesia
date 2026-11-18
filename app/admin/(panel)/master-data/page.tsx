/**
 * Halaman Master data ("/admin/master-data"): khusus superadmin.
 * Mengubah harga dasar, tambahan bahan, biaya dekorasi, ongkir, dan palet warna & stok.
 * Perubahan langsung berlaku di editor, landing, dan checkout karena semuanya membaca data yang sama.
 */
import { MasterDataEditor } from "@/features/admin/MasterDataEditor";
import { requireSuperadminPage } from "@/server/auth/session";
import { getMasterData } from "@/server/services/master-data-service";

export const dynamic = "force-dynamic";

export default async function MasterDataPage() {
  await requireSuperadminPage();
  const data = await getMasterData();
  return <MasterDataEditor data={data} />;
}
