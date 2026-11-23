/**
 * PortfolioSection: tiga proyek yang pernah dikerjakan.
 * Awalnya ketiga kartu sejajar; saat di-scroll, kartu tengah turun perlahan 48 px (driftY).
 * Foto proyek diganti ilustrasi garmen sampai foto asli tersedia.
 */
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import Image from "next/image";
import { ParallaxLayer } from "@/components/ParallaxLayer";
import { cn } from "@/lib/cn";

const PROJECTS = [
  { speed: 1, label: "PDH Model 07", title: "Himpunan Mahasiswa Informatika", detail: "120 pcs · aksen batik parang · bordir dada", tone: "bg-pastel-blue", image: "/landing/pdh-07-parang-depan-unmul.webp", alt: "PDH Model 07 putih dengan plaket hitam, aksen batik parang, dan logo Universitas Mulawarman", drift: undefined },
  { speed: 1, label: "VEST Model 01", title: "KKN Desa Rimberio", detail: "40 pcs · bordir logo · sablon punggung", tone: "bg-pastel-butter", image: "/landing/vest-01-belakang-unmul.webp", alt: "Punggung VEST Model 01 bertuliskan KKN 2026 Desa Rimberio dengan logo Universitas Mulawarman", drift: 48 },
  { speed: 1, label: "VEST Model 06", title: "Tim K3 Proyek Gudang", detail: "60 pcs · bordir lambang & nama jabatan", tone: "bg-pastel-mint", image: "/landing/vest-06-depan-unmul.webp", alt: "VEST Model 06 abu-abu dengan logo Universitas Mulawarman di dada dan nama Taufik Ramadhani", drift: undefined },
] as const;

export function PortfolioSection() {
  return (
    <section id="portofolio">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:px-8 md:py-16">
        <SectionTitle title="Portofolio" />
        <div className="grid items-start gap-6 md:grid-cols-3">
          {PROJECTS.map((project) => (
            <ParallaxLayer key={project.title} speed={project.speed} driftY={project.drift}>
              <Card className="flex flex-col gap-4 !p-3">
                <div className={cn("rounded-card border-2 border-ink px-4 py-6", project.tone)}>
                  <Image src={project.image} alt={project.alt} width={600} height={680} className="mx-auto h-48 w-auto" />
                </div>
                <div className="flex flex-col gap-1 px-2 pb-2">
                  <div>
                    <Tag>{project.label}</Tag>
                  </div>
                  <h3 className="mt-1 font-semibold">{project.title}</h3>
                  <p className="text-xs text-ink-soft">{project.detail}</p>
                </div>
              </Card>
            </ParallaxLayer>
          ))}
        </div>
      </div>
    </section>
  );
}
