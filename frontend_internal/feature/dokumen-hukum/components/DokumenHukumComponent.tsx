"use client";

import { Suspense, useState, useMemo } from "react";
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

  const columns: DataTableColumn<DokumenHukum>[] = useMemo(
    () => [
      {
        key: "judul",
        label: "Dokumen Hukum Terpublikasi",
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
                Nomor: {row.nomor || "-"}
              </span>
              <span>•</span>
              <span>Tahun {row.tahun || "-"}</span>
              {row.bidang && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {row.bidang}
                  </span>
                </>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "tipe_dokumen",
        label: "Tipe & Penetapan",
        width: "220px",
        render: (_val, row) => (
          <div className="text-xs">
            <div className="font-semibold text-slate-700">
              {row.tipe_dokumen || "-"}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {row.tempat_penetapan ? `${row.tempat_penetapan}, ` : ""}
              {row.tanggal_penetapan ? String(row.tanggal_penetapan).split("T")[0] : ""}
            </div>
          </div>
        ),
      },
      {
        key: "file_dokumen",
        label: "Berkas",
        width: "140px",
        align: "center",
        render: (_val, row) => {
          if (!row.file_dokumen) {
            return <span className="text-xs text-slate-400">Tidak ada file</span>;
          }
          return (
            <a
              href={`${APP_BASE_URL}/uploads/dokumen-hukum/${row.file_dokumen}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
            >
              <FileText size={13} />
              <span>Lihat PDF</span>
              <ExternalLink size={11} />
            </a>
          );
        },
      },
      {
        key: "status",
        label: "Status Publikasi",
        width: "160px",
        align: "center",
        render: (value) => {
          const isBerlaku =
            value === "Berlaku" ||
            value === true ||
            value === 1;

          return (
            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-3
                py-1
                text-xs
                font-bold
                border
                ${
                  isBerlaku
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }
              `}
            >
              <CheckCircle2 size={13} className={isBerlaku ? "text-emerald-600" : "text-slate-400"} />
              {isBerlaku ? "Selesai Publikasi" : String(value || "Draft")}
            </span>
          );
        },
      },
      {
        key: "aksi",
        label: "Aksi",
        width: "100px",
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
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setDetailModalData(row);
                        setOpenDropdownId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                    >
                      <Eye size={14} className="text-blue-600" />
                      <span>Detail Dokumen</span>
                    </button>
                    {row.file_dokumen && (
                      <a
                        href={`${APP_BASE_URL}/uploads/dokumen-hukum/${row.file_dokumen}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setOpenDropdownId(null)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                      >
                        <FileText size={14} className="text-slate-500" />
                        <span>Unduh PDF</span>
                      </a>
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

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */

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
          MODAL DETAIL DOKUMEN HUKUM
      ====================================================== */}
      {detailModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDetailModalData(null)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <div className="space-y-1 pr-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                    <FileText size={13} />
                    {detailModalData.kategori || "Peraturan"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={13} />
                    {detailModalData.status || "Publikasi (Berlaku)"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug pt-1">
                  {detailModalData.judul}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalData(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                aria-label="Tutup Detail"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Section 1: Data Identitas Peraturan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Info size={14} className="text-blue-600" />
                  Identitas Dokumen
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Nomor</span>
                    <span className="text-sm font-bold text-slate-800">{detailModalData.nomor || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Tahun</span>
                    <span className="text-sm font-bold text-slate-800">{detailModalData.tahun || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Tipe Dokumen</span>
                    <span className="text-sm font-semibold text-slate-800">{detailModalData.tipe_dokumen || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Bidang Hukum</span>
                    <span className="text-sm font-semibold text-slate-800">{detailModalData.bidang || "-"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Subjek Dokumen</span>
                    <span className="text-sm font-semibold text-slate-800">{detailModalData.subject || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Penetapan & Pengundangan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  Penetapan & Pengundangan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 rounded-xl bg-slate-50/80 p-4 border border-slate-100">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Tempat Penetapan</span>
                    <span className="text-sm font-medium text-slate-800">{detailModalData.tempat_penetapan || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Tgl Penetapan</span>
                    <span className="text-sm font-medium text-slate-800">
                      {detailModalData.tanggal_penetapan ? String(detailModalData.tanggal_penetapan).split("T")[0] : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Tgl Pengundangan</span>
                    <span className="text-sm font-medium text-slate-800">
                      {detailModalData.tanggal_pengundangan ? String(detailModalData.tanggal_pengundangan).split("T")[0] : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase">Tgl Berlaku</span>
                    <span className="text-sm font-medium text-slate-800">
                      {detailModalData.tanggal_berlaku ? String(detailModalData.tanggal_berlaku).split("T")[0] : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Sumber */}
              {detailModalData.sumber && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                    <BookOpen size={14} className="text-blue-600" />
                    Sumber Dokumen
                  </h4>
                  <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100 text-sm text-slate-700">
                    {detailModalData.sumber}
                  </div>
                </div>
              )}

              {/* Section 4: Berkas Dokumen PDF */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <FileCheck size={14} className="text-blue-600" />
                  Berkas Terkait
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Dokumen Utama */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          File Dokumen Utama
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {detailModalData.file_dokumen || "Tidak ada berkas"}
                        </div>
                      </div>
                    </div>
                    {detailModalData.file_dokumen && (
                      <a
                        href={`${APP_BASE_URL}/uploads/dokumen-hukum/${detailModalData.file_dokumen}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        <ExternalLink size={13} />
                        <span>Buka</span>
                      </a>
                    )}
                  </div>

                  {/* File Abstrak */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <FileCheck size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          File Abstrak
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {detailModalData.file_abstrak || "Tidak ada berkas abstrak"}
                        </div>
                      </div>
                    </div>
                    {detailModalData.file_abstrak && (
                      <a
                        href={`${APP_BASE_URL}/uploads/dokumen-hukum/${detailModalData.file_abstrak}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                      >
                        <ExternalLink size={13} />
                        <span>Buka</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setDetailModalData(null)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
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
