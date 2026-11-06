import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import { Kontak, KontakRequest } from "../types/Dashboard.type";


const api = createApiClient("/master-data");

export const fetchKontak = async (
  params: PaginationParams
): Promise<SpringPage<Kontak>> => {
  const res = await api.get("/Kontak", { params });
  return res.data;
};

export const createKontak = async (
  data: KontakRequest
): Promise<KontakRequest> => {
  const res = await api.post("/Kontak", data);
  return res.data.data;
};
