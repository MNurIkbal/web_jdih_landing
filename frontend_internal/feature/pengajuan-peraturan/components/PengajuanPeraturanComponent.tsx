"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ArrowRight,
  X,
  Upload,
  Calendar,
  Users,
  ShieldAlert,
  Send,
  Trash2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import {
  useAddPejabatPersetujuan,
  useAddPembahasanRapat,
  useCreatePengajuan,
  useDeletePejabatPersetujuan,
  useDeletePembahasanRapat,
  useDeletePengajuan,
  usePengajuanDetail,
  usePengajuanList,
  useSubmitHarmonisasi,
  useSubmitPenetapanPublikasi,
  useUpdateStatusPersetujuan,
  useUpdateTahapanPengajuan,
} from "../hooks/PengajuanPeraturan.hooks";
import { PengajuanPeraturan, TahapanPeraturan } from "../types/PengajuanPeraturan.type";
import { APP_BASE_URL } from "@/constanta/GlobalConstanta";
import { useAdminLayout } from "@/feature/layouts/AdminLayoutContext";

const TAHAPAN_STEPS: { stage: TahapanPeraturan; number: number; label: string; desc: string }[] = [
  { stage: "Pengajuan", number: 1, label: "Pengajuan", desc: "Drafting & Naskah Akademik" },
  { stage: "Pembahasan", number: 2, label: "Pembahasan", desc: "Rapat & Notulensi" },
  { stage: "Harmonisasi", number: 3, label: "Harmonisasi", desc: "Penyelarasan Hukum" },
  { stage: "Persetujuan", number: 4, label: "Persetujuan", desc: "Persetujuan Multi-Pejabat" },
  { stage: "Penetapan", number: 5, label: "Penetapan", desc: "Pengundangan & Publikasi" },
];

export default function PengajuanPeraturanComponent() {
  const { activeModule } = useAdminLayout();
  const [search, setSearch] = useState("");
  const [tahapanFilter, setTahapanFilter] = useState(
    activeModule === "HDH" ? "Harmonisasi" : ""
  );
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Jika berada di modul HDH, otomatis fokus pada tahapan Harmonisasi
  React.useEffect(() => {
    if (activeModule === "HDH") {
      setTahapanFilter("Harmonisasi");
    } else {
      setTahapanFilter("");
    }
  }, [activeModule]);

  const { data, isLoading } = usePengajuanList({
    search,
    tahapan: tahapanFilter,
    page,
    size: 10,
  });

  const items = data?.data || [];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {activeModule === "HDH" ? "Harmonisasi Dokumen Hukum (HDH)" : "Pengajuan Peraturan (JDIH)"}
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                activeModule === "HDH"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              Modul {activeModule}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeModule === "HDH"
              ? "Modul Khusus Harmonisasi: Penyelarasan materi rancangan hukum dengan peraturan perundang-undangan."
              : "Modul JDIH: Alur Pembuatan Pengajuan, Pembahasan Rapat, Persetujuan Pejabat, serta Penetapan & Publikasi Dokumen Internal."}
          </p>
        </div>
        {activeModule === "JDIH" && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Buat Pengajuan Baru
          </button>
        )}
      </div>

      {/* Stepper Overview Bar */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4">
          {TAHAPAN_STEPS.map((step) => (
            <div
              key={step.number}
              onClick={() => setTahapanFilter(tahapanFilter === step.stage ? "" : step.stage)}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                tahapanFilter === step.stage
                  ? "border-blue-500 bg-blue-50/70"
                  : "border-slate-100 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    tahapanFilter === step.stage
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {step.number}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {step.label}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul rancangan, nomor, pemrakarsa..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        {tahapanFilter && (
          <button
            onClick={() => setTahapanFilter("")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset Filter Tahapan
            <X size={14} />
          </button>
        )}
      </div>

      {/* List / Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Rancangan Peraturan</th>
                <th className="px-6 py-4">Pemrakarsa</th>
                <th className="px-6 py-4">Tahapan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi / Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Memuat data rancangan peraturan...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data pengajuan peraturan. Silakan buat pengajuan baru.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 line-clamp-2">
                        {item.judul}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <span>No: {item.nomor_rancangan || "-"}</span>
                        <span>•</span>
                        <span>Tahun {item.tahun || new Date().getFullYear()}</span>
                        <span>•</span>
                        <span>{item.kategori || "Peraturan"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {item.pemrakarsa || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                        <Clock size={12} />
                        Tahap: {item.tahapan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.status === "Ditetapkan" || item.status === "Disetujui"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : item.status === "Ditolak"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-blue-600 hover:text-white"
                      >
                        Proses 5 Tahapan
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Pengajuan Baru */}
      {isCreateOpen && (
        <CreatePengajuanModal onClose={() => setIsCreateOpen(false)} />
      )}

      {/* Modal Detail & Alur 5 Tahapan */}
      {selectedId && (
        <DetailTahapanModal
          draftId={selectedId}
          activeModule={activeModule}
          onClose={() => setSelectedId(null)}
        />
      )}
    </main>
  );
}

// ================= MODAL BUAT PENGAJUAN BARU =================
function CreatePengajuanModal({ onClose }: { onClose: () => void }) {
  const { mutate: createDraft, isPending } = useCreatePengajuan();

  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("Rancangan Peraturan Kepala Lembaga");
  const [nomorRancangan, setNomorRancangan] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [pemrakarsa, setPemrakarsa] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [fileDraft, setFileDraft] = useState<File | null>(null);
  const [fileNaskah, setFileNaskah] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;

    const fd = new FormData();
    fd.append("judul", judul);
    fd.append("kategori", kategori);
    fd.append("nomor_rancangan", nomorRancangan);
    fd.append("tahun", tahun);
    fd.append("pemrakarsa", pemrakarsa);
    fd.append("penanggung_jawab", penanggungJawab);
    fd.append("ringkasan", ringkasan);
    if (fileDraft) fd.append("file_draft", fileDraft);
    if (fileNaskah) fd.append("file_naskah_akademik", fileNaskah);

    createDraft(fd, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-white overflow-hidden animate-in fade-in duration-200">
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-8 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                Modul JDIH
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Tahap 1
              </span>
            </div>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              Pengajuan Rancangan Peraturan Baru
            </h3>
            <p className="text-xs text-slate-500">
              Unggah naskah awal dan naskah akademik untuk memulai alur legislasi dokumen hukum.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-5 max-w-5xl mx-auto w-full">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Judul Rancangan Peraturan *
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Rancangan Peraturan Kepala BIN tentang Pedoman Keamanan Informasi"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Rancangan Peraturan Kepala Lembaga">Rancangan Peraturan Kepala Lembaga</option>
                <option value="Rancangan Peraturan Bersama">Rancangan Peraturan Bersama</option>
                <option value="Rancangan Keputusan">Rancangan Keputusan</option>
                <option value="Rancangan Instruksi">Rancangan Instruksi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nomor Rancangan
              </label>
              <input
                type="text"
                value={nomorRancangan}
                onChange={(e) => setNomorRancangan(e.target.value)}
                placeholder="Contoh: R-01/PER/2026"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Tahun
              </label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Unit Pemrakarsa
              </label>
              <input
                type="text"
                value={pemrakarsa}
                onChange={(e) => setPemrakarsa(e.target.value)}
                placeholder="Contoh: Biro Hukum BIN"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Penanggung Jawab
              </label>
              <input
                type="text"
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                placeholder="Contoh: Direktur Regulasi"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Ringkasan / Latar Belakang
            </label>
            <textarea
              rows={3}
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              placeholder="Uraikan ringkasan materi muatan urgensi rancangan..."
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Upload File Draft Rancangan (PDF/DOC)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFileDraft(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Upload File Naskah Akademik (PDF/DOC)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFileNaskah(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan & Lanjutkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================= MODAL DETAIL & 5 TAHAPAN =================
function DetailTahapanModal({
  draftId,
  activeModule = "JDIH",
  onClose,
}: {
  draftId: number;
  activeModule?: "JDIH" | "HDH";
  onClose: () => void;
}) {
  const { data: draft, isLoading } = usePengajuanDetail(draftId);
  const [activeTab, setActiveTab] = useState<TahapanPeraturan>(
    activeModule === "HDH" ? "Harmonisasi" : "Pengajuan"
  );

  React.useEffect(() => {
    if (activeModule === "HDH") {
      setActiveTab("Harmonisasi");
    } else if (draft?.tahapan) {
      setActiveTab(draft.tahapan);
    }
  }, [draft?.tahapan, activeModule]);

  if (isLoading || !draft) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-slate-600 shadow-xl">
          Memuat data pengajuan peraturan...
        </div>
      </div>
    );
  }

  // Filter tahapan berdasarkan modul yang aktif
  // HDH: khusus tahapan Harmonisasi
  // JDIH: tahapan Pengajuan, Pembahasan, Persetujuan, Penetapan
  const visibleSteps =
    activeModule === "HDH"
      ? TAHAPAN_STEPS.filter((s) => s.stage === "Harmonisasi")
      : TAHAPAN_STEPS;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-white overflow-hidden animate-in fade-in duration-200">
      <div className="flex h-full w-full flex-col">
        {/* Modal Top Header Fullscreen */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-8 py-4">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2.5">
              <span
                className={`rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  activeModule === "HDH"
                    ? "bg-amber-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                Modul {activeModule}
              </span>
              <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {draft.kategori || "Rancangan Peraturan"}
              </span>
              <span className="text-xs text-slate-500">
                Tahap Saat Ini: <strong className="text-blue-700">{draft.tahapan}</strong>
              </span>
            </div>
            <h2 className="mt-1 truncate text-xl font-extrabold text-slate-900">
              {draft.judul}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="border-b border-slate-200 bg-white px-8 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-3 overflow-x-auto">
            {visibleSteps.map((step) => {
              const isActive = activeTab === step.stage;
              const isPast =
                TAHAPAN_STEPS.findIndex((s) => s.stage === draft.tahapan) >=
                step.number - 1;

              return (
                <button
                  key={step.number}
                  onClick={() => setActiveTab(step.stage)}
                  className={`flex flex-1 min-w-[170px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                    isActive
                      ? activeModule === "HDH"
                        ? "border-amber-600 bg-amber-50/60 text-amber-800 shadow-sm ring-1 ring-amber-500"
                        : "border-blue-600 bg-blue-50/60 text-blue-800 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200/80 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isActive
                        ? activeModule === "HDH"
                          ? "bg-amber-600 text-white"
                          : "bg-blue-600 text-white"
                        : isPast
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isPast && !isActive ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold leading-tight">
                      {step.label}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {step.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Content Area Fullscreen */}
        <div className="flex-1 overflow-y-auto px-8 py-6 max-w-6xl mx-auto w-full">
          {activeTab === "Pengajuan" && <TabPengajuan draft={draft} />}
          {activeTab === "Pembahasan" && <TabPembahasan draft={draft} />}
          {activeTab === "Harmonisasi" && <TabHarmonisasi draft={draft} />}
          {activeTab === "Persetujuan" && <TabPersetujuan draft={draft} />}
          {activeTab === "Penetapan" && <TabPenetapan draft={draft} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

// ------------------- TAHAP 1: PENGAJUAN VIEW -------------------
function TabPengajuan({ draft }: { draft: PengajuanPeraturan }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <h4 className="text-sm font-bold text-blue-900">
          Tahap 1: Pengajuan & Dokumen Rancangan
        </h4>
        <p className="mt-1 text-xs text-blue-700">
          Rancangan naskah peraturan diajukan oleh pemrakarsa lengkap dengan dokumen naskah akademik.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400">Judul Rancangan</p>
          <p className="mt-1 font-semibold text-slate-800">{draft.judul}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400">Nomor Rancangan</p>
          <p className="mt-1 font-semibold text-slate-800">{draft.nomor_rancangan || "-"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400">Pemrakarsa</p>
          <p className="mt-1 font-semibold text-slate-800">{draft.pemrakarsa || "-"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400">Penanggung Jawab</p>
          <p className="mt-1 font-semibold text-slate-800">{draft.penanggung_jawab || "-"}</p>
        </div>
      </div>

      {draft.ringkasan && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400">Ringkasan Materi / Latar Belakang</p>
          <p className="mt-1 text-sm text-slate-700 leading-relaxed">{draft.ringkasan}</p>
        </div>
      )}

      {/* File Download / View */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">File Draft Rancangan</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {draft.file_draft || "Belum ada file draft"}
              </p>
            </div>
          </div>
          {draft.file_draft && (
            <a
              href={`${APP_BASE_URL}/uploads/pengajuan-peraturan/${draft.file_draft}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Unduh
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">File Naskah Akademik</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {draft.file_naskah_akademik || "Belum ada naskah akademik"}
              </p>
            </div>
          </div>
          {draft.file_naskah_akademik && (
            <a
              href={`${APP_BASE_URL}/uploads/pengajuan-peraturan/${draft.file_naskah_akademik}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Unduh
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------- TAHAP 2: PEMBAHASAN VIEW -------------------
function TabPembahasan({ draft }: { draft: PengajuanPeraturan }) {
  const { mutate: addPembahasan, isPending } = useAddPembahasanRapat();
  const { mutate: deletePembahasan } = useDeletePembahasanRapat();

  const [judulRapat, setJudulRapat] = useState("");
  const [tanggalRapat, setTanggalRapat] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [keterangan, setKeterangan] = useState("");
  const [fileNotulensi, setFileNotulensi] = useState<File | null>(null);

  const handleUploadRapat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulRapat.trim()) return;

    const fd = new FormData();
    fd.append("judul_rapat", judulRapat);
    fd.append("tanggal_rapat", tanggalRapat);
    fd.append("keterangan", keterangan);
    if (fileNotulensi) fd.append("file_notulensi", fileNotulensi);

    addPembahasan(
      { draftId: draft.id, formData: fd },
      {
        onSuccess: () => {
          setJudulRapat("");
          setKeterangan("");
          setFileNotulensi(null);
        },
      }
    );
  };

  const pembahasanList = draft.pembahasan_list || [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <h4 className="text-sm font-bold text-blue-900">
          Tahap 2: Pembahasan Hasil Rapat
        </h4>
        <p className="mt-1 text-xs text-blue-700">
          Upload hasil rapat pembahasan regulasi: sertakan judul rapat, upload file notulensi/teks, dan catatan pembahasan.
        </p>
      </div>

      {/* Form Tambah Rapat */}
      <form
        onSubmit={handleUploadRapat}
        className="rounded-xl border border-slate-200 bg-slate-50/40 p-5 shadow-sm"
      >
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Upload Hasil Rapat Baru
        </h5>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Judul Rapat / Agenda *
            </label>
            <input
              type="text"
              required
              value={judulRapat}
              onChange={(e) => setJudulRapat(e.target.value)}
              placeholder="Contoh: Rapat Pleno I Pembahasan Pasal 1-10"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Tanggal Rapat
            </label>
            <input
              type="date"
              value={tanggalRapat}
              onChange={(e) => setTanggalRapat(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700">
            Teks Keterangan & Catatan Rapat
          </label>
          <textarea
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Tuliskan poin-poin hasil kesepakatan rapat..."
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Upload File Notulensi / Berita Acara (PDF/DOC)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFileNotulensi(e.target.files?.[0] || null)}
              className="mt-1 block text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
          >
            <Upload size={14} />
            {isPending ? "Mengunggah..." : "Simpan Hasil Rapat"}
          </button>
        </div>
      </form>

      {/* List Hasil Rapat */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Riwayat Hasil Rapat ({pembahasanList.length})
        </h5>
        {pembahasanList.length === 0 ? (
          <div className="mt-2 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            Belum ada data rapat pembahasan yang diunggah.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {pembahasanList.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {item.judul_rapat}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {item.tanggal_rapat ? item.tanggal_rapat.split("T")[0] : "-"}
                    </span>
                  </div>
                  {item.keterangan && (
                    <p className="text-xs text-slate-600">{item.keterangan}</p>
                  )}
                  {item.file_notulensi && (
                    <a
                      href={`${APP_BASE_URL}/uploads/pengajuan-peraturan/${item.file_notulensi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline pt-1"
                    >
                      <FileText size={12} />
                      Lihat Dokumen Notulensi
                    </a>
                  )}
                </div>
                <button
                  onClick={() => deletePembahasan(item.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------- TAHAP 3: HARMONISASI VIEW -------------------
function TabHarmonisasi({ draft }: { draft: PengajuanPeraturan }) {
  const { mutate: submitHarmonisasi, isPending } = useSubmitHarmonisasi();

  const [statusHarmonisasi, setStatusHarmonisasi] = useState(
    draft.status_harmonisasi || "Harmonisasi Selesai Disetujui"
  );
  const [catatan, setCatatan] = useState(draft.catatan_harmonisasi || "");
  const [fileHarmonisasi, setFileHarmonisasi] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("status_harmonisasi", statusHarmonisasi);
    fd.append("catatan_harmonisasi", catatan);
    if (fileHarmonisasi) fd.append("file_harmonisasi", fileHarmonisasi);

    submitHarmonisasi({ draftId: draft.id, formData: fd });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <h4 className="text-sm font-bold text-blue-900">
          Tahap 3: Harmonisasi Dokumen Hukum
        </h4>
        <p className="mt-1 text-xs text-blue-700">
          Penyelarasan ketentuan regulasi dengan peraturan perundang-undangan yang lebih tinggi atau setingkat.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 p-5 bg-white">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Status Harmonisasi
          </label>
          <select
            value={statusHarmonisasi}
            onChange={(e) => setStatusHarmonisasi(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="Sedang Diharmonisasi">Sedang Diharmonisasi</option>
            <option value="Harmonisasi Selesai Disetujui">Harmonisasi Selesai (Disetujui)</option>
            <option value="Perlu Perbaikan Harmonisasi">Perlu Perbaikan / Penyesuaian</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Catatan / Hasil Telaah Harmonisasi Hukum
          </label>
          <textarea
            rows={4}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tuliskan hasil harmonisasi, sinkronisasi pasal, atau rekomendasi penyelarasan..."
            className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Upload Berita Acara / Surat Keterangan Harmonisasi (PDF)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFileHarmonisasi(e.target.files?.[0] || null)}
            className="mt-1 block text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
          {draft.file_harmonisasi && (
            <p className="mt-1 text-xs text-slate-500">
              File tersimpan:{" "}
              <a
                href={`${APP_BASE_URL}/uploads/pengajuan-peraturan/${draft.file_harmonisasi}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {draft.file_harmonisasi}
              </a>
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Menyimpan..." : "Simpan Hasil Harmonisasi"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- TAHAP 4: PERSETUJUAN MULTI-PERSON VIEW -------------------
function TabPersetujuan({ draft }: { draft: PengajuanPeraturan }) {
  const { mutate: addPejabat, isPending: isAdding } = useAddPejabatPersetujuan();
  const { mutate: updateStatus } = useUpdateStatusPersetujuan();
  const { mutate: deletePejabat } = useDeletePejabatPersetujuan();

  const [namaPejabat, setNamaPejabat] = useState("");
  const [jabatan, setJabatan] = useState("");

  const handleAddPejabat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPejabat.trim() || !jabatan.trim()) return;

    addPejabat(
      {
        draftId: draft.id,
        payload: { nama_pejabat: namaPejabat, jabatan },
      },
      {
        onSuccess: () => {
          setNamaPejabat("");
          setJabatan("");
        },
      }
    );
  };

  const persetujuanList = draft.persetujuan_list || [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <h4 className="text-sm font-bold text-blue-900">
          Tahap 4: Persetujuan Multi-Pihak
        </h4>
        <p className="mt-1 text-xs text-blue-700">
          Daftar checklist persetujuan dari beberapa orang yang bersangkutan (pejabat terkait, pimpinan, tim legal) sebelum dapat ditetapkan.
        </p>
      </div>

      {/* Tambah Pejabat ke Checklist */}
      <form
        onSubmit={handleAddPejabat}
        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
      >
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Tambahkan Pihak / Pejabat untuk Persetujuan
        </h5>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="text"
            required
            value={namaPejabat}
            onChange={(e) => setNamaPejabat(e.target.value)}
            placeholder="Nama Pejabat / Pihak Bersangkutan"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            required
            value={jabatan}
            onChange={(e) => setJabatan(e.target.value)}
            placeholder="Jabatan / Instansi"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={14} />
            {isAdding ? "Menambahkan..." : "Tambah ke Checklist"}
          </button>
        </div>
      </form>

      {/* Checklist Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 bg-slate-50 font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama Pejabat</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Catatan</th>
              <th className="px-4 py-3 text-center">Update Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {persetujuanList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Belum ada pihak persetujuan yang didaftarkan.
                </td>
              </tr>
            ) : (
              persetujuanList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.nama_pejabat}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.jabatan}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        item.status === "Disetujui"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "Ditolak"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.catatan || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() =>
                          updateStatus({
                            persetujuanId: item.id,
                            payload: { status: "Disetujui" },
                          })
                        }
                        className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() =>
                          updateStatus({
                            persetujuanId: item.id,
                            payload: { status: "Ditolak" },
                          })
                        }
                        className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deletePejabat(item.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------- TAHAP 5: PENETAPAN & PUBLIKASI VIEW -------------------
function TabPenetapan({
  draft,
  onClose,
}: {
  draft: PengajuanPeraturan;
  onClose: () => void;
}) {
  const { mutate: penetapanPublikasi, isPending } = useSubmitPenetapanPublikasi();

  const [nomorPenetapan, setNomorPenetapan] = useState(
    draft.nomor_penetapan || draft.nomor_rancangan || ""
  );
  const [tanggalPenetapan, setTanggalPenetapan] = useState(
    draft.tanggal_penetapan ? draft.tanggal_penetapan.split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [tempatPenetapan, setTempatPenetapan] = useState("Jakarta");
  const [fileDokumenFinal, setFileDokumenFinal] = useState<File | null>(null);

  const isPublished = draft.status === "Ditetapkan" || !!draft.id_dokumen_hukum_terbit;

  const handlePenetapan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorPenetapan.trim()) return;

    const fd = new FormData();
    fd.append("nomor_penetapan", nomorPenetapan);
    fd.append("tanggal_penetapan", tanggalPenetapan);
    fd.append("tempat_penetapan", tempatPenetapan);
    if (fileDokumenFinal) fd.append("file_dokumen_final", fileDokumenFinal);

    penetapanPublikasi(
      { draftId: draft.id, formData: fd },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
        <h4 className="text-sm font-bold text-emerald-900">
          Tahap 5: Penetapan & Publikasi ke Frontend Internal
        </h4>
        <p className="mt-1 text-xs text-emerald-700">
          Setelah semua tahapan terpenuhi, lakukan penetapan resmi. Dokumen hukum secara otomatis dipublikasikan ke repositori <strong>Dokumen Hukum Internal</strong> saja.
        </p>
      </div>

      {isPublished ? (
        <div className="rounded-xl border border-emerald-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="mt-3 text-base font-bold text-slate-800">
            Peraturan Ini Telah Ditetapkan & Dipublikasikan
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            Nomor Penetapan: <strong>{draft.nomor_penetapan}</strong> | Terdaftar di Dokumen Hukum Internal (ID #{draft.id_dokumen_hukum_terbit})
          </p>
          <div className="mt-4">
            <a
              href="/admin/dokumen-hukum"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
            >
              Lihat di Menu Dokumen Hukum
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handlePenetapan}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nomor Peraturan Resmi (Penetapan) *
              </label>
              <input
                type="text"
                required
                value={nomorPenetapan}
                onChange={(e) => setNomorPenetapan(e.target.value)}
                placeholder="Contoh: PER-05/BIN/2026"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Tanggal Penetapan
              </label>
              <input
                type="date"
                value={tanggalPenetapan}
                onChange={(e) => setTanggalPenetapan(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Tempat Penetapan
            </label>
            <input
              type="text"
              value={tempatPenetapan}
              onChange={(e) => setTempatPenetapan(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Upload File Dokumen Resmi Final yang Sudah Bertandatangan (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFileDokumenFinal(e.target.files?.[0] || null)}
              className="mt-1 block text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Jika tidak diunggah, sistem akan menggunakan file draft yang diunggah pada Tahap 1.
            </p>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
            >
              <FileCheck size={16} />
              {isPending ? "Memproses Penetapan..." : "Tetapkan & Publikasikan ke Internal"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

