import { HeroSlider } from "@/components/hero-slider";
import { StatsSummary } from "@/components/stats-summary";
import { BeritaSection } from "@/components/berita-section";
import { PeraturanList } from "@/components/peraturan-list";
import { SiteFooter } from "@/components/site-footer";
import { Navbar } from "@/components/navbar";

export default function BerandaPage() {
  return (
    <>
      <Navbar />
      <HeroSlider />
      <StatsSummary />
      <BeritaSection />
      <PeraturanList />
      <SiteFooter />
    </>
  );
}
