import type { NextConfig } from "next";

/**
 * Konfigurasi Next.js.
 * Catatan: fitur eksperimental `cacheComponents` sengaja DIMATIKAN agar halaman yang
 * membaca database (`export const dynamic = "force-dynamic"`) mudah dipahami.
 * Aturan "turbopack" menghubungkan Tailwind CSS ke proses build.
 */
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
