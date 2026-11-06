
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useWebBeritaHookAll } from "@/feature/web";

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getRingkasan(isi: string) {
  if (!isi) return "";

  const text = isi.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  return text;
}

export function BeritaSection() {
  const { data, isLoading, isError } = useWebBeritaHookAll();

  const berita = (data as any)?.data ?? [];

  const beritaUtama = berita[0];
  const beritaLain = berita.slice(1, 4);

  if (isLoading) {
    return (
      <section
  id="berita"
  className="
    relative
    isolate
    overflow-hidden
    bg-background
    py-20
    sm:py-24
  "
>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.05),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
  <span className="relative flex h-2 w-2 items-center justify-center">
    <span className="absolute h-2 w-2 rounded-full bg-primary/20 animate-ping" />
    <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
  </span>

  <span className="h-px w-8 bg-gradient-to-r from-primary/70 to-primary/10" />

  Pojok Hukum
</span>

              <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
                Berita &amp; Siaran Pers
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Informasi terbaru seputar kegiatan, kebijakan, produk hukum, dan perkembangan penyelenggaraan pemerintahan daerah.  
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[350px] animate-pulse rounded-2xl border border-border bg-card/70"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || berita.length === 0) {
    return (
      <section
        id="berita"
        className="relative overflow-hidden bg-background py-20 sm:py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.05),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Pojok Hukum
          </span>

          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Berita &amp; Siaran Pers
          </h2>

          <p className="mt-4 text-sm text-muted-foreground">
            Belum ada berita yang tersedia.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="berita"
      className="relative overflow-hidden bg-background py-20 sm:py-24"
    >
      {/* ============================================================
   BACKGROUND ILUSTRASI ELEGAN
   ============================================================ */}
<div className="pointer-events-none absolute inset-0 overflow-hidden">

  {/* Soft ambient glow */}
  <div
    className="
      absolute -right-40 -top-40
      h-[600px] w-[600px]
      rounded-full
      bg-primary/[0.07]
      blur-[100px]
    "
  />

  <div
    className="
      absolute -bottom-48 -left-40
      h-[520px] w-[520px]
      rounded-full
      bg-primary/[0.045]
      blur-[100px]
    "
  />

  {/* Center atmospheric glow */}
  <div
    className="
      absolute left-1/2 top-[45%]
      h-[420px] w-[420px]
      -translate-x-1/2
      rounded-full
      bg-primary/[0.025]
      blur-[120px]
    "
  />

  {/* Fine architectural grid */}
  <div
    className="
      absolute inset-0
      opacity-[0.28]
      [background-image:
        linear-gradient(to_right,hsl(var(--border)/0.13)_1px,transparent_1px),
        linear-gradient(to_bottom,hsl(var(--border)/0.13)_1px,transparent_1px)
      ]
      [background-size:56px_56px]
      [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]
    "
  />

  {/* Small dot pattern */}
  <div
    className="
      absolute right-[8%] top-[18%]
      h-[220px] w-[220px]
      opacity-[0.35]
      [background-image:radial-gradient(hsl(var(--primary)/0.25)_1px,transparent_1px)]
      [background-size:16px_16px]
      [mask-image:radial-gradient(circle,black_20%,transparent_75%)]
    "
  />

  {/* Large geometric ring */}
  <div
    className="
      absolute -right-[180px] top-[8%]
      h-[520px] w-[520px]
      rounded-full
      border border-primary/[0.07]
    "
  />

  <div
    className="
      absolute -right-[120px] top-[14%]
      h-[400px] w-[400px]
      rounded-full
      border border-primary/[0.05]
    "
  />

  <div
    className="
      absolute -right-[65px] top-[20%]
      h-[280px] w-[280px]
      rounded-full
      border border-primary/[0.045]
    "
  />

  {/* Abstract document / legal lines */}
  <div
    className="
      absolute right-[5%] top-[10%]
      hidden h-[330px] w-[240px]
      rotate-[8deg]
      rounded-[24px]
      border border-primary/[0.055]
      bg-primary/[0.012]
      shadow-[0_30px_100px_-50px_hsl(var(--primary)/0.25)]
      lg:block
    "
  >
    <div className="absolute left-8 right-8 top-10 space-y-4 opacity-30">
      <div className="h-2 w-24 rounded-full bg-primary/20" />
      <div className="h-1.5 w-full rounded-full bg-primary/10" />
      <div className="h-1.5 w-[85%] rounded-full bg-primary/10" />
      <div className="h-1.5 w-[92%] rounded-full bg-primary/10" />

      <div className="pt-5">
        <div className="h-1.5 w-full rounded-full bg-primary/10" />
        <div className="mt-3 h-1.5 w-[90%] rounded-full bg-primary/10" />
        <div className="mt-3 h-1.5 w-[72%] rounded-full bg-primary/10" />
      </div>

      <div className="pt-6">
        <div className="h-12 w-12 rounded-full border border-primary/10" />
      </div>
    </div>
  </div>

  {/* Thin diagonal architectural lines */}
  <div
    className="
      absolute -left-20 top-[35%]
      h-px w-[420px]
      rotate-[25deg]
      bg-gradient-to-r
      from-transparent
      via-primary/[0.08]
      to-transparent
    "
  />

  <div
    className="
      absolute right-[-80px] bottom-[25%]
      h-px w-[420px]
      -rotate-[25deg]
      bg-gradient-to-r
      from-transparent
      via-primary/[0.08]
      to-transparent
    "
  />

  {/* Bottom fade */}
  <div
    className="
      absolute inset-x-0 bottom-0
      h-40
      bg-gradient-to-t
      from-background
      to-transparent
    "
  />

</div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <span className="h-px w-5 bg-primary/60" />
              Pojok Hukum
            </span>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Berita &amp; Siaran Pers
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Pernyataan resmi, klarifikasi, dan perkembangan terkini seputar
              produk hukum dan kelembagaan.
            </p>
          </div>

          <Link
            href="/berita"
            className="group inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Semua Berita
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {beritaUtama && (
          <Link
            href={`/berita/${beritaUtama.berita_id}`}
            className="group relative grid gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-[0_10px_40px_-20px_hsl(var(--foreground)/0.25)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.25)] lg:grid-cols-[1.1fr_1fr]"
          >
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[390px]">
              <Image
                src={beritaUtama.gambar}
                alt={beritaUtama.judul}
                fill
                priority
                className="object-cover grayscale-[.2] transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Berita Terbaru
              </div>
            </div>

            <div className="relative flex flex-col justify-center p-8 sm:p-10">
              <span className="inline-flex w-fit items-center rounded-md border border-primary/10 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-primary">
                {beritaUtama.kategori}
              </span>

              <h3 className="mt-4 line-clamp-2 text-balance font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                {beritaUtama.judul}
              </h3>

              <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatTanggal(beritaUtama.tanggal_berita)}
              </span>

              <p className="mt-4 line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {getRingkasan(beritaUtama.isi_berita)}
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Baca Selengkapnya
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>

              <div className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-full bg-primary/[0.035]" />
            </div>
          </Link>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {beritaLain.map((b: any) => (
            <Link
              key={b.berita_id}
              href={`/berita/${b.berita_id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-[0_8px_30px_-20px_hsl(var(--foreground)/0.25)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_18px_40px_-20px_hsl(var(--primary)/0.25)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={b.gambar}
                  alt={b.judul}
                  fill
                  className="object-cover grayscale-[.25] transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70" />

                <span className="absolute left-3 top-3 rounded-md border border-white/20 bg-background/85 px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur-md">
                  {b.kategori}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatTanggal(b.tanggal_berita)}
                </span>

                <h4 className="mt-2.5 line-clamp-2 font-display text-base font-semibold leading-snug tracking-tight text-foreground">
                  {b.judul}
                </h4>

                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                  {getRingkasan(b.isi_berita)}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                  Selengkapnya
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/berita"
            className="group inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20"
          >
            Lihat Semua Berita
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
