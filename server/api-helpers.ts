/**
 * File ini untuk apa:
 * Pembantu untuk route API: membungkus handler agar error apa pun menjadi
 * jawaban JSON yang konsisten, dan mengubah error Zod menjadi error per field.
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

/** Mengubah ZodError menjadi { "path.field": "pesan" } (pesan pertama tiap field). */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

/**
 * Menjalankan `handler` dan menangkap error-nya.
 * - ZodError   -> 400 + daftar error per field
 * - AppError   -> status dan pesan dari service
 * - lainnya    -> 500 (detail hanya dicatat di server, tidak dikirim ke pengguna)
 */
export async function handle(handler: () => Promise<unknown>): Promise<NextResponse> {
  try {
    const data = await handler();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, message: "Ada isian yang perlu diperbaiki", fields: zodFieldErrors(error) },
        { status: 400 },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { ok: false, message: error.message, fields: error.fields },
        { status: error.status },
      );
    }
    console.error(error);
    return NextResponse.json({ ok: false, message: "Terjadi kesalahan di server. Coba lagi." }, { status: 500 });
  }
}
