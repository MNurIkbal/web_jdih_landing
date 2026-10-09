"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollText, Scale, FileText, Landmark } from "lucide-react";
import { useWebSumaryHookAll } from "@/feature/web";

const STATS = [
  {
    icon: ScrollText,
    key: "produk_hukum",
    label: "Produk Hukum",
  },
  {
    icon: Scale,
    key: "peraturan",
    label: "Peraturan",
  },
  {
    icon: FileText,
    key: "perundang_undangan",
    label: "Perundang-Undangan",
  },
  {
    icon: Landmark,
    key: "keputusan",
    label: "Keputusan",
  },
] as const;

function Counter({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el || target <= 0) {
      setValue(0);
      return;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setValue(0);

    let started = false;

    const startAnimation = () => {
      if (started) return;

      started = true;

      const duration = 1400;
      const startTime = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);

        setValue(Math.floor(eased * target));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step);
        } else {
          setValue(target);
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          io.disconnect();
        }
      },
      {
        threshold: 0.4,
      },
    );

    io.observe(el);

    return () => {
      io.disconnect();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [target]);

  return (
    <span ref={ref} className="font-display tabular-nums">
      {value.toLocaleString("id-ID")}
    </span>
  );
}

export function StatsSummary() {
  const { data } = useWebSumaryHookAll();
  
  const summary = (data as any)?.data ?? {};

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.10) 0%, transparent 70%)",
        }}
      />

      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--accent) / 0.10) 0%, transparent 70%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <svg
        className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-[0.08]"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="stats-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="45%" stopColor="currentColor" stopOpacity="0.7" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M-100 650 L360 100"
          fill="none"
          stroke="url(#stats-line)"
          strokeWidth="1"
        />

        <path
          d="M-50 760 L450 160"
          fill="none"
          stroke="url(#stats-line)"
          strokeWidth="1"
        />

        <path
          d="M1540 150 L1080 700"
          fill="none"
          stroke="url(#stats-line)"
          strokeWidth="1"
        />

        <path
          d="M1490 50 L990 650"
          fill="none"
          stroke="url(#stats-line)"
          strokeWidth="1"
        />

        <path
          d="M0 180 C350 130 500 230 720 180 C940 130 1100 220 1440 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 8"
        />

        <path
          d="M0 650 C300 590 480 690 720 630 C960 570 1150 670 1440 600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 10"
        />

        <circle cx="180" cy="210" r="3" fill="currentColor" />

        <circle cx="1260" cy="570" r="3" fill="currentColor" />

        <circle cx="1080" cy="170" r="2" fill="currentColor" />

        <circle cx="350" cy="650" r="2" fill="currentColor" />
      </svg>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
            <span className="h-px w-6 bg-primary/50" />
            Ringkasan Basis Data
            <span className="h-px w-6 bg-primary/50" />
          </span>

          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Cakupan Produk Hukum Dalam Angka
          </h2>

          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Diperbarui berkala mengikuti penetapan dan pengundangan resmi oleh
            instansi berwenang.
          </p>
        </div>

        <div className="grid grid-cols-2 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card shadow-card sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="group relative flex flex-col items-center gap-3 overflow-hidden px-6 py-10 text-center"
            >
              <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100" />

              <span className="absolute inset-0 bg-primary/[.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span
                className="relative flex h-12 w-12 animate-[float_4s_ease-in-out_infinite] items-center justify-center rounded-full bg-primary/8 text-primary ring-1 ring-primary/15 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
                style={{
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                <s.icon className="h-5 w-5" />
              </span>

              <div className="relative text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                <Counter target={Number(summary[s.key] ?? 0)} />
              </div>

              <div className="relative text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </section>
  );
}
