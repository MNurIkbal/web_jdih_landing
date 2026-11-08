"use client";


import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  FileText,
  Gavel,
  Newspaper,
  Scale,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useWebSumaryDashboard, useWebSumaryGrafik } from "@/feature/web";
import { usePengajuanList } from "@/feature/pengajuan-peraturan/hooks/PengajuanPeraturan.hooks";

type SummaryCard = {
  title: string;
  value: string;
  change: string;
  description: string;
  href: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ChartSeries = {
  name: string;
  color: string;
  values: number[];
};

type TooltipState = {
  series: string;
  value: number;
  month: string;
  x: number;
  y: number;
} | null;

type TahunData = {
  tahun: number;
  total: number;
};

export default function DashboardPage() {
  const {
    data: summaryResponse,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    refetch: refetchSummary,
  } = useWebSumaryDashboard();

  const {
    data: grafikResponse,
    isLoading: isLoadingGrafik,
    isError: isErrorGrafik,
    refetch: refetchGrafik,
  } = useWebSumaryGrafik();

  const {
    data: pengajuanResponse,
    isLoading: isLoadingPengajuan,
  } = usePengajuanList({
    page: 1,
    size: 5,
  });

  const summaryData = summaryResponse?.data;
  const totalDokumen = summaryData?.dokumen?.total ?? 0;
  const totalPeraturan = summaryData?.dokumen?.peraturan ?? 0;
  const totalKeputusan = summaryData?.dokumen?.keputusan ?? 0;
  const totalPerundangUndangan = summaryData?.dokumen?.perundang_undangan ?? 0;
  const totalInstruksi = summaryData?.dokumen?.instruksi ?? 0;
  const totalBerita = summaryData?.berita?.total ?? 0;
  const pengajuanStats = summaryData?.pengajuan;

  const recentDrafts = (pengajuanResponse as any)?.data || [];

  const tahunData: TahunData[] = useMemo(() => {
    const data = grafikResponse?.data?.tahun ?? [];
    return [...data].sort((a, b) => a.tahun - b.tahun);
  }, [grafikResponse]);

  const summaryCards: SummaryCard[] = [
    {
      title: "Peraturan",
      value: isLoadingSummary ? "..." : totalPeraturan.toLocaleString("id-ID"),
      change: "Regulasi",
      description: "Peraturan aktif & draf hukum",
      icon: Gavel,
      href: "/admin/dokumen-hukum",
    },
    {
      title: "Keputusan",
      value: isLoadingSummary ? "..." : totalKeputusan.toLocaleString("id-ID"),
      change: "Ketetapan",
      description: "Surat keputusan & produk resmi",
      icon: Scale,
      href: "/admin/dokumen-hukum",
    },
    {
      title: "Perundang-Undangan",
      value: isLoadingSummary ? "..." : totalPerundangUndangan.toLocaleString("id-ID"),
      change: "Undang-Undang",
      description: "Regulasi tingkat UU & Perpres",
      icon: FileText,
      href: "/admin/dokumen-hukum",
    },
    {
      title: "Berita & Pengumuman",
      value: isLoadingSummary ? "..." : totalBerita.toLocaleString("id-ID"),
      change: "Publikasi",
      description: "Berita & rilis terpublikasi",
      icon: Newspaper,
      href: "/admin/berita",
    },
  ];

  const chartSeries: ChartSeries[] = [
    {
      name: "Total Dokumen Terbit",
      color: "#2563eb",
      values: tahunData.map((item) => item.total),
    },
  ];

  const months = tahunData.map((item) => String(item.tahun));

  const maxChartValue = Math.max(
    ...tahunData.map((item) => item.total),
    0
  );

  const maxValue =
    maxChartValue <= 5
      ? 5
      : Math.ceil(maxChartValue / 5) * 5;

  const gridStep = maxValue / 4;

  const gridValues = [
    0,
    Math.round(gridStep),
    Math.round(gridStep * 2),
    Math.round(gridStep * 3),
    maxValue,
  ];

  const totalGrafik = grafikResponse?.data?.total ?? totalDokumen;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc]">
      {/* Background Ornaments */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute right-[-120px] top-[180px] h-[420px] w-[420px] rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[35%] h-[450px] w-[450px] rounded-full bg-slate-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.04),transparent_35%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 space-y-7">
        {/* HERO BANNER MODERN */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-2xl p-6 sm:p-9 lg:p-12 border border-slate-800">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[45px] border-white/[0.03]" />
          <div className="pointer-events-none absolute right-24 top-16 h-56 w-56 rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.15),transparent_40%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/10">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Portal Resmi Legislasi JDIH BIN</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Pusat Dokumentasi dan Informasi Hukum
              </h1>

              <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
                Monitoring terpadu produk hukum, proses telaah harmonisasi norma peraturan, persetujuan multi-pihak, hingga penetapan repositori dokumen hukum internal dan eksternal secara akurat dan transparan.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/admin/pengajuan-peraturan"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition cursor-pointer"
                >
                  <span>Kelola Pengajuan Peraturan</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/admin/pengajuan-peraturan?tab=monitoring"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white border border-white/15 hover:bg-white/20 backdrop-blur-md transition cursor-pointer"
                >
                  <Activity size={14} className="text-blue-400" />
                  <span>Monitoring Progres Draf</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats Banner Kanan */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Produk Hukum</span>
                  <BookOpen className="h-4 w-4 text-blue-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{totalDokumen.toLocaleString("id-ID")}</span>
                  <span className="text-xs text-slate-400">dokumen terbit</span>
                </div>
              </div>

              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Draf Dalam Proses</span>
                  <Activity className="h-4 w-4 text-amber-400 animate-pulse" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">
                    {(pengajuanStats?.total ?? 0).toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-slate-400">rancangan regulasi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SUMMARY CARDS KATEGORI DOKUMEN HUKUM */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 border border-slate-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 shadow-xs">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                    <ArrowUpRight size={15} />
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </p>
                  <p className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </section>

        {/* PIPELINE ALUR PENGAJUAN PERATURAN (5 TAHAPAN) */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Layers size={17} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Pipeline Alur Pembentukan Regulasi (5 Tahap)
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Rangkuman status distribusi seluruh draf peraturan hukum pada tiap tahapan aktif
              </p>
            </div>

            <Link
              href="/admin/pengajuan-peraturan?tab=monitoring"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span>Buka Seluruh Monitoring</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Tahap 1</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Pengajuan Draf</p>
              <p className="text-2xl font-black text-blue-700 mt-2">
                {isLoadingSummary ? "..." : (pengajuanStats?.pengajuan ?? 0)}
              </p>
              <span className="text-[10px] text-slate-400">Verifikasi Dokumen</span>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Tahap 2</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Pembahasan</p>
              <p className="text-2xl font-black text-indigo-700 mt-2">
                {isLoadingSummary ? "..." : (pengajuanStats?.pembahasan ?? 0)}
              </p>
              <span className="text-[10px] text-slate-400">Rapat & Notulensi</span>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Tahap 3</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Harmonisasi</p>
              <p className="text-2xl font-black text-amber-700 mt-2">
                {isLoadingSummary ? "..." : (pengajuanStats?.harmonisasi ?? 0)}
              </p>
              <span className="text-[10px] text-slate-400">Penyelarasan Norma</span>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Tahap 4</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Persetujuan</p>
              <p className="text-2xl font-black text-purple-700 mt-2">
                {isLoadingSummary ? "..." : (pengajuanStats?.persetujuan ?? 0)}
              </p>
              <span className="text-[10px] text-slate-400">Penetapan Pejabat</span>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Tahap 5</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Penetapan</p>
              <p className="text-2xl font-black text-emerald-700 mt-2">
                {isLoadingSummary ? "..." : ((pengajuanStats?.penetapan ?? 0) + (pengajuanStats?.selesai ?? 0))}
              </p>
              <span className="text-[10px] text-slate-400">Pengundangan Resmi</span>
            </div>
          </div>
        </section>

        {/* GRID DUA KOLOM: GRAFIK TAHUNAN & DRAF TERBARU */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Kolom Kiri: Line Chart Statistik Dokumen Per Tahun */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Statistik Dokumen Hukum Berdasarkan Tahun
                  </h3>
                  <p className="text-xs text-slate-400">
                    Histori publikasi produk hukum resmi ({totalGrafik} total dokumen)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {chartSeries.map((series) => (
                  <Legend key={series.name} label={series.name} color={series.color} />
                ))}
              </div>
            </div>

            <div className="pt-2">
              {isLoadingGrafik ? (
                <div className="flex h-[320px] items-center justify-center text-xs text-slate-400">
                  Memuat data statistik grafik...
                </div>
              ) : isErrorGrafik || tahunData.length === 0 ? (
                <div className="flex h-[320px] flex-col items-center justify-center text-center p-6 text-slate-400">
                  <BarChart3 size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Belum ada histori data tahunan</p>
                  <button
                    type="button"
                    onClick={() => refetchGrafik()}
                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Segarkan Grafik
                  </button>
                </div>
              ) : (
                <LineChart
                  chartSeries={chartSeries}
                  months={months}
                  gridValues={gridValues}
                />
              )}
            </div>
          </div>

          {/* Kolom Kanan: Draf Regulasi Terbaru yang Sedang Diproses */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Aktivitas Draf Regulasi Terbaru
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rancangan peraturan terakhir diajukan
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/pengajuan-peraturan"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {isLoadingPengajuan ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Memuat draf terbaru...
                  </div>
                ) : recentDrafts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Belum ada draf permohonan regulasi
                  </div>
                ) : (
                  recentDrafts.map((draft: any) => (
                    <div key={draft.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {draft.kategori || "Peraturan"}
                          </span>
                          <span className="text-[11px] text-slate-400">• Tahap:</span>
                          <span className="text-[11px] font-extrabold text-blue-700">
                            {draft.tahapan}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-xs" title={draft.judul}>
                          {draft.judul}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        draft.status === "Ditetapkan"
                          ? "bg-emerald-50 text-emerald-700"
                          : draft.status === "Perlu Perbaikan Harmonisasi" || draft.status === "Ditolak"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {draft.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/admin/pengajuan-peraturan"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <span>Buka Manajemen Pengajuan Peraturan</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function Legend({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />

      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   LINE CHART
========================================================= */

function LineChart({
  chartSeries,
  months,
  gridValues,
}: {
  chartSeries: ChartSeries[];
  months: string[];
  gridValues: number[];
}) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const width = 1000;
  const height = 350;

  /*
   * Padding tetap sama seperti UI awal.
   */

  const left = 48;
  const right = 18;
  const top = 15;
  const bottom = 38;

  const graphWidth = width - left - right;
  const graphHeight = height - top - bottom;

  const maxValue = Math.max(...gridValues, 1);

  function xPosition(index: number) {
    if (months.length <= 1) {
      return left + graphWidth / 2;
    }

    return left + (index / (months.length - 1)) * graphWidth;
  }

  function yPosition(value: number) {
    return (
      top +
      graphHeight -
      (value / maxValue) * graphHeight
    );
  }

  function createPath(values: number[]) {
    if (values.length === 0) {
      return "";
    }

    if (values.length === 1) {
      const x = xPosition(0);
      const y = yPosition(values[0]);

      return `M ${x} ${y}`;
    }

    return values
      .map((value, index) => {
        const x = xPosition(index);
        const y = yPosition(value);

        if (index === 0) {
          return `M ${x} ${y}`;
        }

        const previousX = xPosition(index - 1);
        const previousY = yPosition(values[index - 1]);

        const middleX =
          previousX + (x - previousX) / 2;

        return `C ${middleX} ${previousY}, ${middleX} ${y}, ${x} ${y}`;
      })
      .join(" ");
  }

  return (
    <div className="w-full">
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label="Grafik statistik dokumen hukum"
        >
          {/* =================================================
              GRID
          ================================================= */}

          {gridValues.map((value) => {
            const y = yPosition(value);

            return (
              <g key={`grid-${value}`}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="5 5"
                />

                <text
                  x={left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {value.toLocaleString("id-ID")}
                </text>
              </g>
            );
          })}

          {/* =================================================
              GUIDE
          ================================================= */}

          {months.map((month, index) => {
            const x = xPosition(index);

            return (
              <line
                key={`guide-${month}`}
                x1={x}
                y1={top}
                x2={x}
                y2={height - bottom}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            );
          })}

          {/* =================================================
              SERIES
          ================================================= */}

          {chartSeries.map((series) => (
            <g key={series.name}>
              <path
                d={createPath(series.values)}
                fill="none"
                stroke={series.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-opacity duration-300"
                opacity={
                  tooltip &&
                  tooltip.series !== series.name
                    ? 0.25
                    : 1
                }
              />

              {series.values.map((value, index) => {
                const x = xPosition(index);
                const y = yPosition(value);

                const isActive =
                  tooltip?.series === series.name &&
                  tooltip?.month === months[index];

                return (
                  <g key={`${series.name}-${index}`}>
                    {/* Hover area */}

                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setTooltip({
                          series: series.name,
                          value,
                          month: months[index],
                          x,
                          y,
                        })
                      }
                      onMouseLeave={() =>
                        setTooltip(null)
                      }
                    />

                    {isActive && (
                      <circle
                        cx={x}
                        cy={y}
                        r="9"
                        fill="none"
                        stroke={series.color}
                        strokeWidth="2"
                        opacity="0.25"
                      />
                    )}

                    {/* Main point */}

                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 6 : 4.5}
                      fill="white"
                      stroke={series.color}
                      strokeWidth="2.5"
                      className="pointer-events-none transition-all duration-200"
                    />
                  </g>
                );
              })}
            </g>
          ))}

          {/* =================================================
              TOOLTIP
          ================================================= */}

          {tooltip && (
            <g
              className="pointer-events-none"
              style={{
                transition: "opacity 150ms ease",
              }}
            >
              <line
                x1={tooltip.x}
                y1={top}
                x2={tooltip.x}
                y2={height - bottom}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              <g
                transform={`translate(
                  ${Math.min(
                    Math.max(tooltip.x - 70, 8),
                    width - 148
                  )},
                  ${Math.max(tooltip.y - 78, 5)}
                )`}
              >
                <rect
                  width="140"
                  height="64"
                  rx="10"
                  fill="#0f172a"
                  opacity="0.96"
                  className="drop-shadow-xl"
                />

                <text
                  x="12"
                  y="20"
                  fontSize="10"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {tooltip.series}
                </text>

                <text
                  x="12"
                  y="42"
                  fontSize="17"
                  fontWeight="700"
                  fill="white"
                >
                  {tooltip.value.toLocaleString("id-ID")}
                </text>

                <text
                  x="120"
                  y="42"
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {tooltip.month}
                </text>
              </g>
            </g>
          )}
          {months.map((month, index) => {
            const x = xPosition(index);
            return (
              <text
                key={`month-${month}`}
                x={x}
                y={height - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
              >
                {month}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}