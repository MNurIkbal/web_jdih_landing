import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import {
  PengajuanPeraturan,
  PengajuanPeraturanRequest,
} from "../types/PengajuanPeraturan.type";

const api = createApiClient("/master-data");

export const fetchPengajuanList = async (
  params: PaginationParams & { tahapan?: string }
): Promise<SpringPage<PengajuanPeraturan>> => {
  const res = await api.get("/pengajuan-peraturan", { params });
  return res.data;
};

export const fetchPengajuanDetail = async (
  id: number
): Promise<PengajuanPeraturan> => {
  const res = await api.get(`/pengajuan-peraturan/${id}`);
  return res.data.data;
};

export const createPengajuan = async (
  formData: FormData
): Promise<PengajuanPeraturan> => {
  const res = await api.post("/pengajuan-peraturan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateTahapanPengajuan = async (
  id: number,
  payload: { tahapan: string; status?: string }
): Promise<PengajuanPeraturan> => {
  const res = await api.put(`/pengajuan-peraturan/${id}/tahapan`, payload);
  return res.data.data;
};

// Tahap 2: Pembahasan
export const addPembahasanRapat = async (
  draftId: number,
  formData: FormData
) => {
  const res = await api.post(
    `/pengajuan-peraturan/${draftId}/pembahasan`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data.data;
};

export const deletePembahasanRapat = async (pembahasanId: number) => {
  await api.delete(`/pengajuan-peraturan/pembahasan/${pembahasanId}`);
};

// Tahap 3: Harmonisasi
export const submitHarmonisasi = async (
  draftId: number,
  formData: FormData
) => {
  const res = await api.post(
    `/pengajuan-peraturan/${draftId}/harmonisasi`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data.data;
};

// Tahap 4: Persetujuan
export const addPejabatPersetujuan = async (
  draftId: number,
  payload: { nama_pejabat: string; jabatan: string }
) => {
  const res = await api.post(
    `/pengajuan-peraturan/${draftId}/persetujuan`,
    payload
  );
  return res.data.data;
};

export const updateStatusPersetujuan = async (
  persetujuanId: number,
  payload: { status: "Menunggu" | "Disetujui" | "Ditolak"; catatan?: string }
) => {
  const res = await api.put(
    `/pengajuan-peraturan/persetujuan/${persetujuanId}`,
    payload
  );
  return res.data.data;
};

export const deletePejabatPersetujuan = async (persetujuanId: number) => {
  await api.delete(`/pengajuan-peraturan/persetujuan/${persetujuanId}`);
};

// Tahap 5: Penetapan & Publikasi
export const submitPenetapanPublikasi = async (
  draftId: number,
  formData: FormData
) => {
  const res = await api.post(
    `/pengajuan-peraturan/${draftId}/penetapan`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data.data;
};

export const deletePengajuan = async (id: number) => {
  await api.delete(`/pengajuan-peraturan/${id}`);
};

export const fetchMasterOptions = async (
  type: string,
  query: string = ""
): Promise<{ value: string; label: string }[]> => {
  try {
    const res = await api.get("/pengajuan-peraturan/options", {
      params: { type, query },
    });
    return res.data.data || [];
  } catch (err) {
    // Fallback to web public endpoint if not logged in
    try {
      const publicApi = createApiClient("/web");
      const resWeb = await publicApi.get("/dokumen-hukum/master-options", {
        params: { type, query },
      });
      return resWeb.data.data || [];
    } catch {
      return [];
    }
  }
};


