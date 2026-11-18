/**
 * Layout utama: dibungkus semua halaman. Memuat font Poppins dan
 * menyetel judul/deskripsi situs untuk SEO.
 */
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MULAWARMANESIA | Seragam PDH & VEST Custom Samarinda",
  description:
    "Desain PDH dan VEST organisasimu sendiri di browser, bayar online, lalu lacak produksinya. Workshop konveksi di Samarinda, Kalimantan Timur.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
