"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  Edit3,
  Scale,
  User,
} from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { sendChatMessage, getOrCreateConversationId } from "@/services/chat-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
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
  useUploadRevisedDraftPdf,
} from "../hooks/PengajuanPeraturan.hooks";
import { usePenggunaList } from "@/feature/pengguna/hooks/Pengguna.hooks";
import {
  PengajuanPeraturan,
  TahapanPeraturan,
  PersetujuanItem,
} from "../types/PengajuanPeraturan.type";
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
  PembahasanRapatSchema,
  UploadRevisedDraftPdfSchema,
  type PengajuanPeraturanFormValues,
  type VerifikasiPengajuanFormValues,
  type PembahasanRapatFormValues,
} from "../schema/PengajuanPeraturan.schema";
import { fetchDokumenHukum } from "@/feature/dokumen-hukum/api/DokumenHukum.service";
import { useDokumenHukumList } from "@/feature/dokumen-hukum/hooks/DokumenHukum.hooks";
import { SessionHook } from "@/feature/web";
import { generatePeraturanPdfBlob } from "../utils/pdfGenerator";
import dynamic from "next/dynamic";

const FormCKEditorClient = dynamic(
  () => import("@/components/ui/FormCKEditorClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400">
        Memuat CKEditor...
      </div>
    ),
  }
);

const TAHAPAN_STEPS: { stage: TahapanPeraturan; number: number; label: string; desc: string }[] = [
  { stage: "Pengajuan", number: 1, label: "Pengajuan", desc: "Drafting & Naskah Akademik" },
  { stage: "Pembahasan", number: 2, label: "Pembahasan", desc: "Rapat & Notulensi" },
  { stage: "Harmonisasi", number: 3, label: "Harmonisasi", desc: "Penyelarasan Hukum" },
  { stage: "Persetujuan", number: 4, label: "Persetujuan", desc: "Persetujuan Multi-Pejabat" },
  { stage: "Penetapan", number: 5, label: "Penetapan", desc: "Pengundangan & Publikasi" },
];

const formatTanggalIndo = (val?: string | null) => {
  if (!val) return "-";
  if (typeof val === "string") {
    const match = val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const localDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(localDate);
    }
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
};

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

  const rawItems: PengajuanPeraturan[] = (data as any)?.data || [];
  const items = useMemo(() => {
    if (userRole === "admin") {
      const hiddenStatuses = ["Draft", "Ditolak", "Revisi", "Ditetapkan", "Selesai"];
      return rawItems.filter((item) => !hiddenStatuses.includes(item.status));
    }
    return rawItems;
  }, [rawItems, userRole]);
  const totalElements = (data as any)?.totalItems || items.length;
  const totalPages = (data as any)?.totalPages || Math.ceil(totalElements / size) || 1;

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
        width: "320px",
        render: (_val, row) => (
          <div className="py-1 max-w-[320px]">
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
          // Jika status adalah "Proses", sesuaikan dengan tahapan aktif agar informatif
          let statusVal: string = row.status || "Proses";
          if (statusVal === "Proses" && row.tahapan && row.tahapan !== "Pengajuan") {
            statusVal = row.tahapan;
          }

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
              case "Pembahasan":
                return "bg-sky-50 text-sky-700 border-sky-200";
              case "Harmonisasi":
                return "bg-purple-50 text-purple-700 border-purple-200";
              case "Persetujuan":
                return "bg-amber-50 text-amber-700 border-amber-200";
              case "Penetapan":
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
              case "Pembahasan":
                return "bg-sky-500";
              case "Harmonisasi":
                return "bg-purple-500";
              case "Persetujuan":
                return "bg-amber-500";
              case "Penetapan":
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
        width: "90px",
        align: "center",
        render: (_val, row) => {
          // Status yang mengizinkan edit/hapus bagi pengguna: Draft atau Revisi/Ditolak
          const isEditableByPengguna = row.status === "Draft" || row.status === "Revisi" || row.status === "Ditolak";
          // HANYA role 'pengguna' yang boleh edit atau hapus pengajuan peraturan (superadmin & admin hanya lihat/proses)
          const canEditOrDelete = userRole === "pengguna" && isEditableByPengguna;
          // Superadmin tidak boleh proses pengajuan
          const canProcess = userRole !== "superadmin";

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

                    {canProcess && (
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
                    )}

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
                          className={`px-2 py-0.5 rounded-md border text-[11px] ${row.status === "Draft"
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
                            className={`rounded-xl p-2.5 border text-center transition ${isCurrent
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
                                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${isCurrent ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"
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
            activeModule === "JDIH" && userRole === "pengguna"
              ? "Buat Pengajuan Baru"
              : undefined
          }
          onAdd={
            activeModule === "JDIH" && userRole === "pengguna"
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
    if (typeof val === "string") {
      const match = val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const localDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        return new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(localDate);
      }
    }
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
                  {formatDate(draft.tanggal_penetapan || draft.target_penetapan || draft.tanggal_pengajuan)}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tanggal Pengundangan
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {formatDate(draft.tanggal_pengundangan || draft.tanggal_pengajuan)}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Tanggal Berlaku
                </span>
                <p className="text-xs font-semibold text-slate-800">
                  {formatDate(draft.tanggal_berlaku || draft.target_penetapan || draft.tanggal_pengajuan)}
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
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
          <div className="min-w-0 pr-3 sm:pr-4">
            <h2 className="truncate text-base sm:text-lg lg:text-xl font-extrabold text-slate-900">
              {draft.judul}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 shadow-sm cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="border-b border-slate-200 bg-white px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
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
                  className={`flex flex-1 min-w-[145px] sm:min-w-[170px] items-center gap-2 sm:gap-3 rounded-xl border p-2 sm:p-3 text-left transition shrink-0 ${isActive
                      ? activeModule === "HDH"
                        ? "border-amber-600 bg-amber-50/60 text-amber-800 shadow-sm ring-1 ring-amber-500 cursor-pointer"
                        : "border-blue-600 bg-blue-50/60 text-blue-800 shadow-sm ring-1 ring-blue-500 cursor-pointer"
                      : isStepAccessible
                        ? "border-slate-200/80 text-slate-700 hover:bg-slate-50 cursor-pointer"
                        : "border-slate-100 bg-slate-50/60 text-slate-400 opacity-60 cursor-not-allowed"
                    }`}
                >
                  <div
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${isActive
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
                    <p className="truncate text-[10px] text-slate-400 hidden xs:block sm:block">
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
          <div className="w-full px-3.5 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6">
            {activeTab === "Pengajuan" && (
              <TabPengajuan
                draft={draft}
                onNext={() => setActiveTab("Pembahasan")}
                onCloseModal={onClose}
              />
            )}
            {activeTab === "Pembahasan" && <TabPembahasan draft={draft} />}
            {activeTab === "Harmonisasi" && (
              <TabHarmonisasi
                draft={draft}
                onNext={() => setActiveTab("Persetujuan")}
              />
            )}
            {activeTab === "Persetujuan" && (
              <TabPersetujuan
                draft={draft}
                onNext={() => setActiveTab("Penetapan")}
                onBackToHarmonisasi={() => setActiveTab("Harmonisasi")}
              />
            )}
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
    const nextStatus = (draft.status === "Ditolak" || draft.status === "Revisi") ? "Pengajuan Ulang" : "Submit Dokumen";
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
            draft.status === "Ditolak" || draft.status === "Revisi"
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
            status: "Pembahasan",
            catatan_verifikasi: null,
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
            status: "Ditolak",
            catatan_verifikasi: verifCatatan.trim(),
          },
        },
        {
          onSuccess: () => {
            toast.success("Pengajuan berhasil ditolak!");
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
  const isDitolak = draft.status === "Ditolak" || draft.status === "Revisi";
  const isSudahLanjut = draft.tahapan !== "Pengajuan";

  return (
    <div className="space-y-6">
      {/* Banner Notifikasi Catatan Penolakan (HANYA muncul jika status Ditolak / Revisi) */}
      {isDitolak && ((draft as any).catatan_verifikasi || (draft as any).catatan_revisi) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Catatan Penolakan dari Verifikator:
              </h4>
              <p className="mt-1 text-xs text-rose-700 whitespace-pre-line leading-relaxed font-medium">
                {(draft as any).catatan_verifikasi || (draft as any).catatan_revisi}
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
              className={`inline-block font-bold px-2 py-0.5 rounded-md text-[11px] border ${draft.status === "Draft"
                  ? "bg-slate-100 text-slate-700 border-slate-300"
                  : isDitolak
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
          {/* Aksi untuk Pengguna mengirim ke Verifikator (saat status Draft atau Ditolak) */}
          {(isDraftStatus || isDitolak) && (
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
                  : isDitolak
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
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${activeTabMode === "detail"
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
              className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTabMode === "verifikasi"
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
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition cursor-pointer ${verifStatus === "Disetujui"
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
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition cursor-pointer ${verifStatus === "Ditolak"
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
                      <p className="text-xs font-bold">Tolak Permohonan</p>
                      <p className="text-[11px] text-slate-500">Tolak draft pengajuan peraturan</p>
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
                    ? "Contoh: Alasan penolakan dokumen pengajuan rancangan peraturan..."
                    : "Tuliskan catatan apresiasi atau arahan teknis untuk rapat pembahasan (opsional)..."
                }
                className={`w-full rounded-xl border p-3.5 text-xs text-slate-800 focus:outline-none transition ${verifErrors.catatan
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
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow transition cursor-pointer ${verifStatus === "Disetujui"
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
                    <span>Tolak Pengajuan Peraturan</span>
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
              <p className="text-xs text-slate-400">Tanggal Penetapan</p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatTanggalIndo(draft.tanggal_penetapan || draft.target_penetapan)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Tanggal Pengundangan</p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatTanggalIndo(draft.tanggal_pengundangan || draft.tanggal_pengajuan)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-400">Tanggal Berlaku</p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatTanggalIndo(draft.tanggal_berlaku || draft.target_penetapan)}
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
              <p className="text-xs text-slate-400">Status</p>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">File Draft Rancangan</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {draft.file_draft || "Belum ada file draft"}
                  </p>
                </div>
              </div>
              {draft.file_draft && (
                <div className="flex items-center gap-2 shrink-0">
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 bg-slate-50/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <BookOpen size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">Berkas / Dokumen Pendukung</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {draft.file_naskah_akademik || "Belum ada berkas pendukung"}
                  </p>
                </div>
              </div>
              {draft.file_naskah_akademik && (
                <div className="flex items-center gap-2 shrink-0">
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
  const session = SessionHook();
  const userRole = (session?.data?.data?.role || "superadmin").toLowerCase();
  const isAdmin = userRole === "admin";
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
  const [pembahasanErrors, setPembahasanErrors] = useState<{
    judul_rapat?: string;
    tanggal_rapat?: string;
    file_notulensi?: string;
  }>({});

  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState("");

  const handleUploadRapat = (e: React.FormEvent) => {
    e.preventDefault();
    setPembahasanErrors({});

    const validationResult = PembahasanRapatSchema.safeParse({
      judul_rapat: judulRapat,
      tanggal_rapat: tanggalRapat,
      lokasi: lokasi,
      keterangan: keterangan,
      file_notulensi: fileNotulensi,
    });

    if (!validationResult.success) {
      const fieldErrors: { [key: string]: string } = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0]);
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setPembahasanErrors(fieldErrors);
      const firstErrorMessage = validationResult.error.issues[0]?.message || "Silakan lengkapi formulir dengan benar";
      toast.error(firstErrorMessage);
      return;
    }

    const fd = new FormData();
    fd.append("judul_rapat", judulRapat.trim());
    fd.append("tanggal_rapat", tanggalRapat);
    if (lokasi.trim()) fd.append("lokasi", lokasi.trim());
    if (keterangan.trim()) fd.append("keterangan", keterangan.trim());
    if (fileNotulensi) fd.append("file_notulensi", fileNotulensi);

    addPembahasan(
      { draftId: draft.id, formData: fd },
      {
        onSuccess: () => {
          toast.success("Hasil pembahasan rapat berhasil disimpan");
          setJudulRapat("");
          setLokasi("");
          setKeterangan("");
          setFileNotulensi(null);
          setPembahasanErrors({});
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
          status: "Harmonisasi",
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
        ) : !isAdmin ? (
          <button
            type="button"
            disabled={isUpdatingTahap || pembahasanList.length === 0}
            onClick={handleLanjutKeHarmonisasi}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition shrink-0 ${pembahasanList.length === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              }`}
          >
            <span>{isUpdatingTahap ? "Memproses..." : "Lanjut ke Tahap Harmonisasi"}</span>
            <ArrowRight size={14} />
          </button>
        ) : null}
      </div>

      {/* Form Tambah Rapat (Hanya muncul jika belum lanjut ke Harmonisasi dan bukan admin) */}
      {!isAdmin && !isSudahHarmonisasi && (
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
                value={judulRapat}
                onChange={(e) => {
                  setJudulRapat(e.target.value);
                  if (pembahasanErrors.judul_rapat) {
                    setPembahasanErrors((prev) => ({ ...prev, judul_rapat: undefined }));
                  }
                }}
                placeholder="Contoh: Rapat Pleno I Pembahasan Pasal 1-10"
                className={`mt-1 w-full rounded-xl border bg-white px-3.5 py-2 text-xs focus:outline-none transition ${pembahasanErrors.judul_rapat
                    ? "border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
              />
              {pembahasanErrors.judul_rapat && (
                <p className="mt-1 text-xs font-medium text-rose-500 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>{pembahasanErrors.judul_rapat}</span>
                </p>
              )}
            </div>

            <div>
              <FormDatePicker
                label="Tanggal Rapat"
                required
                value={tanggalRapat}
                onChange={(val) => {
                  setTanggalRapat(val);
                  if (pembahasanErrors.tanggal_rapat) {
                    setPembahasanErrors((prev) => ({ ...prev, tanggal_rapat: undefined }));
                  }
                }}
                placeholder="Pilih tanggal rapat..."
                error={pembahasanErrors.tanggal_rapat}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Lokasi / Tempat Rapat
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
              Keterangan & Catatan Rapat
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
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 30 * 1024 * 1024) {
                    toast.error("Ukuran file tidak boleh melebihi 30 MB");
                    e.target.value = "";
                    return;
                  }
                  setFileNotulensi(file);
                  if (pembahasanErrors.file_notulensi) {
                    setPembahasanErrors((prev) => ({ ...prev, file_notulensi: undefined }));
                  }
                }}
                className="block text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {pembahasanErrors.file_notulensi && (
                <p className="mt-1 text-xs font-medium text-rose-500 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>{pembahasanErrors.file_notulensi}</span>
                </p>
              )}
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
      )}

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
                className="flex flex-col sm:flex-row sm:items-start justify-between rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm gap-3"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">
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
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{item.keterangan}</p>
                  )}
                  {item.file_notulensi && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${backendUrl}/uploads/pengajuan-peraturan/${item.file_notulensi}`;
                          setPreviewPdfUrl(url);
                          setPreviewPdfTitle(`Notulensi: ${item.judul_rapat}`);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                      >
                        <Eye size={12} />
                        Preview Notulensi
                      </button>
                      <a
                        href={`${backendUrl}/uploads/pengajuan-peraturan/${item.file_notulensi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                      >
                        <Download size={12} />
                        Download File
                      </a>
                    </div>
                  )}
                </div>
                {!isAdmin && !isSudahHarmonisasi && (
                  <button
                    onClick={() => deletePembahasan(item.id)}
                    className="self-end sm:self-auto rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
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
function TabHarmonisasi({
  draft,
  onNext,
}: {
  draft: PengajuanPeraturan;
  onNext?: () => void;
}) {
  const qc = useQueryClient();
  const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:8080";
  const session = SessionHook();
  const userRole = (session?.data?.data?.role || "superadmin").toLowerCase();
  const isAdmin = userRole === "admin";
  const { mutate: submitHarmonisasi, isPending } = useSubmitHarmonisasi();
  const { mutate: updateTahap, isPending: isUpdatingTahap } = useUpdateTahapanPengajuan();
  const { mutate: uploadRevisedPdf, isPending: isUploadingPdf } = useUploadRevisedDraftPdf();
  const [selectedRevisedFile, setSelectedRevisedFile] = useState<File | null>(null);
  const [revisedFilePreviewUrl, setRevisedFilePreviewUrl] = useState<string | null>(null);
  const revisedFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Ambil daftar dokumen hukum yang telah terpublikasi untuk perbandingan komparasi
  const { data: publishedDocsRes } = useDokumenHukumList({
    page: 1,
    size: 50,
  });
  const publishedDocs = (publishedDocsRes as any)?.data || [];

  const [statusHarmonisasi, setStatusHarmonisasi] = useState(
    draft.status_harmonisasi || "Harmonisasi Selesai Disetujui"
  );
  const [catatan, setCatatan] = useState(draft.catatan_harmonisasi || "");
  const [fileHarmonisasi, setFileHarmonisasi] = useState<File | null>(null);

  // State Konten Draf untuk Pratinjau Dokumen & Editor Perbaikan (Format HTML untuk CKEditor)
  const [drafBatangTubuh, setDrafBatangTubuh] = useState<string>("");
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [aiSuggestedRevision, setAiSuggestedRevision] = useState<string>("");
  const [extractedPdfContent, setExtractedPdfContent] = useState<string>("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "editor">("preview");

  // State Deteksi Konflik / Coretan Tumpang Tindih
  interface ConflictFinding {
    id: string;
    pasal: string;
    kategoriBenturan: string;
    regulasiAcuan: string;
    alasan: string;
    rekomendasiRevisi: string;
  }
  const [conflictFindings, setConflictFindings] = useState<ConflictFinding[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictFinding | null>(null);
  const [aiWarningAlert, setAiWarningAlert] = useState<string | null>(null);
  const [hasTestedHarmonisasi, setHasTestedHarmonisasi] = useState<boolean>(() => {
    return draft.status_harmonisasi === "Harmonisasi Selesai Disetujui" || draft.tahapan === "Persetujuan" || draft.tahapan === "Penetapan";
  });

  const draftFileUrl = useMemo(() => {
    if (draft.file_draft) {
      if (conflictFindings.length > 0 || aiWarningAlert) {
        return `${backendUrl}/api/master-data/pengajuan-peraturan/${draft.id}/annotated-draft-pdf`;
      }
      return `${backendUrl}/uploads/pengajuan-peraturan/${draft.file_draft}`;
    }
    return null;
  }, [backendUrl, draft.id, draft.file_draft, conflictFindings.length, aiWarningAlert]);

  // Fungsi formatting teks ekstraksi PDF standar dokumen hukum Indonesia (Presiden, Konsideran Menimbang/Mengingat, Diktum, Pasal & Ayat)
  // Format ekstraksi dokumen hukum: MURNI menggunakan elemen paragraf (<p>) dengan indentasi presisi standar naskah hukum
  // Tanpa tabel, mendukung Judul tengah, Konsideran (Menimbang/Mengingat), Poin Huruf/Angka, Bab, Pasal, serta Bab Penjelasan (I. UMUM, dsb)
  const formatExtractedLegalPdfToHtml = (rawText: string) => {
    const rawLines = rawText.split("\n");
    const cleanLines: string[] = [];

    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // Filter penomoran halaman footer/header seperti '-- 1 of 35 --', '- 2 -', watermark bphn, serta sambungan baris titik-titik
      if (/^--\s*\d+\s*of\s*\d+\s*--$/i.test(trimmed)) continue;
      if (/^-\s*\d+\s*-$/i.test(trimmed)) continue;
      if (/www\.bphn\.go\.id/i.test(trimmed)) continue;
      if (/^[a-z0-9.]+\s*\.\s*\.\s*\.$/i.test(trimmed)) continue;
      cleanLines.push(trimmed);
    }

    const resultHtml: string[] = [];
    let currentGroup: "menimbang" | "mengingat" | null = null;
    let i = 0;

    while (i < cleanLines.length) {
      const line = cleanLines[i];

      // 1. Header Judul Dokumen & Lembaga (Center & Bold)
      const isCenterHeader =
        /^(PENJELASAN|ATAS|UNDANG-UNDANG REPUBLIK INDONESIA|PERATURAN\s+[A-Z\s]+|KEPUTUSAN\s+[A-Z\s]+|NOMOR\s+[\w\s/]+TAHUN\s+\d+|TENTANG|DENGAN RAHMAT TUHAN YANG MAHA ESA|PRESIDEN REPUBLIK INDONESIA,?|KEPALA\s+[A-Z\s]+,?|DEWAN PERWAKILAN RAKYAT REPUBLIK INDONESIA|Dengan Persetujuan Bersama|MEMUTUSKAN:|BAB\s+[IVXLCDM]+|Pasal\s+\d+)$/i.test(
          line
        );

      if (isCenterHeader) {
        currentGroup = null;
        resultHtml.push(`<p style="text-align: center; margin-bottom: 6px;"><strong>${line}</strong></p>`);
        i++;
        continue;
      }

      // 2. Judul Bagian Penjelasan (misal: "I. UMUM", "II. PASAL DEMI PASAL")
      if (/^[IVXLCDM]+\.\s+[A-Z\s]+$/i.test(line)) {
        currentGroup = null;
        resultHtml.push(`<p style="margin-top: 16px; margin-bottom: 8px;"><strong>${line}</strong></p>`);
        i++;
        continue;
      }

      // 3. Konsideran Menimbang:
      if (/^Menimbang\s*:/i.test(line)) {
        currentGroup = "menimbang";
        const afterColon = line.replace(/^Menimbang\s*:\s*/i, "").trim();
        let content = afterColon;
        i++;
        while (
          i < cleanLines.length &&
          !/^[a-z]\.\s+bahwa/i.test(cleanLines[i]) &&
          !/^Mengingat\s*:/i.test(cleanLines[i]) &&
          !/^(BAB|Pasal|MEMUTUSKAN|PENJELASAN|[IVXLCDM]+\.)/i.test(cleanLines[i])
        ) {
          content += " " + cleanLines[i];
          i++;
        }
        resultHtml.push(
          `<p style="margin-top: 14px; margin-bottom: 6px; padding-left: 120px; text-indent: -120px; text-align: justify; line-height: 1.7;"><strong>Menimbang:</strong>&nbsp;&nbsp;&nbsp;&nbsp;${content}</p>`
        );
        continue;
      }

      // 4. Poin Konsideran Huruf di bawah Menimbang ("b. bahwa ...", "c. bahwa ...")
      if (currentGroup === "menimbang" && /^[a-z]\.\s+bahwa/i.test(line)) {
        let itemContent = line;
        i++;
        while (
          i < cleanLines.length &&
          !/^[a-z]\.\s+bahwa/i.test(cleanLines[i]) &&
          !/^Mengingat\s*:/i.test(cleanLines[i]) &&
          !/^(BAB|Pasal|MEMUTUSKAN|PENJELASAN|[IVXLCDM]+\.)/i.test(cleanLines[i])
        ) {
          itemContent += " " + cleanLines[i];
          i++;
        }
        resultHtml.push(
          `<p style="margin-left: 120px; margin-bottom: 6px; text-align: justify; line-height: 1.7;">${itemContent}</p>`
        );
        continue;
      }

      // 5. Dasar Hukum Mengingat:
      if (/^Mengingat\s*:/i.test(line)) {
        currentGroup = "mengingat";
        const afterColon = line.replace(/^Mengingat\s*:/i, "").trim();
        let content = afterColon;
        i++;
        while (
          i < cleanLines.length &&
          !/^\d+\.\s+/i.test(cleanLines[i]) &&
          !/^(Dengan Persetujuan|MEMUTUSKAN|BAB|Pasal|PENJELASAN|[IVXLCDM]+\.)/i.test(cleanLines[i])
        ) {
          content += " " + cleanLines[i];
          i++;
        }
        resultHtml.push(
          `<p style="margin-top: 14px; margin-bottom: 6px; padding-left: 120px; text-indent: -120px; text-align: justify; line-height: 1.7;"><strong>Mengingat:</strong>&nbsp;&nbsp;&nbsp;&nbsp;${content}</p>`
        );
        continue;
      }

      // 6. Poin Angka di bawah Mengingat ("1. ...", "2. ...")
      if (currentGroup === "mengingat" && /^\d+\.\s+/i.test(line)) {
        let itemContent = line;
        i++;
        while (
          i < cleanLines.length &&
          !/^\d+\.\s+/i.test(cleanLines[i]) &&
          !/^(Dengan Persetujuan|MEMUTUSKAN|BAB|Pasal|PENJELASAN|[IVXLCDM]+\.)/i.test(cleanLines[i])
        ) {
          itemContent += " " + cleanLines[i];
          i++;
        }
        resultHtml.push(
          `<p style="margin-left: 120px; margin-bottom: 6px; text-align: justify; line-height: 1.7;">${itemContent}</p>`
        );
        continue;
      }

      // 7. Diktum Menetapkan:
      if (/^Menetapkan\s*:/i.test(line)) {
        currentGroup = null;
        const afterColon = line.replace(/^Menetapkan\s*:/i, "").trim();
        let content = afterColon;
        i++;
        while (i < cleanLines.length && !/^(BAB|Pasal|MEMUTUSKAN|PENJELASAN|[IVXLCDM]+\.)/i.test(cleanLines[i])) {
          content += " " + cleanLines[i];
          i++;
        }
        resultHtml.push(
          `<p style="margin-top: 12px; margin-bottom: 12px; padding-left: 120px; text-indent: -120px; text-align: justify; line-height: 1.7;"><strong>Menetapkan:</strong>&nbsp;&nbsp;&nbsp;&nbsp;<strong>${content}</strong></p>`
        );
        continue;
      }

      // 8. Poin Definisi Angka Batang Tubuh (misal: "1. Intelijen adalah ...")
      if (/^\d+\.\s+/i.test(line)) {
        currentGroup = null;
        let itemContent = line;
        i++;
        while (
          i < cleanLines.length &&
          !/^\d+\.\s+/i.test(cleanLines[i]) &&
          !/^(BAB|Pasal|\(\d+\)|PENJELASAN|[IVXLCDM]+\.)/i.test(cleanLines[i])
        ) {
          itemContent += " " + cleanLines[i];
          i++;
        }
        resultHtml.push(
          `<p style="margin-left: 36px; text-indent: -24px; margin-bottom: 6px; text-align: justify; line-height: 1.7;">${itemContent}</p>`
        );
        continue;
      }

      // 9. Ayat Bertanda Kurung (misal: "(1) ...", "(2) ...")
      if (/^\(\d+\)\s+/i.test(line)) {
        currentGroup = null;
        let itemContent = line;
        i++;
        while (
          i < cleanLines.length &&
          !/^\(\d+\)\s+/i.test(cleanLines[i]) &&
          !/^(BAB|Pasal|PENJELASAN|[IVXLCDM]+\.)/i.test(cleanLines[i])
        ) {
          itemContent += " " + cleanLines[i];
          i++;
        }
        resultHtml.push(
          `<p style="margin-left: 32px; text-indent: -20px; margin-bottom: 6px; text-align: justify; line-height: 1.7;">${itemContent}</p>`
        );
        continue;
      }

      // 10. Paragraf Narasi Biasa (Termasuk isi penjelasan seperti Pembukaan UUD 1945, dsb)
      // Diberi indentasi tab awal paragraf (text-indent: 36px) persis seperti naskah aslinya
      currentGroup = null;
      let paragraph = line;
      i++;
      while (
        i < cleanLines.length &&
        !/^(PENJELASAN|ATAS|UNDANG-UNDANG|PERATURAN|KEPUTUSAN|NOMOR|TENTANG|DENGAN RAHMAT|PRESIDEN|DEWAN|MEMUTUSKAN|Menimbang|Mengingat|Menetapkan|BAB|Pasal|\d+\.|\(\d+\)|[IVXLCDM]+\.\s+[A-Z\s]+)/i.test(
          cleanLines[i]
        )
      ) {
        // Jika kalimat sebelumnya berakhir tanda titik (.), maka kalimat berikutnya adalah paragraf baru
        if (paragraph.endsWith(".")) {
          break;
        }
        paragraph += " " + cleanLines[i];
        i++;
      }
      resultHtml.push(
        `<p style="text-indent: 36px; margin-bottom: 10px; text-align: justify; line-height: 1.7;">${paragraph}</p>`
      );
    }

    return resultHtml.join("\n");
  };

  // const handleExtractPdfText = async () => {
  //   if (!draft.id || !draft.file_draft) {
  //     toast.error("File draft rancangan belum tersedia untuk diekstrak.");
  //     return;
  //   }

  //   try {
  //     setIsExtractingText(true);
  //     const res = await fetch(`${backendUrl}/api/master-data/pengajuan-peraturan/${draft.id}/extract-draft-text`);
  //     const json = await res.json();
  //     if (json.success && json.data) {
  //       const rawText = json.data.text || "";
  //       setExtractedPdfContent(rawText);

  //       // Jika backend mengembalikan format html berdasar koordinat layout visual PDF asli, prioritaskan html tersebut
  //       const formattedHtml = json.data.html || formatExtractedLegalPdfToHtml(rawText);
  //       setDrafBatangTubuh(formattedHtml);
  //       toast.success("Berhasil mengekstrak draf PDF dengan format penulisan, posisi tengah, dan indentasi persis aslinya!");
  //     } else {
  //       toast.error(json.message || "Gagal mengekstrak teks dari PDF.");
  //     }
  //   } catch (err: any) {
  //     toast.error("Terjadi kesalahan saat mengekstrak PDF: " + err.message);
  //   } finally {
  //     setIsExtractingText(false);
  //   }
  // };

  // useEffect(() => {
  //   if (draft.id && draft.file_draft) {
  //     handleExtractPdfText();
  //   }
  // }, [draft.id, draft.file_draft]);

  // State Chat Harmonisasi & Komparasi Regulasi
  const [chatMessages, setChatMessages] = useState<
    { id: string; role: "user" | "assistant"; text: string; time: string; conflictDetected?: boolean }[]
  >([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  // Helper untuk generate / update preview PDF
  const refreshPdfPreview = async (customBody?: string) => {
    try {
      setIsGeneratingPdf(true);
      const res = await generatePeraturanPdfBlob({
        judul: draft.judul,
        nomor: draft.nomor_rancangan || "Draft",
        tahun: draft.tahun || new Date().getFullYear(),
        kategori: draft.kategori || "PERATURAN BADAN INTELIJEN NEGARA",
        batangTubuh: customBody || drafBatangTubuh,
      });
      setPdfPreviewUrl(res.url);
    } catch (e: any) {
      console.error("Gagal generate PDF preview:", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Generate preview awal saat tab terbuka
  useEffect(() => {
    refreshPdfPreview();
  }, [draft.judul]);

  // Inisialisasi percakapan otomatis saat membuka tab harmonisasi
  useEffect(() => {
    if (chatMessages.length === 0) {
      const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      setChatMessages([
        {
          id: "intro-harmonisasi",
          role: "assistant",
          time: now,
          text: `Halo! Saya asisten penelaah dan komparasi harmonisasi regulasi.

Saya siap menelaah draf rancangan regulasi **"${draft.judul}"** serta membandingkannya secara kontekstual terhadap seluruh peraturan perundang-undangan yang telah terpublikasi.`,
        },
      ]);
    }
  }, [draft.judul, chatMessages.length]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiLoading]);

  // Fungsi deteksi konflik / tumpang tindih regulasi dari respon dinamis
  const detectRegulationConflicts = (userText: string, aiResponse: string) => {
    // Abaikan jika percakapan sapaan umum sederhana
    const isGreeting =
      /^(halo|hai|pagi|siang|sore|malam|assalamualaikum|tes|test|terima kasih|makasih|siapa kamu)\b/i.test(
        userText.trim()
      ) && userText.trim().split(/\s+/).length <= 4;

    if (isGreeting) {
      return false;
    }

    const lowerRes = aiResponse.toLowerCase();

    // Pastikan tidak mendeteksi negasi/bebas konflik seperti "[selaras & bebas tumpang tindih]" atau "tidak ditemukan benturan"
    const isExplicitlyFree =
      lowerRes.includes("selaras & bebas tumpang tindih") ||
      lowerRes.includes("tidak ada benturan") ||
      lowerRes.includes("tidak ditemukan benturan") ||
      lowerRes.includes("bebas tumpang tindih") ||
      lowerRes.includes("tidak ada tumpang tindih") ||
      lowerRes.includes("tidak ditemukan tumpang tindih");

    const conflictKeywords = [
      "[peringatan: tumpang tindih terdeteksi]",
      "tumpang tindih kewenangan",
      "bertentangan dengan",
      "benturan norma",
      "inkonsistensi hierarki",
      "kontradiksi pasal",
      "melanggar hierarki",
      "perlu direvisi agar selaras",
      "klausul yang bertentangan",
    ];

    const hasConflict =
      !isExplicitlyFree &&
      (conflictKeywords.some((kw) => lowerRes.includes(kw)) ||
        (lowerRes.includes("tumpang tindih") && !lowerRes.includes("bebas tumpang tindih") && !lowerRes.includes("tidak tumpang tindih")) ||
        (lowerRes.includes("bentrok") && !lowerRes.includes("tidak bentrok")));

    if (hasConflict) {
      setAiWarningAlert(
        "Peringatan Harmonisasi: Ditemukan indikasi benturan klausul atau tumpang tindih kewenangan dengan regulasi terpublikasi. Silakan periksa catatan telaah dan unggah draf hasil perbaikan pada tab Perbaikan Dokumen."
      );

      // Parsing temuan konflik dinamis dari respon hasil analisis
      const dynamicFindings: ConflictFinding[] = [];
      const lines = aiResponse.split("\n");
      let currentFinding: Partial<ConflictFinding> | null = null;
      let count = 0;

      for (const rawLine of lines) {
        const line = rawLine.trim();
        const pasalMatch = line.match(/(?:Pasal|BAB|Klausul)\s+[\d\w\s()&.,-]+/i);
        const isItemHeader = /^(\d+\.|\*|-|•)\s+/i.test(line);

        if (isItemHeader || (pasalMatch && (line.includes("tumpang tindih") || line.includes("benturan") || line.includes("bertentangan") || line.includes("beririsan")))) {
          if (currentFinding && currentFinding.pasal) {
            count++;
            dynamicFindings.push({
              id: `cf-${count}`,
              pasal: currentFinding.pasal || `Pasal ${count}`,
              kategoriBenturan: currentFinding.kategoriBenturan || "Tumpang Tindih / Benturan Norma",
              regulasiAcuan: currentFinding.regulasiAcuan || "Peraturan Terpublikasi Terkait",
              alasan: currentFinding.alasan || "Ditemukan norma yang beririsan atau bertentangan secara materi muatan.",
              rekomendasiRevisi: currentFinding.rekomendasiRevisi || "Harmonisasikan rumusan klausul agar selaras dengan peraturan acuan.",
            });
            currentFinding = null;
          }

          let extractedPasal = pasalMatch ? pasalMatch[0] : "";
          let cleanedLine = line.replace(/^(\d+\.|\*|-|•)\s+/, "").replace(/[*_#`]/g, "");

          let kategori = "Tumpang Tindih / Benturan Norma";
          if (line.toLowerCase().includes("kewenangan")) kategori = "Tumpang Tindih Kewenangan Koordinasi";
          else if (line.toLowerCase().includes("hierarki")) kategori = "Potensi Inkonsistensi Hierarki Hukum";
          else if (line.toLowerCase().includes("duplikasi")) kategori = "Duplikasi Ketentuan";

          let refRegulasi = "";
          const refMatch = line.match(/(Undang-Undang|UU|Peraturan Presiden|Perpres|Peraturan Kepala|Perka|Permen)\s+[^.,;()]+/i);
          if (refMatch) refRegulasi = refMatch[0];

          currentFinding = {
            pasal: extractedPasal || cleanedLine.slice(0, 40),
            kategoriBenturan: kategori,
            regulasiAcuan: refRegulasi || "Regulasi Terpublikasi",
            alasan: cleanedLine,
            rekomendasiRevisi: "Lakukan perbaikan atau reformulasi klausul draf agar selaras.",
          };
        } else if (currentFinding) {
          if (line.toLowerCase().includes("usulan") || line.toLowerCase().includes("saran") || line.toLowerCase().includes("revisi")) {
            currentFinding.rekomendasiRevisi = line.replace(/[*_#`]/g, "");
          } else if (line.length > 5 && !currentFinding.alasan?.includes(line)) {
            currentFinding.alasan = `${currentFinding.alasan || ""} ${line}`.trim();
          }
        }
      }

      if (currentFinding && currentFinding.pasal) {
        count++;
        dynamicFindings.push({
          id: `cf-${count}`,
          pasal: currentFinding.pasal || `Pasal ${count}`,
          kategoriBenturan: currentFinding.kategoriBenturan || "Tumpang Tindih / Benturan Norma",
          regulasiAcuan: currentFinding.regulasiAcuan || "Peraturan Terpublikasi Terkait",
          alasan: currentFinding.alasan || "Ditemukan norma yang beririsan atau bertentangan secara materi muatan.",
          rekomendasiRevisi: currentFinding.rekomendasiRevisi || "Harmonisasikan rumusan klausul agar selaras dengan peraturan acuan.",
        });
      }

      if (dynamicFindings.length === 0) {
        // Fallback jika format respons berbentuk narasi umum
        dynamicFindings.push({
          id: "cf-1",
          pasal: "Klausul Substansi Draf",
          kategoriBenturan: "Potensi Benturan / Tumpang Tindih Norma",
          regulasiAcuan: "Regulasi Terpublikasi Terkait",
          alasan: aiResponse.slice(0, 180) + "...",
          rekomendasiRevisi: "Selaraskan rumusan materi muatan sesuai catatan telaah komparasi di samping.",
        });
      }

      setConflictFindings(dynamicFindings);
      setSelectedConflict(dynamicFindings[0]);
    } else {
      setAiWarningAlert(null);
      setConflictFindings([]);
      setSelectedConflict(null);
      setHasTestedHarmonisasi(true);
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
      // Ambil dokumen hukum resmi terpublikasi dari database (ringkas agar prompt hemat karakter)
      const referenceDocsSummary = publishedDocs
        .slice(0, 8)
        .map(
          (doc: any, idx: number) =>
            `${idx + 1}. [${doc.kategori || "Peraturan"}] ${doc.judul} (${doc.nomor || "-"})`
        )
        .join("\n");

      // Cek apakah pertanyaan user adalah sapaan atau percakapan umum sederhana (seperti "halo", "selamat pagi", "siapa kamu", dsb)
      const isGreetingOrGeneral =
        /^(halo|hai|pagi|siang|sore|malam|assalamualaikum|tes|test|terima kasih|makasih|siapa kamu)\b/i.test(
          text.trim()
        ) && text.trim().split(/\s+/).length <= 4;

      let promptToSend = text;
      if (!isGreetingOrGeneral) {
        // Hanya tambahkan konteks komparasi hukum jika pengguna memang menanyakan atau melakukan pengujian harmonisasi/peraturan
        const draftContentText = extractedPdfContent || drafBatangTubuh || draft.ringkasan || draft.judul;
        const snippetDraft = draftContentText.length > 2000 
          ? draftContentText.slice(0, 2000) + "\n...[dipersingkat untuk efisiensi komparasi]" 
          : draftContentText;

        promptToSend = `[INSTRUKSI HARMONISASI & KOMPARASI REGULASI]
Draf yang ditelaah: "${draft.judul}" (${draft.kategori || "Peraturan"} Nomor: ${draft.nomor_rancangan || "-"})
Urgensi: ${(draft as any).urgensi || draft.ringkasan || "-"}

KONTEN DRAF RANCANGAN (CUPLIKAN):
"""
${snippetDraft}
"""

REGULASI RESMI PEMBANDING DI DATABASE:
${referenceDocsSummary || "- Belum ada data peraturan publikasi"}

TUGAS PENELAAH:
1. Jawab pertanyaan pengguna atau komparasikan materi muatan draf terhadap regulasi pembanding di atas.
2. Jika ada klausul TUMPANG TINDIH atau BERTENTANGAN (Lex Superior):
   - Tuliskan: [PERINGATAN: TUMPANG TINDIH TERDETEKSI]
   - Jelaskan nomor pasal yang berbenturan beserta regulasi acuan dan rekomendasi perbaikannya.
3. Jika tidak ada benturan:
   - Tuliskan: [SELARAS & BEBAS TUMPANG TINDIH]
Gunakan gaya bahasa hukum perundang-undangan resmi. Format output tabel markdown yang rapi jika menyajikan komparasi.

Instruksi / Pertanyaan Pengguna: ${text}`;
      }

      const res = await sendChatMessage(promptToSend, convId);
      const answer =
        res.message ||
        (res as any).answer ||
        "Analisis keselarasan selesai. Tidak ditemukan benturan norma hukum yang signifikan dengan dokumen hukum yang telah terpublikasi.";

      const hasConflict = detectRegulationConflicts(text, answer);

      // Tangkap usulan revisi otomatis jika tersedia dalam respon
      if (answer.includes("Usulan") || answer.includes("Revisi") || answer.includes("Perbaikan")) {
        setAiSuggestedRevision(answer);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: "harmonisasi-" + Date.now(),
          role: "assistant",
          text: answer,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          conflictDetected: hasConflict,
        },
      ]);
    } catch (err: any) {
      const errMsg = err?.message || "Gagal menghubungi layanan telaah regulasi.";
      toast.error(errMsg);
      setChatMessages((prev) => [
        ...prev,
        {
          id: "harmonisasi-err-" + Date.now(),
          role: "assistant",
          text: `Terjadi kendala saat melakukan pengujian komparasi: ${errMsg}. Silakan periksa koneksi atau coba beberapa saat lagi.`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          conflictDetected: false,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAutoAnalyze = () => {
    handleSendPrompt(
      `Lakukan uji komparasi dan harmonisasi menyeluruh untuk file draft: "${draft.judul}". Bandingkan terhadap seluruh peraturan yang telah terpublikasi di database dokumen hukum. Cek apakah ada pasal yang bertentangan atau tumpang tindih. Berikan peringatan bila ada norma yang bentrok!`
    );
  };

  const handleSelectRevisedPdfFile = (file: File | null) => {
    if (!file) return;

    // Validasi format dan ukuran file PDF
    const validationResult = UploadRevisedDraftPdfSchema.safeParse({ file_draft: file });
    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues?.[0]?.message ||
        (validationResult.error as any).errors?.[0]?.message ||
        "Berkas tidak valid";
      toast.error(firstError);
      if (revisedFileInputRef.current) revisedFileInputRef.current.value = "";
      return;
    }

    setSelectedRevisedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setRevisedFilePreviewUrl(objectUrl);
  };

  const handleSimpanUploadPerbaikanPdf = () => {
    if (!selectedRevisedFile) {
      toast.error("Silakan pilih file PDF perbaikan terlebih dahulu!");
      return;
    }

    // Validasi ulang schema sebelum kirim
    const validationResult = UploadRevisedDraftPdfSchema.safeParse({ file_draft: selectedRevisedFile });
    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues?.[0]?.message ||
        (validationResult.error as any).errors?.[0]?.message ||
        "Berkas tidak valid";
      toast.error(firstError);
      return;
    }

    uploadRevisedPdf(
      { draftId: draft.id, filePdf: selectedRevisedFile },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
          setAiWarningAlert(null);
          setConflictFindings([]);
          setSelectedConflict(null);
          setStatusHarmonisasi("Harmonisasi Selesai Disetujui");
          setHasTestedHarmonisasi(true);
          setSelectedRevisedFile(null);
          setRevisedFilePreviewUrl(null);
          if (revisedFileInputRef.current) revisedFileInputRef.current.value = "";
          setActiveRightTab("preview");
          toast.success("Dokumen perbaikan berhasil diunggah! Lampiran draf telah diperbarui.");
        },
      }
    );
  };


  const handleLanjutKePersetujuan = () => {
    if (aiWarningAlert) {
      toast.error("Masih terdapat peringatan tumpang tindih atau benturan hukum. Selesaikan revisi sebelum melanjutkan!");
      return;
    }

    updateTahap(
      {
        id: draft.id,
        payload: {
          tahapan: "Persetujuan",
          status: "Persetujuan",
        },
      },
      {
        onSuccess: () => {
          toast.success("Rancangan peraturan berhasil diajukan ke Tahap 4 Persetujuan!");
          if (onNext) onNext();
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("status_harmonisasi", statusHarmonisasi);
    fd.append("catatan_harmonisasi", catatan);
    if (fileHarmonisasi) fd.append("file_harmonisasi", fileHarmonisasi);

    submitHarmonisasi({ draftId: draft.id, formData: fd });
  };

  const rejectedPersetujuan = useMemo(() => {
    return draft.persetujuan_list?.find((item) => item.status === "Ditolak");
  }, [draft.persetujuan_list]);

  const isHarmonisasiLolos =
    hasTestedHarmonisasi &&
    conflictFindings.length === 0 &&
    !aiWarningAlert;

  const isBolehLanjutPersetujuan =
    !isAdmin &&
    isHarmonisasiLolos &&
    draft.tahapan !== "Persetujuan" &&
    draft.tahapan !== "Penetapan";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alert Pengembalian jika Draf Pernah Ditolak di Tahap Persetujuan */}
      {(draft.status === "Perlu Perbaikan Harmonisasi" || rejectedPersetujuan) && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50/95 p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-rose-900 text-sm flex items-center gap-2">
              <span>Dokumen Dikembalikan dari Tahap Persetujuan</span>
              <span className="rounded-full bg-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                Perlu Perbaikan
              </span>
            </h5>
            <p className="mt-1 text-rose-800 font-medium">
              Dokumen rancangan peraturan ini telah <strong>ditolak oleh pihak persetujuan</strong>{" "}
              {rejectedPersetujuan?.nama_pejabat ? `(${rejectedPersetujuan.nama_pejabat} - ${rejectedPersetujuan.jabatan})` : ""} dan dikembalikan ke Tahap Harmonisasi untuk diselaraskan kembali.
            </p>
            {rejectedPersetujuan?.catatan && (
              <div className="mt-2.5 rounded-xl border border-rose-200 bg-white/80 p-2.5 text-rose-900">
                <span className="font-bold block text-[11px] text-rose-700 mb-0.5">Catatan / Alasan Penolakan:</span>
                <p className="whitespace-pre-line text-xs font-semibold">{rejectedPersetujuan.catatan}</p>
              </div>
            )}
            {rejectedPersetujuan?.file_lampiran && (
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={`${backendUrl}/uploads/pengajuan-peraturan/${rejectedPersetujuan.file_lampiran}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
                >
                  <Download size={13} />
                  <span>Unduh File Lampiran Catatan Revisi</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-blue-50/50 to-indigo-50/60 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-600/20">
              <Scale size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Tahap 3: Harmonisasi Dokumen Hukum
                </h4>
              </div>
              <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                Pengujian keselarasan norma draf rancangan terhadap seluruh peraturan hukum yang telah terpublikasi. Sistem memvalidasi agartidak ada aturan yang tumpang tindih, bertentangan, atau bentrok wewenang.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAutoAnalyze}
              disabled={isAiLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={14} className="sm:w-[15px] sm:h-[15px]" />
              <span>{isAiLoading ? "Sedang Mengomparasi..." : "Uji Komparasi Harmonisasi"}</span>
            </button>

            {!isAdmin && isBolehLanjutPersetujuan && (
              <button
                type="button"
                onClick={handleLanjutKePersetujuan}
                disabled={isUpdatingTahap}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold transition shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                title="Semua norma lolos harmonisasi. Lanjut ke Tahap Persetujuan Multi-Pihak"
              >
                <span>{isUpdatingTahap ? "Memproses..." : "Lanjut ke Tahap Persetujuan"}</span>
                <ChevronRight size={14} className="sm:w-[15px] sm:h-[15px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {aiWarningAlert && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 p-3.5 sm:p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <ShieldAlert size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-1.5">
              <span>Peringatan Harmonisasi: Potensi Tumpang Tindih / Benturan Norma Terdeteksi!</span>
            </h5>
            <p className="mt-1 text-amber-800 leading-relaxed font-medium">
              {aiWarningAlert}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-900">
                Status Validasi: Tombol Persetujuan Dinonaktifkan
              </span>
              <button
                type="button"
                onClick={() => setActiveRightTab("editor")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <Upload size={12} />
                <span>Buka Tab Perbaikan Dokumen</span>
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

      {/* Grid 2 Kolom: Kolom Kiri Chat Komparasi, Kolom Kanan Pratinjau Dokumen / Editor / Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Kolom Kiri: Chat Komparasi & Telaah Regulasi */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden h-[620px] sm:h-[700px] lg:h-[780px]">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 sm:px-5 py-3 sm:py-3.5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 text-white shadow-xs">
                <Scale size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                  <span>Asisten Chat </span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </h5>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Komparasi draf terhadap database dokumen hukum yang telah terbit</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setChatMessages([]);
                  setAiWarningAlert(null);
                  setConflictFindings([]);
                }}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 transition p-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                title="Bersihkan Percakapan"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Chat Message List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar bg-slate-50/30">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 sm:gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${isUser
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-amber-600 text-white shadow-xs"
                      }`}
                  >
                    {isUser ? <User size={15} className="sm:w-4 sm:h-4 text-white" /> : <Scale size={14} className="sm:w-4 sm:h-4" />}
                  </div>
                  <div
                    className={`group relative max-w-[92%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs leading-relaxed shadow-2xs ${isUser
                        ? "bg-blue-600 text-white rounded-tr-xs"
                        : msg.conflictDetected
                          ? "bg-amber-50/90 text-slate-800 border border-amber-200 rounded-tl-xs"
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                      }`}
                  >
                    {!isUser && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-1.5 mb-2 gap-1.5">
                        <span className="font-bold text-amber-800 text-[10px] sm:text-[11px] flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-amber-600" />
                          Asisten Chat
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                      </div>
                    )}
                    <div className={`prose prose-xs max-w-none text-xs break-words overflow-x-auto leading-relaxed ${isUser ? "text-white" : "text-slate-800"}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          table: ({ children }) => (
                            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                              <table className="w-full text-left text-xs border-collapse">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="border-b border-slate-200 bg-amber-50/70 text-slate-900 font-bold">
                              {children}
                            </thead>
                          ),
                          th: ({ children }) => (
                            <th className="border-r border-slate-200 last:border-r-0 px-3.5 py-2.5 font-bold text-slate-900 text-xs">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border-t border-r border-slate-100 last:border-r-0 px-3.5 py-2.5 align-top text-xs text-slate-700 leading-relaxed">
                              {children}
                            </td>
                          ),
                          h1: ({ children }) => (
                            <h1 className={`text-sm font-bold mt-3 mb-1.5 ${isUser ? "text-white" : "text-slate-900"}`}>{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className={`text-xs font-bold mt-2.5 mb-1 ${isUser ? "text-white" : "text-slate-900"}`}>{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className={`text-xs font-semibold mt-2 mb-1 ${isUser ? "text-white" : "text-slate-800"}`}>{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-2 leading-relaxed text-xs">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                          ),
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => (
                            <strong className={`font-bold ${isUser ? "text-white" : "text-slate-900"}`}>{children}</strong>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}

            {isAiLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs animate-pulse">
                  <Scale size={16} />
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-600 animate-ping" />
                    <span>Masih Memproses Jawaban Anda...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
          {/* Chat Input */}
          <div className="border-t border-slate-200 bg-white p-2.5 sm:p-3">
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
                placeholder="Ketik instruksi uji komparasi terhadap peraturan terpublikasi..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-3 sm:px-4 py-2 sm:py-2.5 text-xs focus:border-amber-500 focus:bg-white focus:outline-none transition min-w-0"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isAiLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs hover:bg-amber-700 transition disabled:opacity-40 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Dokumen dengan Coretan Background / Form Editor Perbaikan / Simpan Hasil */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden h-[620px] sm:h-[700px] lg:h-[780px]">
          {/* Tab Navigation Kolom Kanan - Responsive Scroll/Wrap */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-3 sm:px-4 py-2 sm:py-2.5 gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-thin max-w-full pb-0.5">
              <button
                type="button"
                onClick={() => setActiveRightTab("preview")}
                className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${activeRightTab === "preview"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <FileText size={13} className="text-blue-600 sm:w-[14px] sm:h-[14px]" />
                <span className="whitespace-nowrap">Pratinjau Lembar Draf</span>
                {conflictFindings.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white font-black animate-pulse">
                    {conflictFindings.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveRightTab("editor")}
                className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0 ${activeRightTab === "editor"
                    ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Edit3 size={13} className="text-emerald-600 sm:w-[14px] sm:h-[14px]" />
                <span className="whitespace-nowrap">Perbaikan Dokumen</span>
              </button>
            </div>
          </div>

          {/* Konten Tab Kanan */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar bg-slate-50/40">
            {activeRightTab === "preview" && (
              <div className="space-y-4">
                {/* Banner Peringatan jika ada klausul berbenturan */}
                {conflictFindings.length > 0 ? (
                  <div className="rounded-xl border border-rose-300 bg-rose-50/95 p-3 sm:p-3.5 shadow-xs space-y-2 sm:space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                        <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                        <span>Klausul Beririsan / Tumpang Tindih Terdeteksi:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveRightTab("editor")}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer self-start sm:self-auto flex items-center gap-1"
                      >
                        <Upload size={11} />
                        Upload Perbaikan Dokumen
                      </button>
                    </div>

                    <div className="space-y-2">
                      {conflictFindings.map((cf) => (
                        <div
                          key={cf.id}
                          onClick={() => setSelectedConflict(cf)}
                          className={`p-2 sm:p-2.5 rounded-lg border text-xs cursor-pointer transition ${selectedConflict?.id === cf.id
                              ? "border-rose-400 bg-rose-100/90 shadow-2xs"
                              : "border-rose-200 bg-white/80 hover:bg-rose-100/60"
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-rose-900 line-through decoration-rose-500 decoration-2">
                              {cf.pasal}
                            </span>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-200 px-2 py-0.5 rounded-full shrink-0">
                              {cf.kategoriBenturan}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600">
                            <strong>Berbenturan dengan:</strong> {cf.regulasiAcuan}
                          </p>
                          <p className="mt-0.5 text-[11px] text-rose-800">
                            <strong>Saran Revisi:</strong> {cf.rekomendasiRevisi}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : ( <></>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <FileText size={15} className="text-blue-600" />
                      <span>File Draft Rancangan</span>
                      {conflictFindings.length > 0 && (
                        <span className="rounded bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          Ditandai Coretan Kuning ({conflictFindings.length} Catatan)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Banner Notifikasi di Atas PDF Preview: Penjelasan Klausul Bermasalah */}
                  {conflictFindings.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-3 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        <span>Catatan Masalah pada Dokumen PDF (Coretan Kuning):</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        {conflictFindings.map((cf, idx) => (
                          <div key={cf.id} className="rounded-lg bg-white/90 border border-amber-200 p-2 shadow-2xs">
                            <span className="font-bold text-rose-700 inline-block mr-1">
                              [{idx + 1}] {cf.pasal}:
                            </span>
                            <span className="text-slate-700 font-medium">{cf.kategoriBenturan}</span>
                            <p className="text-slate-500 text-[10px] mt-0.5">
                              Berbenturan dengan {cf.regulasiAcuan}. {cf.rekomendasiRevisi}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="w-full bg-slate-100 min-h-[460px] sm:min-h-[520px] flex items-center justify-center p-1 sm:p-2">
                    {draftFileUrl || pdfPreviewUrl ? (
                      <iframe
                        src={`${draftFileUrl || pdfPreviewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        title="Pratinjau PDF File Draft Rancangan"
                        className="w-full h-[520px] sm:h-[600px] rounded-lg border border-slate-200 shadow-inner bg-white"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
                        <FileText size={32} className="animate-pulse text-slate-300" />
                        <p className="text-xs font-medium">Sedang menyiapkan viewer PDF...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === "editor" && (
              <div className="space-y-4 flex flex-col h-full">
                {/* Header Toolbar Perbaikan Dokumen (Upload Berkas PDF Perbaikan) */}
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-blue-50/70 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                      <Upload size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Upload Perbaikan Dokumen (PDF)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Unggah berkas PDF naskah draf yang telah diselaraskan / diperbaiki. Berkas ini akan langsung memperbarui pratinjau lembar draf resmi.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => revisedFileInputRef.current?.click()}
                    className="group rounded-xl border border-dashed border-emerald-300 bg-white p-4 sm:p-5 text-center space-y-3 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
                        <FileText size={24} />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-emerald-700 group-hover:text-emerald-800 group-hover:underline">
                          Klik untuk memilih berkas PDF
                        </span>{" "}
                        <span className="text-slate-500">atau tarik dan lepas file di sini</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Hanya format naskah PDF (.pdf), maksimal 30 MB
                      </p>
                    </div>

                    <input
                      ref={revisedFileInputRef}
                      id="upload-perbaikan-pdf-input"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleSelectRevisedPdfFile(file);
                      }}
                      className="hidden"
                    />

                    {selectedRevisedFile && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-left cursor-default"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={18} className="text-emerald-700 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-emerald-950 truncate">
                              {selectedRevisedFile.name}
                            </p>
                            <p className="text-[10px] text-emerald-700 font-medium">
                              {(selectedRevisedFile.size / 1024 / 1024).toFixed(2)} MB • Berkas siap disimpan
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRevisedFile(null);
                            setRevisedFilePreviewUrl(null);
                            if (revisedFileInputRef.current) revisedFileInputRef.current.value = "";
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus pilihan"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSimpanUploadPerbaikanPdf}
                      disabled={!selectedRevisedFile || isUploadingPdf}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 size={15} />
                      <span>{isUploadingPdf ? "Menyimpan Berkas..." : "Simpan Dokumen Perbaikan"}</span>
                    </button>
                  </div>
                </div>

                {/* Pratinjau Berkas PDF: Hanya Muncul Ketika File Berhasil Dipilih/Diupload */}
                {revisedFilePreviewUrl && (
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex-1 min-h-[460px] sm:min-h-[520px] animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <FileText size={15} className="text-blue-600" />
                        <span>Pratinjau Berkas PDF yang Dipilih</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Siap Disimpan
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 min-h-[460px] sm:min-h-[520px] flex items-center justify-center p-1 sm:p-2">
                      <iframe
                        src={`${revisedFilePreviewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        title="Pratinjau PDF Perbaikan"
                        className="w-full h-[520px] sm:h-[600px] rounded-lg border border-slate-200 shadow-inner bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------- TAHAP 4: PERSETUJUAN MULTI-PERSON VIEW -------------------
function TabPersetujuan({
  draft,
  onNext,
  onBackToHarmonisasi,
}: {
  draft: PengajuanPeraturan;
  onNext?: () => void;
  onBackToHarmonisasi?: () => void;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:8080";
  const { mutate: addPejabat, isPending: isAdding } = useAddPejabatPersetujuan();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateStatusPersetujuan();
  const { mutate: deletePejabat } = useDeletePejabatPersetujuan();
  const { mutate: updateTahap, isPending: isUpdatingTahap } = useUpdateTahapanPengajuan();

  // Ambil daftar user untuk dropdown penunjukan admin/pejabat
  const { data: userListRes } = usePenggunaList({ page: 1, size: 100 });
  const rawUserList = (userListRes as any)?.data || (userListRes as any)?.content || [];
  const adminUsers = useMemo(() => {
    return (rawUserList as any[]).filter(
      (u) => u.role?.toLowerCase() === "admin" || u.role?.toLowerCase() === "superadmin"
    );
  }, [rawUserList]);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [namaPejabat, setNamaPejabat] = useState("");
  const [jabatan, setJabatan] = useState("");

  // Modal State Penolakan
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetRejectItem, setTargetRejectItem] = useState<PersetujuanItem | null>(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [fileLampiranPenolakan, setFileLampiranPenolakan] = useState<File | null>(null);

  const handleSelectAdmin = (userId: string) => {
    setSelectedUserId(userId);
    if (!userId) {
      setNamaPejabat("");
      setJabatan("");
      return;
    }
    const found = adminUsers.find((u) => String(u.id) === userId);
    if (found) {
      setNamaPejabat(found.nama || "");
      setJabatan(found.role ? (found.role === "superadmin" ? "Super Admin / Pimpinan" : "Admin Verifikator Hukum") : "Pejabat Terkait");
    }
  };

  const handleAddPejabat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPejabat.trim() || !jabatan.trim()) {
      toast.error("Nama pejabat dan jabatan wajib diisi!");
      return;
    }

    addPejabat(
      {
        draftId: draft.id,
        payload: { nama_pejabat: namaPejabat, jabatan },
      },
      {
        onSuccess: () => {
          setSelectedUserId("");
          setNamaPejabat("");
          setJabatan("");
        },
      }
    );
  };

  const persetujuanList = draft.persetujuan_list || [];
  const isSemuaDisetujui =
    persetujuanList.length > 0 &&
    persetujuanList.every((item) => item.status === "Disetujui");
  const adaYangMenolak = persetujuanList.some((item) => item.status === "Ditolak");

  const handleLanjutKePenetapan = () => {
    updateTahap(
      {
        id: draft.id,
        payload: {
          tahapan: "Penetapan",
          status: "Penetapan",
        },
      },
      {
        onSuccess: () => {
          toast.success("Rancangan peraturan berhasil diajukan ke Tahap Penetapan!");
          if (onNext) onNext();
        },
      }
    );
  };

  const handleOpenRejectModal = (item: PersetujuanItem) => {
    setTargetRejectItem(item);
    setAlasanPenolakan("");
    setFileLampiranPenolakan(null);
    setRejectModalOpen(true);
  };

  const handleSubmitPenolakan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRejectItem) return;
    if (!alasanPenolakan.trim()) {
      toast.error("Pesan / alasan penolakan wajib diisi!");
      return;
    }

    updateStatus(
      {
        persetujuanId: targetRejectItem.id,
        payload: {
          status: "Ditolak",
          catatan: alasanPenolakan.trim(),
          file_lampiran: fileLampiranPenolakan,
        },
      },
      {
        onSuccess: () => {
          setRejectModalOpen(false);
          setTargetRejectItem(null);
          setAlasanPenolakan("");
          setFileLampiranPenolakan(null);
          toast.warning("Dokumen peraturan telah ditolak dan otomatis dikembalikan ke Tahap Harmonisasi untuk perbaikan!");
          if (onBackToHarmonisasi) {
            onBackToHarmonisasi();
          }
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert Pengembalian Status jika ada yang menolak */}
      {adaYangMenolak && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50/95 p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-rose-900 text-sm flex items-center gap-2">
              <span>Persetujuan Ditolak - Dokumen Dikembalikan ke Tahap Harmonisasi</span>
            </h5>
            <p className="mt-1 text-rose-800 font-medium">
              Salah satu pejabat/admin yang ditunjuk menolak persetujuan dokumen ini. Status rancangan peraturan otomatis dikembalikan ke Tahap Harmonisasi untuk dilakukan perbaikan klausul regulasi.
            </p>
            {onBackToHarmonisasi && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onBackToHarmonisasi}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
                >
                  <Scale size={13} />
                  <span>Buka Tahap Harmonisasi untuk Perbaikan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-blue-900">
            Tahap 4: Persetujuan Multi-Pihak
          </h4>
          <p className="mt-1 text-xs text-blue-700">
            Admin menunjuk beberapa pihak/pejabat yang bersangkutan (minimal 1 orang atau lebih). Jika salah satu pihak menolak, draf otomatis dikembalikan ke Tahap Harmonisasi beserta pesan dan lampiran catatan revisi.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleLanjutKePenetapan}
            disabled={!isSemuaDisetujui || isUpdatingTahap || draft.tahapan === "Penetapan"}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            title={
              !isSemuaDisetujui
                ? "Semua pihak dalam checklist harus berstatus Disetujui terlebih dahulu"
                : "Lanjut ke Tahap 5 Penetapan"
            }
          >
            <span>Lanjut ke Penetapan</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Form Penunjukan Admin / Pejabat */}
      <form
        onSubmit={handleAddPejabat}
        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
      >
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span>Penunjukan Admin / Pejabat untuk Persetujuan</span>
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Minimal 1 Orang</span>
        </h5>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Pilih dari Akun Admin
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => handleSelectAdmin(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Admin atau Ketik Manual --</option>
              {adminUsers.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.nama} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Nama Pejabat / Pihak
            </label>
            <input
              type="text"
              required
              value={namaPejabat}
              onChange={(e) => setNamaPejabat(e.target.value)}
              placeholder="Nama Pejabat / Pihak"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Jabatan / Instansi
            </label>
            <input
              type="text"
              required
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Jabatan / Instansi"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isAdding}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Plus size={14} />
              <span>{isAdding ? "Menunjuk..." : "Tunjuk untuk Persetujuan"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Checklist Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white scrollbar-thin">
        <table className="w-full text-left text-xs text-slate-600 min-w-[720px]">
          <thead className="border-b border-slate-100 bg-slate-50 font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama Pejabat</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pesan / Alasan Catatan</th>
              <th className="px-4 py-3">File Lampiran</th>
              <th className="px-4 py-3 text-center">Keputusan</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {persetujuanList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Belum ada pihak persetujuan yang ditunjuk. Silakan tunjuk minimal 1 orang pejabat/admin di atas.
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
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${item.status === "Disetujui"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "Ditolak"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">
                    {item.catatan ? (
                      <p className="line-clamp-2 text-xs" title={item.catatan}>
                        {item.catatan}
                      </p>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.file_lampiran ? (
                      <a
                        href={`${backendUrl}/uploads/pengajuan-peraturan/${item.file_lampiran}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                      >
                        <Download size={13} />
                        <span className="truncate max-w-[120px]">Lampiran</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus({
                            persetujuanId: item.id,
                            payload: { status: "Disetujui" },
                          })
                        }
                        disabled={isUpdatingStatus}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                      >
                        Setujui
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenRejectModal(item)}
                        disabled={isUpdatingStatus}
                        className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => deletePejabat(item.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
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

      {/* Modal Dialog Form Penolakan Dokumen */}
      {rejectModalOpen && targetRejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm sm:text-base">
                <AlertTriangle size={18} />
                <span>Form Penolakan Persetujuan Dokumen</span>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900 leading-relaxed">
              Penolakan dokumen oleh <strong>{targetRejectItem.nama_pejabat} ({targetRejectItem.jabatan})</strong> akan secara otomatis mengembalikan dokumen ini ke <strong>Tahap 3 Harmonisasi</strong> untuk diperbaiki kembali oleh admin.
            </div>

            <form onSubmit={handleSubmitPenolakan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pesan / Alasan Penolakan <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={alasanPenolakan}
                  onChange={(e) => setAlasanPenolakan(e.target.value)}
                  placeholder="Tuliskan alasan penolakan, pasal atau klausul yang perlu direvisi/diselaraskan kembali..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed focus:border-rose-500 focus:outline-none bg-slate-50/50 custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unggah File Lampiran Catatan Revisi (Opsional, PDF/Word)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFileLampiranPenolakan(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-rose-700 hover:file:bg-rose-100 border border-slate-200 rounded-xl p-1 bg-slate-50/50"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Unggah berkas lembar catatan revisi yang dapat diunduh pemohon/admin di tahap harmonisasi.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle size={14} />
                  <span>{isUpdatingStatus ? "Menolak..." : "Tolak & Kembalikan ke Harmonisasi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

