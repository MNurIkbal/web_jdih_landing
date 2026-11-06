"use client";

import { Suspense, useMemo, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ImageIcon } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/ui/DataTable";

import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

import SliderForm, {
  type SliderFormData,
} from "@/feature/slider/components/SliderForm";

import SliderDrawer from "@/components/ui/Drawer";

import {
  useDeleteSlider,
  useSliderList,
} from "../hooks/Slider.hooks";

import Toast from "@/components/ui/Toast";

interface Slider extends SliderFormData {
  slider_id: number;
  createdAt?: string;
}

interface SliderPageResponse {
  content?: Slider[];

  totalElements?: number;
  totalPages?: number;

  page?: number;
  number?: number;

  size?: number;
}

interface SliderApiResponse {
  success?: boolean;

  data?:
    | SliderPageResponse
    | Slider[];

  content?: Slider[];

  totalElements?: number;
  totalPages?: number;
  total?: number;

  pagination?: {
    page?: number;
    size?: number;
    total?: number;
    totalElements?: number;
    totalPages?: number;
  };
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://jdih-be.asiasistem.com";

function getImageUrl(value: unknown) {
  if (!value) {
    return "";
  }

  const url = String(value).trim();

  if (!url) {
    return "";
  }

  // Sudah URL lengkap
  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  // Data berupa base64
  if (url.startsWith("data:image")) {
    return url;
  }

  // Path absolut
  if (url.startsWith("/")) {
    return `${API_URL}${url}`;
  }

  // Path biasa
  return `${API_URL}/${url}`;
}

export default function SliderPage() {
  return (
    <Suspense fallback={null}>
      <SliderContent />
    </Suspense>
  );
}

function SliderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const [selectedSlider, setSelectedSlider] =
    useState<Slider | null>(null);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleteData, setDeleteData] =
    useState<Slider | null>(null);

  const pageParam = Number(
    searchParams.get("page") ?? "0"
  );

  const sizeParam = Number(
    searchParams.get("size") ?? "10"
  );

  const page =
    Number.isInteger(pageParam) &&
    pageParam >= 0
      ? pageParam
      : 0;

  const size =
    Number.isInteger(sizeParam) &&
    sizeParam > 0
      ? sizeParam
      : 10;

  const search =
    searchParams.get("search") ?? "";

  const sort =
    searchParams.get("sort") ?? "";

  const params = useMemo(
    () => ({
      page,
      size,
      search,
      sort,
    }),
    [page, size, search, sort]
  );

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useSliderList(params);

  // ============================================================
  // DELETE
  // ============================================================

  const deleteMutation =
    useDeleteSlider();

  // ============================================================
  // NORMALIZE RESPONSE
  // ============================================================

  const normalizedResponse =
    response as
      | SliderApiResponse
      | undefined;

  /**
   * Mendukung response:
   *
   * 1.
   * {
   *   content: [],
   *   totalElements: 12
   * }
   *
   * 2.
   * {
   *   data: {
   *     content: [],
   *     totalElements: 12
   *   }
   * }
   *
   * 3.
   * {
   *   data: [],
   *   pagination: {
   *     total: 12
   *   }
   * }
   */

  const pageData =
    normalizedResponse?.data &&
    !Array.isArray(
      normalizedResponse.data
    )
      ? normalizedResponse.data
      : undefined;

  // ============================================================
  // TABLE DATA
  // ============================================================

  const data: Slider[] = Array.isArray(
    pageData?.content
  )
    ? pageData.content
    : Array.isArray(
        normalizedResponse?.content
      )
    ? normalizedResponse.content
    : Array.isArray(
        normalizedResponse?.data
      )
    ? normalizedResponse.data
    : [];

  // ============================================================
  // TOTAL ELEMENTS
  // ============================================================

  const totalElements = Number(
    pageData?.totalElements ??
      normalizedResponse?.totalElements ??
      normalizedResponse?.pagination
        ?.totalElements ??
      normalizedResponse?.pagination
        ?.total ??
      normalizedResponse?.total ??
      data.length
  );

  // ============================================================
  // TOTAL PAGES
  // ============================================================

  const totalPagesFromApi = Number(
    pageData?.totalPages ??
      normalizedResponse?.totalPages ??
      normalizedResponse?.pagination
        ?.totalPages ??
      0
  );

  const totalPages =
    totalPagesFromApi > 0
      ? totalPagesFromApi
      : Math.max(
          1,
          Math.ceil(
            totalElements / size
          )
        );


  const updateParams = (
    changes: Record<
      string,
      string | number | null
    >
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
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
            String(value)
          );
        }
      }
    );

    const queryString =
      params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
      {
        scroll: false,
      }
    );
  };

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = () => {
    setSelectedSlider(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (
    row: Slider
  ) => {
    setSelectedSlider(row);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleView = (
    row: Slider
  ) => {
    
  };
  const handleDelete = (
    row: Slider
  ) => {
    if (!row.slider_id) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message:
          "ID slider tidak ditemukan.",
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
    if (!deleteData?.slider_id) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message:
          "ID slider tidak ditemukan.",
      });

      return;
    }

    deleteMutation.mutate(
      deleteData.slider_id,
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
              "Slider berhasil dihapus.",
          });
        },

        onError: (
          error: any
        ) => {
          

          setToast({
            open: true,
            type: "error",
            title: "Gagal",
            message:
              error?.response?.data
                ?.message ??
              "Slider gagal dihapus.",
          });
        },
      }
    );
  };

  // ============================================================
  // COLUMNS
  // ============================================================

  const columns: DataTableColumn<Slider>[] =
    [
      {
        key: "gambar",
        label: "Gambar",
        width: "140px",

        render: (value) => {
          const imageUrl =
            getImageUrl(value);

          return (
            <div className="h-14 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  width={160}
                  height={90}
                  alt="Gambar slider"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    

                    event.currentTarget.style.display =
                      "none";
                  }}
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
        width: "240px",
        sortable: true,

        render: (value) => (
          <span className="font-medium text-slate-700">
            {String(
              value ?? "-"
            )}
          </span>
        ),
      },

      {
        key: "keterangan",
        label: "Keterangan",
        sortable: true,

        render: (value) => (
          <div
            className="max-w-[500px] truncate text-sm text-slate-500"
            title={String(
              value ?? ""
            )}
          >
            {String(
              value ?? "-"
            )}
          </div>
        ),
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
          data={data}
          columns={columns}

          // ======================================================
          // ROW ID
          // ======================================================

          getRowId={(row) =>
            String(
              row.slider_id
            )
          }

          // ======================================================
          // HEADER
          // ======================================================

          title="Slider"

          description="Kelola banner dan slider yang ditampilkan pada halaman utama website JDIH."

          searchPlaceholder="Cari judul atau keterangan..."

          // ======================================================
          // ACTION
          // ======================================================

          actions={{
            view: handleView,
            edit: handleEdit,
            delete: handleDelete,
          }}

          addButtonText="Tambah Slider"

          onAdd={handleCreate}

          onRefresh={refetch}

          loading={
            isLoading ||
            isFetching
          }

          // ======================================================
          // SERVER PAGINATION
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

          currentSort={sort}

          // ======================================================
          // PAGE CHANGE
          // ======================================================

          onPageChange={(
            newPage
          ) => {
            

            updateParams({
              page: newPage,
            });
          }}

          // ======================================================
          // SIZE CHANGE
          // ======================================================

          onSizeChange={(
            newSize
          ) => {
            updateParams({
              size: newSize,
              page: 0,
            });
          }}

          // ======================================================
          // SEARCH
          // ======================================================

          onSearch={(
            value
          ) => {
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
            direction
          ) => {
            updateParams({
              sort: direction
                ? `${key},${direction}`
                : null,
              page: 0,
            });
          }}

          // ======================================================
          // PAGE SIZE
          // ======================================================

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

      <SliderDrawer
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
          setSelectedSlider(null);
        }}

        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <SliderForm
          mode={drawerMode}
          data={selectedSlider}

          onSuccess={() => {
            setDrawerOpen(false);
            setSelectedSlider(null);

            refetch();

            setToast({
              open: true,
              type: "success",
              title: "Berhasil",

              message:
                drawerMode ===
                "create"
                  ? "Slider berhasil ditambahkan."
                  : "Slider berhasil diperbarui.",
            });
          }}
        />
      </SliderDrawer>

      {/* ========================================================
          DELETE
      ======================================================== */}

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Slider"
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
            })
          )
        }
      />
    </div>
  );
}
