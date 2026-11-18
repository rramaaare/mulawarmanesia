// Konfigurasi Prisma CLI: lokasi skema, folder migrasi, dan alamat database.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Perintah `npx prisma db seed` menjalankan file ini untuk mengisi data awal.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
