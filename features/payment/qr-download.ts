/**
 * File ini untuk apa:
 * Mengubah kode QR (elemen SVG di halaman) menjadi gambar PNG lalu mengunduhnya.
 * Caranya: SVG diubah menjadi teks -> dimuat sebagai gambar -> digambar ke kanvas
 * berlatar putih -> kanvas disimpan sebagai file PNG.
 */

/** Mengunduh `svg` sebagai file PNG bernama `fileName` dengan sisi `size` piksel. */
export function downloadSvgAsPng(svg: SVGSVGElement, fileName: string, size = 720): void {
  const xml = new XMLSerializer().serializeToString(svg);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#FFFFFF"; // latar putih supaya QR terbaca di aplikasi pemindai
    context.fillRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
}
