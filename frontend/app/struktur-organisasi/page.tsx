"use client";

import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { useWebKontakHookAll } from "@/feature/web";
import { Network } from "lucide-react";

export default function StrukturOrganisasiPage() {
  const { data, isLoading, isError } = useWebKontakHookAll();

  const strukturOrganisasi = (data as any)?.data?.struktur_organisasi ?? "";

  return (
    <>
      <Navbar />

      <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.07] via-background to-secondary/50">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 0), linear-gradient(to bottom, currentColor 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

          <div className="absolute right-[7%] top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative h-44 w-60">
              <div className="absolute left-1/2 top-0 h-10 w-20 -translate-x-1/2 rounded-lg border border-primary/15 bg-background/60 shadow-sm backdrop-blur-sm">
                <div className="absolute left-3 right-3 top-3 h-1 rounded-full bg-primary/15" />
                <div className="absolute left-5 right-5 top-6 h-1 rounded-full bg-primary/10" />
              </div>

              <div className="absolute left-1/2 top-10 h-7 w-px -translate-x-1/2 bg-primary/15" />

              <div className="absolute left-1/2 top-[4.1rem] h-px w-36 -translate-x-1/2 bg-primary/15" />

              <div className="absolute left-2 top-16 h-10 w-20 rounded-lg border border-primary/10 bg-background/50 shadow-sm backdrop-blur-sm">
                <div className="absolute left-3 right-3 top-3 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-5 top-6 h-1 rounded-full bg-primary/10" />
              </div>

              <div className="absolute left-1/2 top-16 h-10 w-20 -translate-x-1/2 rounded-lg border border-primary/10 bg-background/50 backdrop-blur-sm">
                <div className="absolute left-3 right-3 top-3 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-5 top-6 h-1 rounded-full bg-primary/10" />
              </div>

              <div className="absolute right-2 top-16 h-10 w-20 rounded-lg border border-primary/10 bg-background/50 backdrop-blur-sm">
                <div className="absolute left-3 right-3 top-3 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-5 top-6 h-1 rounded-full bg-primary/10" />
              </div>

              <div className="absolute left-12 top-[4.1rem] h-5 w-px bg-primary/10" />

              <div className="absolute left-1/2 top-[4.1rem] h-5 w-px -translate-x-1/2 bg-primary/10" />

              <div className="absolute right-12 top-[4.1rem] h-5 w-px bg-primary/10" />

              <div className="absolute left-1/2 top-[4.5rem] flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Network className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-9">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Network className="h-5 w-5" />

                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
              </div>

              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  JDIH BIN
                </p>

                <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Struktur Organisasi
                </h1>

                <div className="mt-1.5 h-0.5 w-10 rounded-full bg-primary" />
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Informasi mengenai susunan organisasi, pembagian tugas, serta
              hubungan kerja dalam pengelolaan Jaringan Dokumentasi dan
              Informasi Hukum Badan Intelijen Negara.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Beranda</span>

              <span className="text-primary">/</span>

              <span>Struktur Organisasi</span>
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

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-20">
          {isLoading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-slate-400">
                Memuat informasi struktur organisasi...
              </p>
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-600">
                Gagal memuat informasi struktur organisasi.
              </p>

              <p className="mt-1 text-xs text-red-500">
                Silakan coba kembali beberapa saat lagi.
              </p>
            </div>
          )}

          {!isLoading && !isError && strukturOrganisasi && (
            <article
              className="
                max-w-none
                text-slate-600
                [&_p]:mb-4
                [&_p]:text-justify
                [&_p]:text-[15px]
                [&_p]:leading-8
                sm:[&_p]:text-base
                [&_h1]:mb-5
                [&_h1]:mt-8
                [&_h1]:text-3xl
                [&_h1]:font-bold
                [&_h1]:text-slate-700
                [&_h2]:mb-4
                [&_h2]:mt-8
                [&_h2]:text-2xl
                [&_h2]:font-bold
                [&_h2]:text-slate-700
                [&_h3]:mb-3
                [&_h3]:mt-6
                [&_h3]:text-xl
                [&_h3]:font-bold
                [&_h3]:text-slate-700
                [&_h4]:mb-2
                [&_h4]:mt-5
                [&_h4]:text-lg
                [&_h4]:font-semibold
                [&_h4]:text-slate-700
                [&_ul]:my-4
                [&_ul]:list-disc
                [&_ul]:pl-8
                [&_ol]:my-4
                [&_ol]:list-decimal
                [&_ol]:pl-8
                [&_li]:mb-2
                [&_a]:text-primary
                [&_a]:underline
                [&_strong]:font-bold
                [&_strong]:text-slate-700
                [&_blockquote]:my-6
                [&_blockquote]:border-l-4
                [&_blockquote]:border-primary
                [&_blockquote]:bg-slate-50
                [&_blockquote]:px-5
                [&_blockquote]:py-3
                [&_blockquote]:italic
                [&_blockquote]:text-slate-500
                [&_hr]:my-8
                [&_hr]:border-slate-200
                [&_figure]:my-6
                [&_figure.image]:mx-auto
                [&_figure.image]:w-fit
                [&_figure.image_img]:mx-auto
                [&_figure.image_img]:max-w-full
                [&_figure.image_img]:rounded-xl
                [&_figure.image_img]:object-contain
                [&_figcaption]:mt-2
                [&_figcaption]:text-center
                [&_figcaption]:text-sm
                [&_figcaption]:text-slate-500
                [&_table]:my-6
                [&_table]:w-full
                [&_table]:border-collapse
                [&_table]:border
                [&_table]:border-slate-200
                [&_th]:border
                [&_th]:border-slate-200
                [&_th]:bg-slate-50
                [&_th]:px-4
                [&_th]:py-3
                [&_th]:font-semibold
                [&_th]:text-slate-700
                [&_td]:border
                [&_td]:border-slate-200
                [&_td]:px-4
                [&_td]:py-3
                [&_td]:text-slate-600
                [&_img]:max-w-full
                [&_img]:h-auto
              "
              dangerouslySetInnerHTML={{
                __html: strukturOrganisasi,
              }}
            />
          )}

          {!isLoading &&
            !isError &&
            !strukturOrganisasi && (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <Network className="mx-auto h-10 w-10 text-slate-300" />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Informasi struktur organisasi belum tersedia.
                  </p>
                </div>
              </div>
            )}
        </div>
      </main>

      

      <SiteFooter />
    </>
  );
}
