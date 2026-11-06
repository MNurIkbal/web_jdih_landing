"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  FileText,
  Search,
  Tag,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

import { AppSelect, SelectOption } from "./ui/app-select";
import { useDokumenHukumWebList } from "@/feature/web";
import { bidangOptions, kategoriOptions, tahunOptions } from "@/constanta/GlobalConstanta";

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from(
      { length: total },
      (_, i) => i + 1,
    );
  }

  const pages = new Set<number>([
    1,
    total,
    current,
    current - 1,
    current + 1,
  ]);

  const sorted = Array.from(pages)
    .filter(
      (page) =>
        page >= 1 && page <= total,
    )
    .sort((a, b) => a - b);

  const result: (
    | number
    | "ellipsis"
  )[] = [];

  sorted.forEach((page, index) => {
    if (
      index > 0 &&
      page - sorted[index - 1] > 1
    ) {
      result.push("ellipsis");
    }

    result.push(page);
  });

  return result;
}


type SearchParams = {
  search: string;
  page: number;
  size: number;
  kategori: string;
  tahun: string;
  bidang: string;
};

export function ProdukHukumTable() {
  const [keyword, setKeyword] = useState("");

  const [jenis, setJenis] =
    useState<SelectOption | null>(
      kategoriOptions[0],
    );

  const [tahun, setTahun] =
    useState<SelectOption | null>(
      tahunOptions[0],
    );

  const [bidang, setBidang] =
    useState<SelectOption | null>(
      bidangOptions[0],
    );

  const [searchParams, setSearchParams] =
    useState<SearchParams>({
      search: "",
      page: 1,
      size: 10,
      kategori: "",
      tahun: "",
      bidang: "",
    });

  const {
    data,
    isLoading,
    isError,
  } = useDokumenHukumWebList(
    searchParams,
  );


  const peraturan = useMemo(() => {
    return (data as any)?.data ?? [];
  }, [data]);

  const pagination = useMemo(() => {
    return (
      (data as any)?.pagination ?? {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 1,
      }
    );
  }, [data]);

  const totalData = Number(
    pagination.total ?? 0,
  );

  const totalPages = Math.max(
    1,
    Number(
      pagination.totalPages ?? 1,
    ),
  );

  const currentPage = Number(
    searchParams.page ?? 1,
  );

  const rangeStart =
    totalData === 0
      ? 0
      : (currentPage - 1) *
          searchParams.size +
        1;

  const rangeEnd = Math.min(
    currentPage * searchParams.size,
    totalData,
  );

  const pageNumbers = getPageNumbers(
    currentPage,
    totalPages,
  );

  const handleCari = () => {
    setSearchParams({
      search: keyword.trim(),

      page: 1,

      size: 10,

      kategori:
        jenis?.value
          ? String(jenis.value)
          : "",

      tahun:
        tahun?.value
          ? String(tahun.value)
          : "",

      bidang:
        bidang?.value
          ? String(bidang.value)
          : "",
    });
  };

  const handleReset = () => {
    setKeyword("");

    setJenis(kategoriOptions[0]);

    setTahun(tahunOptions[0]);

    setBidang(bidangOptions[0]);

    setSearchParams({
      search: "",
      page: 1,
      size: 10,
      kategori: "",
      tahun: "",
      bidang: "",
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      handleCari();
    }
  };

  const handlePageChange = (
    page: number,
  ) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setSearchParams((prev) => ({
      ...prev,
      page,
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  useEffect(() => {
    if (
      currentPage > totalPages &&
      totalPages > 0
    ) {
      setSearchParams((prev) => ({
        ...prev,
        page: totalPages,
      }));
    }
  }, [
    currentPage,
    totalPages,
  ]);

  return (
    <div className="space-y-5">

      <div
        className="
          rounded-2xl
          border border-border
          bg-card
          p-4
          shadow-sm
          sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:items-center
            lg:gap-4
          "
        >

          {/* SEARCH */}

          <div
            className="
              flex
              flex-1
              items-center
              gap-2
              rounded-lg
              border border-border
              px-4
              py-2.5
              lg:border-0
              lg:px-0
            "
          >
            <Search
              className="
                h-4 w-4
                shrink-0
                text-muted-foreground
              "
            />

            <input
              value={keyword}
              onChange={(e) =>
                setKeyword(
                  e.target.value,
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Cari judul, nomor, kategori..."
              className="
                w-full
                bg-transparent
                text-sm
                text-foreground
                outline-none
                placeholder:text-muted-foreground
              "
            />
          </div>

          <div className="hidden h-8 w-px bg-border lg:block" />

          <div className="lg:w-48">
            <AppSelect
              options={
                kategoriOptions
              }
              value={jenis}
              onChange={setJenis}
              placeholder="Kategori"
            />
          </div>

          <div className="hidden h-8 w-px bg-border lg:block" />

          <div className="lg:w-32">
            <AppSelect
              options={
                tahunOptions
              }
              value={tahun}
              onChange={setTahun}
              placeholder="Tahun"
            />
          </div>

          <div className="hidden h-8 w-px bg-border lg:block" />

          {/* BIDANG */}

          <div className="lg:min-w-[16rem] lg:flex-1">
            <AppSelect
              options={
                bidangOptions
              }
              value={bidang}
              onChange={setBidang}
              placeholder="Bidang Hukum"
            />
          </div>

          {/* CARI */}

          <button
            type="button"
            onClick={handleCari}
            disabled={isLoading}
            className="
              inline-flex
              w-full
              shrink-0
              items-center
              justify-center
              gap-2
              whitespace-nowrap
              rounded-xl
              bg-primary
              px-7
              py-2.5
              text-sm
              font-semibold
              text-primary-foreground
              shadow-sm
              transition-all
              hover:bg-primary/90
              hover:shadow-md
              disabled:pointer-events-none
              disabled:opacity-60
              lg:w-auto
            "
          >
            <Search className="h-4 w-4" />

            Cari
          </button>

          {/* RESET */}

          <button
            type="button"
            onClick={handleReset}
            title="Reset filter"
            className="
              inline-flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-border
              bg-secondary/50
              text-muted-foreground
              transition-all
              hover:bg-secondary
              hover:text-foreground
              lg:h-10
              lg:w-10
            "
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      {(searchParams.search ||
        searchParams.kategori ||
        searchParams.tahun ||
        searchParams.bidang) && (
        <div className="flex flex-wrap items-center gap-2">

          <span className="text-xs text-muted-foreground">
            Filter:
          </span>

          {searchParams.search && (
            <span
              className="
                rounded-full
                border border-primary/20
                bg-primary/5
                px-3 py-1
                text-[11px]
                font-medium
                text-primary
              "
            >
              "{searchParams.search}"
            </span>
          )}

          {searchParams.kategori && (
            <span
              className="
                rounded-full
                border border-primary/20
                bg-primary/5
                px-3 py-1
                text-[11px]
                font-medium
                text-primary
              "
            >
              {searchParams.kategori}
            </span>
          )}

          {searchParams.tahun && (
            <span
              className="
                rounded-full
                border border-primary/20
                bg-primary/5
                px-3 py-1
                text-[11px]
                font-medium
                text-primary
              "
            >
              Tahun {searchParams.tahun}
            </span>
          )}

          {searchParams.bidang && (
            <span
              className="
                rounded-full
                border border-primary/20
                bg-primary/5
                px-3 py-1
                text-[11px]
                font-medium
                text-primary
              "
            >
              {searchParams.bidang}
            </span>
          )}
        </div>
      )}


      <p className="text-sm text-muted-foreground">
        Menampilkan{" "}
        <span className="font-semibold text-foreground">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-foreground">
          {totalData}
        </span>{" "}
        data
      </p>

      <div className="space-y-3">

        <div className="grid gap-4">

          {/* LOADING */}

          {isLoading &&
            [1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="
                    min-h-[128px]
                    animate-pulse
                    rounded-2xl
                    border border-border/70
                    bg-card
                    shadow-card
                    sm:p-6
                  "
                />
              ),
            )}

          {/* ERROR */}

          {!isLoading &&
            isError && (
              <div
                className="
                  rounded-2xl
                  border border-border
                  bg-card
                  p-10
                  text-center
                  shadow-card
                "
              >
                <FileText
                  className="
                    mx-auto
                    h-10 w-10
                    text-muted-foreground/40
                  "
                />

                <p className="mt-3 text-sm text-muted-foreground">
                  Gagal mengambil data
                  produk hukum.
                </p>

                <button
                  type="button"
                  onClick={handleCari}
                  className="
                    mt-4
                    rounded-lg
                    bg-primary
                    px-4 py-2
                    text-xs
                    font-semibold
                    text-primary-foreground
                  "
                >
                  Coba Lagi
                </button>
              </div>
            )}

          {/* EMPTY */}

          {!isLoading &&
            !isError &&
            peraturan.length ===
              0 && (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-border
                  bg-card
                  p-10
                  text-center
                "
              >
                <FileText
                  className="
                    mx-auto
                    h-10 w-10
                    text-muted-foreground/40
                  "
                />

                <p className="mt-3 text-sm font-medium text-foreground">
                  Tidak ada produk
                  hukum ditemukan.
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Coba ubah kata kunci
                  atau filter pencarian.
                </p>
              </div>
            )}

          {/* DATA */}

          {!isLoading &&
            !isError &&
            peraturan.map(
              (
                p: any,
                index: number,
              ) => (
                <Link
                  key={p.id}
                  href={`/dokumen-hukum/${p.id}`}
                  className="
                    group
                    relative
                    flex
                    min-h-[128px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-border/70
                    bg-card/90
                    shadow-[0_12px_40px_-25px_hsl(var(--foreground)/0.25)]
                    backdrop-blur-xl
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:border-primary/25
                    hover:shadow-[0_22px_55px_-25px_hsl(var(--primary)/0.25)]
                  "
                >

                  {/* LEFT ACCENT */}

                  <span
                    className="
                      absolute
                      inset-y-0
                      left-0
                      w-1
                      origin-bottom
                      scale-y-0
                      bg-primary
                      transition-transform
                      duration-500
                      group-hover:scale-y-100
                    "
                  />

                  {/* NUMBER */}

                  <div
                    className="
                      flex
                      w-[72px]
                      shrink-0
                      flex-col
                      items-center
                      justify-center
                      border-r
                      border-border/50
                      sm:w-[88px]
                    "
                  >
                    <span
                      className="
                        font-mono
                        text-[10px]
                        uppercase
                        tracking-[0.18em]
                        text-muted-foreground/60
                      "
                    >
                      No.
                    </span>

                    <span
                      className="
                        mt-1
                        font-display
                        text-xl
                        font-semibold
                        text-primary/70
                        transition-colors
                        duration-300
                        group-hover:text-primary
                        sm:text-2xl
                      "
                    >
                      {String(
                        (currentPage -
                          1) *
                          searchParams.size +
                          index +
                          1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      h-fit
                      shrink-0
                      items-center
                      self-center
                      pl-4
                      sm:pl-5
                    "
                  >
                    <div
                      className="
                        relative
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        border
                        border-primary/10
                        bg-primary/[0.055]
                        text-primary
                        transition-all
                        duration-500
                        group-hover:border-primary/20
                        group-hover:bg-primary
                        group-hover:text-primary-foreground
                        sm:h-14
                        sm:w-14
                      "
                    >
                      <FileText
                        className="
                          relative
                          z-10
                          h-5 w-5
                          transition-transform
                          duration-500
                          group-hover:scale-110
                        "
                      />

                      <span
                        className="
                          absolute
                          -right-5
                          -top-5
                          h-12
                          w-12
                          rounded-full
                          bg-primary/10
                          transition-transform
                          duration-700
                          group-hover:scale-[2.5]
                        "
                      />
                    </div>
                  </div>
                  <div
                    className="
                      min-w-0
                      flex-1
                      px-4
                      py-5
                      sm:px-6
                      sm:py-6
                    "
                  >

                    {/* NOMOR */}

                    <p
                      className="
                        truncate
                        font-mono
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-muted-foreground
                      "
                    >
                      {p.tipe_dokumen ||
                        ""}

                        - Nomor { " " + p.nomor}
                    </p>

                    <h4
                      className="
                        mt-1.5
                        line-clamp-2
                        font-display
                        text-[16px]
                        font-semibold
                        leading-snug
                        text-foreground
                        transition-colors
                        duration-300
                        group-hover:text-primary
                        sm:text-[17px]
                      "
                    >
                      {p.judul ||
                        "Tanpa judul"}
                    </h4>

                    <div
                      className="
                        mt-3
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >
                      {p.kategori && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-primary/20
                            bg-primary/5
                            px-2.5
                            py-1
                            text-[10px]
                            font-medium
                            text-primary
                          "
                        >
                          <Tag className="h-3 w-3" />

                          {p.kategori}
                        </span>
                      )}

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          ${
                            String(
                              p.status,
                            ).toLowerCase() ===
                              "true" ||
                            String(
                              p.status,
                            ).toLowerCase() ===
                              "berlaku"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-600"
                          }
                        `}
                      >
                        <CircleCheck className="h-3 w-3" />

                        {String(
                          p.status,
                        ).toLowerCase() ===
                          "true" ||
                        String(
                          p.status,
                        ).toLowerCase() ===
                          "berlaku"
                          ? "Berlaku"
                          : "Dicabut"}
                      </span>

                      <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

                      {/* TAHUN */}

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          font-mono
                          text-[10px]
                          text-muted-foreground
                        "
                      >
                        <CalendarDays className="h-3 w-3" />

                        {p.tahun ||
                          "-"}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}

                  <div
                    className="
                      relative
                      hidden
                      w-28
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      sm:flex
                    "
                  >
                    <span
                      className="
                        absolute
                        right-0
                        font-display
                        text-5xl
                        font-bold
                        tracking-tighter
                        text-primary/[0.035]
                        transition-all
                        duration-500
                        group-hover:scale-110
                        group-hover:text-primary/[0.07]
                      "
                    >
                      JDIH
                    </span>

                    <div
                      className="
                        relative
                        z-10
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-border
                        bg-background/60
                        text-muted-foreground
                        transition-all
                        duration-500
                        group-hover:border-primary/30
                        group-hover:bg-primary
                        group-hover:text-primary-foreground
                      "
                    >
                      <ArrowUpRight
                        className="
                          h-4 w-4
                          transition-transform
                          duration-500
                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                      />
                    </div>
                  </div>
                </Link>
              ),
            )}
        </div>
      </div>

      {totalPages > 1 && (
        <div
          className="
            flex
            items-center
            justify-center
            gap-1.5
            pt-2
          "
        >

          <button
            type="button"
            onClick={() =>
              handlePageChange(
                currentPage - 1,
              )
            }
            disabled={
              currentPage === 1 ||
              isLoading
            }
            aria-label="Halaman sebelumnya"
            className="
              flex
              h-9 w-9
              items-center
              justify-center
              rounded-lg
              border
              border-border
              text-muted-foreground
              transition-colors
              hover:bg-secondary
              disabled:pointer-events-none
              disabled:opacity-40
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map(
            (page, index) =>
              page ===
              "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="
                    flex
                    h-9 w-9
                    items-center
                    justify-center
                    text-sm
                    text-muted-foreground
                  "
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      page,
                    )
                  }
                  disabled={isLoading}
                  aria-current={
                    page ===
                    currentPage
                      ? "page"
                      : undefined
                  }
                  className={`
                    flex
                    h-9 w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      page ===
                      currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground hover:bg-secondary"
                    }
                  `}
                >
                  {page}
                </button>
              ),
          )}

          <button
            type="button"
            onClick={() =>
              handlePageChange(
                currentPage + 1,
              )
            }
            disabled={
              currentPage ===
                totalPages ||
              isLoading
            }
            aria-label="Halaman berikutnya"
            className="
              flex
              h-9 w-9
              items-center
              justify-center
              rounded-lg
              border
              border-border
              text-muted-foreground
              transition-colors
              hover:bg-secondary
              disabled:pointer-events-none
              disabled:opacity-40
            "
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
