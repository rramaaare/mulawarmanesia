/**
 * Halaman Editor ("/editor"): server component yang membaca data master dari database
 * lalu menyerahkannya ke EditorApp (komponen client yang interaktif).
 * Parameter ?kategori=ID dari kartu katalog menentukan kategori awal.
 */
import { EditorApp } from "@/features/editor/EditorApp";
import { CheckoutHeader } from "@/components/ui/CheckoutHeader";
import { getCatalog } from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const catalog = await getCatalog();
  const initialCategoryId = kategori && /^\d+$/.test(kategori) ? Number(kategori) : undefined;
  return (
    <>
      {/* Editor = langkah 1/4 (setelah ini langsung ke Pesanan = 2/4), di mobile maupun desktop */}
      <CheckoutHeader step={1} />
      <main className="flex-1">
        <EditorApp catalog={catalog} initialCategoryId={initialCategoryId} />
      </main>
    </>
  );
}
