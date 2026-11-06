import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createGaleri,
  deleteGaleri,
  fetchByIdGaleri,
  fetchGaleri,
  fetchPublicGaleri,
  updateGaleri,
} from "../api/Galeri.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

export const useGaleriList = (params: any) => {
  return useQuery({
    queryKey: ["Galeri", params],
    queryFn: () => fetchGaleri(params),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const usePublicGaleri = (params?: {
  page?: number;
  size?: number;
  limit?: number;
  search?: string;
  tipe?: string;
}) => {
  return useQuery({
    queryKey: ["PublicGaleri", params],
    queryFn: () => fetchPublicGaleri(params),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useGaleriDetail = (id: number) => {
  return useQuery({
    queryKey: ["Galeri", id],
    queryFn: () => fetchByIdGaleri(id),
    enabled: !!id,
  });
};

export const useCreateGaleri = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGaleri,
    onSuccess: () => {
      toast.success("Berhasil menambahkan foto galeri");
      qc.invalidateQueries({ queryKey: ["Galeri"] });
      qc.invalidateQueries({ queryKey: ["PublicGaleri"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateGaleri = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      updateGaleri(id, data),
    onSuccess: () => {
      toast.success("Berhasil memperbarui foto galeri");
      qc.invalidateQueries({ queryKey: ["Galeri"] });
      qc.invalidateQueries({ queryKey: ["PublicGaleri"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteGaleri = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGaleri,
    onSuccess: () => {
      toast.success("Berhasil menghapus foto galeri");
      qc.invalidateQueries({ queryKey: ["Galeri"] });
      qc.invalidateQueries({ queryKey: ["PublicGaleri"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};
