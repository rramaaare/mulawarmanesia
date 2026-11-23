/**
 * File ini untuk apa:
 * Mengubah pratinjau desain pesanan (gambar baju tampak depan & belakang di halaman admin) menjadi
 * satu file PNG resolusi tinggi untuk tim produksi. Polanya sama dengan features/payment/qr-download.ts:
 * SVG -> teks -> dimuat sebagai gambar -> digambar ke kanvas -> disimpan sebagai PNG.
 * Bedanya, gambar di dalam SVG (logo unggahan & motif kain) harus ditanam dulu sebagai data URI,
 * karena SVG yang dimuat sebagai gambar tidak boleh mengambil file dari luar.
 */

/** Ukuran kanvas hasil (piksel). Tiap sisi baju digambar 1100 x 1247 (rasio kanvas Garment 300 x 340). */
const SIDE_WIDTH = 1100;
const SIDE_HEIGHT = Math.round((SIDE_WIDTH * 340) / 300);
const MARGIN = 70;
const HEADER = 150;
const CAPTION = 80;
const CANVAS_WIDTH = MARGIN * 3 + SIDE_WIDTH * 2;
const CANVAS_HEIGHT = HEADER + SIDE_HEIGHT + CAPTION + MARGIN;

/** Mengambil file (logo/motif) lalu mengubahnya menjadi data URI; dicache per alamat. */
async function toDataUri(url: string, cache: Map<string, Promise<string>>): Promise<string> {
  if (url.startsWith("data:")) return url;
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`Gagal mengambil ${url}`);
          return response.blob();
        })
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(blob);
            }),
        ),
    );
  }
  return cache.get(url) as Promise<string>;
}

/** Menunggu sampai gambar mockup di dalam SVG selesai dimuat (Garment mengambilnya terpisah). */
async function waitForMockup(svg: SVGSVGElement): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const inner = svg.querySelector(":scope > svg");
    if (inner && inner.innerHTML.length > 100) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Gambar baju belum selesai dimuat. Coba lagi sebentar lagi.");
}

/**
 * Menyalin SVG Garment siap digambar: gambar luar ditanam sebagai data URI, elemen khusus editor
 * (kotak pilihan, label) tidak ada di halaman admin, dan ukurannya ditetapkan.
 */
async function prepareSvg(svg: SVGSVGElement, cache: Map<string, Promise<string>>): Promise<string> {
  await waitForMockup(svg);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(SIDE_WIDTH));
  clone.setAttribute("height", String(SIDE_HEIGHT));
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  const images = Array.from(clone.querySelectorAll("image"));
  await Promise.all(
    images.map(async (image) => {
      const href = image.getAttribute("href") ?? image.getAttribute("xlink:href");
      if (!href) return;
      const absolute = new URL(href, window.location.origin).toString();
      image.setAttribute("href", await toDataUri(absolute, cache));
      image.removeAttribute("xlink:href");
    }),
  );
  return new XMLSerializer().serializeToString(clone);
}

/** Memuat teks SVG menjadi elemen gambar. */
function loadSvgImage(xml: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar desain gagal disiapkan"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  });
}

/** Data judul yang ditulis di bagian atas gambar. */
export interface DesignExportInfo {
  code: string;
  title: string; // mis. "PDH Model 03 · American Drill · 24 pcs"
}

/**
 * Membuat PNG berisi tampak depan & belakang desain pesanan `info.code` lalu mengunduhnya
 * sebagai `<kode>-desain.png`. Melempar Error berisi pesan yang bisa ditampilkan ke admin.
 */
export async function downloadOrderDesign(info: DesignExportInfo): Promise<void> {
  const root = document.querySelector(`[data-design-preview="${CSS.escape(info.code)}"]`);
  const front = root?.querySelector<SVGSVGElement>('[data-design-side="front"] svg[viewBox="0 0 300 340"]');
  const back = root?.querySelector<SVGSVGElement>('[data-design-side="back"] svg[viewBox="0 0 300 340"]');
  if (!front || !back) throw new Error("Pratinjau desain tidak ditemukan di halaman ini.");

  const cache = new Map<string, Promise<string>>();
  const [frontImage, backImage] = await Promise.all([
    prepareSvg(front, cache).then(loadSvgImage),
    prepareSvg(back, cache).then(loadSvgImage),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser tidak mendukung pembuatan gambar.");

  // Latar putih + judul
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = "#111111";
  context.font = "700 56px Poppins, Arial, sans-serif";
  context.fillText(info.code, MARGIN, 80);
  context.fillStyle = "#3B3B3B";
  context.font = "400 32px Poppins, Arial, sans-serif";
  context.fillText(info.title, MARGIN, 125);

  // Dua sisi berdampingan dengan bingkai tipis dan keterangan
  const sides: [HTMLImageElement, string][] = [[frontImage, "Depan"], [backImage, "Belakang"]];
  sides.forEach(([image, label], index) => {
    const x = MARGIN + index * (SIDE_WIDTH + MARGIN);
    context.fillStyle = "#F1EEEE";
    context.fillRect(x, HEADER, SIDE_WIDTH, SIDE_HEIGHT);
    context.drawImage(image, x, HEADER, SIDE_WIDTH, SIDE_HEIGHT);
    context.strokeStyle = "#DEDADA";
    context.lineWidth = 3;
    context.strokeRect(x, HEADER, SIDE_WIDTH, SIDE_HEIGHT);
    context.fillStyle = "#111111";
    context.font = "600 40px Poppins, Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(label, x + SIDE_WIDTH / 2, HEADER + SIDE_HEIGHT + 55);
    context.textAlign = "start";
  });

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Gambar desain gagal dibuat.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${info.code}-desain.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
