import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addPejabatPersetujuan,
  addPembahasanRapat,
  createPengajuan,
  updatePengajuan,
  deletePejabatPersetujuan,
  deletePembahasanRapat,
  deletePengajuan,
  fetchMasterOptions,
  fetchPengajuanDetail,
  fetchPengajuanList,
  submitHarmonisasi,
  submitPenetapanPublikasi,
  updateStatusPersetujuan,
  updateTahapanPengajuan,
  uploadRevisedDraftPdf,
} from "../api/PengajuanPeraturan.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Terjadi kesalahan pada sistem"
  );
};

export const usePengajuanList = (params: any) => {
  return useQuery({
    queryKey: ["PengajuanPeraturan", params],
    queryFn: () => fetchPengajuanList(params),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const usePengajuanDetail = (id: number) => {
  return useQuery({
    queryKey: ["PengajuanPeraturan", id],
    queryFn: () => fetchPengajuanDetail(id),
    enabled: !!id,
  });
};

export const useCreatePengajuan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPengajuan,
    onSuccess: () => {
      toast.success("Pengajuan rancangan peraturan berhasil disimpan");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdatePengajuan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      updatePengajuan(id, formData),
    onSuccess: () => {
      toast.success("Pengajuan rancangan peraturan berhasil diperbarui");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateTahapanPengajuan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      updateTahapanPengajuan(id, payload),
    onSuccess: () => {
      toast.success("Tahapan berhasil diperbarui");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Tahap 2: Pembahasan
export const useAddPembahasanRapat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, formData }: { draftId: number; formData: FormData }) =>
      addPembahasanRapat(draftId, formData),
    onSuccess: () => {
      toast.success("Hasil notulensi rapat berhasil diunggah");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeletePembahasanRapat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePembahasanRapat,
    onSuccess: () => {
      toast.success("Hasil rapat berhasil dihapus");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Tahap 3: Harmonisasi
export const useSubmitHarmonisasi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, formData }: { draftId: number; formData: FormData }) =>
      submitHarmonisasi(draftId, formData),
    onSuccess: () => {
      toast.success("Harmonisasi dokumen berhasil dicatat");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Tahap 4: Persetujuan
export const useAddPejabatPersetujuan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, payload }: { draftId: number; payload: any }) =>
      addPejabatPersetujuan(draftId, payload),
    onSuccess: () => {
      toast.success("Pejabat persetujuan berhasil ditambahkan ke checklist");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateStatusPersetujuan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ persetujuanId, payload }: { persetujuanId: number; payload: any }) =>
      updateStatusPersetujuan(persetujuanId, payload),
    onSuccess: () => {
      toast.success("Status persetujuan berhasil diperbarui");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeletePejabatPersetujuan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePejabatPersetujuan,
    onSuccess: () => {
      toast.success("Pejabat persetujuan berhasil dihapus");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Tahap 5: Penetapan & Publikasi
export const useSubmitPenetapanPublikasi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, formData }: { draftId: number; formData: FormData }) =>
      submitPenetapanPublikasi(draftId, formData),
    onSuccess: () => {
      toast.success("Peraturan berhasil ditetapkan dan dipublikasikan ke Dokumen Hukum Internal!");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
      qc.invalidateQueries({ queryKey: ["DokumenHukum"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUploadRevisedDraftPdf = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, filePdf }: { draftId: number; filePdf: File }) =>
      uploadRevisedDraftPdf(draftId, filePdf),
    onSuccess: () => {
      toast.success("File PDF perbaikan dokumen berhasil diunggah!");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeletePengajuan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePengajuan,
    onSuccess: () => {
      toast.success("Pengajuan peraturan berhasil dihapus");
      qc.invalidateQueries({ queryKey: ["PengajuanPeraturan"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useMasterOptions = (type: string, query: string = "") => {
  return useQuery({
    queryKey: ["MasterOptions", type, query],
    queryFn: () => fetchMasterOptions(type, query),
    staleTime: 5 * 60 * 1000,
  });
};


