"use client";

import { Suspense, useState } from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/ui/DataTable";

import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import PenggunaDrawer from "@/components/ui/Drawer";
import Toast from "@/components/ui/Toast";

import PenggunaForm from "./PenggunaForm";

import {
  useDeletePengguna,
  usePenggunaList,
} from "../hooks/Pengguna.hooks";

import { Pengguna } from "../types/Pengguna.type";

export default function PenggunaComponent() {
  return (
    <Suspense fallback={null}>
      <PenggunaContent />
    </Suspense>
  );
}

function PenggunaContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ============================================================
  // STATE
  // ============================================================

  const [toast, setToast] = useState({
    open: false,
    type: "success" as
      | "success"
      | "error"
      | "info",
    title: "",
    message: "",
  });

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [drawerMode, setDrawerMode] =
    useState<"create" | "edit">("create");

  const [selectedPengguna, setSelectedPengguna] =
    useState<Pengguna | null>(null);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleteData, setDeleteData] =
    useState<Pengguna | null>(null);

  // ============================================================
  // URL PARAMETER
  //
  // DataTable menggunakan page 0-based
  //
  // page=0 => halaman pertama
  // page=1 => halaman kedua
  // page=2 => halaman ketiga
  // ============================================================

  const page = Math.max(
    0,
    Number(
      searchParams.get("page") ?? "0"
    ),
  );

  const size = Math.max(
    1,
    Number(
      searchParams.get("size") ?? "10"
    ),
  );

  const search =
    searchParams.get("search") ?? "";

  const sort =
    searchParams.get("sort") ?? "";

  // ============================================================
  // PARAMETER UNTUK API
  //
  // API menggunakan page 1-based
  //
  // Frontend 0 => API 1
  // Frontend 1 => API 2
  // Frontend 2 => API 3
  // ============================================================

  const params = {
    page: page + 1,
    size,
    search,
    sort,
  };

  // ============================================================
  // QUERY
  // ============================================================

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = usePenggunaList(params);

  const deleteMutation =
    useDeletePengguna();

  const data: Pengguna[] =
    Array.isArray(
      (response as any)?.data,
    )
      ? (response as any).data
      : [];

  const pagination =
    (response as any)?.pagination;

  const totalElements = Number(
    pagination?.total ?? 0,
  );

  const totalPages = Number(
    pagination?.totalPages ??
      Math.ceil(
        totalElements / size,
      ),
  );

  const updateParams = (
    changes: Record<
      string,
      string | number | null
    >,
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    Object.entries(changes).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(
            key,
            String(value),
          );
        }
      },
    );

    const queryString =
      params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    );
  };

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = () => {
    setSelectedPengguna(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (
    row: Pengguna,
  ) => {
    setSelectedPengguna(row);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  // ============================================================
  // VIEW
  // ============================================================

  const handleView = (
    row: Pengguna,
  ) => {
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = (
    row: Pengguna,
  ) => {
    if (!row.id) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message:
          "ID Pengguna tidak ditemukan.",
      });

      return;
    }

    setDeleteData(row);
    setDeleteOpen(true);
  };

  // ============================================================
  // CONFIRM DELETE
  // ============================================================

  const confirmDelete = () => {
    if (!deleteData?.id) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message:
          "ID Pengguna tidak ditemukan.",
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
              "Pengguna berhasil dihapus.",
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
              "Pengguna gagal dihapus.",
          });
        },
      },
    );
  };

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  const columns: DataTableColumn<Pengguna>[] =
    [
      {
        key: "foto",
        label: "Gambar",
        width: "120px",

        render: (value) => {
          const imageUrl = value
            ? String(value)
            : "";

          return (
            <div className="h-14 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  width={160}
                  height={90}
                  alt="Gambar Pengguna"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <ImageIcon size={18} />
                </div>
              )}
            </div>
          );
        },
      },

      {
        key: "nama",
        label: "Nama",
        sortable: true,
      },

      {
        key: "email",
        label: "Email",
        sortable: true,
      },

      {
        key: "role",
        label: "Role",
        sortable: true,
      },
    ];


  return (
    <div className="min-h-screen bg-[#F8FAFC] px-5 py-8 sm:px-7 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1600px]">

        <DataTable
          data={data}
          columns={columns}

          getRowId={(row) =>
            row.id
          }

          title="Pengguna"

          description="Kelola pengguna yang digunakan untuk mengelola website JDIH."

          searchPlaceholder="Cari pengguna..."

          actions={{
            view: handleView,
            edit: handleEdit,
            delete: handleDelete,
          }}

          addButtonText="Tambah Pengguna"

          onAdd={handleCreate}

          onRefresh={refetch}

          loading={
            isLoading ||
            isFetching
          }

          // ======================================================
          // PAGINATION
          // ======================================================

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

          // ======================================================
          // PINDAH HALAMAN
          // ======================================================

          onPageChange={(newPage) => {
            updateParams({
              page: newPage,
            });
          }}

          // ======================================================
          // UBAH SIZE
          // ======================================================

          onSizeChange={(newSize) => {
            updateParams({
              size: newSize,
              page: 0,
            });
          }}

          // ======================================================
          // SEARCH
          // ======================================================

          onSearch={(value) => {
            updateParams({
              search: value,
              page: 0,
            });
          }}

          // ======================================================
          // SORT
          // ======================================================

          onSort={(
            key,
            direction,
          ) => {
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

      {/* ========================================================
          DRAWER
      ======================================================== */}

      <PenggunaDrawer
        open={drawerOpen}
        mode={drawerMode}
        width="xl"
        scrollable={true}
        onClose={() => {
          if (
            deleteMutation.isPending
          ) {
            return;
          }

          setDrawerOpen(false);
          setSelectedPengguna(null);
        }}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <PenggunaForm
          mode={drawerMode}
          data={selectedPengguna}
          onSuccess={() => {
            setDrawerOpen(false);
            setSelectedPengguna(null);

            refetch();

            setToast({
              open: true,
              type: "success",
              title: "Berhasil",
              message:
                drawerMode ===
                "create"
                  ? "Pengguna berhasil ditambahkan."
                  : "Pengguna berhasil diperbarui.",
            });
          }}
        />
      </PenggunaDrawer>

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Pengguna"
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

      {/* ========================================================
          TOAST
      ======================================================== */}

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() =>
          setToast(
            (prev) => ({
              ...prev,
              open: false,
            }),
          )
        }
      />
    </div>
  );
}
