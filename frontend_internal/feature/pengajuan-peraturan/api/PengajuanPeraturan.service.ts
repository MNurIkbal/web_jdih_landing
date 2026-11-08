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

export const updatePengajuan = async (
  id: number,
  formData: FormData
): Promise<PengajuanPeraturan> => {
  const res = await api.put(`/pengajuan-peraturan/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateTahapanPengajuan = async (
  id: number,
  payload: { tahapan: string; status?: string; status_penunjukan_pejabat?: string; catatan_verifikasi?: string }
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
  payload: { user_id?: string | number; nama_pejabat: string; jabatan?: string }
) => {
  const res = await api.post(
    `/pengajuan-peraturan/${draftId}/persetujuan`,
    payload
  );
  return res.data.data;
};

export const updateStatusPersetujuan = async (
  persetujuanId: number,
  payload: { status: "Menunggu" | "Disetujui" | "Ditolak"; catatan?: string; file_lampiran?: File | null } | FormData
) => {
  let body = payload;
  let headers = {};
  if (!(payload instanceof FormData) && payload.file_lampiran) {
    const fd = new FormData();
    fd.append("status", payload.status);
    if (payload.catatan) fd.append("catatan", payload.catatan);
    fd.append("file_lampiran", payload.file_lampiran);
    body = fd;
    headers = { "Content-Type": "multipart/form-data" };
  } else if (payload instanceof FormData) {
    headers = { "Content-Type": "multipart/form-data" };
  }

  const res = await api.put(
    `/pengajuan-peraturan/persetujuan/${persetujuanId}`,
    body,
    { headers }
  );
  return res.data.data;
};

export const uploadRevisedDraftPdf = async (
  draftId: number,
  filePdf: File
) => {
  const formData = new FormData();
  formData.append("file_draft", filePdf);
  const res = await api.put(
    `/pengajuan-peraturan/${draftId}/upload-revised-pdf`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
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


