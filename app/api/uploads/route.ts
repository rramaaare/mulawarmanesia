/**
 * Route API: POST /api/uploads
 * Menerima satu file logo (multipart/form-data, field "file") dan menyimpannya.
 */
import { handle } from "@/server/api-helpers";
import { AppError } from "@/server/errors";
import { saveUpload } from "@/server/services/upload-service";

export async function POST(request: Request) {
  return handle(async () => {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError("[!] Pilih file logo terlebih dahulu", 400);
    return saveUpload(file);
  });
}
