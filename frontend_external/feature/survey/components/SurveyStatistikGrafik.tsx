"use client";

import { useMemo } from "react";
import {
  Users,
  Award,
  TrendingUp,
  Smile,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Frown,
  BarChart2,
  HelpCircle,
} from "lucide-react";
import { useSurveyStatistik } from "../hooks/Survey.hooks";

const JAWABAN_CONFIG = [
  {
    label: "Sangat Baik",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgLight: "bg-emerald-50 border-emerald-200",
    icon: Smile,
  },
  {
    label: "Baik",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgLight: "bg-blue-50 border-blue-200",
    icon: ThumbsUp,
  },
  {
    label: "Cukup",
    color: "bg-amber-500",
    textColor: "text-amber-700",
    bgLight: "bg-amber-50 border-amber-200",
    icon: Meh,
  },
  {
    label: "Kurang",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgLight: "bg-orange-50 border-orange-200",
    icon: ThumbsDown,
  },
  {
    label: "Kurang Sekali",
    color: "bg-rose-500",
    textColor: "text-rose-700",
    bgLight: "bg-rose-50 border-rose-200",
    icon: Frown,
  },
];

export default function SurveyStatistikGrafik() {
  const { data: stats, isLoading, refetch } = useSurveyStatistik();

  const totalResponden = stats?.totalResponden || 0;
  const persentaseKepuasan = stats?.persentaseKepuasan || 0;
  const rataRataSkor = stats?.rataRataSkor || 0;
  const distribusi = stats?.distribusiJawaban || {
    "Sangat Baik": 0,
    "Baik": 0,
    "Cukup": 0,
    "Kurang": 0,
    "Kurang Sekali": 0,
  };

  const getPredikat = (persen: number) => {
    if (persen >= 85) return { text: "Sangat Memuaskan", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (persen >= 70) return { text: "Memuaskan / Baik", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (persen >= 55) return { text: "Cukup Baik", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { text: "Perlu Peningkatan", color: "text-rose-600 bg-rose-50 border-rose-200" };
  };

  const predikat = getPredikat(persentaseKepuasan);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="h-44 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Responden */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Responden
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalResponden.toLocaleString("id-ID")}
            </span>
            <span className="text-xs text-slate-400">suara responden</span>
          </div>
        </div>

        {/* Indeks Rata-rata Skor */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rata-rata Skor
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Award size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {rataRataSkor}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 5.00</span>
          </div>
        </div>

        {/* Persentase Indeks Kepuasan */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Indeks Kepuasan (IKM)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {persentaseKepuasan}%
            </span>
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${predikat.color}`}>
              {predikat.text}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visual Grafik Batang Kepuasan Pengguna */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Grafik Kepuasan Layanan Pengguna
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribusi akumulasi jawaban pengunjung terhadap pertanyaan survey JDIH
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Segarkan Grafik
          </button>
        </div>

        {totalResponden === 0 ? (
          <div className="py-12 text-center">
            <HelpCircle size={36} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Belum ada respon survey yang terkumpul
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Grafik otomatis terisi saat pengunjung mengisi survey layanan di landing page.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {JAWABAN_CONFIG.map((cfg) => {
              const count = (distribusi as any)[cfg.label] || 0;
              const percent = totalResponden > 0 ? ((count / totalResponden) * 100).toFixed(1) : "0.0";
              const IconComp = cfg.icon;

              return (
                <div key={cfg.label} className="group">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <div className="flex items-center gap-2">
                      <IconComp size={15} className={cfg.textColor} />
                      <span>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-normal">{count} suara</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${cfg.textColor} ${cfg.bgLight}`}>
                        {percent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${cfg.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Detail Hasil per Pertanyaan */}
      {stats?.perPertanyaan && stats.perPertanyaan.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm mb-4">
            Rincian Hasil per Pertanyaan Survey
          </h4>
          <div className="divide-y divide-slate-100">
            {stats.perPertanyaan.map((item, idx) => (
              <div key={item.survey_pertanyaan_id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2 max-w-2xl">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {item.pertanyaan}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500">
                      Rata-rata: <strong className="text-slate-800">{item.rata_rata}</strong> / 5
                    </span>
                    <span className="rounded-lg bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {item.total_jawaban} jawaban
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-emerald-50/70 p-2 border border-emerald-100">
                    <span className="block text-[10px] text-emerald-600 font-medium">Sangat Baik</span>
                    <span className="text-xs font-bold text-emerald-800">{item.sangat_baik}</span>
                  </div>
                  <div className="rounded-xl bg-blue-50/70 p-2 border border-blue-100">
                    <span className="block text-[10px] text-blue-600 font-medium">Baik</span>
                    <span className="text-xs font-bold text-blue-800">{item.baik}</span>
                  </div>
                  <div className="rounded-xl bg-amber-50/70 p-2 border border-amber-100">
                    <span className="block text-[10px] text-amber-600 font-medium">Cukup</span>
                    <span className="text-xs font-bold text-amber-800">{item.cukup}</span>
                  </div>
                  <div className="rounded-xl bg-orange-50/70 p-2 border border-orange-100">
                    <span className="block text-[10px] text-orange-600 font-medium">Kurang</span>
                    <span className="text-xs font-bold text-orange-800">{item.kurang}</span>
                  </div>
                  <div className="rounded-xl bg-rose-50/70 p-2 border border-rose-100 col-span-2 sm:col-span-1">
                    <span className="block text-[10px] text-rose-600 font-medium">Kurang Sekali</span>
                    <span className="text-xs font-bold text-rose-800">{item.kurang_sekali}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
