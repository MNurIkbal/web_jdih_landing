"use client";

import { Suspense, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

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
   */

  const params = {
    page,
    size,
    search,
    sort,
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

  const columns: DataTableColumn<DokumenHukum>[] =
    [
      {
        key: "judul",
        label: "Judul",
        sortable: true,

        render: (value) => (
          <div className="max-w-[650px]">
            <p className="font-medium text-slate-700">
              {String(value ?? "-")}
            </p>
          </div>
        ),
      },

      {
        key: "kategori",
        label: "Kategori",
        sortable: true,

        render: (value) => (
          <span className="text-slate-600">
            {String(value ?? "-")}
          </span>
        ),
      },

      {
        key: "tahun",
        label: "Tahun",
        sortable: true,

        render: (value) => (
          <span className="text-slate-600">
            {String(value ?? "-")}
          </span>
        ),
      },

      {
        key: "status",
        label: "Status",
        width: "120px",
        align: "center",

        render: (value) => {
          const isActive =
            value === "Berlaku" ||
            value === true ||
            value === 1;

          return (
            <span
              className={`
                inline-flex
                items-center
                rounded-lg
                px-3
                py-1.5
                text-xs
                font-semibold
                ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              {isActive
                ? "Berlaku"
                : "Tidak Berlaku"}
            </span>
          );
        },
      },
    ];

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

          title="Dokumen Hukum"

          description="Kelola banner dan Dokumen Hukum yang ditampilkan pada halaman utama website JDIH."

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
