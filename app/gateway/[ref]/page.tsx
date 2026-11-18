/**
 * Halaman Simulator Gateway ("/gateway/SIM-...?code=...&token=..."): meniru halaman bayar
 * milik payment gateway. Hanya untuk demo lomba.
 */
import { Navbar } from "@/components/ui/Navbar";
import { GatewaySimulator } from "@/features/payment/GatewaySimulator";

export default async function GatewayPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ code?: string; token?: string }>;
}) {
  const { ref } = await params;
  const { code = "", token = "" } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="flex-1 p-4 py-12">
        <GatewaySimulator gatewayRef={ref} orderCode={code} token={token} />
      </main>
    </>
  );
}
