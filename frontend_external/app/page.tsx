import { HeroSlider } from "@/components/hero-slider";
import { PenilaianSummarySection } from "@/components/penilaian-summary";
import { TaglineBerakhlakTajam } from "@/components/tagline-berakhlak-tajam";
import { BeritaSection } from "@/components/berita-section";
import { PeraturanList } from "@/components/peraturan-list";
import { SiteFooter } from "@/components/site-footer";
import { Navbar } from "@/components/navbar";
import { SurveyPopup } from "@/components/survey-popup";

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
      <SurveyPopup />
    </>
  );
}
