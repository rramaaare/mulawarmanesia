/**
 * File ini untuk apa:
 * Login admin yang sederhana: setelah email + kata sandi benar, server memberi
 * cookie berisi email admin yang DITANDATANGANI (HMAC). Cookie tidak bisa dipalsukan
 * karena tanda tangannya butuh SESSION_SECRET yang hanya ada di server.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";

/** Nama cookie sesi admin. */
const COOKIE_NAME = "mlw_admin";
/** Sesi berlaku 8 jam. */
const SESSION_HOURS = 8;
/** Batas gagal login sebelum akun dikunci sementara (PRD §10.7). */
const MAX_LOGIN_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
/** Catatan kegagalan login per email, di memori server. */
const loginFailures = new Map<string, { count: number; lockedUntil: number }>();

/** Tanda tangan HMAC untuk sebuah teks. */
function sign(value: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "").update(value).digest("hex");
}

/** Membuat isi cookie: "email|kedaluwarsa|tanda-tangan". */
function createToken(email: string): string {
  const expires = Date.now() + SESSION_HOURS * 3_600_000;
  const body = `${email}|${expires}`;
  return `${body}|${sign(body)}`;
}

/** Membaca cookie; mengembalikan email jika sah dan belum kedaluwarsa, selain itu null. */
function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const [email, expires, signature] = token.split("|");
  if (!email || !expires || !signature) return null;
  const expected = Buffer.from(sign(`${email}|${expires}`));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  return Number(expires) > Date.now() ? email : null;
}

/**
 * Memeriksa email + kata sandi, lalu memasang cookie sesi.
 * Pesan gagal sengaja sama untuk "email salah" dan "sandi salah".
 */
export async function loginAdmin(email: string, password: string): Promise<void> {
  const state = loginFailures.get(email) ?? { count: 0, lockedUntil: 0 };
  if (state.lockedUntil > Date.now()) {
    throw new AppError("Akun dikunci 15 menit karena terlalu banyak percobaan gagal", 429);
  }

  const admin = await db.adminUser.findUnique({ where: { email } });
  // Akun nonaktif diperlakukan sama seperti akun yang tidak ada (pesan gagal sama)
  const valid = admin && admin.active ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!valid) {
    const count = state.count + 1;
    const locked = count >= MAX_LOGIN_FAILURES;
    loginFailures.set(email, { count: locked ? 0 : count, lockedUntil: locked ? Date.now() + LOCK_MS : 0 });
    const left = Math.max(MAX_LOGIN_FAILURES - count, 0);
    throw new AppError(`[!] Email atau kata sandi salah. Sisa ${left} percobaan`, 401);
  }

  loginFailures.delete(email);
  const jar = await cookies();
  jar.set(COOKIE_NAME, createToken(email), {
    httpOnly: true, // tidak bisa dibaca JavaScript di browser
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

/** Menghapus cookie sesi (logout). */
export async function logoutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/** Identitas admin yang sedang login (dibaca dari database, jadi peran/status selalu terbaru). */
export interface AdminIdentity {
  email: string;
  name: string;
  role: "ADMIN" | "SUPERADMIN";
}

/**
 * Mengembalikan admin yang sedang login, atau null.
 * Cookie hanya membuktikan SIAPA orangnya; peran dan status aktif dicek ke database setiap kali,
 * sehingga akun yang dinonaktifkan atau diturunkan perannya langsung berlaku.
 */
export async function currentAdmin(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const email = readToken(jar.get(COOKIE_NAME)?.value);
  if (!email) return null;
  const admin = await db.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.active) return null;
  return { email: admin.email, name: admin.name, role: admin.role };
}

/** Mengembalikan email admin yang sedang login, atau null (dipakai halaman login untuk mengalihkan). */
export async function currentAdminEmail(): Promise<string | null> {
  return (await currentAdmin())?.email ?? null;
}

/** Dipakai di halaman admin: jika belum login, arahkan ke halaman login. */
export async function requireAdminPage(): Promise<AdminIdentity> {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Dipakai di halaman khusus superadmin: admin biasa dikembalikan ke dashboard. */
export async function requireSuperadminPage(): Promise<AdminIdentity> {
  const admin = await requireAdminPage();
  if (admin.role !== "SUPERADMIN") redirect("/admin");
  return admin;
}

/** Dipakai di route API admin: jika belum login, lempar error 401. */
export async function requireAdminApi(): Promise<string> {
  const admin = await currentAdmin();
  if (!admin) throw new AppError("Silakan login sebagai admin", 401);
  return admin.email;
}

/** Dipakai di route API khusus superadmin: 401 bila belum login, 403 bila bukan superadmin. */
export async function requireSuperadminApi(): Promise<AdminIdentity> {
  const admin = await currentAdmin();
  if (!admin) throw new AppError("Silakan login sebagai admin", 401);
  if (admin.role !== "SUPERADMIN") throw new AppError("Hanya superadmin yang boleh melakukan ini", 403);
  return admin;
}
