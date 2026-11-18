/**
 * File ini untuk apa:
 * Membuat SATU koneksi Prisma ke MySQL yang dipakai seluruh server.
 * Saat `next dev`, file bisa dimuat ulang berkali-kali; koneksi disimpan di
 * `globalThis` supaya tidak membuat koneksi baru setiap muat ulang.
 */
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

/** Membuat koneksi baru dari DATABASE_URL di file .env. */
function createPrismaClient(): PrismaClient {
  const url = new URL(process.env.DATABASE_URL ?? "");
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace("/", ""),
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Objek `db` inilah yang dipakai di semua service untuk membaca/menulis database. */
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
