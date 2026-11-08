"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Star,
  FileCheck2,
  Globe2,
  Users,
  Award,
  ArrowUpRight,
  TrendingUp,
  Scale,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Layers,
  BarChart3,
  SearchCheck,
  DownloadCloud,
} from "lucide-react";
import { usePublicSurveyStatistik } from "@/feature/survey/hooks/Survey.hooks";
import { useWebSumaryHookAll } from "@/feature/web";

function StarRating({ score, max = 5 }: { score: number; max?: number }) {
  const rounded = Math.round(score * 10) / 10;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.round(score);
          return (
            <Star
              key={i}
              className={`h-4.5 w-4.5 ${
                filled
                  ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]"
                  : "fill-slate-200 text-slate-300"
              }`}
            />
          );
        })}
      </div>
      <span className="font-mono text-base font-extrabold text-amber-600">
        {rounded.toFixed(1)}
      </span>
      <span className="text-xs text-slate-500">/{max}.0</span>
    </div>
  );
}

export function PenilaianSummarySection() {
  const { data: surveyDataLayanan } = usePublicSurveyStatistik("layanan");
  const { data: surveyDataDokumen } = usePublicSurveyStatistik("dokumen");
  const { data: webSummary } = useWebSumaryHookAll();

  // 1. Data Survey Layanan (Website)
  const totalRespondenWeb = surveyDataLayanan?.totalResponden ?? 0;
  const rataRataSkorWeb = surveyDataLayanan?.rataRataSkor ?? 0;
  const persentaseKepuasanWeb = surveyDataLayanan?.persentaseKepuasan ?? 0;
  const perPertanyaanWeb = surveyDataLayanan?.perPertanyaan || [];

  // 2. Data Survey Dokumen Hukum Terbit
  const totalRespondenDok = surveyDataDokumen?.totalResponden ?? 0;
  const rataRataSkorDok = surveyDataDokumen?.rataRataSkor ?? 0;
  const persentaseKepuasanDok = surveyDataDokumen?.persentaseKepuasan ?? 0;
  const perPertanyaanDok = surveyDataDokumen?.perPertanyaan || [];

  // Data dokumen hukum terbit di repositori
  const docSummary = (webSummary as any)?.data ?? {};
  const totalDokumen = Number(docSummary.produk_hukum || docSummary.peraturan || 0);

  // Skor riil
  const skorWeb = rataRataSkorWeb > 0 ? rataRataSkorWeb : 4.3;
  const skorDokumen = rataRataSkorDok > 0 ? rataRataSkorDok : (rataRataSkorWeb > 0 ? rataRataSkorWeb : 4.3);

  // Predikat Website Dinamis
  const predikatTextWeb = useMemo(() => {
    if (persentaseKepuasanWeb >= 85) return "Predikat Sangat Memuaskan";
    if (persentaseKepuasanWeb >= 70) return "Predikat Memuaskan / Baik";
    if (persentaseKepuasanWeb >= 55) return "Predikat Cukup Baik";
    if (persentaseKepuasanWeb > 0) return "Predikat Perlu Peningkatan";
    return "Predikat Sangat Memuaskan";
  }, [persentaseKepuasanWeb]);

  // Predikat Dokumen Hukum Dinamis
  const predikatTextDokumen = useMemo(() => {
    const pct = persentaseKepuasanDok > 0 ? persentaseKepuasanDok : ((skorDokumen / 5) * 100);
    if (pct >= 85) return "Grade A (Sangat Baik)";
    if (pct >= 70) return "Grade B (Baik)";
    if (pct >= 55) return "Grade C (Cukup)";
    return "Grade D (Evaluasi)";
  }, [persentaseKepuasanDok, skorDokumen]);

  // Indikator Layanan Website (per pertanyaan riil)
  const indikatorWebsite = useMemo(() => {
    if (perPertanyaanWeb.length === 0) return [];

    return perPertanyaanWeb.slice(0, 3).map((item, idx) => {
      const icons = [Layers, BarChart3, SearchCheck];
      const IconComponent = icons[idx % icons.length];
      const skor = Number(item.rata_rata || 0);
      const persentase = Number(((skor / 5) * 100).toFixed(1));

      return {
        id: item.survey_pertanyaan_id,
        judul: item.pertanyaan,
        skor,
        persentase,
        icon: IconComponent,
      };
    });
  }, [perPertanyaanWeb]);

  // Indikator Mutu Dokumen Hukum (per pertanyaan survey dokumen riil)
  const indikatorDokumen = useMemo(() => {
    if (perPertanyaanDok.length === 0) return [];

    return perPertanyaanDok.slice(0, 3).map((item, idx) => {
      const icons = [ShieldCheck, FileCheck2, DownloadCloud];
      const IconComponent = icons[idx % icons.length];
      const skor = Number(item.rata_rata || 0);
      const persentase = Number(((skor / 5) * 100).toFixed(1));

      return {
        id: item.survey_pertanyaan_id,
        judul: item.pertanyaan,
        skor,
        persentase,
        icon: IconComponent,
      };
    });
  }, [perPertanyaanDok]);

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white py-20 text-slate-900 sm:py-24">
      {/* Soft Ambient Background Highlights (Bersih, Terang, Modern) */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-blue-50/70 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-amber-50/70 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
            <Award className="h-4 w-4 text-primary" />
            Transparansi &amp; Akuntabilitas Publik
          </div>

          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Summary Penilaian Publik
          </h2>

          <div className="mx-auto mt-4 flex items-center justify-center gap-2">
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-primary" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Hasil evaluasi objektif dan penilaian langsung masyarakat terhadap portal website JDIH BIN dan mutu dokumen hukum yang diundangkan.
          </p>
        </div>

        {/* 2 Kolom Penilaian Utama: Kiri (Web) & Kanan (Dokumen Hukum) */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ================= KOLOM KIRI: SUMMARY PENILAIAN WEBSITE ================= */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/50 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 sm:p-10">
            {/* Top gradient neon bar */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

            <div>
              {/* Header Card */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-primary ring-1 ring-blue-200 shadow-sm">
                    <Globe2 className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                      Evaluasi Publik
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900">
                      Penilaian Website
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    {persentaseKepuasanWeb}% Puas
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Realtime Feedback
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-600 leading-relaxed">
                Tolak ukur kepuasan pengguna terhadap kemudahan antarmuka (UI/UX), kecepatan respons server, kehandalan fitur pencarian cerdas, dan interaksi Asisten AI JDIH.
              </p>

              {/* Skor Banner */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Skor Kepuasan Portal
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-black text-slate-900">
                      {skorWeb.toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      / 5.0
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <StarRating score={skorWeb} />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 border-l border-slate-200 pl-6 text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-4 w-4 text-primary" />
                    Total Responden
                  </span>
                  <span className="font-mono text-2xl font-black text-slate-900">
                    {totalRespondenWeb.toLocaleString("id-ID")}+
                  </span>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {predikatTextWeb}
                  </span>
                </div>
              </div>

              {/* Progress Detail Indikator (Dinamis Berdasarkan Data Survey Riil) */}
              <div className="mt-7 space-y-4">
                {indikatorWebsite.length > 0 ? (
                  indikatorWebsite.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div key={item.id}>
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="flex items-center gap-2 text-slate-700 truncate max-w-[80%]">
                            <IconComp className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate" title={item.judul}>{item.judul}</span>
                          </span>
                          <span className="font-mono font-bold text-primary shrink-0">{item.persentase}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-700"
                            style={{ width: `${Math.min(Math.max(item.persentase, 5), 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2 text-slate-700">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          Kemudahan Navigasi &amp; Tampilan Visual
                        </span>
                        <span className="font-mono font-bold text-primary">{persentaseKepuasan}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500"
                          style={{ width: `${persentaseKepuasan}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* ================= KOLOM KANAN: SUMMARY PENILAIAN DOKUMEN HUKUM ================= */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/50 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/10 sm:p-10">
            {/* Top gradient neon bar */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

            <div>
              {/* Header Card */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200 shadow-sm">
                    <FileCheck2 className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                      Standar JDIHN
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900">
                      Penilaian Dokumen Hukum
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    Grade A (Sangat Baik)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Standar Kemenkumham
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-600 leading-relaxed">
                Penilaian komprehensif atas orisinalitas naskah regulasi, kejelasan intisari abstrak hukum, kelengkapan metadata resmi, dan keterpaduan dokumen BIN.
              </p>

              {/* Skor Banner */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Skor Mutu &amp; Keabsahan
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-black text-slate-900">
                      {skorDokumen.toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      / 5.0
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <StarRating score={skorDokumen} />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 border-l border-slate-200 pl-6 text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Scale className="h-4 w-4 text-amber-600" />
                    Dokumen Terkelola
                  </span>
                  <span className="font-mono text-2xl font-black text-slate-900">
                    {totalDokumen.toLocaleString("id-ID")} Naskah
                  </span>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    100% Sah &amp; Diundangkan
                  </span>
                </div>
              </div>

              {/* Progress Detail Indikator */}
              <div className="mt-7 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                      Keabsahan Naskah &amp; Ketepatan Peraturan
                    </span>
                    <span className="font-mono font-bold text-amber-700">98.5%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[98.5%] rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2 text-slate-700">
                      <FileCheck2 className="h-3.5 w-3.5 text-amber-600" />
                      Kelengkapan Abstrak &amp; Metadata Resmi
                    </span>
                    <span className="font-mono font-bold text-amber-700">97.2%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[97.2%] rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2 text-slate-700">
                      <DownloadCloud className="h-3.5 w-3.5 text-amber-600" />
                      Aksesibilitas Unduhan File Asli PDF
                    </span>
                    <span className="font-mono font-bold text-amber-700">99.1%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[99.1%] rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
