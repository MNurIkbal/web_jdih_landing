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
} from "lucide-react";
import { useMemo, useState } from "react";
import { useWebSumaryDashboard, useWebSumaryGrafik } from "@/feature/web";

type SummaryCard = {
  title: string;
  value: string;
  change: string;
  description: string;
  href: string;
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
  } = useWebSumaryDashboard();

  const {
    data: grafikResponse,
    isLoading: isLoadingGrafik,
    isError: isErrorGrafik,
  } = useWebSumaryGrafik();

  const summaryData = summaryResponse?.data;

  const totalDokumen = summaryData?.dokumen?.total ?? 0;

  const totalPeraturan = summaryData?.dokumen?.peraturan ?? 0;

  const totalKeputusan = summaryData?.dokumen?.keputusan ?? 0;

  const totalPerundangUndangan =
    summaryData?.dokumen?.perundang_undangan ?? 0;

  const totalBerita = summaryData?.berita?.total ?? 0;

  const tahunData: TahunData[] = useMemo(() => {
    const data = grafikResponse?.data?.tahun ?? [];

    return [...data].sort((a, b) => a.tahun - b.tahun);
  }, [grafikResponse]);

  const summaryCards: SummaryCard[] = [
    {
      title: "Perundang-Undangan",
      value: isLoadingSummary
        ? "..."
        : totalPerundangUndangan.toLocaleString("id-ID"),
      change: "",
      description: "  ",
      icon: FileText,
      href: "/admin/dokumen",
    },
    {
      title: "Peraturan",
      value: isLoadingSummary
        ? "..."
        : totalPeraturan.toLocaleString("id-ID"),
      change: "",
      description: "dokumen aktif",
      icon: Gavel,
      href: "/admin/dokumen",
    },
    {
      title: "Keputusan",
      value: isLoadingSummary
        ? "..."
        : totalKeputusan.toLocaleString("id-ID"),
      change: "",
      description: "dokumen aktif",
      icon: Scale,
      href: "/admin/dokumen",
    },
    {
      title: "Berita",
      value: isLoadingSummary
        ? "..."
        : totalBerita.toLocaleString("id-ID"),
      change: "",
      description: "berita dipublikasikan",
      icon: Newspaper,
      href: "/admin/berita",
    },
  ];

  const chartSeries: ChartSeries[] = [
    {
      name: "Dokumen",
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
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] animate-pulse rounded-full bg-blue-200/20 blur-3xl" />

        <div
          className="absolute right-[-120px] top-[180px] h-[420px] w-[420px] rounded-full bg-indigo-200/20 blur-3xl"
          style={{
            animation: "float 8s ease-in-out infinite",
          }}
        />

        <div
          className="absolute bottom-[-180px] left-[35%] h-[450px] w-[450px] rounded-full bg-slate-300/20 blur-3xl"
          style={{
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent_35%)]" />
      </div>

  

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-6 sm:px-7 lg:px-8">
        <section className="animate-[fadeInUp_0.7s_ease-out] relative mb-7 overflow-hidden rounded-[28px] bg-slate-950 shadow-2xl">
          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[45px] border-white/[0.03]" />

          <div className="pointer-events-none absolute right-24 top-16 h-56 w-56 rounded-full border border-white/[0.06]" />

          <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-80 rounded-full border-[35px] border-white/[0.03]" />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.12),transparent_35%)]" />

          <div className="relative grid min-h-[300px] lg:grid-cols-2">
            {/* HERO CONTENT */}

            <div className="relative z-10 flex flex-col justify-center p-7 sm:p-9 lg:p-12">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white shadow-lg backdrop-blur-sm transition-transform duration-500 hover:scale-110">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    JDIH BIN
                  </p>

                  <p className="text-xs text-slate-400">
                    Badan Intelijen Negara
                  </p>
                </div>
              </div>

              <h2 className="max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Pusat Dokumentasi dan Informasi Hukum
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Kelola produk hukum, dokumentasi, publikasi berita, dan
                informasi hukum secara terstruktur, aman, dan mudah dipantau.
              </p>
            </div>

            {/* HERO VISUAL */}

            <div className="relative hidden min-h-[300px] lg:block">
              <div
                className="absolute right-14 top-1/2 -translate-y-1/2"
                style={{
                  animation: "float 6s ease-in-out infinite",
                }}
              >
                <div className="flex h-64 w-64 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
                  <div className="flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
                      <BookOpen className="h-16 w-16" />
                    </div>
                  </div>
                </div>
              </div>

              {/* STATUS CARD */}

              <div className="absolute bottom-8 left-10 w-52 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:-translate-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Sistem Aktif
                </p>

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">
                    100%
                  </p>

                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full w-[100%] rounded-full bg-emerald-400"
                    style={{
                      animation: "progress 1.5s ease-out",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title || `summary-card-${index}`}
                className="group animate-[fadeInUp_0.6s_ease-out] relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-slate-300 hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-slate-50 transition-all duration-500 group-hover:scale-[2.5] group-hover:bg-slate-100" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-950 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-slate-950" />
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <div className="mt-1 flex items-end gap-3">
                    <p className="text-3xl font-bold text-slate-950">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="animate-[fadeInUp_0.9s_ease-out] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm">
          {/* CHART HEADER */}

          <div className="flex flex-col gap-5 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition-transform duration-300 hover:scale-110">
                <BarChart3 className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Statistik Dokumen Hukum
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Perkembangan jumlah dokumen berdasarkan tahun
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {chartSeries.map((series) => (
                <Legend
                  key={series.name}
                  label={series.name}
                  color={series.color}
                />
              ))}
            </div>
          </div>

          {/* CHART */}

          <div className="px-3 py-4 sm:px-5 sm:py-5">
            {isLoadingGrafik ? (
              <div className="flex h-[350px] items-center justify-center text-sm text-slate-400">
                Memuat grafik...
              </div>
            ) : isErrorGrafik ? (
              <div className="flex h-[350px] items-center justify-center text-sm text-red-400">
                Gagal mengambil data grafik.
              </div>
            ) : (
              <LineChart
                chartSeries={chartSeries}
                months={months}
                gridValues={gridValues}
              />
            )}
          </div>
        </section>

        {/* Optional supaya variable summary error tetap digunakan */}
        {isErrorSummary && (
          <div className="mt-3 text-xs text-red-400">
            Gagal mengambil summary dashboard.
          </div>
        )}
      </div>

      {/* =====================================================
          CUSTOM ANIMATION
      ===================================================== */}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes progress {
          from {
            width: 0;
          }

          to {
            width: 99%;
          }
        }
      `}</style>
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