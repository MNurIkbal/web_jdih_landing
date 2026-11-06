"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { useWebSliderHookAll } from "@/feature/web";

export function HeroSlider() {
  const { data, isLoading } = useWebSliderHookAll();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [active, setActive] = useState(0);

  const rawSliders = ((data as any)?.data ?? []).filter(
    (slider: any) => slider.status === true,
  );

  // Fallback slider resmi jika database kosong
  const fallbackSliders = [
    {
      slider_id: 1,
      judul: "Portal Resmi Jaringan Dokumentasi dan Informasi Hukum Badan Intelijen Negara",
      keterangan:
        "Menyediakan akses lengkap, akurat, dan terpercaya terhadap seluruh produk hukum dan regulasi resmi intelijen demi transparansi dan kepastian hukum nasional.",
      gambar: "/images/hero.png",
      tag: "Pengumuman Resmi",
    },
    {
      slider_id: 2,
      judul: "Layanan Konsultasi & Pencarian Cerdas Regulasi Intelijen Berbasis AI",
      keterangan:
        "Memudahkan aparatur negara dan masyarakat dalam menelusuri naskah peraturan perundang-undangan dan instrumen hukum BIN secara cepat dan interaktif.",
      gambar: "/images/pojok-hukum.png",
      tag: "Inovasi Layanan",
    },
  ];

  const sliders = rawSliders.length > 0 ? rawSliders : fallbackSliders;

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
      if (sliders.length === 0) return;
      setActive((index + sliders.length) % sliders.length);
    },
    [sliders.length],
  );

  // Slideshow otomatis
  useEffect(() => {
    if (sliders.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActive((current) => (current + 1) % sliders.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sliders.length, active]);

  if (isLoading) {
    return (
      <section className="relative overflow-hidden w-full">
        <div className="relative h-[650px] sm:h-[750px] lg:h-[820px] xl:h-[860px] animate-pulse bg-slate-900" />
      </section>
    );
  }

  const currentSlider = sliders[active] || sliders[0];

  return (
    <section className="group/slider relative overflow-hidden w-full select-none">
      {/* Container Slider Gambar */}
      <div className="relative h-[650px] sm:h-[750px] lg:h-[820px] xl:h-[860px] w-full">
        {/* ================= GAMBAR SLIDER ================= */}
        {sliders.map((slider: any, index: number) => {
          const isCurrent = index === active;
          const imageUrl = slider.gambar || "/images/hero.png";

          return (
            <div
              key={slider.slider_id ?? index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isCurrent}
            >
              <Image
                src={imageUrl}
                alt={slider.judul || "Slider Pengumuman"}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover w-full h-full"
              />

              {/* Overlay hitam halus (tidak terlalu gelap) agar tulisan jelas terbaca di atas gambar */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10 sm:from-black/70 sm:via-black/35 sm:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>
          );
        })}

        {/* ================= JUDUL & KETERANGAN PENGUMUMAN LANGSUNG DI SLIDER ================= */}
        <div className="relative z-20 flex h-full items-center pb-20 pt-16 sm:pb-24 sm:pt-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl lg:max-w-3xl">
              {/* Badge Tag Pengumuman */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-black/40 px-3.5 py-1.5 shadow-md backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <Megaphone className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {currentSlider?.tag || "Warta & Pengumuman Resmi"}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-[11px] font-medium text-slate-200">
                  JDIH Badan Intelijen Negara
                </span>
              </div>

              {/* Judul Pengumuman (Teks Putih Terbaca Jelas & Tajam) */}
              <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.18] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-4xl lg:text-5xl xl:text-6xl">
                {currentSlider?.judul}
              </h1>

              {/* Garis Aksen Emas & Biru */}
              <div className="mt-5 flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 shadow-sm" />
                <div className="h-1.5 w-8 rounded-full bg-blue-500" />
                <div className="h-1.5 w-2 rounded-full bg-blue-400" />
              </div>

              {/* Keterangan Pengumuman */}
              <p className="mt-5 max-w-2xl text-base font-normal leading-relaxed text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-lg sm:leading-relaxed">
                {currentSlider?.keterangan}
              </p>
            </div>
          </div>
        </div>

        {/* ================= TOMBOL NAVIGASI DI KANAN DAN KIRI ================= */}
        {sliders.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 z-30 flex -translate-y-1/2 justify-between pointer-events-none sm:inset-x-8 lg:inset-x-12">
            {/* Tombol Kiri */}
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Sebelumnya"
              className="pointer-events-auto group/btn flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/40 p-3 text-white backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-slate-950 active:scale-95"
            >
              <ChevronLeft className="h-6 w-6 transition-transform group-hover/btn:-translate-x-0.5" />
            </button>

            {/* Tombol Kanan */}
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Berikutnya"
              className="pointer-events-auto group/btn flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/40 p-3 text-white backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-slate-950 active:scale-95"
            >
              <ChevronRight className="h-6 w-6 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
