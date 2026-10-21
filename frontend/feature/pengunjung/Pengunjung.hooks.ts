import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createApiClient } from "@/lib/api";

const apiWeb = createApiClient("/web");

const VISITOR_KEY = "jdih_visitor_id";
const HEARTBEAT_MS = 60 * 1000; // 1 menit, harus < jendela online backend (5 menit)

export interface StatistikPengunjung {
  online: number;
  hari_ini: number;
  kemarin: number;
  minggu_ini: number;
  minggu_lalu: number;
  bulan_ini: number;
  bulan_lalu: number;
  total: number;
}

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

const getVisitorId = () => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

export const trackPengunjung = async () => {
  await apiWeb.post("/pengunjung/track", { visitor_id: getVisitorId() });
};

export const fetchStatistikPengunjung = async (): Promise<StatistikPengunjung> => {
  const res = await apiWeb.get("/pengunjung/statistik");
  return res.data.data;
};

/**
 * Mencatat kunjungan saat halaman publik dibuka, lalu mengirim heartbeat
 * berkala selama tab aktif agar hitungan "online" akurat.
 */
export const useTrackPengunjung = (onTracked?: () => void) => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const send = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        await trackPengunjung();
        if (!cancelled) onTracked?.();
      } catch {
        // tracking tidak boleh mengganggu halaman
      }
    };

    send();

    const interval = setInterval(send, HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") send();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export const useStatistikPengunjung = () => {
  return useQuery({
    queryKey: ["StatistikPengunjung"],
    queryFn: fetchStatistikPengunjung,
    refetchInterval: HEARTBEAT_MS,
    staleTime: 30 * 1000,
  });
};
