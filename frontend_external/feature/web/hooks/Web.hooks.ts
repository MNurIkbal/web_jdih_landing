import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createKontak,
  fetchBeritaLain,
  fetchByIdBerita,
  fetchByIdWebDokumenHukum,
  fetchDokumenHukumLain,
  fetchWebBeritaAll,
  fetchWebBeritaResult,
  fetchWebDokumenHukum,
  fetchWebDokumenHukumAll,
  fetchWebGrafik,
  fetchWebKontakAll,
  fetchWebSliderAll,
  fetchWebSumaryAll,
  fetchWebSumaryDashboard,
  getLogout,
  getSession,
  Login,
  updateDownload,
  updatePriview,
  updateViews,
} from "../api/Web.service";
import { toast } from "sonner";
import { FetchWebBeritaParams } from "../types/Web.type";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

export const useWebBeritaHookResult = ({
  page = 1,
  size = 10,
}: FetchWebBeritaParams = {}) => {
  return useQuery({
    queryKey: ["Berita-web", page, size],
    queryFn: () => fetchWebBeritaResult({ page, size }),
    placeholderData: (previousData) => previousData,
  });
};
export const useWebSliderHookAll = () => {
  return useQuery({
    queryKey: ["slider-web"],
    queryFn: fetchWebSliderAll,
  });
};

export const useWebSumaryHookAll = () => {
  return useQuery({
    queryKey: ["Sumary-web"],
    queryFn: fetchWebSumaryAll,
  });
};

export const useWebBeritaHookAll = () => {
  return useQuery({
    queryKey: ["Berita-web"],
    queryFn: fetchWebBeritaAll,
  });
};

export const useWebDokumenHukumHookAll = () => {
  return useQuery({
    queryKey: ["DokumenHukum-web"],
    queryFn: fetchWebDokumenHukumAll,
  });
};

export const useWebBeritaRelated = (beritaId?: any) => {
  return useQuery({
    queryKey: ["berita-lain", beritaId],
    queryFn: () => fetchBeritaLain(beritaId!),
    enabled: !!beritaId,
  });
};

export const useWebDokumenHukumRelated = (idDoc?: any) => {
  return useQuery({
    queryKey: ["berita-lain", idDoc],
    queryFn: () => fetchDokumenHukumLain(idDoc!),
    enabled: !!idDoc,
  });
};

export const useWebSumaryDashboard = () => {
  return useQuery({
    queryKey: ["sumary-dashboard-web"],
    queryFn: fetchWebSumaryDashboard,
  });
};

export const useWebSumaryGrafik = () => {
  return useQuery({
    queryKey: ["sumary-grafik-web"],
    queryFn: fetchWebGrafik,
  });
};

export const useDokumenHukumWebList = (params: any) => {
  return useQuery({
    queryKey: ["DokumenHukum_web", params],
    queryFn: () => fetchWebDokumenHukum(params),

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useDokumenHukumWebDetail = (id: number) => {
  return useQuery({
    queryKey: ["DokumenHukum_web", id],

    queryFn: () => fetchByIdWebDokumenHukum(id),

    enabled: !!id,
  });
};

export const useWebKontakHookAll = () => {
  return useQuery({
    queryKey: ["Kontak-web"],
    queryFn: fetchWebKontakAll,
  });
};

export const useCreateKontak = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createKontak,

    onSuccess: () => {
      toast.success("Berhasil tambah data");

      qc.invalidateQueries({
        queryKey: ["Kontak"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const LoginHook = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: Login,
    onSuccess: () => {
      toast.success("Login Berhasil");
      qc.invalidateQueries({
        queryKey: ["login"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useBeritaDetailWeb = (id: number) => {
  return useQuery({
    queryKey: ["Berita", id],

    queryFn: () => fetchByIdBerita(id),

    enabled: !!id,
  });
};


export const SessionHook = () => {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: getSession,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const LogoutHook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: getLogout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["auth-session"],
      });
    },
  });
};

export const useUpdateViews = () => {
  return useMutation({
    mutationFn: (beritaId: number) => updateViews(beritaId),
  });
};

export const usePriview = () => {
  return useMutation({
    mutationFn: (idDocHukum: number) => updatePriview(idDocHukum),
  });
};

export const useDownload = () => {
  return useMutation({
    mutationFn: (idDocHukumDownload: number) => updateDownload(idDocHukumDownload),
  });
};