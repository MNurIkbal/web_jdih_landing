import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { createSlider, deleteSlider, fetchByIdSlider, fetchSlider, useupdateSlider } from "../api/Slider.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    "Terjadi kesalahan"
  );
};


export const useSliderList = (params: any) => {
  return useQuery({
    queryKey: ["Slider", params],
    queryFn: () => fetchSlider(params),

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useSliderDetail = (id: number) => {
  return useQuery({
    queryKey: ["Slider", id],

    queryFn: () => fetchByIdSlider(id),

    enabled: !!id,
  });
};

export const useCreateSlider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createSlider,

    onSuccess: () => {
      toast.success("Berhasil tambah data");

      qc.invalidateQueries({
        queryKey: ["Slider"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateSlider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) => useupdateSlider(id, data),

    onSuccess: () => {
      toast.success("Berhasil update data");

      qc.invalidateQueries({
        queryKey: ["Slider"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteSlider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteSlider,

    onSuccess: () => {
      toast.success("Berhasil hapus data");

      qc.invalidateQueries({
        queryKey: ["Slider"],
      });
    },

    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};
