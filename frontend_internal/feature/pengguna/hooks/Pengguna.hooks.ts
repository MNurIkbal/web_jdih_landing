import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import {
  createPengguna,
  deletePengguna,
  fetchByIdPengguna,
  fetchPengguna,
  updatePassword,
  useupdatePengguna,
} from "../api/Pengguna.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

export const usePenggunaList = (params: any) => {
  return useQuery({
    queryKey: ["Pengguna", params],
    queryFn: () => fetchPengguna(params),

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const usePenggunaDetail = (id: number) => {
  return useQuery({
    queryKey: ["Pengguna", id],

    queryFn: () => fetchByIdPengguna(id),

    enabled: !!id,
  });
};

export const useCreatePengguna = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createPengguna,

    onSuccess: () => {
      toast.success("Berhasil tambah data");

      qc.invalidateQueries({
        queryKey: ["Pengguna"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdatePengguna = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) => useupdatePengguna(id, data),

    onSuccess: () => {
      toast.success("Berhasil update data");

      qc.invalidateQueries({
        queryKey: ["Pengguna"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeletePengguna = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deletePengguna,

    onSuccess: () => {
      toast.success("Berhasil hapus data");

      qc.invalidateQueries({
        queryKey: ["Pengguna"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      updatePassword(id, { password }),
  });
};
