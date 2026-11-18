/**
 * Halaman Landing ("/"): profil bisnis dengan efek paralaks.
 * Ini Server Component: data harga dibaca dari database di server, lalu
 * dikirim ke section sebagai props. Urutan section sesuai PRD §8.1.
 */
import { CategoryStrip } from "@/features/landing/CategoryStrip";
import { CatalogSection } from "@/features/landing/CatalogSection";
import { HeroSection } from "@/features/landing/HeroSection";
import { HowToOrder } from "@/features/landing/HowToOrder";
import { ManifestoSection } from "@/features/landing/ManifestoSection";
import { PortfolioSection } from "@/features/landing/PortfolioSection";
import { ProfileSection } from "@/features/landing/ProfileSection";
import { CtaSection, Testimonials } from "@/features/landing/TestimonialsAndCta";
import { Ticker } from "@/features/landing/Ticker";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { getCatalog } from "@/server/services/catalog-service";

export const dynamic = "force-dynamic"; // harga selalu terbaru dari database

export default async function LandingPage() {
  const catalog = await getCatalog();
  return (
    <>
      <Ticker />
      <Navbar />
      <main>
        <HeroSection />
        <ProfileSection />
        <CatalogSection catalog={catalog} />
        <CategoryStrip catalog={catalog} />
        <HowToOrder />
        <ManifestoSection />
        <PortfolioSection />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer catalog={catalog} />
    </>
  );
}
