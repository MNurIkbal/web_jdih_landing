"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useStatistikPengunjung,
  useTrackPengunjung,
} from "@/feature/pengunjung/Pengunjung.hooks";

const ROWS = [
  { key: "hari_ini", label: "Hari Ini" },
  { key: "kemarin", label: "Kemarin" },
  { key: "minggu_ini", label: "Minggu Ini" },
  { key: "minggu_lalu", label: "Minggu Lalu" },
  { key: "bulan_ini", label: "Bulan Ini" },
  { key: "bulan_lalu", label: "Bulan Lalu" },
] as const;

const fmt = (n?: number) => (n ?? 0).toLocaleString("id-ID");

export function StatistikPengunjung() {
  const qc = useQueryClient();
  const { data, isLoading } = useStatistikPengunjung();

  // Catat kunjungan lalu segarkan angka statistik
  useTrackPengunjung(() => {
    qc.invalidateQueries({ queryKey: ["StatistikPengunjung"] });
  });

  return (
    <ul className="mt-6 space-y-2.5 text-sm">
      {/* Online */}
      <li className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-white/80">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Online
        </span>
        <span className="font-semibold tabular-nums text-emerald-300">
          {isLoading ? "…" : fmt(data?.online)}
        </span>
      </li>

      {ROWS.map((row) => (
        <li key={row.key} className="flex items-center justify-between gap-4">
          <span className="text-white/80">{row.label}</span>
          <span className="font-medium tabular-nums text-white">
            {isLoading ? "…" : fmt(data?.[row.key])}
          </span>
        </li>
      ))}

      {/* Total */}
      <li className="mt-1 flex items-center justify-between gap-4 border-t border-white/10 pt-3">
        <span className="font-semibold text-white">Total Pengunjung</span>
        <span className="font-bold tabular-nums text-blue-300">
          {isLoading ? "…" : fmt(data?.total)}
        </span>
      </li>
    </ul>
  );
}
