/**
 * PortfolioSection: tiga proyek yang pernah dikerjakan.
 * Awalnya ketiga kartu sejajar; saat di-scroll, kartu tengah turun perlahan 48 px (driftY).
 * Foto proyek diganti ilustrasi garmen sampai foto asli tersedia.
 */
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { Garment } from "@/components/Garment";
import { ParallaxLayer } from "@/components/ParallaxLayer";
import { cn } from "@/lib/cn";
import { PDH_GREEN, PDH_NAVY, VEST_BLACK } from "./garment-colors";

const PROJECTS = [
  { speed: 1, product: "PDH", label: "PDH Organisasi", title: "Himpunan Mahasiswa Informatika", detail: "120 pcs · bordir dada & punggung", tone: "bg-pastel-blue", colors: PDH_NAVY, drift: undefined },
  { speed: 1, product: "VEST", label: "VEST Proyek", title: "Tim K3 Proyek Gudang", detail: "60 pcs · strip reflektif · sablon", tone: "bg-pastel-butter", colors: VEST_BLACK, drift: 48 },
  { speed: 1, product: "PDH", label: "PDH Komunitas", title: "Komunitas Tepian Runners", detail: "45 pcs · sablon punggung", tone: "bg-pastel-mint", colors: PDH_GREEN, drift: undefined },
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
                  <Garment product={project.product} colors={project.colors} className="mx-auto h-48 w-auto" />
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
