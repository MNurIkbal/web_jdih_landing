import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import { DokumenHukum, DokumenHukumRequest } from "../types/DokumenHukum.type";



const api = createApiClient("/master-data");

export const fetchDokumenHukum = async (
  params: PaginationParams
): Promise<SpringPage<DokumenHukum>> => {
  const res = await api.get("/dokumen-hukum", { params });
  return res.data;
};

export const fetchByIdDokumenHukum = async (
  id: number
): Promise<DokumenHukum> => {
  const res = await api.get(`/dokumen-hukum/${id}`);
  return res.data.data;
};

export const createDokumenHukum = async (
  data: DokumenHukumRequest
): Promise<DokumenHukumRequest> => {
  const res = await api.post("/dokumen-hukum", data);
  return res.data.data;
};

export const useupdateDokumenHukum = async (
  id: number,
  data: DokumenHukumRequest
): Promise<DokumenHukumRequest> => {
  const res = await api.put(`/dokumen-hukum/${id}`, data);
  return res.data.data;
};

export const deleteDokumenHukum = async (
  id: number
): Promise<void> => {
  await api.delete(`/dokumen-hukum/${id}`);
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
  } catch {
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
