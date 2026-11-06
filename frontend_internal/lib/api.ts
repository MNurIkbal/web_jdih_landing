import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "https://jdih-be.asiasistem.com";

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_APP_BACKEND_URL belum dikonfigurasi");
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

export const createApiClient = (servicePrefix: string = "") => {
  const api = axios.create({
    baseURL: `${API_URL}/api${servicePrefix}`,
    withCredentials: true,
    headers: {
      Accept: "application/json",
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = getCookie("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Unauthorized");
      }

      if (error.response?.status === 403) {
        console.warn("Forbidden");
      }

      return Promise.reject(error);
    },
  );

  return api;
};