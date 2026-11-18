/**
 * Halaman Pesanan ("/pesanan"): form ukuran, data pemesan, pengiriman, dan pembayaran.
 * Server component hanya mengambil data master; seluruh interaksi ada di OrderForm.
 */
import { CheckoutHeader } from "@/components/ui/CheckoutHeader";
import { OrderForm } from "@/features/order/OrderForm";
import { getCatalog } from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const catalog = await getCatalog();
  return (
    <>
      <CheckoutHeader step={2} />
      <main className="flex-1">
        <OrderForm catalog={catalog} />
      </main>
    </>
  );
}
