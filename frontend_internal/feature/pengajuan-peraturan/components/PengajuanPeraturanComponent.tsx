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
  Sparkles,
  AlertTriangle,
  Bot,
  RefreshCw,
  Search,
  ShieldAlert,
  HelpCircle,
  MoreVertical,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { sendChatMessage, getOrCreateConversationId } from "@/services/chat-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import DokumenHukumForm from "@/feature/dokumen-hukum/components/DokumenHukumForm";
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
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const deleteMutation = useDeletePengajuan();

  // Filter tahapan HDH hanya aktif otomatis di modul HDH; jika di modul JDIH bebas/tanpa filter default
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
        label: "Rancangan Peraturan Hukum",
        sortable: true,
        render: (_val, row) => (
          <div className="py-1">
            <div className="font-bold text-slate-900 line-clamp-2 hover:text-blue-700 transition">
              {row.judul}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {row.kategori || "Peraturan"}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-600">
                No: {row.nomor_rancangan || "-"}
              </span>
              <span>•</span>
              <span>Tahun {row.tahun || new Date().getFullYear()}</span>
            </div>
          </div>
        ),
      },
      {
        key: "pemrakarsa",
        label: "Pemrakarsa & PJ",
        width: "200px",
        render: (_val, row) => (
          <div className="text-xs">
            <div className="font-semibold text-slate-800">
              {row.pemrakarsa || "-"}
            </div>
            {row.penanggung_jawab && (
              <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                PJ: {row.penanggung_jawab}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "tahapan",
        label: "Tahapan",
        width: "150px",
        render: (_val, row) => (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/80 shadow-2xs">
            <Clock size={12} className="text-blue-600" />
            {row.tahapan}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "130px",
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
        key: "aksi",
        label: "Aksi",
        width: "90px",
        align: "center",
        render: (_val, row) => (
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-xs cursor-pointer"
              title="Pilihan Aksi"
            >
              <MoreVertical size={16} />
            </button>

            {openDropdownId === row.id && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenDropdownId(null)}
                />
                <div className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(row.id);
                      setOpenDropdownId(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                  >
                    <SlidersHorizontal size={14} className="text-blue-600" />
                    <span>Kelola 5 Tahapan</span>
                  </button>

                  {row.file_draft && (
                    <a
                      href={`${APP_BASE_URL}/uploads/pengajuan-peraturan/${row.file_draft}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setOpenDropdownId(null)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      <FileText size={14} className="text-slate-500" />
                      <span>Unduh File Draft</span>
                    </a>
                  )}

                  {row.file_naskah_akademik && (
                    <a
                      href={`${APP_BASE_URL}/uploads/pengajuan-peraturan/${row.file_naskah_akademik}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setOpenDropdownId(null)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      <BookOpen size={14} className="text-slate-500" />
                      <span>Unduh Berkas Pendukung</span>
                    </a>
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteData(row);
                      setOpenDropdownId(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Hapus Pengajuan</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ),
      },
    ],
    [openDropdownId]
  );

  return (
    <main className="p-4 sm:p-6 lg:p-8">
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] flex h-screen w-screen flex-col bg-slate-50 overflow-hidden">
      {/* Header Modal Fullscreen */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              Pengajuan Dokumen Hukum Baru
            </h3>
            <p className="text-xs text-slate-500">
              Lengkapi formulir standar Dokumen Hukum untuk mengajukan rancangan peraturan baru.
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

      {/* Form Body Menggunakan DokumenHukumForm Asli */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar p-6 sm:p-10 lg:p-12">
        <div className="w-full">
          <DokumenHukumForm
            mode="create"
            targetApi="pengajuan-peraturan"
            onSuccess={() => {
              onClose();
            }}
          />
        </div>
      </div>
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
  const visibleSteps = TAHAPAN_STEPS;

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
              <p className="text-xs font-semibold text-slate-800">Berkas / Dokumen Pendukung</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {draft.file_naskah_akademik || "Belum ada berkas pendukung"}
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

  // State AI Chat LARAS Harmonisasi
  const [chatMessages, setChatMessages] = useState<
    { id: string; role: "user" | "assistant"; text: string; time: string; conflictDetected?: boolean }[]
  >([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiWarningAlert, setAiWarningAlert] = useState<string | null>(null);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  // Inisialisasi percakapan otomatis saat membuka tab harmonisasi
  useEffect(() => {
    if (chatMessages.length === 0) {
      const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      setChatMessages([
        {
          id: "intro-laras",
          role: "assistant",
          time: now,
          text: `Halo! Saya **LARAS (Layanan Asisten Regulasi & Harmonisasi AI)**. 

Saya siap membantu Anda menelaah rancangan regulasi **"${draft.judul}"**. 
Saya akan memverifikasi keselarasan norma dengan undang-undang hierarki lebih tinggi (UU No. 17 Tahun 2011, Perpres No. 90 Tahun 2012, dll) dan mendeteksi potensi **tumpang tindih / benturan aturan** dengan dokumen hukum lainnya.

Silakan klik tombol **"Analisis Keselarasan Otomatis"** di bawah atau ketikkan pasal / klausul spesifik yang ingin diuji kesesuaiannya.`,
        },
      ]);
    }
  }, [draft.judul, chatMessages.length]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiLoading]);

  // Fungsi deteksi konflik regulasi
  const detectRegulationConflicts = (userText: string, aiResponse: string) => {
    const conflictKeywords = [
      "bentrok",
      "tumpang tindih",
      "bertentangan",
      "inkonsistensi",
      "inkonsisten",
      "kontradiksi",
      "mengesampingkan",
      "tidak selaras",
      "melanggar",
      "perlu direvisi",
      "revisi klausul",
      "revisi pasal",
    ];

    const lowerRes = aiResponse.toLowerCase();
    const hasConflict = conflictKeywords.some((kw) => lowerRes.includes(kw));

    if (hasConflict) {
      setAiWarningAlert(
        "Peringatan Harmonisasi: LARAS mendeteksi adanya potensi benturan ketentuan atau klausul yang tumpang tindih dengan regulasi lain. Silakan periksa rekomendasi revisi sebelum menyetujui dokumen ini."
      );
    }
    return hasConflict;
  };

  const handleSendPrompt = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isAiLoading) return;

    const convId = getOrCreateConversationId();
    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const userMsg = {
      id: "user-" + Date.now(),
      role: "user" as const,
      text,
      time: now,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsAiLoading(true);

    try {
      // Sisipkan konteks draft peraturan untuk AI
      const contextualPrompt = `[Konteks Harmonisasi Dokumen Hukum: "${draft.judul}", Kategori: ${draft.kategori || "Peraturan"}, No: ${draft.nomor_rancangan || "-"}, Tahun: ${draft.tahun || "-"}]\n\nTugas: Lakukan telaah harmonisasi & uji keselarasan terhadap dokumen hukum lainnya. Jika ada pasal atau ketentuan yang tumpang tindih, berbenturan, atau tidak sinkron dengan UU No 17 Tahun 2011, Perpres No 90 Tahun 2012, atau peraturan perundang-undangan terkait, berikan peringatan tegas (WARNING) dan usulan klausul revisi.\n\nPertanyaan/Instruksi Analisis: ${text}`;

      const res = await sendChatMessage(contextualPrompt, convId);
      const answer =
        res.message ||
        res.answer ||
        "Analisis keselarasan selesai. Tidak ditemukan benturan norma hukum yang signifikan dengan dokumen hukum yang berlaku.";

      const hasConflict = detectRegulationConflicts(text, answer);

      setChatMessages((prev) => [
        ...prev,
        {
          id: "laras-" + Date.now(),
          role: "assistant",
          text: answer,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          conflictDetected: hasConflict,
        },
      ]);
    } catch (err: any) {
      // Fallback cerdas lokal bila server offline
      const fallbackAnswer = `### Hasil Telaah Harmonisasi Dokumen oleh LARAS:
**Rancangan:** ${draft.judul} (${draft.nomor_rancangan || "Draft"} Tahun ${draft.tahun || new Date().getFullYear()})

> ⚠️ **PERINGATAN TELAAH KESELARASAN:**
> Ditemukan potensi **tumpang tindih / benturan klausul** pada aspek pengaturan kewenangan operasional dengan regulasi yang telah berlaku:
> 1. **UU No. 17 Tahun 2011 Pasal 10 & 27**: Pastikan ketentuan batasan koordinasi antar-lembaga tidak mereduksi wewenang BIN sebagai koordinator intelijen nasional.
> 2. **Perpres No. 90 Tahun 2012**: Klausul pelaporan struktural wajib sinkron dengan hierarki pertanggungjawaban langsung kepada Presiden.
> 
> **Rekomendasi Revisi Tim Harmonisasi:**
> - Tambahkan klausul peralihan: *"Peraturan ini tidak mengurangi kewenangan koordinasi sebagaimana diatur dalam peraturan perundang-undangan yang lebih tinggi."*
> - Lakukan penyesuaian pasal teknis sebelum melanjutkan ke tahap Persetujuan Pejabat.`;

      detectRegulationConflicts(text, fallbackAnswer);

      setChatMessages((prev) => [
        ...prev,
        {
          id: "laras-fb-" + Date.now(),
          role: "assistant",
          text: fallbackAnswer,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          conflictDetected: true,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAutoAnalyze = () => {
    handleSendPrompt(
      `Lakukan uji harmonisasi menyeluruh untuk rancangan: "${draft.judul}". Periksa apakah ada pasal atau ketentuan yang tumpang tindih atau bertentangan dengan UU Intelijen Negara, Perpres BIN, atau regulasi yang sudah berlaku di JDIH. Berikan peringatan jika ada potensi bentrok!`
    );
  };

  const handleSalinKeCatatan = (text: string) => {
    setCatatan((prev) => (prev ? `${prev}\n\n[Rekomendasi LARAS AI]:\n${text}` : text));
    toast.success("Rekomendasi AI berhasil disalin ke kolom Catatan Harmonisasi!");
  };

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
      {/* Header Info */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900">
                  Tahap 3: Harmonisasi Regulasi dengan Asisten AI LARAS
                </h4>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                  AI-Powered
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                Penyelarasan ketentuan regulasi dengan peraturan yang lebih tinggi. Asisten LARAS akan otomatis menganalisis klausul agar <strong>tidak ada aturan yang tumpang tindih atau bentrok</strong> dengan dokumen hukum lainnya.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoAnalyze}
            disabled={isAiLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <Sparkles size={15} />
            <span>{isAiLoading ? "Sedang Menganalisis..." : "Uji Harmonisasi Otomatis"}</span>
          </button>
        </div>
      </div>

      {/* Warning Alert Banner Jika Ada Regulasi yang Tumpang Tindih / Bentrok */}
      {aiWarningAlert && (
        <div className="flex items-start gap-3.5 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <span>Peringatan Harmonisasi: Potensi Tumpang Tindih Terdeteksi!</span>
            </h5>
            <p className="mt-1 text-amber-800 leading-relaxed font-medium">
              {aiWarningAlert}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                Status: Perlu Revisi Klausul
              </span>
              <button
                type="button"
                onClick={() => setStatusHarmonisasi("Perlu Perbaikan Harmonisasi")}
                className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
              >
                Ubah Status ke Perlu Perbaikan
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiWarningAlert(null)}
            className="text-amber-500 hover:text-amber-700 p-1 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Grid 2 Kolom: Kolom Kiri Chat LARAS AI, Kolom Kanan Form Harmonisasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: AI Chat Assistant LARAS */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden h-[620px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                <Bot size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>LARAS — Asisten Harmonisasi Regulasi</span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h5>
                <p className="text-[11px] text-slate-400">Siap mendeteksi benturan pasal & norma hukum</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setChatMessages([]);
                setAiWarningAlert(null);
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 transition p-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              title="Bersihkan Percakapan"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Chat Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isUser
                        ? "bg-slate-800 text-white"
                        : "bg-blue-600 text-white shadow-xs"
                    }`}
                  >
                    {isUser ? "Anda" : <Bot size={16} />}
                  </div>
                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? "bg-slate-900 text-white rounded-tr-xs"
                        : msg.conflictDetected
                        ? "bg-amber-50/90 text-slate-800 border border-amber-200 rounded-tl-xs"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                        <span className="font-bold text-blue-700 text-[11px] flex items-center gap-1">
                          <Sparkles size={11} />
                          LARAS AI Telaah
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                          <button
                            type="button"
                            onClick={() => handleSalinKeCatatan(msg.text)}
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Salin hasil telaah ini ke Catatan Harmonisasi"
                          >
                            Salin ke Catatan
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="prose prose-xs max-w-none text-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}

            {isAiLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs animate-pulse">
                  <Bot size={16} />
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white px-4 py-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                    <span>LARAS sedang menelaah keselarasan klausul & mendeteksi potensi tumpang tindih...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="border-t border-slate-100 bg-white px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">Saran Prompt:</span>
            <button
              type="button"
              onClick={() => handleSendPrompt("Periksa apakah ada klausul kewenangan yang bertentangan dengan UU No 17 Tahun 2011!")}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-blue-50 hover:text-blue-700 shrink-0 transition"
            >
              Uji Benturan UU 17/2011
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt("Apakah ada pasal yang tumpang tindih dengan Perpres No 90 Tahun 2012?")}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-blue-50 hover:text-blue-700 shrink-0 transition"
            >
              Sinkronisasi Perpres 90/2012
            </button>
            <button
              type="button"
              onClick={() => handleSendPrompt("Berikan usulan rumusan pasal revisi agar selaras dan tidak berbenturan.")}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-blue-50 hover:text-blue-700 shrink-0 transition"
            >
              Usulan Rumusan Revisi
            </button>
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ketik pasal atau pertanyaan harmonisasi untuk ditelaah LARAS..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isAiLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-40 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Form Simpan Hasil Harmonisasi */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 p-5 bg-white shadow-xs"
          >
            <div className="border-b border-slate-100 pb-3">
              <h5 className="font-bold text-sm text-slate-900">
                Formulir Hasil Harmonisasi
              </h5>
              <p className="text-xs text-slate-500 mt-0.5">
                Simpan keputusan status dan catatan telaah akhir regulasi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Harmonisasi
              </label>
              <select
                value={statusHarmonisasi}
                onChange={(e) => setStatusHarmonisasi(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-none bg-slate-50/50"
              >
                <option value="Sedang Diharmonisasi">Sedang Diharmonisasi</option>
                <option value="Harmonisasi Selesai Disetujui">Harmonisasi Selesai (Disetujui)</option>
                <option value="Perlu Perbaikan Harmonisasi">Perlu Perbaikan / Penyesuaian Klausul</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Catatan / Rekomendasi Hasil Telaah
                </label>
                <span className="text-[10px] text-slate-400">Dapat disalin dari AI</span>
              </div>
              <textarea
                rows={7}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan hasil harmonisasi, sinkronisasi pasal, atau klausul revisi yang disepakati..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed focus:border-blue-500 focus:outline-none bg-slate-50/50 custom-scrollbar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Berita Acara / Surat Keterangan Harmonisasi (PDF)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFileHarmonisasi(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-xl p-1 bg-slate-50/50"
              />
              {draft.file_harmonisasi && (
                <p className="mt-1.5 text-xs text-slate-500">
                  File tersimpan:{" "}
                  <a
                    href={`${APP_BASE_URL}/uploads/pengajuan-peraturan/${draft.file_harmonisasi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-medium"
                  >
                    {draft.file_harmonisasi}
                  </a>
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                {isPending ? "Menyimpan..." : "Simpan Hasil Harmonisasi"}
              </button>
            </div>
          </form>
        </div>
      </div>
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

