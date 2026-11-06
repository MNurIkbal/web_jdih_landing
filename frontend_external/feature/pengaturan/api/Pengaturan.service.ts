import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import { Pengaturan, PengaturanRequest } from "../types/Pengaturan.type";


const api = createApiClient("/master-data");

export const fetchPengaturan = async (): Promise<SpringPage<Pengaturan>> => {
  const res = await api.get("/pengaturan");
  return res.data;
};


export const useupdatePengaturan = async (
  id: number,
  data: PengaturanRequest
): Promise<PengaturanRequest> => {
  const res = await api.put(`/pengaturan/${id}`, data);
  return res.data.data;
};
