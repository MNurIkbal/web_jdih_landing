import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import { Berita, BeritaRequest } from "../types/Berita.type";


const api = createApiClient("/master-data");

export const fetchBerita = async (
  params: PaginationParams
): Promise<SpringPage<Berita>> => {
  const res = await api.get("/berita", { params });
  return res.data;
};

export const fetchByIdBerita = async (
  id: number
): Promise<Berita> => {
  const res = await api.get(`/berita/${id}`);
  return res.data.data;
};

export const createBerita = async (
  data: BeritaRequest
): Promise<BeritaRequest> => {
  const res = await api.post("/berita", data);
  return res.data.data;
};

export const useupdateBerita = async (
  id: number,
  data: BeritaRequest
): Promise<BeritaRequest> => {
  const res = await api.put(`/berita/${id}`, data);
  return res.data.data;
};

export const deleteBerita = async (
  id: number
): Promise<void> => {
  await api.delete(`/berita/${id}`);
};