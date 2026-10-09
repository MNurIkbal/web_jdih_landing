import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import { Pengguna, PenggunaRequest } from "../types/Pengguna.type";

const api = createApiClient("/master-data");

export const fetchPengguna = async (
  params: PaginationParams,
): Promise<SpringPage<Pengguna>> => {
  const res = await api.get("/user", { params });
  return res.data;
};

export const fetchByIdPengguna = async (id: number): Promise<Pengguna> => {
  const res = await api.get(`/user/${id}`);
  return res.data.data;
};

export const createPengguna = async (
  data: PenggunaRequest,
): Promise<PenggunaRequest> => {
  const res = await api.post("/user", data);
  return res.data.data;
};

export const useupdatePengguna = async (
  id: number,
  data: PenggunaRequest,
): Promise<PenggunaRequest> => {
  const res = await api.put(`/user/${id}`, data);
  return res.data.data;
};

export const deletePengguna = async (id: number): Promise<void> => {
  await api.delete(`/user/${id}`);
};


export interface UpdatePasswordPayload {
  password: string;
}
export const updatePassword = async (
  id: number,
  data: UpdatePasswordPayload,
) => {
  const response = await api.put(`/user/${id}/password`, data);
  return response.data;
};
