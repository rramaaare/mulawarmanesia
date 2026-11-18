/**
 * Route API: POST /api/admin/login   (body { email, password })
 * Route API: DELETE /api/admin/login (logout)
 */
import { handle } from "@/server/api-helpers";
import { loginAdmin, logoutAdmin } from "@/server/auth/session";
import { loginSchema } from "@/lib/validation/tracking-admin";

export async function POST(request: Request) {
  return handle(async () => {
    const { email, password } = loginSchema.parse(await request.json());
    await loginAdmin(email, password);
    return { loggedIn: true };
  });
}

export async function DELETE() {
  return handle(async () => {
    await logoutAdmin();
    return { loggedIn: false };
  });
}
