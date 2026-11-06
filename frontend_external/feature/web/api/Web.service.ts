import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import {
  BeritaWebResponse,
  FetchWebBeritaParams,
  Sumary,
} from "../types/Web.type";
import { Slider } from "@/feature/slider";
import { Berita } from "@/feature/berita/types/Berita.type";
import { DokumenHukum } from "@/feature/dokumen-hukum/types/DokumenHukum.type";
import { Kontak, KontakRequest } from "@/feature/kontak";

const api = createApiClient("/web");
const master = createApiClient("/master-data");

export const fetchWebSliderAll = async (): Promise<Slider[]> => {
  const res = await api.get("/slider");
  return res.data;
};

export const fetchWebSumaryAll = async (): Promise<Sumary[]> => {
  const res = await api.get("/sumary-dashboard");
  return res.data;
};

export const fetchWebBeritaAll = async (): Promise<Berita[]> => {
  const res = await api.get("/berita");
  return res.data;
};

export const fetchWebDokumenHukumAll = async (): Promise<DokumenHukum[]> => {
  const res = await api.get("/dokumen-hukum");
  return res.data;
};


export const fetchBeritaLain = async (id:any): Promise<any> => {
  const res = await api.get(`/berita/${id}/related`);
  return res.data;
};

export const fetchDokumenHukumLain = async (id:any): Promise<any> => {
  const res = await api.get(`/dokumen-hukum/${id}/related`);
  return res.data;
};

export const fetchWebDokumenHukum = async (
  params: PaginationParams,
): Promise<SpringPage<DokumenHukum>> => {
  const res = await api.get("/dokumen-hukum-pagination", { params });
  return res.data;
};

export const fetchByIdWebDokumenHukum = async (
  id: number,
): Promise<DokumenHukum> => {
  const res = await api.get(`/dokumen-hukum/${id}`);
  return res.data.data;
};

export const fetchWebKontakAll = async (): Promise<Kontak[]> => {
  const res = await api.get("/pengaturan");
  return res.data;
};

export const createKontak = async (
  data: KontakRequest,
): Promise<KontakRequest> => {
  const res = await api.post("/kontak", data);
  return res.data.data;
};

export const updateViews = async (beritaId: number) => {
  const res = await api.post(`/berita/${beritaId}/views`);

  return res.data;
};

export const updatePriview = async (idDocHuk: number) => {
  const res = await api.post(`/dokumen-hukum/${idDocHuk}/preview`);
  return res.data;
};

export const updateDownload = async (idDocHuk: number) => {
  const res = await api.post(`/dokumen-hukum/${idDocHuk}/download`);
  return res.data;
};

export const fetchWebBeritaResult = async ({
  page = 1,
  size = 10,
}: FetchWebBeritaParams = {}): Promise<BeritaWebResponse> => {
  const res = await api.get<BeritaWebResponse>("/pagination-berita", {
    params: { page, size },
  });
  return res.data;
};

export const fetchByIdBerita = async (id: number): Promise<Berita> => {
  const res = await api.get(`/berita/${id}`);
  return res.data.data;
};

// master
export const fetchWebSumaryDashboard = async (): Promise<any> => {
  const res = await master.get("/pengaturan/sumary");
  return res.data;
};

export const fetchWebGrafik = async (): Promise<any> => {
  const res = await master.get("/pengaturan/sumary-grafik");
  return res.data;
};

export const Login = async (data: any): Promise<any> => {
  const res = await master.post("/login", data);
  return res.data.data;
};

export const getSession = async () => {
  const res = await master.get("/login/session");
  return res.data;
};

export const getLogout = async () => {
  const res = await master.post("/login/logout");
  return res.data;
};
