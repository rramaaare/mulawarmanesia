/**
 * Halaman Login Admin ("/admin/login"). Jika sudah login, langsung ke dashboard.
 */
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/features/admin/LoginForm";
import { currentAdminEmail } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await currentAdminEmail()) redirect("/admin");
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <Logo />
      <LoginForm />
    </main>
  );
}
