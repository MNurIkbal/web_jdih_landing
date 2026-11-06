"use client";

import { Shield, Award, HeartHandshake } from "lucide-react";

export function TaglineBerakhlakTajam() {
  const berakhlakItems = [
    {
      letter: "Ber",
      title: "Berorientasi Pelayanan",
      desc: "Komitmen memberikan pelayanan hukum prima demi kepuasan publik.",
    },
    {
      letter: "A",
      title: "Akuntabel",
      desc: "Bertanggung jawab atas kepercayaan yang diberikan secara transparan.",
    },
    {
      letter: "K",
      title: "Kompeten",
      desc: "Terus belajar dan mengembangkan kapabilitas hukum intelijen.",
    },
    {
      letter: "H",
      title: "Harmonis",
      desc: "Saling peduli dan menghargai perbedaan demi kesatuan bangsa.",
    },
    {
      letter: "L",
      title: "Loyal",
      desc: "Berdedikasi dan mengutamakan kepentingan bangsa dan negara.",
    },
    {
      letter: "A",
      title: "Adaptif",
      desc: "Terus berinovasi dan antusias dalam menggerakkan ataupun menghadapi perubahan.",
    },
    {
      letter: "K",
      title: "Kolaboratif",
      desc: "Membangun kerja sama yang sinergis antarseluruh elemen kelembagaan.",
    },
  ];

  const tajamPillars = [
    {
      code: "T",
      title: "Tangguh",
      desc: "Kekuatan mentalitas, integritas kokoh, dan ketahanan dalam mengawal supremasi hukum nasional.",
    },
    {
      code: "A",
      title: "Akurat",
      desc: "Presisi tinggi dalam penyediaan data, analisa regulasi, dan verifikasi naskah hukum yang absah.",
    },
    {
      code: "J",
      title: "Jujur",
      desc: "Menjunjung keterbukaan, kebenaran fakta informasi, dan kepatuhan kode etik tertinggi aparatur.",
    },
    {
      code: "A",
      title: "Antisipatif",
      desc: "Kepekaan mendalam dalam memitigasi risiko hukum dan merespons dinamika ancaman kontemporer.",
    },
    {
      code: "M",
      title: "Melindungi",
      desc: "Bakti setia menjaga kedaulatan NKRI, keselamatan bangsa, dan kepentingan strategis negara.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 text-slate-900 sm:py-24 border-b border-border/70">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center">

          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            BerAKHLAK <span className="text-amber-600">&amp;</span> TAJAM
          </h2>

          <div className="mx-auto mt-4 flex items-center justify-center gap-2">
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-amber-500" />
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-amber-500" />
          </div>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sinergi Core Values Aparatur Sipil Negara Republik Indonesia dipadukan dengan Doktrin Intelijen Kehormatan Badan Intelijen Negara dalam melayani dan menjaga kedaulatan bangsa.
          </p>
        </div>

        {/* 2 Big Feature Cards: BerAKHLAK & TAJAM */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lg shadow-black/[0.03] transition-all duration-300 hover:border-amber-400 sm:p-10">
            {/* Top decorative stripe */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400" />

            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 shadow-sm">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
                      Core Values ASN RI
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-foreground">
                      BerAKHLAK
                    </h3>
                  </div>
                </div>

                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-700">
                  Bangga Melayani Bangsa
                </span>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Panduan perilaku dan standar etika moralitas bagi seluruh insan aparatur negara dalam melaksanakan tugas kedinasan dan pelayanan masyarakat:
              </p>

              {/* Grid 7 Values BerAKHLAK */}
              <div className="mt-6 space-y-3">
                {berakhlakItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-3.5 rounded-2xl border border-border/80 bg-muted/40 p-3.5 transition-colors hover:border-amber-300 hover:bg-muted/80"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-xs font-extrabold text-amber-700 ring-1 ring-amber-500/25">
                      {item.letter}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-amber-700 transition-colors">
                        {item.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Berdasarkan SE MenPANRB No. 20 Tahun 2021</span>
              <span className="text-amber-700 font-medium">Etika Pelayanan Prima</span>
            </div>
          </div>

          {/* ================= CARD 2: TAJAM ================= */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lg shadow-black/[0.03] transition-all duration-300 hover:border-primary/40 sm:p-10">
            {/* Top decorative stripe */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-cyan-400" />

            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                      Doktrin &amp; Karakter Insan Intelijen
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-foreground">
                      TAJAM
                    </h3>
                  </div>
                </div>

                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  Velox et Exactus
                </span>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Pilar kehormatan dan keunggulan profesionalitas personel Badan Intelijen Negara dalam menjaga keamanan dan kedaulatan Negara Kesatuan Republik Indonesia:
              </p>

              {/* 5 Pillars TAJAM */}
              <div className="mt-6 space-y-4">
                {tajamPillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-muted/80"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-extrabold text-primary ring-1 ring-primary/20">
                        {pillar.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {pillar.title}
                          </h4>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Semboyan Kehormatan Intelijen Negara</span>
              <span className="text-primary font-medium">Setia Waspada</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner Kehormatan BIN */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
            <Award className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground sm:text-base">
              &ldquo;BerAKHLAK dalam Pelayanan Publik — TAJAM dalam Perlindungan Kedaulatan Negara&rdquo;
            </h4>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Jaringan Dokumentasi dan Informasi Hukum Badan Intelijen Negara Republik Indonesia
          </p>
        </div>
      </div>
    </section>
  );
}
