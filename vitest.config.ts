// Konfigurasi Vitest: alias "@/" sama dengan di tsconfig agar import tes sama dengan kode utama.
// File tes dijalankan BERURUTAN (bukan paralel) karena tes integrasi memakai satu database yang sama.
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: { include: ["tests/**/*.test.ts"], fileParallelism: false },
});
