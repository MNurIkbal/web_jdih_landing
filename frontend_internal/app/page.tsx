import { HeroSlider } from "@/components/hero-slider";
import { BeritaSection } from "@/components/berita-section";
import { PeraturanList } from "@/components/peraturan-list";
import { SiteFooter } from "@/components/site-footer";
import { Navbar } from "@/components/navbar";
import { TaglineBerakhlakTajam } from "@/components/tagline-berakhlak-tajam";
import { PenilaianSummarySection } from "@/components/penilaian-summary";
import { AccessibilityWidget } from "@/components/accessibility-widget";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function BerandaPage() {
  return (
    <>
      <Navbar />
      <HeroSlider />
      <PenilaianSummarySection />
      <TaglineBerakhlakTajam />
      <BeritaSection />
      <PeraturanList />
      <SiteFooter />
      <AccessibilityWidget />
      <ScrollToTop />
    </>
  );
}
