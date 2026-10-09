"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Newspaper,
  Sparkles,
  Tag,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { useWebBeritaHookAll, useWebBeritaHookResult } from "@/feature/web";

type Berita = {
  berita_id?: number;
  beritaId?: number;
  judul?: string;
  title?: string;
  slug?: string;
  gambar?: string;
  image?: string;
  thumbnail?: string;
  tanggal?: string;
  tanggal_berita?: string;
  kategori?: string;
  isi?: string;
  isi_berita?: string;
};

type PaginationData = {
  content?: Berita[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
};

const ITEMS_PER_PAGE = 10;
const FIXED_TOP_COUNT = 4;

export default function BeritaPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError } = useWebBeritaHookResult({
    page: currentPage,
    size: ITEMS_PER_PAGE,
  });

  const paginationData = useMemo<PaginationData>(() => {
    return ((data as any)?.data ?? {}) as PaginationData;
  }, [data]);

  const berita = useMemo<Berita[]>(() => {
    const content = paginationData.content;

    return Array.isArray(content) ? content : [];
  }, [paginationData]);

  const totalPages = Math.max(1, Number(paginationData.totalPages ?? 1));

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const highlight = berita[0];

  const sideNews = useMemo(() => {
    return berita.slice(1, FIXED_TOP_COUNT);
  }, [berita]);

  const otherNews = useMemo(() => {
    return berita.slice(FIXED_TOP_COUNT);
  }, [berita]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Navbar />

      <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.09] via-background to-secondary/60">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div className="absolute -left-32 -top-32 h-80 w-80 animate-pulse rounded-full bg-primary/10 blur-3xl" />

          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-primary/[0.08] blur-3xl" />

          <div className="absolute bottom-[-140px] left-1/3 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" />

          <div className="absolute right-[10%] top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative h-52 w-64 opacity-60">
              <div className="absolute left-1/2 top-1/2 h-40 w-52 -translate-x-1/2 -translate-y-1/2 rotate-6 rounded-2xl border border-primary/10 bg-background/40 shadow-2xl backdrop-blur-md" />

              <div className="absolute left-1/2 top-1/2 h-40 w-52 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-2xl border border-primary/10 bg-background/40 shadow-xl backdrop-blur-md" />

              <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 animate-bounce items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                <Newspaper className="h-6 w-6" />
              </div>

              <div className="absolute left-10 top-8 h-2 w-20 rounded-full bg-primary/10" />

              <div className="absolute right-8 top-16 h-2 w-16 rounded-full bg-primary/10" />

              <div className="absolute bottom-10 left-14 h-2 w-24 rounded-full bg-primary/10" />
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Newspaper className="h-5 w-5" />

                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              </div>

              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  JDIH BIN
                </p>
                <h1 className="mt-0.5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Berita
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Informasi, kegiatan, dan kabar terbaru seputar Jaringan
              Dokumentasi dan Informasi Hukum Badan Intelijen Negara.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Link
                href="/"
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                Beranda
              </Link>

              <ChevronRight className="h-3.5 w-3.5 text-primary" />

              <span>Berita</span>
            </div>
          </div>
        </div>
      </section>

      <main className="relative min-h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-120px] top-40 h-72 w-72 rounded-full bg-primary/[0.035] blur-3xl" />

          <div className="absolute right-[-100px] top-[45%] h-80 w-80 rounded-full bg-primary/[0.035] blur-3xl" />

          <div className="absolute bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-secondary/60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {isLoading && (
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="h-[500px] animate-pulse rounded-2xl bg-secondary/70 sm:h-[560px]" />

              <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[170px] animate-pulse rounded-2xl bg-secondary/70"
                  />
                ))}
              </div>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <Newspaper className="mx-auto h-10 w-10 text-red-400" />

              <p className="mt-3 text-sm font-semibold text-red-600">
                Gagal memuat berita.
              </p>

              <p className="mt-1 text-xs text-red-500">
                Silakan coba kembali beberapa saat lagi.
              </p>
            </div>
          )}

          {!isLoading && !isError && berita.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/70 p-16 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/30" />

              <h2 className="mt-4 text-lg font-bold text-foreground">
                Belum Ada Berita
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Informasi berita belum tersedia.
              </p>
            </div>
          )}

          {!isLoading && !isError && highlight && (
            <>
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-8 rounded-full bg-primary" />

                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      Berita Terbaru
                    </span>
                  </div>

                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Informasi Terkini
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
                <HighlightNews berita={highlight} />

                <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
                  {sideNews.map((item, index) => (
                    <SideNews
                      key={item.berita_id ?? item.beritaId ?? index}
                      berita={item}
                    />
                  ))}
                </div>
              </div>

              {otherNews.length > 0 && (
                <div className="mt-14">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />

                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      Berita Lainnya
                    </span>

                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {otherNews.map((item, index) => (
                      <NewsCard
                        key={item.berita_id ?? item.beritaId ?? index}
                        berita={item}
                      />
                    ))}
                  </div>
                </div>
              )}

              {totalPages > 1 && (
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function HighlightNews({ berita }: { berita: Berita }) {
  const id = berita.berita_id ?? berita.beritaId;
  const title = berita.judul ?? berita.title ?? "Berita";
  const image = berita.gambar ?? berita.image ?? berita.thumbnail;
  const date = berita.tanggal_berita ?? berita.tanggal;

  return (
    <Link
      href={id ? `/berita/${id}` : "#"}
      className="group relative block min-h-[500px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 sm:min-h-[560px]"
    >
      <div className="absolute inset-0">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 65vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary to-primary/5">
            <Newspaper className="h-20 w-20 text-primary/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      </div>

      <div className="absolute left-5 top-5 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          Highlight
        </span>

        {berita.kategori && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
            <Tag className="h-3 w-3" />
            {berita.kategori}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        {date && (
          <div className="mb-3 flex items-center gap-2 text-xs text-white/75">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(date)}
          </div>
        )}

        <h3 className="line-clamp-2 max-w-2xl font-display text-lg font-bold leading-snug text-white sm:text-xl lg:text-2xl">
          {title}
        </h3>

        {(berita.isi_berita || berita.isi) && (
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-white/75">
            {stripHtml(berita.isi_berita ?? berita.isi ?? "")}
          </p>
        )}

        <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white">
          Baca selengkapnya
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function SideNews({ berita }: { berita: Berita }) {
  const id = berita.berita_id ?? berita.beritaId;
  const title = berita.judul ?? berita.title ?? "Berita";
  const image = berita.gambar ?? berita.image ?? berita.thumbnail;
  const date = berita.tanggal_berita ?? berita.tanggal;

  return (
    <Link
      href={id ? `/berita/${id}` : "#"}
      className="group flex min-h-[170px] gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative h-full w-[120px] shrink-0 overflow-hidden rounded-xl bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="120px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Newspaper className="h-8 w-8 text-primary/20" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div>
          {berita.kategori && (
            <p className="mb-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary">
              <Tag className="h-2.5 w-2.5" />
              {berita.kategori}
            </p>
          )}

          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>

          {(berita.isi_berita || berita.isi) && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
              {stripHtml(berita.isi_berita ?? berita.isi ?? "")}
            </p>
          )}
        </div>

        {date && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {formatDate(date)}
          </div>
        )}
      </div>
    </Link>
  );
}

function NewsCard({ berita }: { berita: Berita }) {
  const id = berita.berita_id ?? berita.beritaId;
  const title = berita.judul ?? berita.title ?? "Berita";
  const image = berita.gambar ?? berita.image ?? berita.thumbnail;
  const date = berita.tanggal_berita ?? berita.tanggal;

  return (
    <Link
      href={id ? `/berita/${id}` : "#"}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative h-48 overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-secondary">
            <Newspaper className="h-12 w-12 text-primary/15" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {berita.kategori && (
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-md bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm backdrop-blur">
              <Tag className="h-3 w-3" />
              {berita.kategori}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        {date && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(date)}
          </div>
        )}

        <h3 className="line-clamp-2 text-base font-bold leading-6 text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>

        {(berita.isi_berita || berita.isi) && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {stripHtml(berita.isi_berita ?? berita.isi ?? "")}
          </p>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
          Selengkapnya
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Halaman sebelumnya"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 items-center justify-center text-xs font-semibold text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={
              page === currentPage
                ? "flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20"
                : "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            }
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Halaman berikutnya"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 1) {
    return [1];
  }

  const delta = 1;
  const range: (number | "...")[] = [];

  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);

  if (left > 2) {
    range.push("...");
  }

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < total - 1) {
    range.push("...");
  }

  range.push(total);

  return range;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function stripHtml(value: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}
