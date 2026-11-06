import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import {
  createDokumenHukum,
  deleteDokumenHukum,
  fetchByIdDokumenHukum,
  fetchDokumenHukum,
  useupdateDokumenHukum,
} from "../api/DokumenHukum.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

export const useDokumenHukumList = (params: any) => {
  return useQuery({
    queryKey: ["DokumenHukum", params],
    queryFn: () => fetchDokumenHukum(params),

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useDokumenHukumDetail = (id: number) => {
  return useQuery({
    queryKey: ["DokumenHukum", id],

    queryFn: () => fetchByIdDokumenHukum(id),

    enabled: !!id,
  });
};

export const useCreateDokumenHukum = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createDokumenHukum,

    onSuccess: () => {
      toast.success("Berhasil tambah data");

      qc.invalidateQueries({
        queryKey: ["DokumenHukum"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateDokumenHukum = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) => useupdateDokumenHukum(id, data),

    onSuccess: () => {
      toast.success("Berhasil update data");

      qc.invalidateQueries({
        queryKey: ["DokumenHukum"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteDokumenHukum = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteDokumenHukum,

    onSuccess: () => {
      toast.success("Berhasil hapus data");

      qc.invalidateQueries({
        queryKey: ["DokumenHukum"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};
