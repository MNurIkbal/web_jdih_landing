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
} from "lucide-react";
import { APP_BASE_URL } from "@/constanta/GlobalConstanta";

import DataTable, {
  type DataTableColumn,
} from "@/components/ui/DataTable";

import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import DokumenHukumDrawer from "@/components/ui/Drawer";
import Toast from "@/components/ui/Toast";

import DokumenHukumForm from "./DokumenHukumForm";

import { DokumenHukum } from "../types/DokumenHukum.type";

import {
  useDeleteDokumenHukum,
  useDokumenHukumList,
} from "../hooks/DokumenHukum.hooks";

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

  /**
   * ============================================================
   * DRAWER
   * ============================================================
   */

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [drawerMode, setDrawerMode] =
    useState<"create" | "edit">("create");

  const [selectedDokumenHukum, setSelectedDokumenHukum] =
    useState<DokumenHukum | null>(null);

  /**
   * ============================================================
   * DELETE
   * ============================================================
   */

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleteData, setDeleteData] =
    useState<DokumenHukum | null>(null);

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

  const deleteMutation = useDeleteDokumenHukum();

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

  /**
   * ============================================================
   * CREATE
   * ============================================================
   */

  const handleCreate = () => {
    setSelectedDokumenHukum(null);

    setDrawerMode("create");

    setDrawerOpen(true);
  };

  /**
   * ============================================================
   * EDIT
   * ============================================================
   */

  const handleEdit = (
    row: DokumenHukum
  ) => {
    setSelectedDokumenHukum(row);

    setDrawerMode("edit");

    setDrawerOpen(true);
  };

  /**
   * ============================================================
   * VIEW
   * ============================================================
   */

  const handleView = (
    row: DokumenHukum
  ) => {
    
  };


  const handleDelete = (
    row: DokumenHukum
  ) => {
    if (
      row.id === undefined ||
      row.id === null
    ) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message:
          "ID Dokumen Hukum tidak ditemukan.",
      });

      return;
    }

    setDeleteData(row);

    setDeleteOpen(true);
  };

  /**
   * ============================================================
   * CONFIRM DELETE
   * ============================================================
   */

  const confirmDelete = () => {
    if (
      deleteData?.id === undefined ||
      deleteData?.id === null
    ) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message:
          "ID Dokumen Hukum tidak ditemukan.",
      });

      return;
    }

    deleteMutation.mutate(
      deleteData.id,
      {
        onSuccess: () => {
          setDeleteOpen(false);

          setDeleteData(null);

          refetch();

          setToast({
            open: true,
            type: "success",
            title: "Berhasil",
            message:
              "Dokumen Hukum berhasil dihapus.",
          });
        },

        onError: (error: any) => {
          

          setToast({
            open: true,
            type: "error",
            title: "Gagal",
            message:
              error?.response?.data
                ?.message ??
              "Dokumen Hukum gagal dihapus.",
          });
        },
      }
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
    ],
    []
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

          actions={{
            view: handleView,
            edit: handleEdit,
            delete: handleDelete,
          }}

          addButtonText="Tambah Dokumen Hukum"

          onAdd={handleCreate}

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
          DRAWER
      ====================================================== */}

      <DokumenHukumDrawer
        open={drawerOpen}
        mode={drawerMode}
        width="full"
        scrollable={true}

        onClose={() => {
          if (
            deleteMutation.isPending
          ) {
            return;
          }

          setDrawerOpen(false);

          setSelectedDokumenHukum(
            null
          );
        }}

        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <DokumenHukumForm
          mode={drawerMode}

          data={
            selectedDokumenHukum
          }

          onSuccess={() => {
            setDrawerOpen(false);

            setSelectedDokumenHukum(
              null
            );

            refetch();

            setToast({
              open: true,
              type: "success",
              title: "Berhasil",
              message:
                drawerMode === "create"
                  ? "Dokumen Hukum berhasil ditambahkan."
                  : "Dokumen Hukum berhasil diperbarui.",
            });
          }}
        />
      </DokumenHukumDrawer>

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Dokumen Hukum"
        description="Apakah Anda yakin ingin menghapus data ini?"

        loading={
          deleteMutation.isPending
        }

        onClose={() => {
          if (
            !deleteMutation.isPending
          ) {
            setDeleteOpen(false);

            setDeleteData(null);
          }
        }}

        onConfirm={
          confirmDelete
        }
      />

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
