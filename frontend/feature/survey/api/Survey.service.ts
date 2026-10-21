import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import {
  SurveyPertanyaan,
  SurveyPertanyaanRequest,
  SurveyStatistik,
  SurveyJawabanSubmission,
} from "../types/Survey.type";

const apiMaster = createApiClient("/master-data");
const apiWeb = createApiClient("/web");

// Admin: CRUD Pertanyaan
export const fetchPertanyaanList = async (
  params?: PaginationParams
): Promise<SpringPage<SurveyPertanyaan>> => {
  const res = await apiMaster.get("/survey/pertanyaan", { params });
  return res.data;
};

export const fetchPertanyaanById = async (id: number): Promise<SurveyPertanyaan> => {
  const res = await apiMaster.get(`/survey/pertanyaan/${id}`);
  return res.data.data;
};

export const createPertanyaan = async (
  data: SurveyPertanyaanRequest
): Promise<SurveyPertanyaan> => {
  const res = await apiMaster.post("/survey/pertanyaan", data);
  return res.data.data;
};

export const updatePertanyaan = async (
  id: number,
  data: Partial<SurveyPertanyaanRequest>
): Promise<SurveyPertanyaan> => {
  const res = await apiMaster.put(`/survey/pertanyaan/${id}`, data);
  return res.data.data;
};

export const deletePertanyaan = async (id: number): Promise<void> => {
  await apiMaster.delete(`/survey/pertanyaan/${id}`);
};

// Admin: Statistik & Grafik Kepuasan
export const fetchSurveyStatistik = async (): Promise<SurveyStatistik> => {
  const res = await apiMaster.get("/survey/statistik");
  return res.data.data;
};

// Public: Modal Survey
export const fetchPublicPertanyaan = async (): Promise<SurveyPertanyaan[]> => {
  const res = await apiWeb.get("/survey/pertanyaan");
  return res.data.data;
};

export const submitPublicSurvey = async (answers: SurveyJawabanSubmission[]): Promise<any> => {
  const res = await apiWeb.post("/survey/submit", { answers });
  return res.data;
};
