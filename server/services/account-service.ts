/**
 * File ini untuk apa:
 * Mengelola akun admin (khusus superadmin): daftar, tambah, aktif/nonaktif, dan reset kata sandi.
 * Aturan pengaman: superadmin tidak boleh menonaktifkan dirinya sendiri, dan harus selalu ada
 * minimal satu superadmin aktif (jika tidak, tidak ada lagi yang bisa mengelola akun).
 */
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { createAdminSchema, updateAdminSchema } from "@/lib/validation/master-data";
import { writeAudit } from "./audit-service";

/** Satu baris daftar akun (tanpa kata sandi). */
export interface AdminAccount {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "SUPERADMIN";
  active: boolean;
  createdAt: string;
}

/** Daftar semua akun admin. */
export async function listAdmins(): Promise<AdminAccount[]> {
  const rows = await db.adminUser.findMany({ orderBy: { id: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
  }));
}

/** Membuat akun admin baru. Email harus belum dipakai. */
export async function createAdmin(actorEmail: string, rawInput: unknown): Promise<void> {
  const input = createAdminSchema.parse(rawInput);
  const passwordHash = await bcrypt.hash(input.password, 10);

  await db.$transaction(async (tx) => {
    const exists = await tx.adminUser.findUnique({ where: { email: input.email } });
    if (exists) throw new AppError("[!] Email ini sudah terdaftar", 409, { email: "[!] Email ini sudah terdaftar" });
    await tx.adminUser.create({ data: { email: input.email, name: input.name, passwordHash, role: input.role } });
    await writeAudit(tx, actorEmail, "akun_dibuat", input.email, `peran ${input.role}`);
  });
}

/** Mengubah status aktif atau kata sandi akun `id`. */
export async function updateAdmin(actorEmail: string, id: number, rawInput: unknown): Promise<void> {
  const input = updateAdminSchema.parse(rawInput);

  await db.$transaction(async (tx) => {
    // Kunci baris akun agar dua superadmin tidak saling menimpa
    await tx.$queryRaw`SELECT id FROM AdminUser WHERE id = ${id} FOR UPDATE`;
    const target = await tx.adminUser.findUnique({ where: { id } });
    if (!target) throw new AppError("Akun tidak ditemukan", 404);

    if ("password" in input) {
      await tx.adminUser.update({ where: { id }, data: { passwordHash: await bcrypt.hash(input.password, 10) } });
      await writeAudit(tx, actorEmail, "kata_sandi_direset", target.email);
      return;
    }

    if (!input.active) {
      if (target.email === actorEmail) throw new AppError("[!] Kamu tidak bisa menonaktifkan akunmu sendiri", 409);
      if (target.role === "SUPERADMIN") {
        const activeSupers = await tx.adminUser.count({ where: { role: "SUPERADMIN", active: true } });
        if (activeSupers <= 1) throw new AppError("[!] Harus ada minimal satu superadmin aktif", 409);
      }
    }
    await tx.adminUser.update({ where: { id }, data: { active: input.active } });
    await writeAudit(tx, actorEmail, input.active ? "akun_diaktifkan" : "akun_dinonaktifkan", target.email);
  });
}
