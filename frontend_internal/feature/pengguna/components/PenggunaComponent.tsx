"use client";

import { Suspense, useState } from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Image from "next/image";
import { ImageIcon, MoreVertical, Pencil, Trash2, Shield } from "lucide-react";

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

  const [openDropdownId, setOpenDropdownId] =
    useState<number | null>(null);

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
        render: (value) => {
          const roleStr = String(value || "pengguna").toLowerCase();
          const badgeConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
            superadmin: {
              bg: "bg-purple-50",
              text: "text-purple-700",
              border: "border-purple-200",
              label: "Superadmin",
            },
            admin: {
              bg: "bg-blue-50",
              text: "text-blue-700",
              border: "border-blue-200",
              label: "Admin Verifikator",
            },
            pengguna: {
              bg: "bg-emerald-50",
              text: "text-emerald-700",
              border: "border-emerald-200",
              label: "Pengguna",
            },
          };

          const current = badgeConfig[roleStr] || {
            bg: "bg-slate-50",
            text: "text-slate-700",
            border: "border-slate-200",
            label: String(value || "-"),
          };

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${current.bg} ${current.text} ${current.border}`}
            >
              <Shield size={12} className="opacity-80" />
              {current.label}
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
          const isOpen = openDropdownId === row.id;

          return (
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdownId(isOpen ? null : row.id)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-xs cursor-pointer"
                title="Pilihan Aksi"
              >
                <MoreVertical size={16} />
              </button>

              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenDropdownId(null)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdownId(null);
                        handleEdit(row);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
                    >
                      <Pencil size={14} className="text-emerald-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdownId(null);
                        handleDelete(row);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                    >
                      <Trash2 size={14} className="text-red-500" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        },
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
