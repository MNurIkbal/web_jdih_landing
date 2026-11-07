"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  FileCheck,
  ChevronRight,
  ArrowRight,
  X,
  Upload,
  Send,
  Trash2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import {
  useAddPejabatPersetujuan,
  useAddPembahasanRapat,
  useCreatePengajuan,
  useDeletePejabatPersetujuan,
  useDeletePembahasanRapat,
  useDeletePengajuan,
  useMasterOptions,
  usePengajuanDetail,
  usePengajuanList,
  useSubmitHarmonisasi,
  useSubmitPenetapanPublikasi,
  useUpdateStatusPersetujuan,
  useUpdateTahapanPengajuan,
} from "../hooks/PengajuanPeraturan.hooks";
import { PengajuanPeraturan, TahapanPeraturan } from "../types/PengajuanPeraturan.type";
import {
  APP_BASE_URL,
  kategoriOptions,
  tipeDokumenOptions,
  bidangOptions,
  subjectOptions,
  tahunOptions,
  statusOptions,
} from "@/constanta/GlobalConstanta";
import { useAdminLayout } from "@/feature/layouts/AdminLayoutContext";
import { toast } from "sonner";
import FormDatePicker from "@/components/ui/FormDatePicker";
import FormSelectSearch, { type SelectSearchOption } from "@/components/ui/FormSelectSearch";
import {
  PengajuanPeraturanSchema,
  type PengajuanPeraturanFormValues,
} from "../schema/PengajuanPeraturan.schema";
import { fetchDokumenHukum } from "@/feature/dokumen-hukum/api/DokumenHukum.service";

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
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<PengajuanPeraturan | null>(null);

  const deleteMutation = useDeletePengajuan();

  // Jika berada di modul HDH, otomatis fokus pada tahapan Harmonisasi
  React.useEffect(() => {
    if (activeModule === "HDH") {
      setTahapanFilter("Harmonisasi");
    } else {
      setTahapanFilter("");
    }
  }, [activeModule]);

  const { data, isLoading, refetch, isFetching } = usePengajuanList({
    search,
    tahapan: tahapanFilter,
    page,
    size,
  });

  const items: PengajuanPeraturan[] = (data as any)?.data || [];
  const totalElements = (data as any)?.totalItems || items.length;
  const totalPages = (data as any)?.totalPages || Math.ceil(totalElements / size) || 1;

  const columns: DataTableColumn<PengajuanPeraturan>[] = useMemo(
    () => [
      {
        key: "judul",
        label: "Rancangan Dokumen Hukum",
        sortable: true,
        render: (_val, row) => (
          <div className="py-1">
            <div className="font-semibold text-slate-900 line-clamp-2 hover:text-blue-700 transition">
              {row.judul}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-500">
                No: {row.nomor_rancangan || "-"}
              </span>
              <span>•</span>
              <span>Tahun {row.tahun || new Date().getFullYear()}</span>
              <span>•</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {row.kategori || "Peraturan"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "pemrakarsa",
        label: "Pemrakarsa",
        width: "180px",
        render: (_val, row) => (
          <div className="text-xs font-semibold text-slate-700">
            {row.pemrakarsa || "-"}
            {row.penanggung_jawab && (
              <div className="text-[11px] text-slate-400 font-normal">
                PJ: {row.penanggung_jawab}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "tahapan",
        label: "Tahapan",
        width: "160px",
        render: (_val, row) => (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/80 shadow-xs">
            <Clock size={12} className="text-blue-600" />
            Tahap {row.tahapan}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "140px",
        render: (_val, row) => {
          const isDone = row.status === "Ditetapkan" || row.status === "Disetujui";
          const isReject = row.status === "Ditolak";
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                isDone
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isReject
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {row.status}
            </span>
          );
        },
      },
      {
        key: "aksi_alur",
        label: "Kelola Tahapan",
        align: "center",
        width: "170px",
        render: (_val, row) => (
          <button
            type="button"
            onClick={() => setSelectedId(row.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-blue-800 active:scale-95 cursor-pointer"
          >
            <span>Alur 5 Tahapan</span>
            <ChevronRight size={13} />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {/* Stepper Overview Filter Bar */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Filter Tahapan Regulasi & Harmonisasi:
          </span>
          {tahapanFilter && (
            <button
              onClick={() => setTahapanFilter("")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer"
            >
              <span>Reset Filter</span>
              <X size={13} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
          {TAHAPAN_STEPS.map((step) => {
            const isSelected = tahapanFilter === step.stage;
            return (
              <div
                key={step.number}
                onClick={() => setTahapanFilter(isSelected ? "" : step.stage)}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {step.label}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabel Utama menggunakan DataTable standar sistem */}
      <DataTable
        data={items}
        columns={columns}
        getRowId={(row) => row.id}
        title={activeModule === "HDH" ? "Harmonisasi Dokumen Hukum" : "Pengajuan Peraturan"}
        description={
          activeModule === "HDH"
            ? "Penyelarasan & harmonisasi materi rancangan hukum dengan peraturan perundang-undangan."
            : "Alur perancangan produk hukum: Pengajuan, Pembahasan, Harmonisasi, Persetujuan, hingga Penetapan & Publikasi Internal."
        }
        searchPlaceholder="Cari judul rancangan, nomor, pemrakarsa..."
        addButtonText={activeModule === "JDIH" ? "Buat Pengajuan Baru" : undefined}
        onAdd={activeModule === "JDIH" ? () => setIsCreateOpen(true) : undefined}
        onRefresh={() => refetch()}
        loading={isLoading || isFetching}
        page={page - 1}
        size={size}
        totalElements={totalElements}
        totalPages={totalPages}
        currentSearch={search}
        currentSort={sort}
        onPageChange={(newPage) => setPage(newPage + 1)}
        onSizeChange={(newSize) => {
          setSize(newSize);
          setPage(1);
        }}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onSort={(key, direction) => {
          setSort(direction ? `${key},${direction}` : "");
          setPage(1);
        }}
        actions={{
          view: (row) => setSelectedId(row.id),
          delete: (row) => setDeleteData(row),
        }}
      />

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

      {/* Modal Konfirmasi Hapus Pengajuan */}
      <ConfirmDeleteModal
        open={Boolean(deleteData)}
        title="Hapus Pengajuan Peraturan"
        description={`Apakah Anda yakin ingin menghapus draft peraturan "${deleteData?.judul}"? Tindakan ini tidak dapat dibatalkan.`}
        loading={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteData(null);
          }
        }}
        onConfirm={() => {
          if (deleteData?.id) {
            deleteMutation.mutate(deleteData.id, {
              onSuccess: () => {
                setDeleteData(null);
                refetch();
              },
            });
          }
        }}
      />
    </main>
  );
}

// ================= MODAL BUAT PENGAJUAN BARU =================
function CreatePengajuanModal({ onClose }: { onClose: () => void }) {
  const { mutate: createDraft, isPending } = useCreatePengajuan();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Form State (Default kosong semua, urutan dan nama field 100% sama dengan DokumenHukumForm)
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("");
  const [tipeDokumen, setTipeDokumen] = useState("");
  const [nomorRancangan, setNomorRancangan] = useState("");
  const [tahun, setTahun] = useState("");
  const [bidang, setBidang] = useState("");
  const [tempatPenetapan, setTempatPenetapan] = useState("");

  const [tanggalPenetapan, setTanggalPenetapan] = useState("");
  const [tanggalPengundangan, setTanggalPengundangan] = useState("");
  const [tanggalBerlaku, setTanggalBerlaku] = useState("");
  const [sumber, setSumber] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("Draft");

  // Identitas Pengusul & Catatan
  const [pemrakarsa, setPemrakarsa] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [ringkasan, setRingkasan] = useState("");

  // Upload berkas & preview
  const [fileDraft, setFileDraft] = useState<File | null>(null);
  const [fileNaskah, setFileNaskah] = useState<File | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>("");

  // Form Validation Errors State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Clean object URL on unmount
  useEffect(() => {
    return () => {
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    };
  }, [previewPdfUrl]);

  // Master Options dari API (Dynamic via React Query)
  const { data: apiKategori } = useMasterOptions("kategori");
  const { data: apiTipeDokumen } = useMasterOptions("tipe_dokumen");
  const { data: apiBidang } = useMasterOptions("bidang");
  const { data: apiSubject } = useMasterOptions("subject");
  const { data: apiStatus } = useMasterOptions("status");
  const { data: apiTahun } = useMasterOptions("tahun");

  // Fallback initial options jika API sedang dimuat
  const kategoriSelectOptions: SelectSearchOption[] = useMemo(() => {
    if (apiKategori && apiKategori.length > 0) return apiKategori;
    return kategoriOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }));
  }, [apiKategori]);

  const tipeDokumenSelectOptions: SelectSearchOption[] = useMemo(() => {
    if (apiTipeDokumen && apiTipeDokumen.length > 0) return apiTipeDokumen;
    return tipeDokumenOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }));
  }, [apiTipeDokumen]);

  const bidangSelectOptions: SelectSearchOption[] = useMemo(() => {
    if (apiBidang && apiBidang.length > 0) return apiBidang;
    return bidangOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }));
  }, [apiBidang]);

  const subjectSelectOptions: SelectSearchOption[] = useMemo(() => {
    if (apiSubject && apiSubject.length > 0) return apiSubject;
    return subjectOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }));
  }, [apiSubject]);

  const statusSelectOptions: SelectSearchOption[] = useMemo(() => {
    if (apiStatus && apiStatus.length > 0) return apiStatus;
    return statusOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }));
  }, [apiStatus]);

  const tahunSelectOptions: SelectSearchOption[] = useMemo(() => {
    if (apiTahun && apiTahun.length > 0) return apiTahun;
    return tahunOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }));
  }, [apiTahun]);

  // Dynamic API search handlers for select inputs
  const handleSearchKategori = async (q: string) => {
    const { fetchMasterOptions } = await import("../api/PengajuanPeraturan.service");
    return await fetchMasterOptions("kategori", q);
  };

  const handleSearchTipeDokumen = async (q: string) => {
    const { fetchMasterOptions } = await import("../api/PengajuanPeraturan.service");
    return await fetchMasterOptions("tipe_dokumen", q);
  };

  const handleSearchBidang = async (q: string) => {
    const { fetchMasterOptions } = await import("../api/PengajuanPeraturan.service");
    return await fetchMasterOptions("bidang", q);
  };

  const handleSearchSubject = async (q: string) => {
    const { fetchMasterOptions } = await import("../api/PengajuanPeraturan.service");
    return await fetchMasterOptions("subject", q);
  };

  const handleSearchTahun = async (q: string) => {
    const { fetchMasterOptions } = await import("../api/PengajuanPeraturan.service");
    return await fetchMasterOptions("tahun", q);
  };

  // Search API for Referensi Dokumen / Produk Hukum
  const handleSearchDokumenApi = async (query: string): Promise<SelectSearchOption[]> => {
    try {
      const res = await fetchDokumenHukum({ search: query, page: 0, size: 8 });
      const items = res?.content || (res as any)?.data || [];
      return items.map((doc: any) => ({
        value: doc.judul,
        label: doc.judul,
        subLabel: `${doc.kategori || "Dokumen"} • No ${doc.nomor || "-"} • Tahun ${doc.tahun || "-"}`,
      }));
    } catch {
      return [];
    }
  };

  // Open Preview PDF in modal
  const handleOpenPdfPreview = (file: File | null, title: string) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.info("Pratinjau langsung hanya tersedia untuk format PDF.");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewPdfUrl(url);
    setPreviewPdfTitle(title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Zod Schema identik dengan DokumenHukum
    const validation = PengajuanPeraturanSchema.safeParse({
      judul,
      kategori,
      tipe_dokumen: tipeDokumen,
      nomor_rancangan: nomorRancangan,
      tahun,
      bidang,
      tempat_penetapan: tempatPenetapan,
      tanggal_penetapan: tanggalPenetapan,
      tanggal_pengundangan: tanggalPengundangan,
      tanggal_berlaku: tanggalBerlaku,
      sumber,
      subject,
      status: status || "Draft",
      pemrakarsa,
      penanggung_jawab: penanggungJawab,
      ringkasan,
      file_draft: fileDraft,
      file_naskah_akademik: fileNaskah,
    });

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0]);
        formattedErrors[fieldName] = issue.message;
      });
      setFormErrors(formattedErrors);

      const firstError = Object.values(formattedErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setFormErrors({});

    const fd = new FormData();
    fd.append("judul", judul);
    fd.append("kategori", kategori);
    fd.append("nomor_rancangan", nomorRancangan);
    fd.append("tahun", tahun);
    fd.append("pemrakarsa", pemrakarsa);
    fd.append("penanggung_jawab", penanggungJawab);
    fd.append("tanggal_pengajuan", tanggalPengundangan || new Date().toISOString().split("T")[0]);
    if (tanggalPenetapan) fd.append("target_penetapan", tanggalPenetapan);

    const fullRingkasan = [
      ringkasan,
      `[Tipe: ${tipeDokumen}]`,
      `[Bidang: ${bidang}]`,
      `[Tempat Penetapan: ${tempatPenetapan}]`,
      `[Tanggal Berlaku: ${tanggalBerlaku}]`,
      sumber ? `[Sumber: ${sumber}]` : "",
      subject ? `[Subjek: ${subject}]` : "",
      status ? `[Status: ${status}]` : "",
    ]
      .filter(Boolean)
      .join(" ");

    fd.append("ringkasan", fullRingkasan);
    if (fileDraft) fd.append("file_draft", fileDraft);
    if (fileNaskah) fd.append("file_naskah_akademik", fileNaskah);

    createDraft(fd, {
      onSuccess: () => onClose(),
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] flex h-screen w-screen flex-col bg-white overflow-hidden">
      {/* Header Modal Fullscreen */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              Pengajuan Rancangan Dokumen Hukum Baru
            </h3>
            <p className="text-xs text-slate-500">
              Formulir terstandar Dokumen Hukum JDIH. Status awal pengajuan adalah Draft sebelum ditindaklanjuti.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 shadow-sm cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form Body - Full Width & Scrollbar di pojok kanan layar */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar">
        <div className="w-full px-6 sm:px-10 lg:px-16 py-8 space-y-8">
          {/* Section 01: Informasi Dokumen (Persis DokumenHukumForm) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                01
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Informasi Dokumen
                </h4>
                <p className="text-xs text-slate-400">Informasi dasar dokumen hukum yang diajukan</p>
              </div>
            </div>

            {/* JUDUL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Judul <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => {
                  setJudul(e.target.value);
                  if (formErrors.judul) setFormErrors((prev) => ({ ...prev, judul: "" }));
                }}
                placeholder="Masukkan judul dokumen hukum"
                className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition ${
                  formErrors.judul
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {formErrors.judul && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.judul}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* KATEGORI */}
              <div>
                <FormSelectSearch
                  label="Kategori"
                  required
                  value={kategori}
                  onChange={(val) => {
                    setKategori(val);
                    if (formErrors.kategori) setFormErrors((prev) => ({ ...prev, kategori: "" }));
                  }}
                  options={kategoriSelectOptions}
                  onSearchApi={handleSearchKategori}
                  error={formErrors.kategori}
                  placeholder="Pilih kategori..."
                  searchPlaceholder="Cari kategori dari API..."
                />
              </div>

              {/* TIPE DOKUMEN */}
              <div>
                <FormSelectSearch
                  label="Tipe Dokumen"
                  value={tipeDokumen}
                  onChange={(val) => {
                    setTipeDokumen(val);
                    if (formErrors.tipe_dokumen) setFormErrors((prev) => ({ ...prev, tipe_dokumen: "" }));
                  }}
                  options={tipeDokumenSelectOptions}
                  onSearchApi={handleSearchTipeDokumen}
                  error={formErrors.tipe_dokumen}
                  placeholder="Pilih tipe dokumen..."
                  searchPlaceholder="Cari tipe dokumen dari API..."
                />
              </div>

              {/* NOMOR */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nomor <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={nomorRancangan}
                  onChange={(e) => {
                    setNomorRancangan(e.target.value);
                    if (formErrors.nomor_rancangan) setFormErrors((prev) => ({ ...prev, nomor_rancangan: "" }));
                  }}
                  placeholder="Masukkan nomor dokumen"
                  className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none transition ${
                    formErrors.nomor_rancangan
                      ? "border-rose-400 ring-2 ring-rose-100"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.nomor_rancangan && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.nomor_rancangan}</p>
                )}
              </div>

              {/* TAHUN */}
              <div>
                <FormSelectSearch
                  label="Tahun"
                  required
                  value={tahun}
                  onChange={(val) => {
                    setTahun(val);
                    if (formErrors.tahun) setFormErrors((prev) => ({ ...prev, tahun: "" }));
                  }}
                  options={tahunSelectOptions}
                  onSearchApi={handleSearchTahun}
                  error={formErrors.tahun}
                  placeholder="Pilih tahun..."
                  searchPlaceholder="Cari tahun dari API..."
                />
              </div>

              {/* BIDANG */}
              <div>
                <FormSelectSearch
                  label="Bidang"
                  required
                  value={bidang}
                  onChange={(val) => {
                    setBidang(val);
                    if (formErrors.bidang) setFormErrors((prev) => ({ ...prev, bidang: "" }));
                  }}
                  options={bidangSelectOptions}
                  onSearchApi={handleSearchBidang}
                  error={formErrors.bidang}
                  placeholder="Pilih bidang..."
                  searchPlaceholder="Cari bidang dari API..."
                />
              </div>

              {/* TEMPAT PENETAPAN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tempat Penetapan <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={tempatPenetapan}
                  onChange={(e) => {
                    setTempatPenetapan(e.target.value);
                    if (formErrors.tempat_penetapan) setFormErrors((prev) => ({ ...prev, tempat_penetapan: "" }));
                  }}
                  placeholder="Contoh: Jakarta, Surabaya"
                  className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none transition ${
                    formErrors.tempat_penetapan
                      ? "border-rose-400 ring-2 ring-rose-100"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.tempat_penetapan && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.tempat_penetapan}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 02: Detail Penetapan & Pengusul (Persis DokumenHukumForm) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                02
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Detail Penetapan
                </h4>
                <p className="text-xs text-slate-400">Informasi tanggal, klasifikasi dokumen, dan unit pemrakarsa</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* TANGGAL PENETAPAN */}
              <div>
                <FormDatePicker
                  label="Tanggal Penetapan"
                  required
                  value={tanggalPenetapan}
                  onChange={(d) => {
                    setTanggalPenetapan(d);
                    if (formErrors.tanggal_penetapan) setFormErrors((prev) => ({ ...prev, tanggal_penetapan: "" }));
                  }}
                  error={formErrors.tanggal_penetapan}
                  placeholder="Pilih tanggal penetapan..."
                />
              </div>

              {/* TANGGAL PENGUNDANGAN */}
              <div>
                <FormDatePicker
                  label="Tanggal Pengundangan"
                  required
                  value={tanggalPengundangan}
                  onChange={(d) => {
                    setTanggalPengundangan(d);
                    if (formErrors.tanggal_pengundangan) setFormErrors((prev) => ({ ...prev, tanggal_pengundangan: "" }));
                  }}
                  error={formErrors.tanggal_pengundangan}
                  placeholder="Pilih tanggal pengundangan..."
                />
              </div>

              {/* TANGGAL BERLAKU */}
              <div>
                <FormDatePicker
                  label="Tanggal Berlaku"
                  required
                  value={tanggalBerlaku}
                  onChange={(d) => {
                    setTanggalBerlaku(d);
                    if (formErrors.tanggal_berlaku) setFormErrors((prev) => ({ ...prev, tanggal_berlaku: "" }));
                  }}
                  error={formErrors.tanggal_berlaku}
                  placeholder="Pilih tanggal berlaku..."
                />
              </div>

              {/* SUMBER */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sumber
                </label>
                <input
                  type="text"
                  value={sumber}
                  onChange={(e) => setSumber(e.target.value)}
                  placeholder="Masukkan sumber dokumen"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              {/* SUBJECT */}
              <div>
                <FormSelectSearch
                  label="Subject"
                  value={subject}
                  onChange={(val) => {
                    setSubject(val);
                    if (formErrors.subject) setFormErrors((prev) => ({ ...prev, subject: "" }));
                  }}
                  options={subjectSelectOptions}
                  onSearchApi={handleSearchSubject}
                  error={formErrors.subject}
                  placeholder="Pilih subject..."
                  searchPlaceholder="Cari subject dari API..."
                />
              </div>

              {/* STATUS */}
              <div>
                <FormSelectSearch
                  label="Status"
                  required
                  value={status}
                  onChange={(val) => setStatus(val)}
                  options={statusSelectOptions}
                  placeholder="Pilih status..."
                  searchPlaceholder="Cari status..."
                />
              </div>

              {/* UNIT PEMRAKARSA */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Unit Pemrakarsa <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={pemrakarsa}
                  onChange={(e) => {
                    setPemrakarsa(e.target.value);
                    if (formErrors.pemrakarsa) setFormErrors((prev) => ({ ...prev, pemrakarsa: "" }));
                  }}
                  placeholder="Contoh: Biro Hukum BIN"
                  className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none transition ${
                    formErrors.pemrakarsa
                      ? "border-rose-400 ring-2 ring-rose-100"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.pemrakarsa && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.pemrakarsa}</p>
                )}
              </div>

              {/* PENANGGUNG JAWAB */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Penanggung Jawab Perumusan
                </label>
                <input
                  type="text"
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                  placeholder="Contoh: Direktur Regulasi Keamanan"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Ringkasan / Latar Belakang Urgensi
              </label>
              <textarea
                rows={3}
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                placeholder="Uraikan latar belakang perlunya penyusunan regulasi ini..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3.5 text-sm focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Section 03: Berkas Dokumen & Pratinjau (Persis DokumenHukumForm) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">
                03
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Berkas Dokumen
                </h4>
                <p className="text-xs text-slate-400">Upload dokumen dalam format PDF atau DOC. Pratinjau PDF tersedia sebelum disimpan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* File Dokumen Utama / Draft */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  File Dokumen (PDF) <span className="text-rose-500 ml-1">*</span>
                </label>
                <div
                  className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                    formErrors.file_draft
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-slate-200 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    type="file"
                    id="file-draft-input"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setFileDraft(f);
                      if (formErrors.file_draft) setFormErrors((prev) => ({ ...prev, file_draft: "" }));
                    }}
                  />
                  <label htmlFor="file-draft-input" className="cursor-pointer block">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mx-auto mb-3">
                      <Upload size={22} />
                    </div>
                    {fileDraft ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{fileDraft.name}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                          Berkas terpilih ({(fileDraft.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Pilih Berkas Dokumen (PDF)</p>
                        <p className="text-[11px] text-slate-400 mt-1">Maksimal ukuran file 50 MB</p>
                      </div>
                    )}
                  </label>

                  {/* Tombol Preview PDF jika file draft sudah dipilih */}
                  {fileDraft && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPdfPreview(fileDraft, `Preview Dokumen: ${fileDraft.name}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
                      >
                        <ExternalLink size={13} />
                        <span>Pratinjau PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileDraft(null)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
                {formErrors.file_draft && (
                  <p className="text-xs text-rose-500 mt-1.5">{formErrors.file_draft}</p>
                )}
              </div>

              {/* File Abstrak / Naskah Akademik */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  File Abstrak / Naskah Akademik
                </label>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center hover:border-amber-400 hover:bg-amber-50/30 transition">
                  <input
                    type="file"
                    id="file-naskah-input"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setFileNaskah(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="file-naskah-input" className="cursor-pointer block">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mx-auto mb-3">
                      <BookOpen size={22} />
                    </div>
                    {fileNaskah ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{fileNaskah.name}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                          Berkas terpilih ({(fileNaskah.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Pilih File Abstrak (PDF/DOC)</p>
                        <p className="text-[11px] text-slate-400 mt-1">Opsional, jika naskah penunjang tersedia</p>
                      </div>
                    )}
                  </label>

                  {/* Tombol Preview PDF jika file naskah dipilih */}
                  {fileNaskah && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPdfPreview(fileNaskah, `Preview Abstrak: ${fileNaskah.name}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition cursor-pointer"
                      >
                        <ExternalLink size={13} />
                        <span>Pratinjau PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileNaskah(null)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 pb-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              <FileCheck size={16} />
              {isPending ? "Menyimpan Draft..." : "Simpan Pengajuan (Draft)"}
            </button>
          </div>
        </div>
      </form>

      {/* Modal Preview PDF Instan */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 lg:p-10 animate-in fade-in duration-200">
          <div className="flex flex-col h-full w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 truncate max-w-lg">
                    {previewPdfTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500">Pratinjau dokumen sebelum berkas diunggah dan disimpan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPdfUrl(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-100">
              <iframe
                src={previewPdfUrl}
                className="w-full h-full border-none"
                title="Preview PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  React.useEffect(() => {
    if (activeModule === "HDH") {
      setActiveTab("Harmonisasi");
    } else if (draft?.tahapan) {
      setActiveTab(draft.tahapan);
    }
  }, [draft?.tahapan, activeModule]);

  if (!mounted) return null;

  if (isLoading || !draft) {
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-slate-600 shadow-xl">
          Memuat data pengajuan peraturan...
        </div>
      </div>,
      document.body
    );
  }

  // Filter tahapan berdasarkan modul yang aktif
  // HDH: khusus tahapan Harmonisasi
  // JDIH: tahapan Pengajuan, Pembahasan, Persetujuan, Penetapan
  const visibleSteps =
    activeModule === "HDH"
      ? TAHAPAN_STEPS.filter((s) => s.stage === "Harmonisasi")
      : TAHAPAN_STEPS;

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] flex h-screen w-screen flex-col bg-white overflow-hidden">
      <div className="flex h-full w-full flex-col">
        {/* Modal Top Header Fullscreen */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-xs">
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 shadow-sm cursor-pointer"
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
                  className={`flex flex-1 min-w-[170px] items-center gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
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

        {/* Stage Content Area Fullscreen - Full width & scrollbar di pojok kanan layar */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar">
          <div className="w-full px-6 sm:px-10 lg:px-16 py-8">
            {activeTab === "Pengajuan" && (
              <TabPengajuan
                draft={draft}
                onNext={() => setActiveTab("Pembahasan")}
              />
            )}
            {activeTab === "Pembahasan" && <TabPembahasan draft={draft} />}
            {activeTab === "Harmonisasi" && <TabHarmonisasi draft={draft} />}
            {activeTab === "Persetujuan" && <TabPersetujuan draft={draft} />}
            {activeTab === "Penetapan" && <TabPenetapan draft={draft} onClose={onClose} />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ------------------- TAHAP 1: PENGAJUAN VIEW -------------------
function TabPengajuan({
  draft,
  onNext,
}: {
  draft: PengajuanPeraturan;
  onNext?: () => void;
}) {
  const { mutate: updateTahap, isPending } = useUpdateTahapanPengajuan();

  const handleKirimKeVerifikator = () => {
    updateTahap(
      {
        id: draft.id,
        payload: {
          tahapan: "Pembahasan",
          status: "Proses",
        },
      },
      {
        onSuccess: () => {
          if (onNext) onNext();
        },
      }
    );
  };

  const isSudahLanjut = draft.tahapan !== "Pengajuan";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-blue-900">
            Tahap 1: Pengajuan & Dokumen Rancangan
          </h4>
          <p className="mt-1 text-xs text-blue-700">
            Status dokumen: <strong className="font-semibold text-slate-800">{draft.status}</strong>. Kirim ke verifikator untuk memulai pembahasan dan rapat tindak lanjut.
          </p>
        </div>
        {!isSudahLanjut ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handleKirimKeVerifikator}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send size={14} />
            <span>{isPending ? "Mengirim..." : "Kirim ke Verifikator (Tahap Pembahasan)"}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 shrink-0">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Terkirim ke Verifikator (Tahap {draft.tahapan})
          </span>
        )}
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

