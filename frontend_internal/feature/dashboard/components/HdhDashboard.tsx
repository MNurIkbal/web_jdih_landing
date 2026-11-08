"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Scale,
  FileCheck2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileText,
  Activity,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { usePengajuanList } from "@/feature/pengajuan-peraturan/hooks/PengajuanPeraturan.hooks";
import { useDokumenHukumList } from "@/feature/dokumen-hukum/hooks/DokumenHukum.hooks";

export default function HdhDashboard() {
  const { data: pengajuanRes, isLoading: loadingPengajuan } = usePengajuanList({
    page: 1,
    size: 50,
  });

  const { data: dokumenRes, isLoading: loadingDokumen } = useDokumenHukumList({
    page: 1,
    size: 10,
  });

  const pengajuanItems = (pengajuanRes as any)?.data || [];
  const totalPengajuan = (pengajuanRes as any)?.totalItems ?? (pengajuanRes as any)?.pagination?.total ?? pengajuanItems.length;

  const dokumenItems = (dokumenRes as any)?.data || [];
  const totalPublikasi = (dokumenRes as any)?.totalItems ?? (dokumenRes as any)?.pagination?.total ?? dokumenItems.length;

  const stats = useMemo(() => {
    let selarasCount = 0;
    let perluPenyesuaianCount = 0;
    let belumUjiCount = 0;

    pengajuanItems.forEach((item: any) => {
      const statusH = (item.status_harmonisasi || "").toLowerCase();
      const statusDok = (item.status || "").toLowerCase();
      const tahapan = (item.tahapan || "").toLowerCase();

      if (
        statusH.includes("perlu perbaikan") ||
        statusH.includes("bentrok") ||
        statusH.includes("tumpang tindih") ||
        statusDok.includes("perlu perbaikan")
      ) {
        perluPenyesuaianCount++;
      } else if (
        statusH.includes("selesai") ||
        statusH.includes("setuju") ||
        tahapan === "persetujuan" ||
        tahapan === "penetapan"
      ) {
        selarasCount++;
      } else {
        belumUjiCount++;
      }
    });

    const totalTested = selarasCount + perluPenyesuaianCount;
    const keselarasanPercentage =
      totalTested > 0
        ? Math.round((selarasCount / totalTested) * 100 * 10) / 10
        : totalPengajuan > 0
        ? 100
        : 0;

    return {
      selaras: selarasCount,
      perluPenyesuaian: perluPenyesuaianCount,
      belumUji: belumUjiCount,
      totalTested,
      indeksKeselarasan: keselarasanPercentage,
    };
  }, [pengajuanItems, totalPengajuan]);

  const recentDrafts = useMemo(() => {
    return pengajuanItems.slice(0, 6);
  }, [pengajuanItems]);

  const recentPublished = useMemo(() => {
    return dokumenItems.slice(0, 6);
  }, [dokumenItems]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* HERO BANNER HDH DINAMIS */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0c2444] via-[#0f325e] to-[#1a1c2e] p-6 sm:p-9 lg:p-12 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] opacity-10 [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl space-y-3.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
              <Scale size={14} className="text-amber-400" />
              <span>Modul Harmonisasi & Penyelarasan Dokumen Hukum (HDH)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Sistem Analisis Komparasi & Harmonisasi Regulasi
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Pusat kendali penelaahan dan pengujian keselarasan norma draf rancangan regulasi terhadap seluruh dokumen hukum yang telah terpublikasi. Memastikan produk hukum terbebas dari pertentangan hierarki (Lex Superior), tumpang tindih kewenangan, atau multitafsir.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/admin/pengajuan-peraturan"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-900/40 hover:from-amber-600 hover:to-amber-700 transition active:scale-95 cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Buka Harmonisasi Peraturan</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Skor Indeks Harmonisasi Dinamis (Berdasarkan rasio draf selaras vs draf perlu penyesuaian) */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:w-80 shrink-0 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Indeks Keselarasan Norma</span>
              <span className={`flex items-center gap-1 font-bold ${
                stats.indeksKeselarasan >= 80 ? "text-emerald-400" : "text-amber-400"
              }`}>
                {stats.indeksKeselarasan >= 80 ? (
                  <>
                    <CheckCircle2 size={13} />
                    Optimal
                  </>
                ) : (
                  <>
                    <AlertTriangle size={13} />
                    Evaluasi
                  </>
                )}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-amber-400">
                {loadingPengajuan ? "..." : `${stats.indeksKeselarasan}%`}
              </span>
              <span className="text-xs text-slate-400">Tingkat Konsistensi</span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(Math.max(stats.indeksKeselarasan, 8), 100)}%` }}
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Selaras: <strong className="text-emerald-400">{stats.selaras}</strong></span>
              <span>Revisi: <strong className="text-amber-400">{stats.perluPenyesuaian}</strong></span>
              <span>Total Diuji: <strong className="text-white">{stats.totalTested}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Statistik Kartu Indikator Dinamis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rancangan</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Layers size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loadingPengajuan ? "..." : totalPengajuan}
            </span>
            <span className="text-xs text-slate-400 font-medium">draf regulasi</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <Activity size={13} className="text-blue-500" />
            <span>Semua rancangan dalam siklus pembentukan</span>
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Status Selaras</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">
              {loadingPengajuan ? "..." : stats.selaras}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Tervalidasi Bebas Konflik</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Lolos komparasi terhadap seluruh regulasi publikasi
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Perlu Penyesuaian</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">
              {loadingPengajuan ? "..." : stats.perluPenyesuaian}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Indikasi Tumpang Tindih</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Diberikan saran rumusan revisi klausul
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Database Regulasi Acuan</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <FileCheck2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700">
              {loadingDokumen ? "..." : totalPublikasi}
            </span>
            <span className="text-xs text-purple-600 font-semibold">Regulasi Aktif</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Basis data komparasi kontekstual nasional
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom: Aktivitas Harmonisasi Terbaru & Daftar Acuan Regulasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Kolom Kiri: Rancangan Regulasi yang Sedang Diharmonisasi */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Scale size={18} className="text-amber-600" />
                <span>Rancangan Dalam Proses Harmonisasi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar pengajuan peraturan yang siap atau sedang diuji keselarasan normanya
              </p>
            </div>
            <Link
              href="/admin/pengajuan-peraturan"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {loadingPengajuan ? (
              <div className="p-10 text-center text-xs text-slate-400">
                Memuat data rancangan peraturan...
              </div>
            ) : recentDrafts.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                Belum ada data rancangan peraturan dalam sistem.
              </div>
            ) : (
              recentDrafts.map((draft: any) => {
                const statusH = draft.status_harmonisasi || "Belum Diharmonisasi";
                const isSelaras =
                  statusH.toLowerCase().includes("selesai") ||
                  statusH.toLowerCase().includes("disetujui") ||
                  draft.tahapan === "Persetujuan" ||
                  draft.tahapan === "Penetapan";
                const isWarning =
                  statusH.toLowerCase().includes("perlu perbaikan") ||
                  statusH.toLowerCase().includes("bentrok") ||
                  (draft.status || "").toLowerCase().includes("perlu perbaikan");

                return (
                  <div
                    key={draft.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase">
                          {draft.kategori || "Regulasi"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Tahun {draft.tahun || new Date().getFullYear()}
                        </span>
                        {draft.nomor_rancangan && (
                          <span className="text-[11px] text-slate-400">
                            • No: {draft.nomor_rancangan}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
                        {draft.judul}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        Tahapan saat ini: <strong className="text-slate-700">{draft.tahapan}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                          isWarning
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : isSelaras
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isWarning ? (
                          <AlertTriangle size={12} className="text-amber-600" />
                        ) : isSelaras ? (
                          <CheckCircle2 size={12} className="text-emerald-600" />
                        ) : (
                          <Clock size={12} className="text-slate-400" />
                        )}
                        <span>{statusH}</span>
                      </span>

                      <Link
                        href="/admin/pengajuan-peraturan"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition cursor-pointer shadow-2xs"
                        title="Buka Lembar Harmonisasi"
                      >
                        <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Database Regulasi Publikasi Acuan Komparasi */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileCheck2 size={18} className="text-purple-600" />
                  <span>Regulasi Acuan Terpublikasi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Basis norma hukum aktif yang digunakan sebagai pembanding
                </p>
              </div>
              <Link
                href="/admin/dokumen-hukum"
                className="text-xs font-bold text-purple-600 hover:text-purple-800 transition flex items-center gap-1"
              >
                <span>Semua</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {loadingDokumen ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Memuat regulasi acuan...
                </div>
              ) : recentPublished.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada dokumen hukum terpublikasi.
                </div>
              ) : (
                recentPublished.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-purple-50/30 hover:border-purple-200 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                        {doc.kategori || "Peraturan"}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {doc.status_dokumen || "Berlaku"}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1" title={doc.judul}>
                      {doc.judul}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Nomor: {doc.nomor || "-"} / {doc.tahun || "-"}</span>
                      <span>{doc.tanggal_penetapan ? doc.tanggal_penetapan.split("T")[0] : "-"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-600" />
              <span>Prinsip Komparasi Otomatis</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed font-normal">
              Setiap kali pengujian keselarasan dijalankan, mesin komparasi AI menelaah hierarki norma (Lex Superior, Lex Specialis, Lex Posterior) terhadap basis data dokumen hukum terbit untuk menjamin kepastian hukum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

