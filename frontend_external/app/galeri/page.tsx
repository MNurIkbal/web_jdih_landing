"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
} from "lucide-react";
import { usePublicGaleri } from "@/feature/galeri/hooks/Galeri.hooks";
import { Galeri } from "@/feature/galeri/types/Galeri.type";

const ITEMS_PER_PAGE = 10; // Default 10 data per page

export default function PublicGaleriPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default 10 data per page
  const [activeModalItem, setActiveModalItem] = useState<Galeri | null>(null);

  // Hit backend API dengan page (0-indexed) dan size
  const { data: apiResponse, isLoading } = usePublicGaleri({
    page: currentPage - 1,
    size: pageSize,
  });

  // Data murni dari API/database tanpa data hardcode
  const itemsList: Galeri[] = Array.isArray(apiResponse?.data)
    ? apiResponse.data
    : Array.isArray(apiResponse)
    ? apiResponse
    : [];

  const pagination = (apiResponse as any)?.pagination;
  const totalItems = Number(pagination?.totalElements ?? pagination?.total ?? itemsList.length);
  const totalPages = Number(pagination?.totalPages ?? (totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1));
  const paginatedItems = itemsList;

  return (
    <>
      <Navbar />

      {/* =========================================================
          PAGE HEADER (Sesuai Desain Standar Dokumen Hukum)
          ========================================================= */}
      <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.07] via-background to-secondary/50">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

          {/* Right Floating Illustration */}
          <div className="absolute right-[8%] top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative h-44 w-56">
              <div className="absolute right-2 top-5 h-32 w-28 rotate-6 rounded-2xl border border-primary/10 bg-background/40 shadow-sm backdrop-blur-sm">
                <div className="absolute left-3 right-3 top-4 h-18 rounded-lg bg-primary/5 overflow-hidden flex items-center justify-center">
                  <Images className="h-7 w-7 text-primary/30" />
                </div>
                <div className="absolute left-3 right-3 bottom-3 h-1.5 rounded-full bg-primary/15" />
              </div>

              <div className="absolute bottom-2 left-6 h-32 w-28 -rotate-6 rounded-2xl border border-primary/10 bg-background/50 shadow-sm backdrop-blur-sm">
                <div className="absolute left-3 right-3 top-4 h-18 rounded-lg bg-primary/10 overflow-hidden flex items-center justify-center">
                  <Camera className="h-7 w-7 text-primary/40" />
                </div>
                <div className="absolute left-3 right-3 bottom-3 h-1.5 rounded-full bg-primary/20" />
              </div>

              <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Images className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-9">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Images className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
              </div>

              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  JDIH BIN
                </p>

                <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Galeri Foto
                </h1>

                <div className="mt-1.5 h-0.5 w-10 rounded-full bg-primary" />
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Dokumentasi visual foto kegiatan resmi dan publikasi JDIH Badan Intelijen Negara.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="font-medium text-foreground hover:underline">
                Beranda
              </Link>
              <span className="text-primary">/</span>
              <span className="text-foreground">Galeri</span>
            </div>
          </div>

          <div className="absolute bottom-0 right-8 hidden items-end gap-1 lg:flex">
            <span className="h-5 w-1 rounded-t-full bg-primary/10" />
            <span className="h-8 w-1 rounded-t-full bg-primary/15" />
            <span className="h-12 w-1 rounded-t-full bg-primary/20" />
            <span className="h-16 w-1 rounded-t-full bg-primary/25" />
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN GALLERY WITH COOL GRID & PAGINATION (10 PER PAGE)
          ========================================================= */}
      <main className="min-h-[500px] bg-slate-50/60 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <Images size={40} className="mx-auto text-slate-300" />
              <p className="mt-3 text-base font-semibold text-slate-700">
                Belum ada foto galeri yang dipublikasikan
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Foto yang diupload melalui CMS admin akan langsung muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedItems.map((item, idx) => {
                const imageUrl = item.media_full_url || item.media_url || "";

                return (
                  <div
                    key={item.galeri_id || idx}
                    onClick={() => setActiveModalItem(item)}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 cursor-pointer"
                  >
                    {/* Media Container */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.judul || "Galeri"}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                          <Images size={36} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Maximize2 size={14} />
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {item.judul || "Dokumentasi Foto"}
                      </h3>

                      {item.keterangan && (
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.keterangan}
                        </p>
                      )}

                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-primary">
                        <span>Lihat Foto Penuh</span>
                        <Maximize2 size={13} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================
              PAGINATION CONTROL (Default 10 items per page)
              ========================================================= */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                dari <span className="font-semibold text-slate-700">{totalItems}</span> foto
              </p>

              <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 border border-slate-200 shadow-xs">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
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
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================
          LIGHTBOX MODAL
          ========================================================= */}
      {activeModalItem && (
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <span className="text-xs font-semibold text-slate-500">
                Dokumentasi Galeri
              </span>

              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full bg-slate-900 flex items-center justify-center overflow-hidden">
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
              <h3 className="text-lg font-bold text-slate-900">
                {activeModalItem.judul || "Dokumentasi Foto"}
              </h3>
              {activeModalItem.keterangan && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {activeModalItem.keterangan}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
