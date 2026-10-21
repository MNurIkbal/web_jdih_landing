import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createPertanyaan,
  deletePertanyaan,
  fetchPertanyaanById,
  fetchPertanyaanList,
  fetchPublicPertanyaan,
  fetchSurveyStatistik,
  submitPublicSurvey,
  updatePertanyaan,
} from "../api/Survey.service";
import { SurveyPertanyaanRequest, SurveyJawabanSubmission } from "../types/Survey.type";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

export const useSurveyPertanyaanList = (params?: any) => {
  return useQuery({
    queryKey: ["SurveyPertanyaan", params],
    queryFn: () => fetchPertanyaanList(params),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useSurveyPertanyaanDetail = (id: number) => {
  return useQuery({
    queryKey: ["SurveyPertanyaan", id],
    queryFn: () => fetchPertanyaanById(id),
    enabled: !!id,
  });
};

export const useSurveyStatistik = () => {
  return useQuery({
    queryKey: ["SurveyStatistik"],
    queryFn: () => fetchSurveyStatistik(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCreateSurveyPertanyaan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SurveyPertanyaanRequest) => createPertanyaan(data),
    onSuccess: () => {
      toast.success("Berhasil menambahkan pertanyaan survey");
      qc.invalidateQueries({ queryKey: ["SurveyPertanyaan"] });
      qc.invalidateQueries({ queryKey: ["PublicSurveyPertanyaan"] });
      qc.invalidateQueries({ queryKey: ["SurveyStatistik"] });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useUpdateSurveyPertanyaan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SurveyPertanyaanRequest> }) =>
      updatePertanyaan(id, data),
    onSuccess: () => {
      toast.success("Berhasil memperbarui pertanyaan survey");
      qc.invalidateQueries({ queryKey: ["SurveyPertanyaan"] });
      qc.invalidateQueries({ queryKey: ["PublicSurveyPertanyaan"] });
      qc.invalidateQueries({ queryKey: ["SurveyStatistik"] });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useDeleteSurveyPertanyaan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePertanyaan(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus pertanyaan survey");
      qc.invalidateQueries({ queryKey: ["SurveyPertanyaan"] });
      qc.invalidateQueries({ queryKey: ["PublicSurveyPertanyaan"] });
      qc.invalidateQueries({ queryKey: ["SurveyStatistik"] });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });
};

// Public Hooks
export const usePublicSurveyPertanyaan = () => {
  return useQuery({
    queryKey: ["PublicSurveyPertanyaan"],
    queryFn: () => fetchPublicPertanyaan(),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
};

export const useSubmitPublicSurvey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: SurveyJawabanSubmission[]) => submitPublicSurvey(answers),
    onSuccess: () => {
      toast.success("Terima kasih atas partisipasi Anda dalam survey layanan JDIH!");
      qc.invalidateQueries({ queryKey: ["SurveyStatistik"] });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });
};
