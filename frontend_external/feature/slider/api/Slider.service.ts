import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import { Slider, SliderRequest } from "../types/Slider.type";


const api = createApiClient("/master-data");

export const fetchSlider = async (
  params: PaginationParams
): Promise<SpringPage<Slider>> => {
  const res = await api.get("/slider", { params });
  return res.data;
};

export const fetchByIdSlider = async (
  id: number
): Promise<Slider> => {
  const res = await api.get(`/slider/${id}`);
  return res.data.data;
};

export const createSlider = async (
  data: SliderRequest
): Promise<SliderRequest> => {
  const res = await api.post("/slider", data);
  return res.data.data;
};

export const useupdateSlider = async (
  id: number,
  data: SliderRequest
): Promise<SliderRequest> => {
  const res = await api.put(`/slider/${id}`, data);
  return res.data.data;
};

export const deleteSlider = async (
  id: number
): Promise<void> => {
  await api.delete(`/slider/${id}`);
};