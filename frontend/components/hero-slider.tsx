"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useWebSliderHookAll } from "@/feature/web";

function CredibilityBadge() {
  return (
    <div className="pointer-events-none absolute bottom-8 right-8 z-30 sm:right-14 lg:right-20">
      <div className="relative h-24 w-24 sm:h-28 sm:w-28">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full animate-spin [animation-duration:9s]"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2.5"
            strokeDasharray="0.5 8"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-[var(--ink-950)] ring-1 ring-white/15 shadow-2xl">
          <ShieldCheck className="h-6 w-6 text-accent" />

          <span className="mt-1.5 text-[9px] font-bold leading-none tracking-wider text-white">
            RESMI
          </span>

          <span className="text-[9px] font-bold leading-none tracking-wider text-accent">
            · SAH
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroSlider() {
  const { data, isLoading, isError } = useWebSliderHookAll();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [active, setActive] = useState(0);

  const sliders = ((data as any)?.data ?? []).filter(
    (slider: any) => slider.status === true,
  );

  useEffect(() => {
    if (sliders.length === 0) {
      setActive(0);
      return;
    }

    if (active >= sliders.length) {
      setActive(0);
    }
  }, [sliders.length, active]);

  const goTo = useCallback(
    (index: number) => {
      if (sliders.length === 0) {
        return;
      }

      setActive((index + sliders.length) % sliders.length);
    },
    [sliders.length],
  );

  // ============================================================
  // AUTO SLIDER
  // ============================================================

  useEffect(() => {
    if (sliders.length <= 1) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setActive((current) => (current + 1) % sliders.length);
    }, 6000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sliders.length]);

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <section className="relative bg-[var(--ink-950)]">
        <div className="relative h-[560px] overflow-hidden sm:h-[640px] lg:h-[700px]">
          <div className="absolute inset-0 animate-pulse bg-[var(--ink-900)]" />

          <div className="relative z-10 flex h-full items-end pb-20 sm:pb-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <div className="max-w-xl">
                <div className="h-7 w-40 rounded bg-white/10" />

                <div className="mt-6 h-20 w-full max-w-xl rounded bg-white/10" />

                <div className="mt-5 h-16 w-full max-w-lg rounded bg-white/10" />

                <div className="mt-8 h-12 w-52 rounded-lg bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ============================================================
  // ERROR / DATA KOSONG
  // ============================================================

  if (isError || sliders.length === 0) {
    return (
      <section className="relative bg-[var(--ink-950)]">
        <div className="relative flex h-[560px] items-center justify-center overflow-hidden sm:h-[640px] lg:h-[700px]">
          <div className="px-6 text-center text-white">
            <ShieldCheck className="mx-auto h-10 w-10 text-accent" />

            <h1 className="mt-4 text-2xl font-bold">Portal Resmi JDIH</h1>

            <p className="mt-2 text-sm text-white/70">
              Belum ada slider yang tersedia.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section className="relative bg-[var(--ink-950)]">
      <div className="relative h-[560px] overflow-hidden sm:h-[640px] lg:h-[700px]">
        {/* ======================================================
            SLIDES
        ====================================================== */}

        {sliders.map((slider: any, index: number) => {
          const imageUrl = slider.gambar;

          return (
            <div
              key={slider.slider_id}
              className="absolute inset-0 transition-opacity duration-1000 ease-out"
              style={{
                opacity: index === active ? 1 : 0,
              }}
              aria-hidden={index !== active}
            >
              <Image
                src={imageUrl}
                alt={slider.judul || "Slider JDIH"}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover contrast-[1.05] saturate-[1.05] brightness-[.92]"
              />

              {/* Overlay kiri */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink-950)]/75 via-[var(--ink-950)]/25 to-transparent" />

              {/* Overlay bawah */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--ink-950)]/60 to-transparent" />
            </div>
          );
        })}

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="relative z-10 flex h-full items-end pb-20 sm:pb-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-xl text-primary-foreground">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent ring-1 ring-white/20 backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                Portal Resmi JDIH
              </span>

              {/* ==================================================
                  JUDUL DARI API
              ================================================== */}

              <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-[1.1] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-5xl">
                {sliders[active]?.judul}
              </h1>

              {/* ==================================================
                  KETERANGAN DARI API
              ================================================== */}

              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-primary-foreground/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
                {sliders[active]?.keterangan}
              </p>

              {/* ==================================================
                  BUTTON
              ================================================== */}

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/dokumen-hukum"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                >
                  Jelajahi Produk Hukum
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/berita"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Baca Berita Terbaru
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            PREVIOUS
        ====================================================== */}

        {sliders.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Sebelumnya"
              className="absolute left-5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-black/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Berikutnya"
              className="absolute right-5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-black/50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2.5">
              {sliders.map((slider: any, index: number) => (
                <button
                  key={slider.slider_id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Slide ${index + 1}`}
                  className="h-[3px] rounded-full bg-white/30 transition-all"
                  style={{
                    width: index === active ? 40 : 26,
                    background: index === active ? "var(--accent)" : undefined,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* ======================================================
            CREDIBILITY BADGE
        ====================================================== */}

        <CredibilityBadge />
      </div>
    </section>
  );
}
