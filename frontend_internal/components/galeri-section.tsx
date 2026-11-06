"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Maximize2,
  X,
  Images,
} from "lucide-react";
import { usePublicGaleri } from "@/feature/galeri/hooks/Galeri.hooks";
import { Galeri } from "@/feature/galeri/types/Galeri.type";

const ITEMS_PER_PAGE = 10; // Default 10 data per page

export function GaleriSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModalItem, setActiveModalItem] = useState<Galeri | null>(null);

  const { data: apiData, isLoading } = usePublicGaleri({ limit: 100 });

  // Data murni dari API/database tanpa data hardcode
  const items: Galeri[] = apiData && Array.isArray(apiData) ? apiData : [];

  // Pagination 10 data per page
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, currentPage]);

  // Jika belum ada data galeri di database, section disembunyikan agar bersih
  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section
      id="galeri"
      className="relative isolate overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 py-20 sm:py-28 text-white"
    >
      {/* Background Grid Pattern & Ambient Glow */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 h-96 w-[700px] rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="absolute -bottom-20 right-10 -z-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
              <Sparkles size={13} className="text-amber-400" />
              <span>Dokumentasi Visual</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Galeri Foto JDIH BIN
            </h2>

            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Rangkaian dokumentasi foto kegiatan resmi dan publikasi Jaringan Dokumentasi dan Informasi Hukum Badan Intelijen Negara.
            </p>
          </div>

          <Link
            href="/galeri"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/30 shrink-0"
          >
            <span>Buka Halaman Galeri</span>
            <ChevronRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Gallery Grid (10 items per page) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item, idx) => {
            const imageUrl = item.media_full_url || item.media_url || "";

            return (
              <div
                key={item.galeri_id || idx}
                onClick={() => setActiveModalItem(item)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/15 cursor-pointer"
              >
                {/* Media Container with smooth zoom */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.judul || "Galeri"}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-500">
                      <Images size={32} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-75" />
                  <div className="absolute inset-0 bg-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Fullscreen Icon Trigger on Hover */}
                  <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <Maximize2 size={14} />
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-blue-300 transition-colors">
                    {item.judul || "Dokumentasi Foto"}
                  </h3>

                  {item.keterangan && (
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {item.keterangan}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 border-t border-white/5">
                    <span>Lihat Foto Selengkapnya</span>
                    <ChevronRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================
            PAGINATION CONTROL (10 items per page)
            ========================================================= */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
            <p className="text-xs text-slate-400">
              Menampilkan{" "}
              <span className="font-semibold text-white">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-white">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </span>{" "}
              dari <span className="font-semibold text-white">{totalItems}</span> foto
            </p>

            <div className="inline-flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeModalItem && (
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-slate-900 border border-white/15 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <span className="text-xs font-semibold text-slate-400">
                Dokumentasi Galeri
              </span>

              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  activeModalItem.media_full_url ||
                  activeModalItem.media_url ||
                  ""
                }
                alt={activeModalItem.judul || "Galeri"}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white">
                {activeModalItem.judul || "Dokumentasi Foto"}
              </h3>
              {activeModalItem.keterangan && (
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {activeModalItem.keterangan}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
