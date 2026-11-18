/**
 * File ini untuk apa:
 * Merapikan nomor WhatsApp ke bentuk standar 628xxxx (PRD §10.4).
 */

/**
 * Menerima "0812 5555 0199", "+62 812-5555-0199", atau "6281255550199".
 * Mengembalikan "6281255550199", atau null jika bukan nomor valid (10-14 digit).
 */
export function normalizeWhatsapp(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  let normalized: string;

  if (/^08\d+$/.test(digits)) normalized = "62" + digits.slice(1);
  else if (/^\+628\d+$/.test(digits)) normalized = digits.slice(1);
  else if (/^628\d+$/.test(digits)) normalized = digits;
  else return null;

  // Panjang diukur dalam bentuk lokal (diawali 0): "62" diganti "0", jadi +(-2 + 1)
  const localLength = normalized.length - 1;
  return localLength >= 10 && localLength <= 14 ? normalized : null;
}
