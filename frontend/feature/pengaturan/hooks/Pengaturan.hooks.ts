import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { fetchPengaturan, useupdatePengaturan } from "../api/Pengaturan.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    "Terjadi kesalahan"
  );
};


export const usePengaturanList = () => {
  return useQuery({
    queryKey: ["Pengaturan"],
    queryFn: () => fetchPengaturan(),

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useUpdatePengaturan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) => useupdatePengaturan(id, data),

    onSuccess: () => {
      toast.success("Berhasil update data");

      qc.invalidateQueries({
        queryKey: ["Pengaturan"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};