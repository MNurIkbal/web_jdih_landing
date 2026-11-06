"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Drawer from "@/components/ui/Drawer";
import GaleriForm from "./GaleriForm";
import { toast } from "sonner";
import { useDeleteGaleri, useGaleriList } from "../hooks/Galeri.hooks";
import { Galeri } from "../types/Galeri.type";

export default function GaleriPage() {
  return (
    <Suspense fallback={null}>
      <GaleriContent />
    </Suspense>
  );
}

function GaleriContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page") ?? "0");
  const sizeParam = Number(searchParams.get("size") ?? "10");

  const page = Number.isInteger(pageParam) && pageParam >= 0 ? pageParam : 0;
  const size = Number.isInteger(sizeParam) && sizeParam > 0 ? sizeParam : 10;
  const search = searchParams.get("search") ?? "";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<Galeri | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Galeri | null>(null);

  // Parameter yang dikirim ke backend API
  const apiParams = useMemo(
    () => ({
      page,
      size,
      search,
    }),
    [page, size, search]
  );

  const { data: res, isLoading, isFetching, refetch } = useGaleriList(apiParams);

  const deleteMutation = useDeleteGaleri();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Data galeri berhasil diperbarui.");
    } catch {
      toast.error("Gagal menyegarkan data galeri.");
    }
  };

  const dataList: Galeri[] = useMemo(() => {
    return (res as any)?.data || [];
  }, [res]);

  const pagination = (res as any)?.pagination;
  const totalElements = Number(pagination?.totalElements ?? pagination?.total ?? dataList.length);
  const totalPages = Number(pagination?.totalPages ?? (totalElements > 0 ? Math.ceil(totalElements / size) : 1));

  const updateParams = (changes: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const columns: DataTableColumn<Galeri>[] = [
    {
      key: "media_url",
      label: "Foto",
      width: "110px",
      render: (_, row) => {
        const previewUrl = row.media_full_url || row.media_url;
        return (
          <div className="relative h-14 w-20 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={row.judul || "Galeri"}
                className="h-full w-full object-cover transition-transform hover:scale-110"
              />
            ) : (
              <ImageIcon size={22} className="text-slate-400" />
            )}
          </div>
        );
      },
    },
    {
      key: "judul",
      label: "Judul & Keterangan",
      render: (_, row) => (
        <div className="max-w-md py-1">
          <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
            {row.judul || "Tanpa Judul"}
          </h4>
          {row.keterangan && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {row.keterangan}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status Publikasi",
      width: "150px",
      render: (_, row) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            row.status
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {row.status ? "Tampil di Publik" : "Tidak Tampil"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* DataTable dengan pagination & search langsung hit ke backend */}
      <DataTable
        title="Daftar Foto Galeri"
        description="Kelola foto galeri yang dipublikasikan pada portal resmi JDIH"
        data={dataList}
        columns={columns}
        getRowId={(row) => row.galeri_id}
        loading={isLoading || isFetching}
        addButtonText="Upload Foto Baru"
        onAdd={() => {
          setSelectedItem(null);
          setDrawerMode("create");
          setDrawerOpen(true);
        }}
        searchPlaceholder="Cari judul atau keterangan foto..."
        currentSearch={search}
        onSearch={(val) => {
          updateParams({
            search: val,
            page: 0,
          });
        }}
        page={page}
        size={size}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={(p) => {
          updateParams({ page: p });
        }}
        onSizeChange={(s) => {
          updateParams({ size: s, page: 0 });
        }}
        onRefresh={handleRefresh}
        actions={{
          edit: (row) => {
            setSelectedItem(row);
            setDrawerMode("edit");
            setDrawerOpen(true);
          },
          delete: (row) => {
            setItemToDelete(row);
            setDeleteModalOpen(true);
          },
        }}
      />

      {/* Drawer Form Create / Edit */}
      <Drawer
        open={drawerOpen}
        mode={drawerMode}
        onClose={() => setDrawerOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        title={drawerMode === "create" ? "Tambah Foto Galeri" : "Edit Foto Galeri"}
      >
        <GaleriForm
          mode={drawerMode}
          data={selectedItem}
          onSuccess={() => {
            setDrawerOpen(false);
            setSelectedItem(null);
            refetch();
          }}
        />
      </Drawer>

      {/* Confirm Delete Modal (Alert Dialog) */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Hapus Foto Galeri?"
        description={`Apakah Anda yakin ingin menghapus foto "${itemToDelete?.judul || 'ini'}"? Tindakan ini tidak dapat dibatalkan.`}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={async () => {
          if (itemToDelete?.galeri_id) {
            try {
              await deleteMutation.mutateAsync(itemToDelete.galeri_id);
              setDeleteModalOpen(false);
              setItemToDelete(null);
              refetch();
            } catch (err: any) {
              console.error("Gagal hapus foto:", err);
            }
          }
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
