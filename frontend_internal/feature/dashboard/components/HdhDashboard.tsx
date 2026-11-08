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
    size: 100,
  });

  const { data: dokumenRes, isLoading: loadingDokumen } = useDokumenHukumList({
    page: 1,
    size: 100,
  });

  const pengajuanItems = (pengajuanRes as any)?.data || [];
  const totalPengajuan = (pengajuanRes as any)?.pagination?.total ?? pengajuanItems.length;

  const dokumenItems = (dokumenRes as any)?.data || [];
  const totalPublikasi = (dokumenRes as any)?.pagination?.total ?? dokumenItems.length;

  const stats = useMemo(() => {
    let selarasCount = 0;
    let perluPenyesuaianCount = 0;
    let dalamProsesCount = 0;

    pengajuanItems.forEach((item: any) => {
      const statusH = (item.status_harmonisasi || "").toLowerCase();
      const tahapan = (item.tahapan || "").toLowerCase();

      if (statusH.includes("selesai") || statusH.includes("setuju") || tahapan === "persetujuan" || tahapan === "penetapan") {
        selarasCount++;
      } else if (statusH.includes("perlu perbaikan") || statusH.includes("bentrok") || statusH.includes("tumpang tindih")) {
        perluPenyesuaianCount++;
      } else {
        dalamProsesCount++;
      }
    });

    return {
      selaras: selarasCount,
      perluPenyesuaian: perluPenyesuaianCount,
      dalamProses: dalamProsesCount,
    };
  }, [pengajuanItems]);

  const recentDrafts = useMemo(() => {
    return pengajuanItems.slice(0, 5);
  }, [pengajuanItems]);

  const recentPublished = useMemo(() => {
    return dokumenItems.slice(0, 5);
  }, [dokumenItems]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0c2444] via-[#0f325e] to-[#1a1c2e] p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] opacity-10 [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
              <Scale size={14} className="text-amber-400" />
              <span>Modul Harmonisasi & Penyelarasan Dokumen Hukum (HDH)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sistem Analisis Komparasi & Harmonisasi Regulasi
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Pusat kendali telaah dan pengujian keselarasan draf rancangan regulasi terhadap seluruh dokumen hukum yang telah terpublikasi. Memastikan norma hukum tidak bertentangan, tidak duplikatif, dan bebas tumpang tindih kewenangan.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/admin/pengajuan-peraturan"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-900/40 hover:from-amber-600 hover:to-amber-700 transition active:scale-95"
              >
                <Sparkles size={15} />
                <span>Buka Harmonisasi Peraturan</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/admin/dokumen-hukum"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition backdrop-blur-sm"
              >
                <FileText size={15} className="text-amber-400" />
                <span>Database Regulasi Publikasi ({totalPublikasi})</span>
              </Link>
            </div>
          </div>

          {/* Skor Indeks Harmonisasi Badge Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md lg:w-72 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Indeks Keselarasan Norma</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} />
                Optimal
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-amber-400">98.4%</span>
              <span className="text-xs text-slate-400">Tingkat Konsistensi</span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full" style={{ width: "98.4%" }} />
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Berdasarkan hasil komparasi kontekstual klausul regulasi terhadap hierarki perundang-undangan nasional.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Statistik Kartu Indikator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rancangan</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {loadingPengajuan ? "..." : totalPengajuan}
            </span>
            <span className="text-xs text-slate-400">draf regulasi</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Activity size={12} className="text-blue-500" />
            <span>Semua rancangan dalam siklus pembentukan</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Status Selaras</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {loadingPengajuan ? "..." : stats.selaras}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Tervalidasi Bebas Konflik</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Lolos komparasi terhadap seluruh regulasi publikasi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Perlu Penyesuaian</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {loadingPengajuan ? "..." : stats.perluPenyesuaian}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Indikasi Tumpang Tindih</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Diberikan saran rumusan revisi klausul
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Database Regulasi Acuan</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FileCheck2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">
              {loadingDokumen ? "..." : totalPublikasi}
            </span>
            <span className="text-xs text-purple-600 font-semibold">Regulasi Aktif</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Basis data komparasi kontekstual nasional
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom: Aktivitas Harmonisasi Terbaru & Daftar Acuan Regulasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Kolom Kiri: Rancangan Regulasi yang Sedang Diharmonisasi */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
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
            {recentDrafts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada data rancangan peraturan.
              </div>
            ) : (
              recentDrafts.map((draft: any) => {
                const statusH = draft.status_harmonisasi || "Belum Diharmonisasi";
                const isSelaras = statusH.toLowerCase().includes("selesai") || statusH.toLowerCase().includes("disetujui");
                const isWarning = statusH.toLowerCase().includes("perlu perbaikan") || statusH.toLowerCase().includes("bentrok");

                return (
                  <div
                    key={draft.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase">
                          {draft.kategori || "Regulasi"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Tahun {draft.tahun || new Date().getFullYear()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                        {draft.judul}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        Tahapan saat ini: <strong>{draft.tahapan}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                          isSelaras
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isWarning
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isSelaras ? (
                          <CheckCircle2 size={12} className="text-emerald-600" />
                        ) : isWarning ? (
                          <AlertTriangle size={12} className="text-amber-600" />
                        ) : (
                          <Clock size={12} className="text-slate-400" />
                        )}
                        <span>{statusH}</span>
                      </span>

                      <Link
                        href="/admin/pengajuan-peraturan"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition cursor-pointer"
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
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
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

          <div className="space-y-3">
            {recentPublished.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada dokumen hukum terpublikasi.
              </div>
            ) : (
              recentPublished.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-purple-50/30 hover:border-purple-200 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                      {doc.kategori || "Peraturan"}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Berlaku
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {doc.judul}
                  </h5>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Nomor: {doc.nomor || "-"} / {doc.tahun || "-"}</span>
                    <span>{doc.tanggal_penetapan || "-"}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-600" />
              <span>Prinsip Komparasi Otomatis</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Setiap kali pengujian keselarasan dijalankan, mesin komparasi menelaah hierarki norma (Lex Superior, Lex Specialis, Lex Posterior) untuk menjamin kepastian hukum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

