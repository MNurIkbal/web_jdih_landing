import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { createBerita, deleteBerita, fetchByIdBerita, fetchBerita, useupdateBerita } from "../api/Berita.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    "Terjadi kesalahan"
  );
};


export const useBeritaList = (params: any) => {
  return useQuery({
    queryKey: ["Berita", params],
    queryFn: () => fetchBerita(params),

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useBeritaDetail = (id: number) => {
  return useQuery({
    queryKey: ["Berita", id],

    queryFn: () => fetchByIdBerita(id),

    enabled: !!id,
  });
};

export const useCreateBerita = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createBerita,

    onSuccess: () => {
      toast.success("Berhasil tambah data");

      qc.invalidateQueries({
        queryKey: ["Berita"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateBerita = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) => useupdateBerita(id, data),

    onSuccess: () => {
      toast.success("Berhasil update data");

      qc.invalidateQueries({
        queryKey: ["Berita"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteBerita = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteBerita,

    onSuccess: () => {
      toast.success("Berhasil hapus data");

      qc.invalidateQueries({
        queryKey: ["Berita"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};
