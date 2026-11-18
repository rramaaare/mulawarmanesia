/**
 * File ini untuk apa:
 * Jenis error khusus aplikasi. Service melempar AppError, lalu route API
 * mengubahnya menjadi jawaban HTTP yang rapi (status + pesan Indonesia).
 */

/** Error yang aman ditampilkan ke pengguna (pesannya sudah berbahasa Indonesia). */
export class AppError extends Error {
  /** Kode HTTP, mis. 400 = input salah, 404 = tidak ada, 409 = bentrok. */
  readonly status: number;
  /** Error per field untuk form, mis. { "customer.email": "[!] ..." }. */
  readonly fields?: Record<string, string>;

  constructor(message: string, status = 400, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
