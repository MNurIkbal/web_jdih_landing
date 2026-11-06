import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { createKontak, fetchKontak } from "../api/Dashboard.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    "Terjadi kesalahan"
  );
};


export const useKontakList = (params: any) => {
  return useQuery({
    queryKey: ["Kontak", params],
    queryFn: () => fetchKontak(params),

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
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
