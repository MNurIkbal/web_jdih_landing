"use client";

import { useEffect, useMemo, useState } from "react";
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

const STORAGE_KEY = "jdih_survey_layanan_done";

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

  const { data: pertanyaan } = usePublicSurveyPertanyaan();
  const submitMutation = useSubmitPublicSurvey();

  const list = useMemo(() => (Array.isArray(pertanyaan) ? pertanyaan : []), [pertanyaan]);

  // Tampilkan sekali saja untuk pengunjung yang belum pernah mengakses / mengisi
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (list.length === 0) return;

    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [list.length]);

  const markDone = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  };

  const handleClose = () => {
    markDone(); // ditutup pun dianggap sudah pernah muncul (hanya sekali)
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
      await submitMutation.mutateAsync(payload);
      markDone();
      setDone(true);
      setTimeout(() => setOpen(false), 2200);
    } catch {
      // error toast ditangani hook
    }
  };

  if (!open || !current) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.3)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0D3B73] via-[#1358A8] to-[#1d6fd1] px-6 pb-6 pt-5 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup survey"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:rotate-90 hover:bg-white/20 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <ClipboardCheck size={22} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                JDIH BIN
              </p>
              <h2 className="text-lg font-bold leading-tight">Survey Kepuasan Layanan</h2>
            </div>
          </div>

          {!done && (
            <div className="relative mt-5">
              <div className="mb-1.5 flex justify-between text-[11px] font-medium text-white/80">
                <span>Pertanyaan {step + 1} dari {list.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-amber-300 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {done ? (
          <div className="px-6 py-12 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-8 ring-emerald-50/50">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">Terima Kasih!</h3>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-slate-500">
              Penilaian Anda sangat berarti untuk peningkatan layanan JDIH BIN.
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 pt-6">
              <p key={current.survey_pertanyaan_id} className="text-[15px] font-semibold leading-relaxed text-slate-800 animate-in fade-in slide-in-from-right-2 duration-300">
                {current.pertanyaan}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-2.5">
                {OPSI.map((opt) => {
                  const Icon = opt.icon;
                  const selected = currentAnswer === opt.label;
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
                      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                        selected ? opt.active : `border-slate-200 text-slate-700 ${opt.idle}`
                      }`}
                    >
                      <Icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                      <span className="flex-1">{opt.label}</span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                          selected ? "border-current" : "border-slate-300"
                        }`}
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-current" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                onClick={() => (step === 0 ? handleClose() : setStep((s) => s - 1))}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                {step === 0 ? "Nanti Saja" : (<><ChevronLeft size={16} /> Kembali</>)}
              </button>

              {isLast ? (
                <button
                  type="button"
                  disabled={!currentAnswer || submitMutation.isPending}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1358A8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-[#0D3B73] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {submitMutation.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
                  ) : (
                    "Kirim Penilaian"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!currentAnswer}
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#1358A8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-[#0D3B73] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Lanjut <ChevronRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
