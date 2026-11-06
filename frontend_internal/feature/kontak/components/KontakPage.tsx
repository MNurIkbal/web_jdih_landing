
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, X } from "lucide-react";

import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

import {
  useDeleteKontak,
  useKontakList,
} from "../hooks/Kontak.hooks";

import { KontakRequest } from "../types/Kontak.type";

interface Kontak extends KontakRequest {
  kontak_id: string | number;
  nama: string;
  email: string;
  subject: string;
  pesan: string;
  created_at?: string;
  updated_at?: string;
}

interface KontakResponse {
  success: boolean;
  message: string;
  data: Kontak[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export default function KontakComponent() {
  return (
    <Suspense fallback={null}>
      <KontakContent />
    </Suspense>
  );
}

function KontakContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawPage = Number(searchParams.get("page") ?? "1");
  const rawSize = Number(searchParams.get("size") ?? "10");

  const page =
    Number.isFinite(rawPage) && rawPage >= 1
      ? rawPage
      : 1;

  const size =
    Number.isFinite(rawSize) && rawSize >= 1
      ? rawSize
      : 10;

  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const params = useMemo(
    () => ({
      page,
      size,
      search,
      sort,
    }),
    [page, size, search, sort],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useKontakList(params);

  const result = response as KontakResponse | undefined;

  const data: Kontak[] = result?.data ?? [];

  const totalElements =
    result?.pagination?.total ?? 0;

  const totalPages =
    result?.pagination?.totalPages ??
    Math.max(1, Math.ceil(totalElements / size));

  const deleteMutation = useDeleteKontak();

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<Kontak | null>(null);

  useEffect(() => {
    if (!toast.open) {
      return;
    }

    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.open]);

  const updateParams = (
    changes: Record<string, string | number | null>,
  ) => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(
      `${pathname}?${params.toString()}`,
    );
  };

  const handleDelete = (row: Kontak) => {
    const id = row?.kontak_id;

    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "ID Kontak tidak ditemukan.",
      });

      return;
    }

    setDeleteData(row);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    const id = deleteData?.kontak_id;

    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "ID Kontak tidak ditemukan.",
      });

      return;
    }

    deleteMutation.mutate((id as any), {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeleteData(null);

        refetch();

        setToast({
          open: true,
          type: "success",
          title: "Berhasil",
          message: "Kontak berhasil dihapus.",
        });
      },

      onError: (error: any) => {
        setToast({
          open: true,
          type: "error",
          title: "Gagal",
          message:
            error?.response?.data?.message ??
            "Kontak gagal dihapus.",
        });
      },
    });
  };

  const columns: DataTableColumn<Kontak>[] = [
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
      key: "subject",
      label: "Subject",
      sortable: false,
    },

    {
      key: "pesan",
      label: "Pesan",
      sortable: false,
    },

    {
      key: "created_at",
      label: "Dikirim",
      sortable: false,

      render: (value) => {
        if (!value) {
          return (
            <span className="text-sm text-slate-400">
              -
            </span>
          );
        }

        const date = new Date(String(value));

        if (Number.isNaN(date.getTime())) {
          return (
            <span className="text-sm text-slate-400">
              -
            </span>
          );
        }

        return (
          <span className="text-sm text-slate-500">
            {date.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-5 py-8 sm:px-7 lg:px-8 lg:py-10">
      {toast.open && (
        <div className="fixed right-5 top-5 z-[9999] w-[calc(100%-2.5rem)] max-w-md">
          <div
            className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
              toast.type === "success"
                ? "border-emerald-200"
                : toast.type === "error"
                  ? "border-red-200"
                  : "border-blue-200"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">
                {toast.title}
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast((prev) => ({
                  ...prev,
                  open: false,
                }))
              }
              className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px]">
        <DataTable<Kontak>
          data={data}
          columns={columns}
          getRowId={(row) =>
            String(row.kontak_id)
          }
          title="Kontak"
          description="Kelola informasi masukan yang ditampilkan pada halaman utama website JDIH."
          searchPlaceholder="Cari nama, email, atau subject..."
          onRefresh={refetch}
          loading={isLoading || isFetching}
          actions={{
            delete: handleDelete,
          }}
          page={page - 1}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          currentSearch={search}
          currentSort={sort}
          onPageChange={(newPage) => {
            updateParams({
              page: newPage + 1,
            });
          }}
          onSizeChange={(newSize) => {
            updateParams({
              size: newSize,
              page: 1,
            });
          }}
          onSearch={(value) => {
            updateParams({
              search: value,
              page: 1,
            });
          }}
          onSort={(key, direction) => {
            updateParams({
              sort: direction
                ? `${key},${direction}`
                : null,
              page: 1,
            });
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Kontak"
        description="Apakah Anda yakin ingin menghapus data kontak ini?"
        loading={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteOpen(false);
            setDeleteData(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
