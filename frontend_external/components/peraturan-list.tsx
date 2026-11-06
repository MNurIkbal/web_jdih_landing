"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  FileText,
  Tag,
} from "lucide-react";
import { useWebDokumenHukumHookAll } from "@/feature/web";

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function PeraturanList() {
  const { data, isLoading, isError } = useWebDokumenHukumHookAll();

  const peraturan = (data as any)?.data ?? [];

  return (
    <section
      id="peraturan"
      className="relative isolate overflow-hidden bg-secondary/30 py-20 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-primary/[0.045] blur-3xl" />

        <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.035] blur-3xl" />

        <div
          className="
            absolute inset-0
            opacity-[0.18]
            [background-image:
              linear-gradient(to_right,hsl(var(--primary)/0.10)_1px,transparent_1px),
              linear-gradient(to_bottom,hsl(var(--primary)/0.10)_1px,transparent_1px)
            ]
            [background-size:64px_64px]
            [mask-image:linear-gradient(to_bottom,black,transparent_75%)]
          "
        />

        <div
          className="
            absolute right-[4%] top-[8%]
            h-[420px] w-[420px]
            rounded-full
            border border-primary/[0.06]
          "
        />

        <div
          className="
            absolute right-[7%] top-[12%]
            h-[340px] w-[340px]
            rounded-full
            border border-primary/[0.045]
          "
        />

        <div
          className="
            absolute right-[11%] top-[17%]
            h-[240px] w-[240px]
            rounded-full
            border border-primary/[0.035]
          "
        />

        <div
          className="
            absolute right-[14%] top-[21%]
            h-3 w-3
            rounded-full
            bg-primary/20
            shadow-[0_0_30px_hsl(var(--primary)/0.25)]
          "
        />

        <div
          className="
            absolute left-[4%] top-[28%]
            h-[180px] w-[180px]
            rounded-full
            border border-primary/[0.045]
          "
        />

        <div
          className="
            absolute left-[7%] top-[32%]
            h-[100px] w-[100px]
            rounded-full
            border border-primary/[0.035]
          "
        />

        <div
          className="
            absolute left-[11%] top-[36%]
            h-2 w-2
            rounded-full
            bg-primary/15
          "
        />

        <div
          className="
            absolute right-[2%] bottom-[12%]
            h-[260px] w-[420px]
            rotate-[-18deg]
            rounded-[40%]
            border border-primary/[0.035]
          "
        />

        <div
          className="
            absolute -left-20 bottom-[18%]
            h-px w-[360px]
            rotate-[28deg]
            bg-gradient-to-r
            from-transparent
            via-primary/[0.10]
            to-transparent
          "
        />

        <div
          className="
            absolute right-[-40px] top-[45%]
            h-px w-[320px]
            rotate-[-28deg]
            bg-gradient-to-r
            from-transparent
            via-primary/[0.08]
            to-transparent
          "
        />

        <div
          className="
            absolute left-[18%] top-[12%]
            hidden h-[140px] w-[140px]
            rounded-full
            border border-dashed
            border-primary/[0.045]
            lg:block
          "
        />

        <div
          className="
            absolute left-[21%] top-[15%]
            hidden h-2 w-2
            rounded-full
            bg-primary/10
            lg:block
          "
        />

        <div
          className="
            absolute right-[12%] bottom-[8%]
            hidden h-[150px] w-[110px]
            rotate-[8deg]
            rounded-xl
            border border-primary/[0.045]
            bg-primary/[0.012]
            lg:block
          "
        >
          <div className="absolute left-5 right-5 top-6 space-y-3 opacity-40">
            <div className="h-1.5 w-12 rounded-full bg-primary/20" />
            <div className="h-px w-full bg-primary/10" />
            <div className="h-px w-[85%] bg-primary/10" />
            <div className="h-px w-[92%] bg-primary/10" />
            <div className="h-px w-[70%] bg-primary/10" />

            <div className="pt-2">
              <div className="h-6 w-6 rounded-full border border-primary/10" />
            </div>
          </div>
        </div>

        <div
          className="
            absolute left-[3%] bottom-[8%]
            hidden h-[90px] w-[90px]
            rotate-45
            border border-primary/[0.035]
            lg:block
          "
        />

        <div
          className="
            absolute right-[30%] top-[5%]
            hidden h-px w-32
            bg-gradient-to-r
            from-transparent
            via-primary/[0.08]
            to-transparent
            lg:block
          "
        />

        <div
          className="
            absolute right-[30%] top-[5%]
            hidden h-32 w-px
            bg-gradient-to-b
            from-transparent
            via-primary/[0.08]
            to-transparent
            lg:block
          "
        />

        <div
          className="
            absolute inset-x-0 bottom-0
            h-48
            bg-gradient-to-t
            from-background/70
            to-transparent
          "
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-primary/20" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="h-px w-7 bg-gradient-to-r from-primary/70 to-primary/10" />
              Indeks Resmi
            </span>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Produk Hukum Terkini
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Daftar peraturan perundang-undangan terbaru yang telah
              diinventarisasi dalam sistem JDIH.
            </p>
          </div>

          <Link
            href="/dokumen-hukum"
            className="group inline-flex items-center gap-2 border-b-2 border-primary pb-0.5 text-sm font-semibold text-primary"
          >
            Semua Produk Hukum
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4">
          {isLoading &&
            [1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[128px] animate-pulse rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
              />
            ))}

          {!isLoading && isError && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />

              <p className="mt-3 text-sm text-muted-foreground">
                Gagal mengambil data produk hukum.
              </p>
            </div>
          )}

          {!isLoading && !isError && peraturan.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />

              <p className="mt-3 text-sm text-muted-foreground">
                Belum ada produk hukum tersedia.
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            peraturan.map((p: any, index: number) => (
              <Link
                key={p.id}
                href={`/dokumen-hukum/${p.id}`}
                className="
                  group relative flex min-h-[128px]
                  overflow-hidden rounded-2xl
                  border border-border/70
                  bg-card/90
                  shadow-[0_12px_40px_-25px_hsl(var(--foreground)/0.25)]
                  backdrop-blur-xl
                  transition-all duration-500
                  hover:-translate-y-1
                  hover:border-primary/25
                  hover:shadow-[0_22px_55px_-25px_hsl(var(--primary)/0.25)]
                "
              >
                <span className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-primary transition-transform duration-500 group-hover:scale-y-100" />

                <div className="flex w-[72px] shrink-0 flex-col items-center justify-center border-r border-border/50 sm:w-[88px]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                    No.
                  </span>

                  <span className="mt-1 font-display text-xl font-semibold text-primary/70 transition-colors duration-300 group-hover:text-primary sm:text-2xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex h-fit shrink-0 items-center self-center pl-4 sm:pl-5">
                  <div
                    className="
                      relative flex h-11 w-11
                      items-center justify-center
                      overflow-hidden rounded-xl
                      border border-primary/10
                      bg-primary/[0.055]
                      text-primary
                      transition-all duration-500
                      group-hover:border-primary/20
                      group-hover:bg-primary
                      group-hover:text-primary-foreground
                      sm:h-14 sm:w-14
                    "
                  >
                    <FileText className="relative z-10 h-5 w-5 transition-transform duration-500 group-hover:scale-110" />

                    <span className="absolute -right-5 -top-5 h-12 w-12 rounded-full bg-primary/10 transition-transform duration-700 group-hover:scale-[2.5]" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {p.tipe_dokumen || ""} - Nomor {p.nomor || ""}
                    </p>
                  </div>

                  <h4 className="mt-1.5 line-clamp-2 font-display text-[16px] font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary sm:text-[17px]">
                    {p.judul}
                  </h4>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary">
                      <Tag className="h-3 w-3" />
                      {p.kategori || ""}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      <CircleCheck className="h-3 w-3" />
                      {p.status || "Berlaku"}
                    </span>

                    <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {p.tahun}
                    </span>
                  </div>
                </div>

                <div className="relative hidden w-28 shrink-0 items-center justify-center overflow-hidden sm:flex">
                  <span
                    className="
                      absolute right-0
                      font-display text-5xl font-bold
                      tracking-tighter
                      text-primary/[0.035]
                      transition-all duration-500
                      group-hover:scale-110
                      group-hover:text-primary/[0.07]
                    "
                  >
                    JDIH
                  </span>

                  <div
                    className="
                      relative z-10 flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      border border-border
                      bg-background/60
                      text-muted-foreground
                      transition-all duration-500
                      group-hover:border-primary/30
                      group-hover:bg-primary
                      group-hover:text-primary-foreground
                    "
                  >
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/dokumen-hukum"
            className="
              group inline-flex items-center gap-2
              rounded-lg
              border border-border
              
              px-7 py-3.5
              text-sm font-semibold
              text-white
              shadow-sm
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-primary/30
              bg-primary
              hover:text-primary-foreground
              hover:shadow-lg
            "
          >
            Lihat Semua Peraturan
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
