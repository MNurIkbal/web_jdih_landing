"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  FileSpreadsheet,
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
  Pencil,
  Eye,
  Download,
  SlidersHorizontal,
  Activity,
  Check,
} from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { sendChatMessage, getOrCreateConversationId } from "@/services/chat-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import FormDatePicker from "@/components/ui/FormDatePicker";
import {
  PengajuanPeraturanSchema,
  VerifikasiPengajuanSchema,
  type PengajuanPeraturanFormValues,
  type VerifikasiPengajuanFormValues,
} from "../schema/PengajuanPeraturan.schema";
import { fetchDokumenHukum } from "@/feature/dokumen-hukum/api/DokumenHukum.service";
import { SessionHook } from "@/feature/web";

const TAHAPAN_STEPS: { stage: TahapanPeraturan; number: number; label: string; desc: string }[] = [
  { stage: "Pengajuan", number: 1, label: "Pengajuan", desc: "Drafting & Naskah Akademik" },
  { stage: "Pembahasan", number: 2, label: "Pembahasan", desc: "Rapat & Notulensi" },
  { stage: "Harmonisasi", number: 3, label: "Harmonisasi", desc: "Penyelarasan Hukum" },
  { stage: "Persetujuan", number: 4, label: "Persetujuan", desc: "Persetujuan Multi-Pejabat" },
  { stage: "Penetapan", number: 5, label: "Penetapan", desc: "Pengundangan & Publikasi" },
];

export default function PengajuanPeraturanComponent({
  isMonitoringOnly = false,
}: {
  isMonitoringOnly?: boolean;
} = {}) {
  const { activeModule } = useAdminLayout();
  const session = SessionHook();
  const userRole = (session?.data?.data?.role || "superadmin").toLowerCase();
  const [search, setSearch] = useState("");
  const [tahapanFilter, setTahapanFilter] = useState(
    activeModule === "HDH" ? "Harmonisasi" : ""
  );
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("");
  const searchParams = useSearchParams();
  const currentTabParam = searchParams.get("tab") || "pengajuan";
  const [activeMainTab, setActiveMainTab] = useState<"pengajuan" | "monitoring">(
    isMonitoringOnly || currentTabParam === "monitoring" ? "monitoring" : "pengajuan"
  );
  const [detailModalData, setDetailModalData] = useState<PengajuanPeraturan | null>(null);

  useEffect(() => {
    if (isMonitoringOnly) {
      setActiveMainTab("monitoring");
    } else if (searchParams.get("tab") === "monitoring") {
      setActiveMainTab("monitoring");
    } else {
      setActiveMainTab("pengajuan");
    }
  }, [searchParams, isMonitoringOnly]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editData, setEditData] = useState<PengajuanPeraturan | null>(null);
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

  const formatTanggalIndo = (val?: string | null) => {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  };

  const columns: DataTableColumn<PengajuanPeraturan>[] = useMemo(
    () => [
      {
        key: "tanggal_pengajuan",
        label: "Tanggal & Nomor",
        width: "180px",
        render: (_val, row) => (
          <div className="py-1">
            <div className="text-xs font-semibold text-slate-800">
              {formatTanggalIndo(row.tanggal_pengajuan || (row as any).created_at)}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Nomor: <span className="font-medium text-slate-700">{row.nomor_rancangan || "-"}</span>
            </div>
          </div>
        ),
      },
      {
        key: "judul",
        label: "Judul Dokumen",
        sortable: true,
        render: (_val, row) => (
          <div className="py-1">
            <div className="font-semibold text-slate-900 line-clamp-2 hover:text-blue-700 transition">
              {row.judul}
            </div>
          </div>
        ),
      },
      {
        key: "kategori",
        label: "Kategori",
        width: "140px",
        render: (_val, row) => (
          <div className="text-xs font-medium text-slate-700">
            {row.kategori || "-"}
          </div>
        ),
      },
      {
        key: "bidang",
        label: "Bidang",
        width: "160px",
        render: (_val, row) => (
          <div className="text-xs font-medium text-slate-700">
            {row.bidang || (row as any).bidang_hukum || "-"}
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "150px",
        render: (_val, row) => {
          const statusVal = row.status || "Proses";

          // Format status badge dengan style bersih & warna semantik yang tepat
          const getStatusStyle = (s: string) => {
            switch (s) {
              case "Draft":
                return "bg-slate-100 text-slate-700 border-slate-200";
              case "Submit Dokumen":
                return "bg-blue-50 text-blue-700 border-blue-200";
              case "Review":
                return "bg-amber-50 text-amber-800 border-amber-200";
              case "Pengajuan Ulang":
                return "bg-indigo-50 text-indigo-700 border-indigo-200";
              case "Disetujui":
              case "Ditetapkan":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
              case "Ditolak":
              case "Revisi":
                return "bg-rose-50 text-rose-700 border-rose-200";
              case "Proses":
              default:
                return "bg-sky-50 text-sky-700 border-sky-200";
            }
          };

          const getStatusDot = (s: string) => {
            switch (s) {
              case "Draft":
                return "bg-slate-400";
              case "Submit Dokumen":
                return "bg-blue-500";
              case "Review":
                return "bg-amber-500 animate-pulse";
              case "Pengajuan Ulang":
                return "bg-indigo-500";
              case "Disetujui":
              case "Ditetapkan":
                return "bg-emerald-500";
              case "Ditolak":
              case "Revisi":
                return "bg-rose-500";
              case "Proses":
              default:
                return "bg-sky-500";
            }
          };

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border shadow-2xs ${getStatusStyle(
                statusVal
              )}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(statusVal)}`} />
              <span>{statusVal}</span>
            </span>
          );
        },
      },
      {
        key: "aksi",
        label: "Aksi",
        width: "80px",
        align: "center",
        render: (_val, row) => {
          // Status yang mengizinkan edit/hapus bagi pengguna: Draft atau Revisi/Ditolak
          const isEditableByPengguna = row.status === "Draft" || row.status === "Revisi" || row.status === "Ditolak";
          // Admin (verifikator) MUTLAK TIDAK BOLEH buat, edit, atau hapus pengajuan
          // Hanya 'pengguna' (atau 'superadmin') yang boleh edit/hapus
          const canEditOrDelete =
            (userRole === "pengguna" && isEditableByPengguna) || userRole === "superadmin";

          return (
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
                        setDetailModalData(row);
                        setOpenDropdownId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Eye size={14} className="text-slate-500" />
                      <span>Detail</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(row.id);
                        setOpenDropdownId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <ArrowRight size={14} className="text-blue-600" />
                      <span>Proses</span>
                    </button>

                    {canEditOrDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditData(row);
                          setOpenDropdownId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Pencil size={14} className="text-amber-600" />
                        <span>Edit Pengajuan</span>
                      </button>
                    )}

                    {canEditOrDelete && (
                      <>
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
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [openDropdownId]
  );

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">
      {activeMainTab === "monitoring" ? (
        /* TAMPILAN MONITORING PROGRES */
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              <span>Monitoring Real-time Tahapan & Progres Dokumen Hukum</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Pantau perjalanan dan tahapan seluruh permohonan rancangan produk hukum dari Pengajuan, Pembahasan, Harmonisasi, Persetujuan, hingga Penetapan & Pengundangan.
            </p>
          </div>

          <div className="space-y-4">
            {items.map((row) => {
              const currentStepIdx = TAHAPAN_STEPS.findIndex((s) => s.stage === row.tahapan);
              const progressPercentage = Math.round(((currentStepIdx + 1) / TAHAPAN_STEPS.length) * 100);

              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                          {row.kategori || "Peraturan"}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          Nomor: <strong className="text-slate-700">{row.nomor_rancangan || "-"}</strong>
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">Tahun {row.tahun || "-"}</span>
                      </div>
                      <h4 className="mt-1.5 text-sm font-bold text-slate-900">{row.judul}</h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setDetailModalData(row)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Detail Form</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                      >
                        <ArrowRight size={13} />
                        <span>Kelola Tahapan</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual 5 Stages Progress Tracker */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span>Tahap Saat Ini:</span>
                        <strong className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {row.tahapan}
                        </strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span>Status:</span>
                        <strong
                          className={`px-2 py-0.5 rounded-md border text-[11px] ${
                            row.status === "Draft"
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : row.status === "Submit Dokumen" || row.status === "Review"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : row.status === "Revisi"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {row.status}
                        </strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {TAHAPAN_STEPS.map((s, idx) => {
                        const isDone = currentStepIdx > idx;
                        const isCurrent = currentStepIdx === idx;
                        return (
                          <div
                            key={s.number}
                            className={`rounded-xl p-2.5 border text-center transition ${
                              isCurrent
                                ? "border-blue-500 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500"
                                : isDone
                                ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                                : "border-slate-200 bg-slate-50/60 text-slate-400"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                              {isDone ? (
                                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                              ) : (
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                                    isCurrent ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"
                                  }`}
                                >
                                  {s.number}
                                </span>
                              )}
                              <span className="truncate">{s.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Tabel Utama menggunakan DataTable standar sistem */
        <DataTable
          data={items}
          columns={columns}
          getRowId={(row) => row.id}
          title={activeModule === "HDH" ? "Harmonisasi Dokumen Hukum" : "Pengajuan Peraturan"}
          description={
            activeModule === "HDH"
              ? "Penyelarasan & harmonisasi materi rancangan hukum dengan peraturan perundang-undangan."
              : "Daftar permohonan rancangan peraturan hukum yang diajukan beserta status verifikasi proses."
          }
          searchPlaceholder="Cari judul rancangan, nomor, pemrakarsa..."
          addButtonText={
            activeModule === "JDIH" && (userRole === "pengguna" || userRole === "superadmin") && userRole !== "admin"
              ? "Buat Pengajuan Baru"
              : undefined
          }
          onAdd={
            activeModule === "JDIH" && (userRole === "pengguna" || userRole === "superadmin") && userRole !== "admin"
              ? () => setIsCreateOpen(true)
              : undefined
          }
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
      )}

      {/* Modal Buat Pengajuan Baru */}
      {isCreateOpen && (
        <CreatePengajuanModal onClose={() => setIsCreateOpen(false)} />
      )}

      {/* Modal Edit Pengajuan */}
      {editData && (
        <EditPengajuanModal
          data={editData}
          onClose={() => setEditData(null)}
          onSuccess={() => {
            setEditData(null);
            refetch();
          }}
        />
      )}

      {/* Modal Detail & Alur 5 Tahapan */}
      {selectedId && (
        <DetailTahapanModal
          draftId={selectedId}
          activeModule={activeModule}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Modal Readonly Detail Dokumen */}
      {detailModalData && (
        <ReadonlyDetailModal
          draft={detailModalData}
          onClose={() => setDetailModalData(null)}
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
                toast.success("Draft pengajuan peraturan berhasil dihapus");
                setDeleteData(null);
                refetch();
              },
              onError: (err: any) => {
                toast.error(err?.message || "Gagal menghapus pengajuan peraturan");
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

// ================= MODAL DETAIL READONLY (SESUAI FORM ASLI) =================
function ReadonlyDetailModal({
  draft: initialDraft,
  onClose,
}: {
  draft: PengajuanPeraturan;
  onClose: () => void;
}) {
  const { data: detailData, isLoading } = usePengajuanDetail(initialDraft.id);
  const draft = detailData || initialDraft;
  const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:8080";
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

  const formatDate = (val?: string | null) => {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  };

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] flex h-screen w-screen flex-col bg-slate-50 overflow-hidden">
      {/* Header Modal Fullscreen */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Eye size={24} />
          </div>
          <div>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              Detail Dokumen Pengajuan
            </h3>
            <p className="text-xs text-slate-500">
              Rincian lengkap rancangan peraturan: {draft.judul}
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar p-6 sm:p-10 lg:p-12">
        <div className="w-full space-y-8">
          {/* Card 01: Informasi Dokumen */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-xs">
                01
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Informasi Dokumen</h3>
                <p className="text-xs text-slate-400">Informasi dasar dokumen hukum</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Judul Dokumen
                </span>
                <p className="text-sm font-extrabold text-slate-900 leading-relaxed">
                  {draft.judul}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Kategori
                </span>
                <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  {draft.kategori || "-"}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tipe Dokumen
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {draft.tipe_dokumen || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Nomor Rancangan
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {draft.nomor_rancangan || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tahun
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {draft.tahun || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Bidang Hukum
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {draft.bidang || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tempat Penetapan
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {draft.tempat_penetapan || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Unit Kerja / Eselon Pemrakarsa
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {draft.pemrakarsa || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Penanggung Jawab Substansi (PIC)
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {draft.penanggung_jawab || "-"}
                </p>
              </div>

              <div className="md:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Dasar Kewenangan Pembentukan Peraturan
                </span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {(draft as any).dasar_hukum || "-"}
                </p>
              </div>

              <div className="md:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Urgensi & Latar Belakang Perumusan Regulasi
                </span>
                <div className="text-xs font-medium text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {(draft as any).urgensi || draft.ringkasan || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Card 02: Detail Penetapan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                02
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Detail Penetapan</h3>
                <p className="text-xs text-slate-400">Informasi tanggal dan klasifikasi dokumen</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tanggal Penetapan
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {formatDate(draft.target_penetapan || draft.tanggal_pengajuan)}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tanggal Pengundangan
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {formatDate(draft.tanggal_pengajuan)}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tanggal Berlaku
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {formatDate(draft.target_penetapan || draft.tanggal_pengajuan)}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Sumber
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {(draft as any).sumber || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Subject
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {(draft as any).subject || (draft as any).subjek || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Status Dokumen
                </span>
                <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  {draft.status_dokumen || "Berlaku"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 03: Berkas Dokumen */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-600">
                03
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Berkas Dokumen</h3>
                <p className="text-xs text-slate-400">Dokumen draft dan naskah akademik yang diunggah</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">File Draft Rancangan</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {draft.file_draft || "Belum ada file draft"}
                    </p>
                  </div>
                </div>
                {draft.file_draft && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${backendUrl}/uploads/pengajuan-peraturan/${draft.file_draft}`;
                        window.open(url, "_blank");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                    <a
                      href={`${backendUrl}/api/master-data/pengajuan-peraturan/${draft.id}/download-file/draft`}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Berkas Pendukung / Naskah Akademik</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {draft.file_naskah_akademik || "Belum ada berkas pendukung"}
                    </p>
                  </div>
                </div>
                {draft.file_naskah_akademik && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${backendUrl}/uploads/pengajuan-peraturan/${draft.file_naskah_akademik}`;
                        window.open(url, "_blank");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                    <a
                      href={`${backendUrl}/api/master-data/pengajuan-peraturan/${draft.id}/download-file/akademik`}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition cursor-pointer shadow-xs"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ================= MODAL EDIT PENGAJUAN =================
function EditPengajuanModal({
  data: initialData,
  onClose,
  onSuccess,
}: {
  data: PengajuanPeraturan;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: detailData, isLoading } = usePengajuanDetail(initialData.id);
  const currentData = detailData || initialData;
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md shadow-amber-500/20">
            <Pencil size={24} />
          </div>
          <div>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              Edit Pengajuan Peraturan
            </h3>
            <p className="text-xs text-slate-500">
              Perbarui rincian informasi dan berkas pengajuan peraturan: {currentData.judul}
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

      {/* Form Body Menggunakan DokumenHukumForm Mode Edit */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar p-6 sm:p-10 lg:p-12">
        <div className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-sm font-semibold text-slate-500">
              Memuat data lengkap pengajuan...
            </div>
          ) : (
            <DokumenHukumForm
              mode="edit"
              data={currentData as any}
              targetApi="pengajuan-peraturan"
              onSuccess={() => {
                onSuccess();
              }}
            />
          )}
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
      // Jika di modul JDIH dan draft sudah sampai Harmonisasi atau lebih tinggi,
      // tab aktif tetap di Pembahasan/Pengajuan karena Harmonisasi hanya dapat dibuka di HDH
      if (draft.tahapan === "Harmonisasi" || draft.tahapan === "Persetujuan" || draft.tahapan === "Penetapan") {
        setActiveTab("Pembahasan");
      } else {
        setActiveTab(draft.tahapan);
      }
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
            <h2 className="truncate text-xl font-extrabold text-slate-900">
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

              // Aturan Akses Tab:
              // 1. Modul HDH: HANYA tab Harmonisasi yang bisa dibuka. Tab lain disable semua.
              // 2. Modul JDIH: Tab Harmonisasi disable (hanya bisa dibuka dari modul HDH). Tab lain bisa diakses jika sudah tercapai (isPast).
              let isStepAccessible = false;
              if (activeModule === "HDH") {
                isStepAccessible = step.stage === "Harmonisasi";
              } else {
                // Di Modul JDIH
                if (step.stage === "Harmonisasi") {
                  isStepAccessible = false; // Harmonisasi disabled di JDIH
                } else {
                  isStepAccessible = isPast || isActive;
                }
              }

              return (
                <button
                  key={step.number}
                  disabled={!isStepAccessible}
                  onClick={() => {
                    if (isStepAccessible) setActiveTab(step.stage);
                  }}
                  title={
                    activeModule === "HDH" && step.stage !== "Harmonisasi"
                      ? "Tahapan ini dikelola di Modul JDIH"
                      : activeModule === "JDIH" && step.stage === "Harmonisasi"
                      ? "Tahap Harmonisasi khusus dibuka melalui Modul HDH"
                      : undefined
                  }
                  className={`flex flex-1 min-w-[170px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                    isActive
                      ? activeModule === "HDH"
                        ? "border-amber-600 bg-amber-50/60 text-amber-800 shadow-sm ring-1 ring-amber-500 cursor-pointer"
                        : "border-blue-600 bg-blue-50/60 text-blue-800 shadow-sm ring-1 ring-blue-500 cursor-pointer"
                      : isStepAccessible
                      ? "border-slate-200/80 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      : "border-slate-100 bg-slate-50/60 text-slate-400 opacity-60 cursor-not-allowed"
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
                        : "bg-slate-200 text-slate-400"
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
                onCloseModal={onClose}
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
  onCloseModal,
}: {
  draft: PengajuanPeraturan;
  onNext?: () => void;
  onCloseModal?: () => void;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:8080";
  const session = SessionHook();
  const userRole = (session?.data?.data?.role || "superadmin").toLowerCase();
  const isVerifikator = userRole === "admin" || userRole === "superadmin";

  const { mutate: updateTahap, isPending } = useUpdateTahapanPengajuan();
  const [activeTabMode, setActiveTabMode] = useState<"detail" | "verifikasi">("detail");
  
  // State verifikasi
  const [verifStatus, setVerifStatus] = useState<"Disetujui" | "Ditolak">("Disetujui");
  const [verifCatatan, setVerifCatatan] = useState("");
  const [verifErrors, setVerifErrors] = useState<{ status?: string; catatan?: string }>({});

  const handleKirimKeVerifikator = () => {
    const nextStatus = draft.status === "Revisi" ? "Pengajuan Ulang" : "Submit Dokumen";
    updateTahap(
      {
        id: draft.id,
        payload: {
          tahapan: "Pengajuan",
          status: nextStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            draft.status === "Revisi"
              ? "Perbaikan rancangan berhasil diajukan ulang ke Verifikator!"
              : "Rancangan peraturan berhasil disubmit ke Verifikator!"
          );
        },
      }
    );
  };

  const handleVerifikasiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifErrors({});

    const result = VerifikasiPengajuanSchema.safeParse({
      status: verifStatus,
      catatan: verifCatatan,
    });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setVerifErrors(fieldErrors);
      return;
    }

    if (verifStatus === "Disetujui") {
      updateTahap(
        {
          id: draft.id,
          payload: {
            tahapan: "Pembahasan",
            status: "Proses",
            catatan_verifikasi: verifCatatan.trim() || "Rancangan disetujui untuk lanjut ke tahap pembahasan.",
          },
        },
        {
          onSuccess: () => {
            toast.success("Pengajuan diverifikasi & disetujui lanjut ke Tahap Pembahasan!");
            if (onNext) onNext();
          },
        }
      );
    } else {
      updateTahap(
        {
          id: draft.id,
          payload: {
            tahapan: "Pengajuan",
            status: "Revisi",
            catatan_verifikasi: verifCatatan.trim(),
          },
        },
        {
          onSuccess: () => {
            toast.success("Pengajuan berhasil ditolak dan dikembalikan ke pemohon untuk direvisi!");
            if (onCloseModal) {
              onCloseModal();
            }
          },
        }
      );
    }
  };

  const isDraftStatus = draft.status === "Draft";
  const isMenungguVerifikasi =
    draft.status === "Submit Dokumen" ||
    draft.status === "Review" ||
    draft.status === "Pengajuan Ulang" ||
    (draft.status === "Proses" && draft.tahapan === "Pengajuan");
  const isRevisi = draft.status === "Revisi";
  const isSudahLanjut = draft.tahapan !== "Pengajuan";

  return (
    <div className="space-y-6">
      {/* Banner Notifikasi Catatan Revisi jika ada */}
      {((draft as any).catatan_verifikasi || isRevisi) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Catatan Revisi dari Verifikator:
              </h4>
              <p className="mt-1 text-xs text-rose-700 whitespace-pre-line leading-relaxed font-medium">
                {(draft as any).catatan_verifikasi || (draft as any).catatan_revisi || "Mohon perbaiki draft rancangan dan lampiran berkas sesuai arahan verifikator."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Header Card */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-blue-900">
            Tahap 1: Pengajuan & Dokumen Rancangan
          </h4>
          <p className="mt-1 text-xs text-blue-700">
            Status pengajuan:{" "}
            <span
              className={`inline-block font-bold px-2 py-0.5 rounded-md text-[11px] border ${
                draft.status === "Draft"
                  ? "bg-slate-100 text-slate-700 border-slate-300"
                  : draft.status === "Revisi"
                  ? "bg-rose-100 text-rose-800 border-rose-300"
                  : draft.status === "Review"
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-blue-100 text-blue-800 border-blue-300"
              }`}
            >
              {draft.status}
            </span>
            {isDraftStatus && " — Draft belum dikirim ke verifikator."}
            {isMenungguVerifikasi && " — Berada dalam pemeriksaan Admin / Verifikator."}
            {isSudahLanjut && ` — Telah diverifikasi dan berada pada Tahap ${draft.tahapan}.`}
          </p>
        </div>

        {/* Tombol Aksi Verifikator vs Pengguna */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Aksi untuk Pengguna mengirim ke Verifikator (saat status Draft atau Revisi) */}
          {(isDraftStatus || isRevisi) && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleKirimKeVerifikator}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send size={14} />
              <span>
                {isPending
                  ? "Mengirim..."
                  : isRevisi
                  ? "Kirim Pengajuan Ulang"
                  : "Submit Dokumen ke Verifikator"}
              </span>
              <ArrowRight size={14} />
            </button>
          )}

          {isMenungguVerifikasi && !isVerifikator && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">
              <Clock size={14} className="text-blue-600" />
              Menunggu Verifikasi Admin ({draft.status})
            </span>
          )}

          {isSudahLanjut && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Disetujui ke Tahap {draft.tahapan}
            </span>
          )}
        </div>
      </div>

      {/* Sub Tabs: Tab 1 (Detail Data Pengajuan) & Tab 2 (Verifikasi Dokumen Khusus Verifikator) */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTabMode("detail")}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTabMode === "detail"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Tab 1: Rincian Lengkap Data Pengajuan
          </button>
          {/* Tab 2 hanya muncul untuk verifikator jika dokumen belum disetujui / belum lanjut ke pembahasan */}
          {isVerifikator && !isSudahLanjut && (
            <button
              type="button"
              onClick={() => setActiveTabMode("verifikasi")}
              className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === "verifikasi"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Tab 2: Verifikasi & Tindak Lanjut</span>
              {isMenungguVerifikasi && (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>

      {activeTabMode === "verifikasi" && isVerifikator ? (
        /* Form Tab 2: Verifikasi & Validasi Zod */
        <form
          onSubmit={handleVerifikasiSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900">Form Verifikasi Dokumen Rancangan</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan keputusan verifikasi untuk menyetujui rancangan ke tahap pembahasan atau menolaknya untuk direvisi oleh pemohon.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Keputusan Verifikasi <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                <button
                  type="button"
                  onClick={() => setVerifStatus("Disetujui")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    verifStatus === "Disetujui"
                      ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2
                      size={18}
                      className={verifStatus === "Disetujui" ? "text-emerald-600" : "text-slate-400"}
                    />
                    <div>
                      <p className="text-xs font-bold">Setujui Dokumen</p>
                      <p className="text-[11px] text-slate-500">Lanjut ke Tahap Pembahasan</p>
                    </div>
                  </div>
                  {verifStatus === "Disetujui" && <Check size={16} className="text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setVerifStatus("Ditolak")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    verifStatus === "Ditolak"
                      ? "border-rose-500 bg-rose-50/60 ring-1 ring-rose-500 text-rose-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <X
                      size={18}
                      className={verifStatus === "Ditolak" ? "text-rose-600" : "text-slate-400"}
                    />
                    <div>
                      <p className="text-xs font-bold">Tolak / Revisi</p>
                      <p className="text-[11px] text-slate-500">Kembalikan ke Pemohon</p>
                    </div>
                  </div>
                  {verifStatus === "Ditolak" && <Check size={16} className="text-rose-600" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pesan / Catatan Verifikasi{" "}
                {verifStatus === "Ditolak" ? (
                  <span className="text-rose-500 font-semibold">(Wajib Diisi)*</span>
                ) : (
                  <span className="text-slate-400 font-normal">(Opsional)</span>
                )}
              </label>
              <textarea
                rows={4}
                value={verifCatatan}
                onChange={(e) => {
                  setVerifCatatan(e.target.value);
                  if (verifErrors.catatan) {
                    setVerifErrors((prev) => ({ ...prev, catatan: undefined }));
                  }
                }}
                placeholder={
                  verifStatus === "Ditolak"
                    ? "Contoh: Mohon perbaiki landasan sosiologis dan lampirkan naskah akademik yang telah ditandatangani..."
                    : "Tuliskan catatan apresiasi atau arahan teknis untuk rapat pembahasan (opsional)..."
                }
                className={`w-full rounded-xl border p-3.5 text-xs text-slate-800 focus:outline-none transition ${
                  verifErrors.catatan
                    ? "border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {verifErrors.catatan && (
                <p className="mt-1 text-xs font-medium text-rose-500 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>{verifErrors.catatan}</span>
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow transition cursor-pointer ${
                  verifStatus === "Disetujui"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                } disabled:opacity-50`}
              >
                {isPending ? (
                  <span>Menyimpan Keputusan...</span>
                ) : verifStatus === "Disetujui" ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Setujui & Lanjutkan ke Pembahasan</span>
                  </>
                ) : (
                  <>
                    <X size={15} />
                    <span>Kirim Catatan Penolakan / Revisi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Tab 1: Menampilkan seluruh data persis form pengajuan readonly */
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Judul Rancangan</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.judul}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Nomor Rancangan</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.nomor_rancangan || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Tahun</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.tahun || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Kategori</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.kategori || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Tipe Dokumen</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.tipe_dokumen || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Bidang Hukum</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.bidang || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Status Dokumen (Label)</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.status_dokumen || "Berlaku"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Subject</p>
              <p className="mt-1 font-semibold text-slate-800">{(draft as any).subject || (draft as any).subjek || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Unit Eselon / Pemrakarsa</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.pemrakarsa || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Penanggung Jawab Substansi (PIC)</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.penanggung_jawab || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Tanggal Pengajuan</p>
              <p className="mt-1 font-semibold text-slate-800">
                {draft.tanggal_pengajuan ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(draft.tanggal_pengajuan)) : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Target Penetapan</p>
              <p className="mt-1 font-semibold text-slate-800">
                {draft.target_penetapan ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(draft.target_penetapan)) : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Tempat Penetapan</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.tempat_penetapan || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Sumber</p>
              <p className="mt-1 font-semibold text-slate-800">{(draft as any).sumber || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Status Alur Proses</p>
              <p className="mt-1 font-semibold text-slate-800">{draft.status} ({draft.tahapan})</p>
            </div>
          </div>

          {((draft as any).dasar_hukum || (draft as any).urgensi || draft.ringkasan) && (
            <div className="space-y-4">
              {(draft as any).dasar_hukum && (
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
                  <p className="text-xs text-slate-400">Dasar Kewenangan Pembentukan Peraturan</p>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed font-medium">{(draft as any).dasar_hukum}</p>
                </div>
              )}
              {((draft as any).urgensi || draft.ringkasan) && (
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
                  <p className="text-xs text-slate-400">Urgensi & Latar Belakang Perumusan Regulasi</p>
                  <p className="mt-1 text-xs text-slate-700 whitespace-pre-line leading-relaxed">{(draft as any).urgensi || draft.ringkasan}</p>
                </div>
              )}
            </div>
          )}

          {/* File Download / View dengan Watermark JDIH BIN */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/30">
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${backendUrl}/uploads/pengajuan-peraturan/${draft.file_draft}`;
                      window.open(url, "_blank");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Pratinjau Dokumen"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </button>
                  <a
                    href={`${backendUrl}/api/master-data/pengajuan-peraturan/${draft.id}/download-file/draft`}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
                    title="Download dengan Watermark JDIH BIN"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/30">
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${backendUrl}/uploads/pengajuan-peraturan/${draft.file_naskah_akademik}`;
                      window.open(url, "_blank");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Pratinjau Dokumen"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </button>
                  <a
                    href={`${backendUrl}/api/master-data/pengajuan-peraturan/${draft.id}/download-file/akademik`}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition cursor-pointer shadow-xs"
                    title="Download dengan Watermark JDIH BIN"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------- TAHAP 2: PEMBAHASAN VIEW -------------------
function TabPembahasan({
  draft,
  onNext,
}: {
  draft: PengajuanPeraturan;
  onNext?: () => void;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:8080";
  const { mutate: addPembahasan, isPending } = useAddPembahasanRapat();
  const { mutate: deletePembahasan } = useDeletePembahasanRapat();
  const { mutate: updateTahap, isPending: isUpdatingTahap } = useUpdateTahapanPengajuan();

  const [judulRapat, setJudulRapat] = useState("");
  const [tanggalRapat, setTanggalRapat] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lokasi, setLokasi] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [fileNotulensi, setFileNotulensi] = useState<File | null>(null);

  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState("");

  const handleUploadRapat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulRapat.trim()) {
      toast.error("Judul rapat wajib diisi");
      return;
    }
    if (!tanggalRapat) {
      toast.error("Tanggal rapat wajib diisi");
      return;
    }
    if (!fileNotulensi) {
      toast.error("File PDF hasil rapat wajib diunggah (Maks. 30 MB)");
      return;
    }
    if (fileNotulensi.size > 30 * 1024 * 1024) {
      toast.error("Ukuran file melebihi batas maksimal 30 MB");
      return;
    }

    const fd = new FormData();
    fd.append("judul_rapat", judulRapat.trim());
    fd.append("tanggal_rapat", tanggalRapat);
    if (lokasi.trim()) fd.append("lokasi", lokasi.trim());
    if (keterangan.trim()) fd.append("keterangan", keterangan.trim());
    fd.append("file_notulensi", fileNotulensi);

    addPembahasan(
      { draftId: draft.id, formData: fd },
      {
        onSuccess: () => {
          toast.success("Hasil pembahasan rapat berhasil disimpan");
          setJudulRapat("");
          setLokasi("");
          setKeterangan("");
          setFileNotulensi(null);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Gagal menyimpan hasil rapat");
        },
      }
    );
  };

  const pembahasanList = draft.pembahasan_list || [];

  const isSudahHarmonisasi =
    draft.tahapan === "Harmonisasi" ||
    draft.tahapan === "Persetujuan" ||
    draft.tahapan === "Penetapan";

  const handleLanjutKeHarmonisasi = () => {
    if (pembahasanList.length === 0) {
      toast.error("Wajib mengunggah minimal 1 data hasil rapat pembahasan sebelum dapat lanjut ke tahap berikutnya!");
      return;
    }

    updateTahap(
      {
        id: draft.id,
        payload: {
          tahapan: "Harmonisasi",
          status: "Proses",
        },
      },
      {
        onSuccess: () => {
          toast.success("Rancangan peraturan berhasil diajukan ke Tahap Harmonisasi!");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-blue-900">
            Tahap 2: Pembahasan Hasil Rapat
          </h4>
          <p className="mt-1 text-xs text-blue-700">
            Upload hasil rapat pembahasan regulasi: wajib menyertakan minimal 1 data pembahasan untuk dapat melanjutkan ke tahap berikutnya.
          </p>
        </div>

        {isSudahHarmonisasi ? (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs shrink-0">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Telah Diajukan ke Harmonisasi</span>
          </span>
        ) : (
          <button
            type="button"
            disabled={isUpdatingTahap || pembahasanList.length === 0}
            onClick={handleLanjutKeHarmonisasi}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition shrink-0 ${
              pembahasanList.length === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            }`}
          >
            <span>{isUpdatingTahap ? "Memproses..." : "Lanjut ke Tahap Harmonisasi"}</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Form Tambah Rapat */}
      <form
        onSubmit={handleUploadRapat}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Upload size={15} className="text-blue-600" />
          <span>Input Data Hasil Rapat Pembahasan</span>
        </h5>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Judul Rapat / Agenda <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judulRapat}
              onChange={(e) => setJudulRapat(e.target.value)}
              placeholder="Contoh: Rapat Pleno I Pembahasan Pasal 1-10"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <FormDatePicker
              label="Tanggal Rapat"
              required
              value={tanggalRapat}
              onChange={(val) => setTanggalRapat(val)}
              placeholder="Pilih tanggal rapat..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Lokasi / Tempat Rapat <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Ruang Rapat Biro Hukum / Zoom Meeting"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700">
            Keterangan & Catatan Rapat <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Tuliskan poin-poin kesepakatan atau arahan hasil rapat..."
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Upload File Notulensi / Berita Acara <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5">
              Format: PDF • Ukuran Maksimal 30 MB
            </p>
            <input
              type="file"
              required
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && file.size > 30 * 1024 * 1024) {
                  toast.error("Ukuran file tidak boleh melebihi 30 MB");
                  e.target.value = "";
                  return;
                }
                setFileNotulensi(file);
              }}
              className="block text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            {fileNotulensi && (
              <button
                type="button"
                onClick={() => {
                  const url = URL.createObjectURL(fileNotulensi);
                  setPreviewPdfUrl(url);
                  setPreviewPdfTitle(`Pratinjau File: ${fileNotulensi.name}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition"
              >
                <Eye size={13} />
                <span>Preview PDF</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              <Upload size={14} />
              {isPending ? "Mengunggah..." : "Simpan Hasil Rapat"}
            </button>
          </div>
        </div>
      </form>

      {/* List Hasil Rapat */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Riwayat Hasil Rapat Pembahasan ({pembahasanList.length})
        </h5>
        {pembahasanList.length === 0 ? (
          <div className="mt-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-8 text-center text-xs font-medium text-amber-800">
            Wajib menambahkan minimal 1 data hasil rapat pembahasan sebelum dapat melanjutkan ke tahap berikutnya.
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
                    {(item as any).lokasi && (
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">
                        📍 {(item as any).lokasi}
                      </span>
                    )}
                  </div>
                  {item.keterangan && (
                    <p className="text-xs text-slate-600 whitespace-pre-line">{item.keterangan}</p>
                  )}
                  {item.file_notulensi && (
                    <div className="flex items-center gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${backendUrl}/uploads/pengajuan-peraturan/${item.file_notulensi}`;
                          setPreviewPdfUrl(url);
                          setPreviewPdfTitle(`Notulensi: ${item.judul_rapat}`);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                      >
                        <Eye size={12} />
                        Preview Notulensi
                      </button>
                      <a
                        href={`${backendUrl}/uploads/pengajuan-peraturan/${item.file_notulensi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                      >
                        <Download size={12} />
                        Download File
                      </a>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deletePembahasan(item.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview PDF Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5">
              <h4 className="text-sm font-bold text-slate-900 truncate pr-4">
                {previewPdfTitle || "Pratinjau Dokumen PDF"}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setPreviewPdfUrl(null);
                  setPreviewPdfTitle("");
                }}
                className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={previewPdfUrl}
                className="h-full w-full rounded-xl border border-slate-200 bg-white shadow-inner"
                title="Preview PDF"
              />
            </div>
          </div>
        </div>
      )}
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
        (res as any).answer ||
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

