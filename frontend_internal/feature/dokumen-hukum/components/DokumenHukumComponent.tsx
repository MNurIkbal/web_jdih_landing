"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  FileText,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  FileCheck,
  ExternalLink,
  Search,
  MoreVertical,
  Eye,
  X,
  Download,
  Info,
  Layers,
  MapPin,
  Clock,
  BookOpen,
} from "lucide-react";
import { APP_BASE_URL } from "@/constanta/GlobalConstanta";

import DataTable, {
  type DataTableColumn,
} from "@/components/ui/DataTable";

import Toast from "@/components/ui/Toast";
import { DokumenHukum } from "../types/DokumenHukum.type";
import { useDokumenHukumList } from "../hooks/DokumenHukum.hooks";
import { SessionHook } from "@/feature/web";

/**
 * ============================================================
 * RESPONSE PAGINATION
 * ============================================================
 */

interface PaginationResponse {
  page?: number;
  size?: number;
  total?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface DokumenHukumResponse {
  content?: DokumenHukum[];

  data?: DokumenHukum[];

  pagination?: PaginationResponse;

  total?: number;
  totalElements?: number;
  totalPages?: number;

  page?: number;
  size?: number;
  number?: number;
}

/**
 * ============================================================
 * PAGE COMPONENT
 * ============================================================
 *
 * Suspense wajib berada di luar component yang menggunakan
 * useSearchParams().
 *
 * UI, UX dan logic DokumenHukumContent tetap sama.
 */

export default function DokumenHukumComponent() {
  return (
    <Suspense fallback={null}>
      <DokumenHukumContent />
    </Suspense>
  );
}

/**
 * ============================================================
 * DOKUMEN HUKUM CONTENT
 * ============================================================
 */

function DokumenHukumContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * ============================================================
   * URL PARAMETER
   * ============================================================
   *
   * page:
   *
   * 0 = halaman 1
   * 1 = halaman 2
   * 2 = halaman 3
   *
   * size:
   *
   * jumlah data per halaman
   */

  const pageParam = searchParams.get("page");
  const sizeParam = searchParams.get("size");

  const parsedPage = Number(pageParam);
  const parsedSize = Number(sizeParam);

  const page =
    Number.isInteger(parsedPage) && parsedPage >= 0
      ? parsedPage
      : 0;

  const size =
    Number.isInteger(parsedSize) && parsedSize > 0
      ? parsedSize
      : 10;

  const search = searchParams.get("search") ?? "";

  const sort = searchParams.get("sort") ?? "";

  /**
   * ============================================================
   * TOAST
   * ============================================================
   */

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);
  const [detailModalData, setDetailModalData] = useState<DokumenHukum | null>(null);

  const session = SessionHook();
  const userRole = (session?.data?.data?.role || "superadmin").toLowerCase();

  /**
   * ============================================================
   * PARAMETER API
   * ============================================================
   * Hanya menampilkan dokumen hukum yang telah selesai dipublikasi/berlaku
   */
  const params = {
    page,
    size,
    search,
    sort,
    status: "Berlaku",
  };

  /**
   * ============================================================
   * FETCH DATA
   * ============================================================
   */
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useDokumenHukumList(params);

  /**
   * ============================================================
   * NORMALIZE RESPONSE
   * ============================================================
   */

  const apiResponse =
    (response ?? {}) as DokumenHukumResponse;

  /**
   * Data dari API.
   *
   * Bisa:
   *
   * response.content
   * response.data
   */

  const rawData: DokumenHukum[] = Array.isArray(
    apiResponse.content
  )
    ? apiResponse.content
    : Array.isArray(apiResponse.data)
      ? apiResponse.data
      : [];

  /**
   * ============================================================
   * PAGINATION RESPONSE
   * ============================================================
   */

  const pagination =
    apiResponse.pagination ?? {};

  /**
   * Ambil total data dari berbagai kemungkinan response API.
   */

  const apiTotalElements =
    pagination.totalElements ??
    pagination.total ??
    apiResponse.totalElements ??
    apiResponse.total;

  /**
   * ============================================================
   * DETEKSI SERVER PAGINATION / CLIENT PAGINATION
   * ============================================================
   */

  const hasServerPagination =
    rawData.length <= size &&
    (
      Number(pagination.totalPages) > 1 ||
      Number(apiResponse.totalPages) > 1 ||
      Number(apiTotalElements) > rawData.length
    );

  /**
   * ============================================================
   * TOTAL ELEMENTS
   * ============================================================
   */

  const totalElements =
    Number(apiTotalElements) > 0
      ? Number(apiTotalElements)
      : rawData.length;

  /**
   * ============================================================
   * TOTAL PAGES
   * ============================================================
   */

  const totalPages =
    Number(
      pagination.totalPages ??
      apiResponse.totalPages
    ) > 0
      ? Number(
          pagination.totalPages ??
          apiResponse.totalPages
        )
      : Math.max(
          1,
          Math.ceil(totalElements / size)
        );

  /**
   * ============================================================
   * DATA UNTUK TABLE
   * ============================================================
   */

  const data: DokumenHukum[] = hasServerPagination
    ? rawData
    : rawData.slice(
        page * size,
        page * size + size
      );

 
  const updateParams = (
    changes: Record<
      string,
      string | number | null
    >
  ) => {
    const newParams = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(changes).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          newParams.delete(key);
        } else {
          newParams.set(
            key,
            String(value)
          );
        }
      }
    );

    router.push(
      `${pathname}?${newParams.toString()}`
    );
  };

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

  const columns: DataTableColumn<DokumenHukum>[] = useMemo(
    () => [
      {
        key: "tanggal_penetapan",
        label: "Tanggal & Nomor",
        width: "180px",
        render: (_val, row) => (
          <div className="py-1">
            <div className="text-xs font-semibold text-slate-800">
              {formatTanggalIndo(row.tanggal_penetapan || row.tanggal_pengundangan || row.tanggal_berlaku)}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Nomor: <span className="font-medium text-slate-700">{row.nomor || "-"}</span>
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
            {row.bidang || "-"}
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "150px",
        render: (value) => {
          const isBerlaku =
            value === "Berlaku" ||
            value === true ||
            value === 1 ||
            String(value).toLowerCase().includes("selesai") ||
            String(value).toLowerCase().includes("publikasi");

          const statusText = isBerlaku ? "Berlaku" : String(value || "Draft");

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border shadow-2xs ${
                isBerlaku
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isBerlaku ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              <span>{statusText}</span>
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
                      <span>Detail Dokumen</span>
                    </button>
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
    <div className="min-h-screen bg-[#F8FAFC] px-5 py-8 sm:px-7 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1600px]">

        <DataTable
          data={data}
          columns={columns}

          getRowId={(row) =>
            String(row.id)
          }

          title="Dokumen Hukum Publikasi"

          description="Daftar resmi peraturan perundang-undangan dan produk hukum yang telah selesai diverifikasi, diundangkan, dan berstatus Berlaku / Publikasi."

          searchPlaceholder="Cari dokumen hukum..."

          onRefresh={refetch}

          loading={
            isLoading ||
            isFetching
          }

          /**
           * ====================================================
           * PAGINATION
           * ====================================================
           */

          page={page}

          size={size}

          totalElements={
            totalElements
          }

          totalPages={
            totalPages
          }

          currentSearch={
            search
          }

          currentSort={
            sort
          }

          /**
           * ====================================================
           * PAGE CHANGE
           * ====================================================
           */

          onPageChange={(newPage) => {
            if (
              newPage < 0 ||
              newPage >= totalPages
            ) {
              return;
            }

            updateParams({
              page: newPage,
            });
          }}

          /**
           * ====================================================
           * SIZE CHANGE
           * ====================================================
           */

          onSizeChange={(newSize) => {
            updateParams({
              size: newSize,
              page: 0,
            });
          }}

          /**
           * ====================================================
           * SEARCH
           * ====================================================
           */

          onSearch={(value) => {
            updateParams({
              search: value,
              page: 0,
            });
          }}

          /**
           * ====================================================
           * SORT
           * ====================================================
           */

          onSort={(key, direction) => {
            updateParams({
              sort: direction
                ? `${key},${direction}`
                : null,
              page: 0,
            });
          }}

          pageSizeOptions={[
            10,
            20,
            50,
            100,
          ]}
        />
      </div>

      {/* ======================================================
          MODAL DETAIL DOKUMEN HUKUM (DISAMAKAN DENGAN PENGAJUAN PERATURAN)
      ====================================================== */}
      {detailModalData && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] flex h-screen w-screen flex-col bg-slate-50 overflow-hidden">
          {/* Header Modal Fullscreen */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Eye size={24} />
              </div>
              <div>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                  Detail Dokumen Hukum
                </h3>
                <p className="text-xs text-slate-500">
                  Rincian lengkap dokumen hukum: {detailModalData.judul}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDetailModalData(null)}
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
                      {detailModalData.judul}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Kategori
                    </span>
                    <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                      {detailModalData.kategori || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Tipe Dokumen
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.tipe_dokumen || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Nomor Rancangan
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.nomor_rancangan || detailModalData.nomor || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Tahun
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.tahun || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Bidang Hukum
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.bidang || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Tempat Penetapan
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.tempat_penetapan || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Unit Kerja / Eselon Pemrakarsa
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.pemrakarsa || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Penanggung Jawab Substansi (PIC)
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.penanggung_jawab || "-"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Dasar Kewenangan Pembentukan Peraturan
                    </span>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                      {detailModalData.dasar_hukum || "-"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Urgensi & Latar Belakang Perumusan Regulasi
                    </span>
                    <div className="text-xs font-medium text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      {detailModalData.urgensi || detailModalData.ringkasan || "-"}
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
                    <p className="text-xs text-slate-400">Informasi tanggal dan status dokumen</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Tanggal Penetapan
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {formatTanggalIndo(detailModalData.tanggal_penetapan)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Tanggal Pengundangan
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {formatTanggalIndo(detailModalData.tanggal_pengundangan)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Tanggal Berlaku
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {formatTanggalIndo(detailModalData.tanggal_berlaku)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Sumber
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.sumber || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Subject
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {detailModalData.subject || detailModalData.subjek || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Status Dokumen
                    </span>
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                      {detailModalData.status || "Berlaku"}
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
                    <p className="text-xs text-slate-400">Dokumen berkas utama dan abstrak</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">File Dokumen Utama</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {detailModalData.file_dokumen || "Belum ada file dokumen"}
                        </p>
                      </div>
                    </div>
                    {detailModalData.file_dokumen && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${APP_BASE_URL}/uploads/dokumen-hukum/${detailModalData.file_dokumen}`;
                            window.open(url, "_blank");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Eye size={12} />
                          Preview
                        </button>
                        <a
                          href={`${APP_BASE_URL}/uploads/dokumen-hukum/${detailModalData.file_dokumen}`}
                          target="_blank"
                          rel="noreferrer"
                          download
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
                        <p className="text-xs font-bold text-slate-800">File Berkas Abstrak</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {detailModalData.file_abstrak || "Belum ada berkas abstrak"}
                        </p>
                      </div>
                    </div>
                    {detailModalData.file_abstrak && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${APP_BASE_URL}/uploads/dokumen-hukum/${detailModalData.file_abstrak}`;
                            window.open(url, "_blank");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Eye size={12} />
                          Preview
                        </button>
                        <a
                          href={`${APP_BASE_URL}/uploads/dokumen-hukum/${detailModalData.file_abstrak}`}
                          target="_blank"
                          rel="noreferrer"
                          download
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
      )}

      {/* ======================================================
          TOAST
      ====================================================== */}
      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}

        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </div>
  );
}
