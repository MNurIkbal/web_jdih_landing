import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import { Galeri, GaleriRequest } from "../types/Galeri.type";

const apiMaster = createApiClient("/master-data");
const apiWeb = createApiClient("/web");

export const fetchGaleri = async (params: PaginationParams & { tipe?: string }): Promise<SpringPage<Galeri>> => {
  const res = await apiMaster.get("/galeri", { params });
  return res.data;
};

export const fetchByIdGaleri = async (id: number): Promise<Galeri> => {
  const res = await apiMaster.get(`/galeri/${id}`);
  return res.data.data;
};

export const createGaleri = async (data: FormData): Promise<Galeri> => {
  const res = await apiMaster.post("/galeri", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateGaleri = async (id: number, data: FormData): Promise<Galeri> => {
  const res = await apiMaster.put(`/galeri/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const deleteGaleri = async (id: number): Promise<void> => {
  await apiMaster.delete(`/galeri/${id}`);
};

// Public web api
export interface PublicGaleriParams {
  tipe?: string;
  limit?: number;
  page?: number;
  size?: number;
  search?: string;
}

export const fetchPublicGaleri = async (params?: PublicGaleriParams) => {
  const res = await apiWeb.get("/galeri", { params });
  return res.data;
};
