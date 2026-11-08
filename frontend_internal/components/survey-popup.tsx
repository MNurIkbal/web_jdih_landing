"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  ClipboardCheck,
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
  usePublicSurveyPertanyaan,
  useSubmitPublicSurvey,
} from "@/feature/survey/hooks/Survey.hooks";
import { SurveyJawabanSubmission } from "@/feature/survey/types/Survey.type";

const LAST_SHOWN_KEY = "jdih_survey_last_shown";
const PAGE_CHANGE_COUNT_KEY = "jdih_survey_page_change_count";
const HAS_SEEN_ONCE_KEY = "jdih_survey_has_seen_once";
const COOLDOWN_DAYS = 3;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

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

export function SurveyPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Jawaban>>({});
  const [done, setDone] = useState(false);
  const pathname = usePathname();
  const lastRecordedPath = useRef<string | null>(null);

  const { data: pertanyaan } = usePublicSurveyPertanyaan();
  const submitMutation = useSubmitPublicSurvey();

  const list = useMemo(() => (Array.isArray(pertanyaan) ? pertanyaan : []), [pertanyaan]);

  // Cek apakah halaman saat ini adalah portal admin atau autentikasi/login
  const isAdminOrAuthPage = () => {
    if (!pathname) return false;
    return (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    );
  };

  // Cek apakah user sedang dalam masa jeda (cooldown 3 hari)
  const isCooldownActive = () => {
    if (typeof window === "undefined") return true;
    const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
    if (!lastShown) return false;
    const lastTimestamp = new Date(lastShown).getTime();
    if (isNaN(lastTimestamp)) return false;
    return Date.now() - lastTimestamp < COOLDOWN_MS;
  };

  const recordPageChangeAndCheck = () => {
    if (typeof window === "undefined" || open || done) return;
    if (isAdminOrAuthPage()) return; // Survey hanya untuk landing page / publik
    if (isCooldownActive()) return;
    if (list.length === 0) return;

    // Periksa apakah ini pengunjung pertama kali atau pengunjung berulang setelah masa 3 hari
    const hasSeenOnce = localStorage.getItem(HAS_SEEN_ONCE_KEY) === "true";
    const requiredPageChanges = hasSeenOnce ? 5 : 3;

    let count = parseInt(localStorage.getItem(PAGE_CHANGE_COUNT_KEY) || "0", 10);
    if (isNaN(count)) count = 0;
    count += 1;
    localStorage.setItem(PAGE_CHANGE_COUNT_KEY, count.toString());

    if (count >= requiredPageChanges) {
      setOpen(true);
      localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
      localStorage.setItem(HAS_SEEN_ONCE_KEY, "true");
      localStorage.setItem(PAGE_CHANGE_COUNT_KEY, "0");
    }
  };

  // Deteksi interaksi pindah page (route change)
  useEffect(() => {
    if (isAdminOrAuthPage()) {
      if (open) setOpen(false);
      return;
    }

    if (pathname && lastRecordedPath.current !== pathname) {
      lastRecordedPath.current = pathname;
      recordPageChangeAndCheck();
    }
  }, [pathname, list.length, open, done]);

  const markDone = () => {
    localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
    localStorage.setItem(HAS_SEEN_ONCE_KEY, "true");
    localStorage.setItem(PAGE_CHANGE_COUNT_KEY, "0");
  };

  const handleClose = () => {
    markDone(); // ditutup tetap tercatat dan masuk cooldown 3 hari
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
      }));

    try {
      await submitMutation.mutateAsync({ answers: payload });
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
      data-survey-popup
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.3)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0D3B73] via-[#1358A8] to-[#1d6fd1] px-6 pb-6 pt-5 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup survey"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/80 transition-all hover:bg-white/20 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
              <ClipboardCheck size={22} className="text-amber-300" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Kuesioner Masyarakat
              </span>
              <h2 className="text-lg font-bold leading-tight">Survey Kepuasan Layanan</h2>
            </div>
          </div>

          <p className="mt-3 text-xs text-blue-100 leading-relaxed font-normal">
            Bantu kami meningkatkan kualitas keterbukaan dan layanan informasi hukum dengan memberikan ulasan objektif Anda.
          </p>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-blue-100 mb-1.5">
              <span>Pertanyaan {step + 1} dari {list.length}</span>
              <span>{Math.round(progress)}% Selesai</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-500 ease-out"
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
                Terima Kasih atas Penilaian Anda!
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Ulasan Anda sangat berharga bagi kami dalam mewujudkan pelayanan publik JDIH yang prima, akuntabel, dan transparan.
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
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:shadow-none cursor-pointer transition active:scale-95"
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D3B73] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-900/20 hover:bg-[#1358A8] disabled:opacity-50 disabled:shadow-none cursor-pointer transition active:scale-95"
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
