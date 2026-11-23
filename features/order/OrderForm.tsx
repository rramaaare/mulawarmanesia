"use client";
/**
 * OrderForm: halaman Pesanan (satu halaman, tanpa login).
 * Kolom kiri berisi empat blok: 1 Ukuran & jumlah, 2 Data pemesan, 3 Pengiriman, 4 Pembayaran.
 * Kolom kanan: ringkasan desain + harga (menempel saat di-scroll).
 *
 * Alur: baca draf desain dari browser -> pelanggan mengisi form -> saat "Bayar sekarang":
 *   1) validasi dengan skema Zod yang SAMA dengan server
 *   2) unggah file logo ke server
 *   3) kirim pesanan -> pindah ke halaman Pembayaran
 */
import { StickyBar } from "@/components/ui/StickyBar";
import { toast } from "@/lib/toast";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { cn } from "@/lib/cn";
import { MIN_ORDER_PCS, SIZES, type Size } from "@/lib/domain/constants";
import { calculatePrice, countPieces, type SizeQuantities } from "@/lib/domain/pricing";
import { formatRupiah } from "@/lib/format";
import { checkoutSchema } from "@/lib/validation/order";
import { colorsToHex, syncModelWithCategory, toGarmentOverlays } from "@/features/editor/design-helpers";
import { loadDraft, loadFile, restorePreviews } from "@/features/editor/draft-storage";
import { POSITIONS } from "@/features/editor/garment-data";
import type { DesignState } from "@/features/editor/types";
import type { Catalog } from "@/server/services/catalog-service";
import { OrderSummary } from "./OrderSummary";
import { SizeGuideModal } from "./SizeGuideModal";

type ErrorMap = Record<string, string>;

/** Judul blok bernomor ("1 Ukuran & jumlah"). */
function BlockTitle({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-2.5 text-xl font-semibold md:text-lg md:font-medium">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-accent text-sm text-white md:h-7 md:w-7 md:text-xs">{number}</span>
      {title}
    </h2>
  );
}

export function OrderForm({ catalog }: { catalog: Catalog }) {
  const router = useRouter();
  const [design, setDesign] = useState<DesignState | null>(null);
  const [loaded, setLoaded] = useState(false);

  // ---- isian form ----
  const [quantities, setQuantities] = useState<SizeQuantities>({});
  const [materialId, setMaterialId] = useState(0);
  const [namePerPerson, setNamePerPerson] = useState(false);
  const [personNames, setPersonNames] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [customer, setCustomer] = useState({ name: "", whatsapp: "", email: "", organization: "" });
  const [shipping, setShipping] = useState({ method: "" as "" | "KIRIM" | "AMBIL", address: "", city: "", postalCode: "" });
  const [paymentScheme, setPaymentScheme] = useState<"" | "LUNAS" | "DP50">("");
  const [agreed, setAgreed] = useState(false);

  // ---- status halaman ----
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<ErrorMap>({});
  const [serverMessage, setServerMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Baca draf desain dari browser saat halaman dibuka
  useEffect(() => {
    (async () => {
      const draft = loadDraft();
      if (draft) {
        const restored = syncModelWithCategory(await restorePreviews(draft), catalog);
        setDesign(restored);
        setMaterialId(restored.materialId);
      }
      setLoaded(true);
    })();
  }, [catalog]); // catalog dari server tidak berubah selama halaman terbuka, jadi efek ini tetap berjalan sekali

  /** Daftar ukuran satu per satu (S,S,M,M,...) untuk baris "nama per orang". */
  const sizeSequence = useMemo(
    () => SIZES.flatMap((size) => Array.from({ length: quantities[size] ?? 0 }, () => size as Size)),
    [quantities],
  );
  const totalPcs = countPieces(quantities);

  const category = catalog.categories.find((item) => item.id === design?.categoryId);
  const material = catalog.materials.find((item) => item.id === materialId);
  const city = catalog.cities.find((item) => item.name === shipping.city);
  const shippingFee = shipping.method === "KIRIM" ? (city?.fee ?? 0) : 0;

  /** Harga estimasi di browser (server menghitung ulang yang resmi). */
  const price = calculatePrice({
    basePrice: category?.basePrice ?? 0,
    materialSurcharge: material?.surcharge ?? 0,
    decorationTechniques: design?.images.map((image) => image.technique) ?? [],
    namePerPerson,
    quantities,
    shippingFee,
    fees: catalog.fees,
  });
  const payNowAmount = paymentScheme === "DP50" ? price.downPayment : price.total;

  /** Menyusun data yang dikirim ke server. `fileNames` berisi nama file hasil unggah (atau penanda sementara). */
  function buildInput(fileNames: string[]) {
    return {
      design: {
        product: design?.product ?? "PDH",
        model: design?.product === "PDH" ? design.model : undefined,
        categoryId: design?.categoryId ?? 0,
        materialId,
        colors: design?.colors ?? {},
        images: (design?.images ?? []).map((image, index) => ({
          fileName: fileNames[index],
          position: image.position,
          technique: image.technique,
          label: image.fileName,
          aspect: image.aspect,
          offsetX: image.offsetX,
          offsetY: image.offsetY,
          scale: image.scale,
          flipX: image.flipX,
          flipY: image.flipY,
        })),
        texts: (design?.texts ?? []).map((text) => ({
          content: text.content,
          font: text.fontName,
          color: text.colorName,
          position: text.position,
          offsetX: text.offsetX,
          offsetY: text.offsetY,
          scale: text.scale,
          flipX: text.flipX,
          flipY: text.flipY,
        })),
      },
      quantities,
      namePerPerson,
      names: namePerPerson ? sizeSequence.map((size, index) => ({ name: personNames[index] ?? "", size })) : [],
      notes: notes || undefined,
      customer: { ...customer, organization: customer.organization || undefined },
      shipping: { ...shipping, method: shipping.method || undefined },
      paymentScheme: paymentScheme || undefined,
      agreed: agreed ? true : undefined,
    };
  }

  /** Aturan validasi dijalankan terus; hasilnya peta "kolom -> pesan error". */
  const errors: ErrorMap = useMemo(() => {
    if (!design) return {};
    const result = checkoutSchema.safeParse(buildInput(design.images.map(() => "belum-diunggah")));
    if (result.success) return {};
    const map: ErrorMap = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!(key in map)) map[key] = issue.message;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, quantities, materialId, namePerPerson, personNames, notes, customer, shipping, paymentScheme, agreed]);

  /** Error yang boleh tampil: setelah submit semuanya, sebelum itu hanya kolom yang sudah disentuh. */
  function errorFor(key: string): string | undefined {
    const message = serverErrors[key] ?? errors[key];
    return message && (submitted || touched.has(key) || key in serverErrors) ? message : undefined;
  }
  /** Menandai kolom sudah disentuh (saat kehilangan fokus). */
  const touch = (key: string) => setTouched((current) => new Set(current).add(key));
  /** Properti umum untuk input teks: nama, nilai, error, dan penanda blur. */
  const textProps = (key: string) => ({ name: key, error: errorFor(key), onBlur: () => touch(key) });

  /** Tombol "Bayar sekarang". */
  async function handleSubmit() {
    setSubmitted(true);
    setServerErrors({});
    setServerMessage(undefined);
    if (!design || Object.keys(errors).length > 0) {
      // Pindahkan fokus ke kolom error pertama
      const firstKey = Object.keys(errors)[0];
      requestAnimationFrame(() => (document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null)?.focus());
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Unggah file logo (baru dikirim ke server sekarang, bukan saat mengedit)
      const fileNames: string[] = [];
      for (const image of design.images) {
        const blob = (image.previewUrl ? await fetch(image.previewUrl).then((r) => r.blob()) : null) ?? (await loadFile(image.fileKey));
        if (!blob) throw new Error("File logo tidak ditemukan di browser. Unggah ulang di editor.");
        const form = new FormData();
        form.append("file", new File([blob], image.fileName));
        const upload = await fetch("/api/uploads", { method: "POST", body: form }).then((r) => r.json());
        if (!upload.ok) throw new Error(upload.message);
        fileNames.push(upload.data.fileName);
      }
      // 2. Kirim pesanan
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildInput(fileNames)) }).then((r) => r.json());
      if (!response.ok) {
        setServerErrors(response.fields ?? {});
        setServerMessage(response.message);
        toast.error(response.message ?? "Pesanan belum bisa dibuat. Periksa isianmu.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      toast.success(`Pesanan ${response.data.code} dibuat. Lanjut ke pembayaran.`);
      router.push(`/pembayaran/${response.data.code}?token=${response.data.trackingToken}`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.";
      setServerMessage(text);
      toast.error(text);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) return <p className="p-10 text-center text-sm text-ink-muted">Memuat desainmu…</p>;
  if (!design) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <Alert tone="warning" title="Belum ada desain">Buat desain dulu di editor, lalu lanjut ke halaman ini.</Alert>
        <Button href="/editor" className="mt-4">Buka editor →</Button>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;
  const productMaterials = catalog.materials.filter((item) => item.product === design.product);
  const overlays = toGarmentOverlays(design);
  const totalTone = totalPcs >= MIN_ORDER_PCS ? "text-success" : "text-danger";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-5 pb-24 md:gap-6 md:px-8 md:py-8 lg:grid-cols-[1fr_340px] lg:pb-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-medium md:text-5xl">Pesanan</h1>
          <p className="text-ink-soft">Isi ukuran, data pemesan, pengiriman, dan pembayaran. Semua di satu halaman.</p>
        </div>

        {(submitted && errorCount > 0) && (
          <Alert tone="danger" title={`Ada ${errorCount} isian yang perlu diperbaiki`}>
            Periksa kolom yang diberi tanda [!] di bawah ini.
          </Alert>
        )}
        {serverMessage && <Alert tone="danger" title="Pesanan belum bisa dibuat">{serverMessage}</Alert>}

        {/* ===== 1. Ukuran & jumlah ===== */}
        <Card className="!p-4 md:!p-5">
          <BlockTitle number={1} title="Ukuran & jumlah" />
          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Jumlah per ukuran">
            {SIZES.map((size) => (
              <QtyStepper
                key={size}
                label={size}
                value={quantities[size] ?? 0}
                onChange={(value) => {
                  setQuantities((current) => ({ ...current, [size]: value }));
                  touch("quantities");
                }}
              />
            ))}
          </div>
          <p className={cn("mt-3 text-sm font-semibold", totalTone)} id="quantities" aria-live="polite">
            Total {totalPcs} pcs{" "}
            <span className="font-normal">
              {totalPcs >= MIN_ORDER_PCS ? `· Memenuhi minimal order ${MIN_ORDER_PCS} pcs` : ""}
            </span>
          </p>
          {errorFor("quantities") && <p className="mt-1 text-xs font-semibold text-danger">{errorFor("quantities")}</p>}
          <button type="button" className="mt-2 text-sm font-semibold text-accent underline" onClick={() => setShowGuide(true)}>
            Panduan ukuran →
          </button>

          <div className="mt-6 flex flex-col gap-3">
            <p className="text-sm font-semibold">Bahan</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {productMaterials.map((item) => (
                <ChoiceCard size="sm"
                  key={item.id}
                  name="bahan"
                  value={String(item.id)}
                  checked={materialId === item.id}
                  onChange={() => setMaterialId(item.id)}
                  title={item.name}
                  text={item.surcharge ? "Bahan premium" : "Standar, termasuk harga dasar"}
                  right={item.surcharge ? `+${formatRupiah(item.surcharge)}` : "Termasuk"}
                />
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" checked={namePerPerson} onChange={(event) => setNamePerPerson(event.target.checked)} className="h-4 w-4 accent-[#C12822]" />
              Tambah nama per orang (+{formatRupiah(7500)}/pcs)
            </label>
            {namePerPerson && (
              <div className="flex flex-col gap-2" id="names">
                {sizeSequence.length === 0 && <p className="text-xs text-ink-muted">Isi jumlah per ukuran dulu, lalu baris nama akan muncul.</p>}
                {sizeSequence.map((size, index) => (
                  <div key={index} className="grid grid-cols-[1.5rem_1fr_3rem] items-center gap-2 sm:grid-cols-[2rem_1fr_3.5rem]">
                    <span className="text-xs text-ink-muted">{index + 1}</span>
                    <TextInput
                      aria-label={`Nama orang ke-${index + 1}`}
                      placeholder="Nama (maks. 20 huruf)"
                      maxLength={20}
                      value={personNames[index] ?? ""}
                      onChange={(event) => setPersonNames((current) => Object.assign([...current], { [index]: event.target.value }))}
                    />
                    <span className="rounded-control border-2 border-ink bg-subtle py-2 text-center text-xs font-semibold">{size}</span>
                  </div>
                ))}
                {errorFor("names") && <p className="text-xs font-semibold text-danger">{errorFor("names")}</p>}
              </div>
            )}
            <Field label="Catatan untuk produksi" hint={`${notes.length}/300 karakter · opsional`} error={errorFor("notes")}>
              {(props) => (
                <TextArea {...props} {...textProps("notes")} value={notes} placeholder="Contoh: logo dada kiri bordir, nama di punggung sablon putih." onChange={(event) => setNotes(event.target.value)} />
              )}
            </Field>
          </div>
        </Card>

        {/* ===== 2. Data pemesan ===== */}
        <Card className="!p-4 md:!p-5">
          <BlockTitle number={2} title="Data pemesan" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama lengkap" required error={errorFor("customer.name")} hint="Sesuai identitas, untuk invoice.">
              {(props) => <TextInput {...props} {...textProps("customer.name")} value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />}
            </Field>
            <Field label="Nomor WhatsApp" required error={errorFor("customer.whatsapp")} hint="Dipakai untuk lacak pesanan dan kabar produksi.">
              {(props) => <TextInput {...props} {...textProps("customer.whatsapp")} inputMode="tel" placeholder="0812 5555 0199" value={customer.whatsapp} onChange={(event) => setCustomer({ ...customer, whatsapp: event.target.value })} />}
            </Field>
            <Field label="Email" required error={errorFor("customer.email")} hint="Invoice dan tautan lacak dikirim ke sini.">
              {(props) => <TextInput {...props} {...textProps("customer.email")} type="email" placeholder="nama@email.com" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />}
            </Field>
            <Field label="Organisasi / instansi" error={errorFor("customer.organization")} hint="Opsional.">
              {(props) => <TextInput {...props} {...textProps("customer.organization")} value={customer.organization} onChange={(event) => setCustomer({ ...customer, organization: event.target.value })} />}
            </Field>
          </div>
        </Card>

        {/* ===== 3. Pengiriman ===== */}
        <Card className="!p-4 md:!p-5">
          <BlockTitle number={3} title="Pengiriman" />
          <div className="flex flex-col gap-3" id="shipping.method">
            <ChoiceCard size="sm" name="pengiriman" value="KIRIM" checked={shipping.method === "KIRIM"} onChange={() => { setShipping({ ...shipping, method: "KIRIM" }); touch("shipping.method"); }} title="Kirim ke alamat" text="Estimasi 2–4 hari setelah produksi" right={shipping.city ? formatRupiah(city?.fee ?? 0) : "Sesuai kota"} />
            <ChoiceCard size="sm" name="pengiriman" value="AMBIL" checked={shipping.method === "AMBIL"} onChange={() => { setShipping({ ...shipping, method: "AMBIL" }); touch("shipping.method"); }} title="Ambil di workshop" text="Jl. Mulawarman No. 12, Samarinda" right="Gratis" />
            {errorFor("shipping.method") && <p className="text-xs font-semibold text-danger">{errorFor("shipping.method")}</p>}
          </div>
          {shipping.method === "KIRIM" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Alamat lengkap" required error={errorFor("shipping.address")} hint="Jalan, nomor, RT/RW, kelurahan.">
                  {(props) => <TextInput {...props} {...textProps("shipping.address")} maxLength={200} value={shipping.address} onChange={(event) => setShipping({ ...shipping, address: event.target.value })} />}
                </Field>
              </div>
              <Field label="Kota / kabupaten" required error={errorFor("shipping.city")} hint="Ongkir dihitung dari kota ini.">
                {(props) => (
                  <SelectInput {...props} {...textProps("shipping.city")} value={shipping.city} onChange={(event) => setShipping({ ...shipping, city: event.target.value })}>
                    <option value="">Pilih kota</option>
                    {catalog.cities.map((item) => <option key={item.name}>{item.name}</option>)}
                  </SelectInput>
                )}
              </Field>
              <Field label="Kode pos" required error={errorFor("shipping.postalCode")} hint="Lima digit.">
                {(props) => <TextInput {...props} {...textProps("shipping.postalCode")} inputMode="numeric" maxLength={5} value={shipping.postalCode} onChange={(event) => setShipping({ ...shipping, postalCode: event.target.value.replace(/\D/g, "") })} />}
              </Field>
            </div>
          )}
        </Card>

        {/* ===== 4. Pembayaran ===== */}
        <Card className="!p-4 md:!p-5">
          <BlockTitle number={4} title="Pembayaran" />
          <div className="flex flex-col gap-3" id="paymentScheme">
            <ChoiceCard size="sm" name="skema" value="LUNAS" checked={paymentScheme === "LUNAS"} onChange={() => { setPaymentScheme("LUNAS"); touch("paymentScheme"); }} title="Lunas" text="Bayar penuh sekarang" right={formatRupiah(price.total)} />
            <ChoiceCard size="sm" name="skema" value="DP50" checked={paymentScheme === "DP50"} onChange={() => { setPaymentScheme("DP50"); touch("paymentScheme"); }} title="DP 50%" text="Sisa dibayar sebelum pengiriman" right={formatRupiah(price.downPayment)} />
            {errorFor("paymentScheme") && <p className="text-xs font-semibold text-danger">{errorFor("paymentScheme")}</p>}
          </div>
          <label className="mt-5 flex items-start gap-3 text-sm" id="agreed">
            <input type="checkbox" name="agreed" checked={agreed} onChange={(event) => { setAgreed(event.target.checked); touch("agreed"); }} className="mt-0.5 h-4 w-4 accent-[#C12822]" />
            <span>Saya setuju dengan syarat produksi &amp; revisi</span>
          </label>
          {errorFor("agreed") && <p className="mt-1 text-xs font-semibold text-danger">{errorFor("agreed")}</p>}
        </Card>
      </div>

      <OrderSummary
        product={design.product}
        model={design.model}
        title={`${design.product} ${category?.name ?? ""}`}
        subtitle={`${material?.name ?? ""} · ${design.images.length} gambar${design.images[0] ? ` (${POSITIONS[design.images[0].position].label})` : ""}`}
        hexColors={colorsToHex(design.colors, catalog)}
        images={overlays.images}
        texts={overlays.texts}
        price={price}
        schemeLabel={paymentScheme === "DP50" ? "DP 50%" : "Lunas"}
        payNowAmount={payNowAmount}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
      {/* Mobile: bilah bawah 75px (Total + Bayar) */}
      <StickyBar label="Total" value={formatRupiah(price.total)} action={<Button onClick={handleSubmit} disabled={submitting} className="h-[49px] px-5">{submitting ? "Memproses…" : "Bayar →"}</Button>} />
      <SizeGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
