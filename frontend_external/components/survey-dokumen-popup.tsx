"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  X,
  FileCheck2,
  Smile,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Frown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  usePublicPertanyaan,
  useSubmitPublicSurvey,
} from "@/feature/survey/hooks/Survey.hooks";
import { SurveyJawabanSubmission } from "@/feature/survey/types/Survey.type";

const DOKUMEN_SURVEY_LAST_SHOWN = "jdih_survey_dokumen_last_shown";
const COOLDOWN_1_DAY_MS = 24 * 60 * 60 * 1000; // 1 kali 1 hari saja

type Jawaban = SurveyJawabanSubmission["jawaban"];

const OPSI: {
  label: Jawaban;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: string;
  idle: string;
}[] = [
  { label: "Sangat Baik", icon: Smile, active: "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20", idle: "hover:border-emerald-300 hover:bg-emerald-50/50" },
  { label: "Baik", icon: ThumbsUp, active: "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20", idle: "hover:border-blue-300 hover:bg-blue-50/50" },
  { label: "Cukup", icon: Meh, active: "border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20", idle: "hover:border-amber-300 hover:bg-amber-50/50" },
  { label: "Kurang", icon: ThumbsDown, active: "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20", idle: "hover:border-orange-300 hover:bg-orange-50/50" },
  { label: "Kurang Sekali", icon: Frown, active: "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20", idle: "hover:border-rose-300 hover:bg-rose-50/50" },
];

export function SurveyDokumenPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Jawaban>>({});
  const [done, setDone] = useState(false);
  const [targetDokumen, setTargetDokumen] = useState<{ id?: number; judul?: string } | null>(null);

  const pathname = usePathname();
  const { data: pertanyaan } = usePublicPertanyaan("dokumen");
  const submitMutation = useSubmitPublicSurvey();

  const list = useMemo(() => (Array.isArray(pertanyaan) ? pertanyaan : []), [pertanyaan]);

  const isAdminOrAuthPage = () => {
    if (!pathname) return false;
    return (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    );
  };

  const isCooldownActive = () => {
    if (typeof window === "undefined") return true;
    const lastShown = localStorage.getItem(DOKUMEN_SURVEY_LAST_SHOWN);
    if (!lastShown) return false;
    const lastTimestamp = new Date(lastShown).getTime();
    if (isNaN(lastTimestamp)) return false;
    return Date.now() - lastTimestamp < COOLDOWN_1_DAY_MS;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Dengarkan event kustom saat user mengklik tombol download dokumen hukum
    const handleDownloadEvent = (e: Event) => {
      if (isAdminOrAuthPage()) return;
      if (isCooldownActive()) return;
      if (list.length === 0) return;

      const detail = (e as CustomEvent)?.detail;
      setTargetDokumen(detail || null);

      // Munculkan popup ulasan dokumen hukum setelah delay singkat agar proses unduhan file berjalan terlebih dahulu
      setTimeout(() => {
        setOpen(true);
        localStorage.setItem(DOKUMEN_SURVEY_LAST_SHOWN, new Date().toISOString());
      }, 1000);
    };

    window.addEventListener("jdih_download_dokumen", handleDownloadEvent);
    return () => window.removeEventListener("jdih_download_dokumen", handleDownloadEvent);
  }, [list.length, pathname]);

  const markDone = () => {
    localStorage.setItem(DOKUMEN_SURVEY_LAST_SHOWN, new Date().toISOString());
  };

  const handleClose = () => {
    markDone();
    setOpen(false);
  };

  const current = list[step];
  const isLast = step === list.length - 1;
  const currentAnswer = current ? answers[current.survey_pertanyaan_id] : undefined;
  const progress = list.length > 0 ? ((step + 1) / list.length) * 100 : 0;

  const handleSubmit = async () => {
    const payload: SurveyJawabanSubmission[] = list
      .filter((q) => answers[q.survey_pertanyaan_id])
      .map((q) => ({
        survey_pertanyaan_id: q.survey_pertanyaan_id,
        jawaban: answers[q.survey_pertanyaan_id],
        dokumen_hukum_id: targetDokumen?.id || null,
      }));

    try {
      await submitMutation.mutateAsync({
        answers: payload,
        dokumen_hukum_id: targetDokumen?.id || null,
      });
      markDone();
      setDone(true);
      setTimeout(() => setOpen(false), 2200);
    } catch {
      // error toast ditangani hook
    }
  };

  if (!open || !current || isAdminOrAuthPage()) return null;

  return (
    <div
      data-survey-dokumen-popup
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.3)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-amber-200/50">
        {/* Header Emas-Navy untuk Dokumen Hukum */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1e1b4b] px-6 pb-6 pt-5 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-blue-500/15 blur-2xl" />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup survey dokumen"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/80 transition-all hover:bg-white/20 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30 shadow-inner">
              <FileCheck2 size={22} className="text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Ulasan Mutu Produk Hukum
              </span>
              <h2 className="text-lg font-bold leading-tight">Survey Dokumen Hukum Terbit</h2>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-300 leading-relaxed font-normal">
            {targetDokumen?.judul ? (
              <span>Dokumen: <strong className="text-white">&ldquo;{targetDokumen.judul}&rdquo;</strong></span>
            ) : (
              "Bantu kami meningkatkan kualitas keabsahan dan keterbacaan naskah dokumen hukum yang diunduh."
            )}
          </p>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
              <span>Pertanyaan {step + 1} dari {list.length}</span>
              <span>{Math.round(progress)}% Selesai</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {done ? (
            <div className="py-8 text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Terima Kasih atas Penilaian Dokumen Anda!
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Ulasan Anda terhadap mutu regulasi yang diunduh membantu BIN mempertahankan standar publikasi dokumen hukum nasional yang berkualitas tinggi.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <p key={current.survey_pertanyaan_id} className="text-[15px] font-semibold leading-relaxed text-slate-800 animate-in fade-in slide-in-from-right-2 duration-300">
                {current.pertanyaan}
              </p>

              {/* 5 Opsi Pilihan Emoji */}
              <div className="grid grid-cols-5 gap-2">
                {OPSI.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = currentAnswer === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [current.survey_pertanyaan_id]: opt.label,
                        }))
                      }
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? opt.active
                          : `border-slate-200 bg-white text-slate-600 ${opt.idle}`
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-[10px] font-semibold leading-tight text-center line-clamp-1">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  <span>Sebelumnya</span>
                </button>

                {isLast ? (
                  <button
                    type="button"
                    disabled={!currentAnswer || submitMutation.isPending}
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-700/20 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:shadow-none cursor-pointer transition active:scale-95"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Kirim Penilaian</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!currentAnswer}
                    onClick={() => setStep((s) => Math.min(list.length - 1, s + 1))}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 disabled:shadow-none cursor-pointer transition active:scale-95"
                  >
                    <span>Lanjut</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

