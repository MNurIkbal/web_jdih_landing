"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HelpCircle, BarChart3, ListFilter } from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Drawer from "@/components/ui/Drawer";
import SurveyPertanyaanForm from "./SurveyPertanyaanForm";
import SurveyStatistikGrafik from "./SurveyStatistikGrafik";
import {
  useDeleteSurveyPertanyaan,
  useSurveyPertanyaanList,
} from "../hooks/Survey.hooks";
import { SurveyPertanyaan } from "../types/Survey.type";
import { toast } from "sonner";

export default function SurveyPage() {
  return (
    <Suspense fallback={null}>
      <SurveyContent />
    </Suspense>
  );
}

function SurveyContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"grafik" | "pertanyaan">("grafik");

  const pageParam = Number(searchParams.get("page") ?? "0");
  const sizeParam = Number(searchParams.get("size") ?? "10");
  const search = searchParams.get("search") ?? "";

  const page = Number.isInteger(pageParam) && pageParam >= 0 ? pageParam : 0;
  const size = Number.isInteger(sizeParam) && sizeParam > 0 ? sizeParam : 10;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<SurveyPertanyaan | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SurveyPertanyaan | null>(null);

  const apiParams = useMemo(
    () => ({
      page,
      size,
      search,
    }),
    [page, size, search]
  );

  const { data: res, isLoading, isFetching, refetch } = useSurveyPertanyaanList(apiParams);
  const deleteMutation = useDeleteSurveyPertanyaan();

  const dataList: SurveyPertanyaan[] = useMemo(() => {
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

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Data pertanyaan survey berhasil diperbarui.");
    } catch {
      toast.error("Gagal menyegarkan data.");
    }
  };

  const columns: DataTableColumn<SurveyPertanyaan>[] = [
    {
      key: "urutan",
      label: "Urutan",
      width: "80px",
      align: "center",
      render: (_, row) => (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-bold text-xs text-slate-700">
          {row.urutan ?? 0}
        </span>
      ),
    },
    {
      key: "pertanyaan",
      label: "Pertanyaan Survey",
      render: (_, row) => (
        <div className="max-w-xl py-1">
          <p className="font-semibold text-slate-900 text-sm leading-snug">
            {row.pertanyaan}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "140px",
      align: "center",
      render: (_, row) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            row.status
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {row.status ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Tab Switcher: Grafik Kepuasan & Kelola Pertanyaan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Survey Layanan & Kepuasan Pengguna
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pantau indeks kepuasan masyarakat (IKM) dan kelola daftar pertanyaan survey popup portal JDIH.
          </p>
        </div>

        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("grafik")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "grafik"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 size={15} />
            <span>Grafik Kepuasan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pertanyaan")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "pertanyaan"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListFilter size={15} />
            <span>Kelola Pertanyaan</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Grafik Kepuasan Pengguna */}
      {activeTab === "grafik" && <SurveyStatistikGrafik />}

      {/* Tab 2: CRUD Pertanyaan Survey */}
      {activeTab === "pertanyaan" && (
        <DataTable
          title="Daftar Pertanyaan Survey"
          description="Pertanyaan ini akan otomatis dimunculkan kepada pengunjung landing page dalam bentuk popup survey."
          data={dataList}
          columns={columns}
          getRowId={(row) => row.survey_pertanyaan_id}
          loading={isLoading || isFetching}
          addButtonText="Tambah Pertanyaan"
          onAdd={() => {
            setSelectedItem(null);
            setDrawerMode("create");
            setDrawerOpen(true);
          }}
          searchPlaceholder="Cari teks pertanyaan survey..."
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
          onPageChange={(p) => updateParams({ page: p })}
          onSizeChange={(s) => updateParams({ size: s, page: 0 })}
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
      )}

      {/* Drawer Form Create / Edit */}
      <Drawer
        open={drawerOpen}
        mode={drawerMode}
        onClose={() => setDrawerOpen(false)}
        onSubmit={(e) => e.preventDefault()}
        title={drawerMode === "create" ? "Tambah Pertanyaan Survey" : "Edit Pertanyaan Survey"}
      >
        <SurveyPertanyaanForm
          mode={drawerMode}
          data={selectedItem}
          onSuccess={() => {
            setDrawerOpen(false);
            setSelectedItem(null);
            refetch();
          }}
        />
      </Drawer>

      {/* Confirm Delete Alert Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Hapus Pertanyaan Survey?"
        description={`Apakah Anda yakin ingin menghapus pertanyaan "${itemToDelete?.pertanyaan || 'ini'}"? Jawaban terkait juga akan terhapus.`}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={async () => {
          if (itemToDelete?.survey_pertanyaan_id) {
            try {
              await deleteMutation.mutateAsync(itemToDelete.survey_pertanyaan_id);
              setDeleteModalOpen(false);
              setItemToDelete(null);
              refetch();
            } catch (err) {
              console.error("Gagal hapus pertanyaan:", err);
            }
          }
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
