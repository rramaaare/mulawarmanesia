/**
 * Route API: GET /api/uploads/[fileName]
 * Menampilkan/mengunduh file logo yang sudah diunggah.
 * Nama file acak 128-bit sehingga tidak bisa ditebak.
 */
import { AppError } from "@/server/errors";
import { readUpload } from "@/server/services/upload-service";

export async function GET(_request: Request, context: { params: Promise<{ fileName: string }> }) {
  try {
    const { fileName } = await context.params;
    const { bytes, mime } = await readUpload(fileName);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime,
        // "sandbox" mencegah SVG menjalankan skrip bila dibuka langsung
        "Content-Security-Policy": "sandbox",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return new Response("File tidak ditemukan", { status });
  }
}
