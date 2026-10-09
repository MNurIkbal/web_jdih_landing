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
import BeritaDrawer from "@/components/ui/Drawer";
import Toast from "@/components/ui/Toast";

import {
  useBeritaList,
  useDeleteBerita,
} from "../hooks/Berita.hooks";

import { Berita } from "../types/Berita.type";
import BeritaForm from "./BeritaForm";

/**
 * ============================================================
 * PAGE
 * ============================================================
 *
 * Tetap satu file.
 *
 * BeritaComponent dibungkus Suspense agar penggunaan
 * useSearchParams() tidak menyebabkan error saat next build.
 */

export default function BeritaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] px-5 py-8 sm:px-7 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-sm text-slate-500">
                Memuat berita...
              </div>
            </div>
          </div>
        </div>
      }
    >
      <BeritaComponent />
    </Suspense>
  );
}

/**
 * ============================================================
 * BERITA COMPONENT
 * ============================================================
 */

function BeritaComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(
    1,
    Number(searchParams.get("page") ?? "1"),
  );

  const size = Math.max(
    1,
    Number(searchParams.get("size") ?? "10"),
  );

  const search = searchParams.get("search") ?? "";

  const sort = searchParams.get("sort") ?? "";

  // ============================================================
  // PARAMS UNTUK API
  // API kamu juga menggunakan page 1-based
  // ============================================================

  const params = {
    page: currentPage,
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
  } = useBeritaList(params);

  const deleteMutation = useDeleteBerita();

  const beritaData: Berita[] = Array.isArray(
    (response as any)?.data,
  )
    ? (response as any).data
    : [];

  const pagination = (response as any)?.pagination;

  const totalElements = Number(
    pagination?.total ?? 0,
  );

  const totalPages = Number(
    pagination?.totalPages ??
      Math.ceil(totalElements / size),
  );

  const tablePage = currentPage - 1;

  const updateParams = (
    changes: Record<string, string | number | null>,
  ) => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    Object.entries(changes).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        value === undefined
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    );
  };

  // ============================================================
  // DRAWER
  // ============================================================

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [drawerMode, setDrawerMode] = useState<
    "create" | "edit"
  >("create");

  const [selectedBerita, setSelectedBerita] =
    useState<Berita | null>(null);

  const handleCreate = () => {
    setSelectedBerita(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  const handleEdit = (row: Berita) => {
    setSelectedBerita(row);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleView = (row: Berita) => {
    
  };


  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleteData, setDeleteData] =
    useState<Berita | null>(null);

  const [toast, setToast] = useState({
    open: false,
    type: "success" as
      | "success"
      | "error"
      | "info",
    title: "",
    message: "",
  });

  const handleDelete = (row: Berita) => {
    if (!row.berita_id) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "ID Berita tidak ditemukan.",
      });

      return;
    }

    setDeleteData(row);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteData?.berita_id) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "ID Berita tidak ditemukan.",
      });

      return;
    }

    deleteMutation.mutate(deleteData.berita_id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeleteData(null);

        refetch();

        setToast({
          open: true,
          type: "success",
          title: "Berhasil",
          message: "Berita berhasil dihapus.",
        });
      },

      onError: (error: any) => {
        

        setToast({
          open: true,
          type: "error",
          title: "Gagal",
          message:
            error?.response?.data?.message ??
            "Berita gagal dihapus.",
        });
      },
    });
  };

  // ============================================================
  // COLUMNS
  // ============================================================

  const columns: DataTableColumn<Berita>[] = [
    {
      key: "gambar",
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
                alt="Gambar Berita"
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
      key: "judul",
      label: "Judul",
      sortable: true,
    },

    {
      key: "kategori",
      label: "Kategori",
      sortable: true,
    },

    {
      key: "penulis",
      label: "Penulis",
      sortable: true,
    },

    {
      key: "tanggal_berita",
      label: "Tanggal Publish",
      sortable: true,

      render: (value) => {
        if (!value) {
          return "-";
        }

        return new Date(
          String(value),
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      },
    },

    {
      key: "status",
      label: "Status",
      width: "120px",
      align: "center",

      render: (value) => {
        const isActive =
          value === "Aktif" ||
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
              ? "Aktif"
              : "Tidak Aktif"}
          </span>
        );
      },
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-5 py-8 sm:px-7 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1600px]">
        <DataTable
          data={beritaData}
          columns={columns}
          getRowId={(row) => row.berita_id}
          title="Berita"
          description="Kelola banner dan Berita yang ditampilkan pada halaman utama website JDIH."
          searchPlaceholder="Cari judul atau keterangan..."
          actions={{
            view: handleView,
            edit: handleEdit,
            delete: handleDelete,
          }}
          addButtonText="Tambah Berita"
          onAdd={handleCreate}
          onRefresh={refetch}
          loading={isLoading || isFetching}

          // ======================================================
          // DataTable page = 0-based
          // ======================================================

          page={tablePage}

          size={size}

          // ======================================================
          // Ambil dari response.pagination
          // ======================================================

          totalElements={totalElements}
          totalPages={totalPages}

          currentSearch={search}
          currentSort={sort}

          // ======================================================
          // PAGE CHANGE
          // ======================================================

          onPageChange={(newPage) => {
            updateParams({
              page: newPage + 1,
            });
          }}

          // ======================================================
          // SIZE CHANGE
          // ======================================================

          onSizeChange={(newSize) => {
            updateParams({
              size: newSize,
              page: 1,
            });
          }}

          // ======================================================
          // SEARCH
          // ======================================================

          onSearch={(value) => {
            updateParams({
              search: value,
              page: 1,
            });
          }}

          // ======================================================
          // SORT
          // ======================================================

          onSort={(key, direction) => {
            updateParams({
              sort: direction
                ? `${key},${direction}`
                : null,
              page: 1,
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

      {/* ==========================================================
          DRAWER
      ========================================================== */}

      <BeritaDrawer
        open={drawerOpen}
        mode={drawerMode}
        width="full"
        scrollable={true}
        onClose={() => {
          if (deleteMutation.isPending) {
            return;
          }

          setDrawerOpen(false);
          setSelectedBerita(null);
        }}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <BeritaForm
          mode={drawerMode}
          data={selectedBerita}
          onSuccess={() => {
            setDrawerOpen(false);
            setSelectedBerita(null);

            refetch();

            setToast({
              open: true,
              type: "success",
              title: "Berhasil",
              message:
                drawerMode === "create"
                  ? "Berita berhasil ditambahkan."
                  : "Berita berhasil diperbarui.",
            });
          }}
        />
      </BeritaDrawer>

      {/* ==========================================================
          DELETE MODAL
      ========================================================== */}

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Berita"
        description="Apakah Anda yakin ingin menghapus data ini?"
        loading={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteOpen(false);
            setDeleteData(null);
          }
        }}
        onConfirm={confirmDelete}
      />

      {/* ==========================================================
          TOAST
      ========================================================== */}

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
