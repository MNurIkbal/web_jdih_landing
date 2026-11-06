"use client";

import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Sun,
  Contrast,
  Link2,
  Type,
  MoveHorizontal,
  Pause,
  ImageOff,
  MousePointer,
  HelpCircle,
  Layers,
  AlignJustify,
  AlignLeft,
  Droplet,
  RotateCcw,
  X,
  Settings2,
  Check,
  ChevronDown,
  Eye,
  Brain,
  Zap,
  Target,
  Accessibility,
} from "lucide-react";

export type AccessibilityProfile =
  | "none"
  | "gangguan_motorik"
  | "netra_total"
  | "buta_warna"
  | "disleksia"
  | "penglihatan_rendah"
  | "kognitif"
  | "epilepsi"
  | "adhd";

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [widgetSizeLg, setWidgetSizeLg] = useState(false);
  const [position, setPosition] = useState<"right" | "left">("left");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(true);
  const [activeProfile, setActiveProfile] = useState<AccessibilityProfile>("netra_total");

  // States fitur aksesibilitas
  const [isReading, setIsReading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState<"normal" | "slow" | "fast">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [smartContrast, setSmartContrast] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [textScale, setTextScale] = useState<number>(0); // 0, 1, 2, 3
  const [letterSpacing, setLetterSpacing] = useState<number>(0); // 0, 1, 2
  const [pauseAnimations, setPauseAnimations] = useState(false);
  const [hideImages, setHideImages] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [bigCursor, setBigCursor] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);
  const [pageStructure, setPageStructure] = useState(false);
  const [lineHeightLevel, setLineHeightLevel] = useState<number>(0); // 0, 1, 2
  const [textAlignMode, setTextAlignMode] = useState<"normal" | "left" | "justify">("normal");
  const [saturationMode, setSaturationMode] = useState<"normal" | "high" | "mono">("normal");

  // Terapkan preset profil jika profil dipilih
  const applyProfile = (profile: AccessibilityProfile) => {
    if (activeProfile === profile) {
      setActiveProfile("none");
      handleResetAll();
      return;
    }

    setActiveProfile(profile);

    // Konfigurasi profil otomatis
    if (profile === "netra_total") {
      setIsReading(true);
      setShowTooltips(true);
      setPageStructure(true);
      startSpeechSynthesis();
    } else if (profile === "gangguan_motorik") {
      setBigCursor(true);
      setHighlightLinks(true);
      setShowTooltips(true);
    } else if (profile === "buta_warna") {
      setHighContrast(true);
      setSmartContrast(false);
      setSaturationMode("high");
    } else if (profile === "disleksia") {
      setDyslexicFont(true);
      setLetterSpacing(1);
      setLineHeightLevel(1);
    } else if (profile === "penglihatan_rendah") {
      setTextScale(2);
      setHighContrast(true);
      setBigCursor(true);
    } else if (profile === "kognitif") {
      setPauseAnimations(true);
      setHighlightLinks(true);
      setShowTooltips(true);
    } else if (profile === "epilepsi") {
      setPauseAnimations(true);
      setSaturationMode("mono");
      setHideImages(true);
    } else if (profile === "adhd") {
      setPauseAnimations(true);
      setHighlightLinks(true);
      setLineHeightLevel(1);
    }
  };

  // Keyboard shortcut: CTRL + U
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Text-to-Speech (Baca Normal)
  const startSpeechSynthesis = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const textToRead = document.body.innerText.slice(0, 3000);
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "id-ID";
    if (readingSpeed === "slow") utterance.rate = 0.8;
    else if (readingSpeed === "fast") utterance.rate = 1.3;
    else utterance.rate = 1.0;

    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  const toggleSpeech = () => {
    if (isReading) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsReading(false);
    } else {
      startSpeechSynthesis();
    }
  };

  // Reset semua pengaturan
  const handleResetAll = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveProfile("none");
    setIsReading(false);
    setHighContrast(false);
    setSmartContrast(false);
    setHighlightLinks(false);
    setTextScale(0);
    setLetterSpacing(0);
    setPauseAnimations(false);
    setHideImages(false);
    setDyslexicFont(false);
    setBigCursor(false);
    setShowTooltips(false);
    setPageStructure(false);
    setLineHeightLevel(0);
    setTextAlignMode("normal");
    setSaturationMode("normal");
  };

  // Terapkan perubahan ke DOM root
  useEffect(() => {
    const root = document.documentElement;

    if (smartContrast) root.classList.add("a11y-smart-contrast");
    else root.classList.remove("a11y-smart-contrast");

    if (highContrast) root.classList.add("a11y-high-contrast");
    else root.classList.remove("a11y-high-contrast");

    if (highlightLinks) root.classList.add("a11y-highlight-links");
    else root.classList.remove("a11y-highlight-links");

    root.classList.remove("a11y-text-1", "a11y-text-2", "a11y-text-3");
    if (textScale === 1) root.classList.add("a11y-text-1");
    if (textScale === 2) root.classList.add("a11y-text-2");
    if (textScale === 3) root.classList.add("a11y-text-3");

    root.classList.remove("a11y-space-1", "a11y-space-2");
    if (letterSpacing === 1) root.classList.add("a11y-space-1");
    if (letterSpacing === 2) root.classList.add("a11y-space-2");

    if (pauseAnimations) root.classList.add("a11y-pause-animations");
    else root.classList.remove("a11y-pause-animations");

    if (hideImages) root.classList.add("a11y-hide-images");
    else root.classList.remove("a11y-hide-images");

    if (dyslexicFont) root.classList.add("a11y-dyslexic-font");
    else root.classList.remove("a11y-dyslexic-font");

    if (bigCursor) root.classList.add("a11y-big-cursor");
    else root.classList.remove("a11y-big-cursor");

    if (showTooltips) root.classList.add("a11y-show-tooltips");
    else root.classList.remove("a11y-show-tooltips");

    if (pageStructure) root.classList.add("a11y-page-structure");
    else root.classList.remove("a11y-page-structure");

    root.classList.remove("a11y-line-1", "a11y-line-2");
    if (lineHeightLevel === 1) root.classList.add("a11y-line-1");
    if (lineHeightLevel === 2) root.classList.add("a11y-line-2");

    root.classList.remove("a11y-align-left", "a11y-align-justify");
    if (textAlignMode === "left") root.classList.add("a11y-align-left");
    if (textAlignMode === "justify") root.classList.add("a11y-align-justify");

    root.classList.remove("a11y-sat-high", "a11y-sat-mono");
    if (saturationMode === "high") root.classList.add("a11y-sat-high");
    if (saturationMode === "mono") root.classList.add("a11y-sat-mono");
  }, [
    smartContrast,
    highContrast,
    highlightLinks,
    textScale,
    letterSpacing,
    pauseAnimations,
    hideImages,
    dyslexicFont,
    bigCursor,
    showTooltips,
    pageStructure,
    lineHeightLevel,
    textAlignMode,
    saturationMode,
  ]);

  // Label nama profil yang sedang aktif
  const getProfileTitle = () => {
    switch (activeProfile) {
      case "netra_total":
        return "Netra Total profil aktif";
      case "gangguan_motorik":
        return "Gangguan Motorik aktif";
      case "buta_warna":
        return "Buta warna aktif";
      case "disleksia":
        return "Disleksia aktif";
      case "penglihatan_rendah":
        return "Penglihatan rendah aktif";
      case "kognitif":
        return "Kognitif & Pembelajaran aktif";
      case "epilepsi":
        return "Kejang dan Epilepsi aktif";
      case "adhd":
        return "ADHD profil aktif";
      default:
        return "Profil Aksesibilitas";
    }
  };

  return (
    <>
      {/* Floating Trigger Button Aksesibilitas */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Buka Menu Aksesibilitas (CTRL+U)"
        title="Menu Aksesibilitas (CTRL+U)"
        className={`fixed z-50 bottom-6 ${
          position === "right" ? "right-6" : "left-6"
        } flex h-13 w-13 items-center justify-center rounded-full bg-[#0055ff] text-white shadow-xl shadow-blue-600/30 ring-4 ring-white transition hover:scale-110 hover:bg-[#0044cc] focus:outline-none`}
        style={{ width: "52px", height: "52px" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <circle cx="12" cy="4.5" r="2.5" />
          <path d="m18 10-6 1-6-1" />
          <path d="M12 11v6" />
          <path d="m9 20 3-3 3 3" />
        </svg>
      </button>

      {/* Slide-in Drawer Menu Aksesibilitas */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`fixed inset-y-0 ${
              position === "right" ? "right-0" : "left-0"
            } flex max-w-full`}
          >
            <div
              className={`w-screen ${
                widgetSizeLg ? "max-w-md" : "max-w-[415px]"
              } transform bg-[#f4f7fc] shadow-2xl transition-all duration-300 flex flex-col font-sans`}
            >
              {/* Header Biru Pekat (Sesuai Gambar) */}
              <div className="flex items-center justify-between bg-[#0055ff] px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight">
                    Menu Aksesibilitas (CTRL+U)
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-white hover:bg-white/20 transition"
                  aria-label="Tutup menu aksesibilitas"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Sub-Header: Profil Aksesibilitas Dropdown & Grid Pilihan Profil */}
              <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div
                  onClick={() => setProfileDropdownOpen((v) => !v)}
                  className="flex items-center justify-between cursor-pointer select-none py-1"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-4 w-4"
                      >
                        <circle cx="12" cy="4.5" r="2.5" />
                        <path d="m18 10-6 1-6-1" />
                        <path d="M12 11v6" />
                        <path d="m9 20 3-3 3 3" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {getProfileTitle()}
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${
                          profileDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">i</span>
                </div>

                {/* Grid 8 Profil Aksesibilitas (2 Kolom sesuai gambar) */}
                {profileDropdownOpen && (
                  <div className="mt-3 grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                    {/* 1. Gangguan Motorik */}
                    <ProfileCard
                      icon={<Accessibility size={18} />}
                      label="Gangguan Motorik"
                      active={activeProfile === "gangguan_motorik"}
                      onClick={() => applyProfile("gangguan_motorik")}
                    />

                    {/* 2. Netra Total */}
                    <ProfileCard
                      icon={<Volume2 size={18} />}
                      label="Netra Total"
                      active={activeProfile === "netra_total"}
                      onClick={() => applyProfile("netra_total")}
                    />

                    {/* 3. Buta warna */}
                    <ProfileCard
                      icon={<Droplet size={18} />}
                      label="Buta warna"
                      active={activeProfile === "buta_warna"}
                      onClick={() => applyProfile("buta_warna")}
                    />

                    {/* 4. Disleksia */}
                    <ProfileCard
                      icon={<span className="text-xs font-bold">Df</span>}
                      label="Disleksia"
                      active={activeProfile === "disleksia"}
                      onClick={() => applyProfile("disleksia")}
                    />

                    {/* 5. Penglihatan rendah */}
                    <ProfileCard
                      icon={<Eye size={18} />}
                      label="Penglihatan rendah"
                      active={activeProfile === "penglihatan_rendah"}
                      onClick={() => applyProfile("penglihatan_rendah")}
                    />

                    {/* 6. Kognitif & Pembelajaran */}
                    <ProfileCard
                      icon={<Brain size={18} />}
                      label="Kognitif & Pembelajaran"
                      active={activeProfile === "kognitif"}
                      onClick={() => applyProfile("kognitif")}
                    />

                    {/* 7. Kejang dan Epilepsi */}
                    <ProfileCard
                      icon={<Zap size={18} />}
                      label="Kejang dan Epilepsi"
                      active={activeProfile === "epilepsi"}
                      onClick={() => applyProfile("epilepsi")}
                    />

                    {/* 8. ADHD */}
                    <ProfileCard
                      icon={<Target size={18} />}
                      label="ADHD"
                      active={activeProfile === "adhd"}
                      onClick={() => applyProfile("adhd")}
                    />
                  </div>
                )}

                {/* XL Widget kebesaran Switch */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">XL</span>
                    <span className="text-xs font-semibold text-slate-700">
                      Widget kebesaran
                    </span>
                  </div>
                  <button
                    onClick={() => setWidgetSizeLg((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      widgetSizeLg ? "bg-[#0055ff]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        widgetSizeLg ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Grid 15 Tombol Aksesibilitas Mandiri (Sesuai Gambar 3 Kolom) */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-3 gap-2.5">
                  {/* 1. Baca Normal */}
                  <AccessibilityCard
                    icon={isReading ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    label={isReading ? "Berhenti" : "Baca Normal"}
                    active={isReading}
                    onClick={toggleSpeech}
                    info="i"
                    hasIndicatorBar
                  />

                  {/* 2. Kontras + */}
                  <AccessibilityCard
                    icon={<Sun size={24} />}
                    label="Kontras +"
                    active={highContrast}
                    onClick={() => {
                      setHighContrast((prev) => !prev);
                      if (!highContrast) setSmartContrast(false);
                    }}
                  />

                  {/* 3. Kontras Cerdas */}
                  <AccessibilityCard
                    icon={<Contrast size={24} />}
                    label="Kontras Cerdas"
                    active={smartContrast}
                    onClick={() => {
                      setSmartContrast((prev) => !prev);
                      if (!smartContrast) setHighContrast(false);
                    }}
                  />

                  <AccessibilityCard
                    icon={<Link2 size={24} />}
                    label="Sorot tautan"
                    active={highlightLinks}
                    onClick={() => setHighlightLinks((prev) => !prev)}
                  />

                  <AccessibilityCard
                    icon={<Type size={24} />}
                    label={`Teks Lebih Besar${textScale > 0 ? ` (+${textScale})` : ""}`}
                    active={textScale > 0}
                    onClick={() => setTextScale((prev) => (prev >= 3 ? 0 : prev + 1))}
                  />

                  <AccessibilityCard
                    icon={<MoveHorizontal size={24} />}
                    label={`Spasi teks${letterSpacing > 0 ? ` (+${letterSpacing})` : ""}`}
                    active={letterSpacing > 0}
                    onClick={() => setLetterSpacing((prev) => (prev >= 2 ? 0 : prev + 1))}
                  />

                  {/* 7. Animasi Dijeda */}
                  <AccessibilityCard
                    icon={<Pause size={24} />}
                    label="Animasi dijeda"
                    active={pauseAnimations}
                    onClick={() => setPauseAnimations((prev) => !prev)}
                  />

                  {/* 8. Sembunyikan Gambar */}
                  <AccessibilityCard
                    icon={<ImageOff size={24} />}
                    label="Sembunyikan Gambar"
                    active={hideImages}
                    onClick={() => setHideImages((prev) => !prev)}
                  />

                  {/* 9. Ramah Disleksia */}
                  <AccessibilityCard
                    icon={<span className="text-xl font-bold">Df</span>}
                    label="Ramah Disleksia"
                    active={dyslexicFont}
                    onClick={() => setDyslexicFont((prev) => !prev)}
                    info="i"
                  />

                  {/* 10. Kursor */}
                  <AccessibilityCard
                    icon={<MousePointer size={24} />}
                    label="Kursor Besar"
                    active={bigCursor}
                    onClick={() => setBigCursor((prev) => !prev)}
                  />

                  {/* 11. Keterangan Alat */}
                  <AccessibilityCard
                    icon={<HelpCircle size={24} />}
                    label="Keterangan alat"
                    active={showTooltips}
                    onClick={() => setShowTooltips((prev) => !prev)}
                  />

                  {/* 12. Struktur Halaman */}
                  <AccessibilityCard
                    icon={<Layers size={24} />}
                    label="Struktur halaman"
                    active={pageStructure}
                    onClick={() => setPageStructure((prev) => !prev)}
                  />

                  {/* 13. Tinggi Garis */}
                  <AccessibilityCard
                    icon={<AlignJustify size={24} />}
                    label={`Tinggi garis${lineHeightLevel > 0 ? ` (+${lineHeightLevel})` : ""}`}
                    active={lineHeightLevel > 0}
                    onClick={() => setLineHeightLevel((prev) => (prev >= 2 ? 0 : prev + 1))}
                  />

                  {/* 14. Perataan Teks */}
                  <AccessibilityCard
                    icon={<AlignLeft size={24} />}
                    label={`Perataan Teks${textAlignMode !== "normal" ? ` (${textAlignMode})` : ""}`}
                    active={textAlignMode !== "normal"}
                    onClick={() => {
                      if (textAlignMode === "normal") setTextAlignMode("left");
                      else if (textAlignMode === "left") setTextAlignMode("justify");
                      else setTextAlignMode("normal");
                    }}
                  />

                  {/* 15. Kejenuhan */}
                  <AccessibilityCard
                    icon={<Droplet size={24} />}
                    label={`Kejenuhan${saturationMode !== "normal" ? ` (${saturationMode})` : ""}`}
                    active={saturationMode !== "normal"}
                    onClick={() => {
                      if (saturationMode === "normal") setSaturationMode("high");
                      else if (saturationMode === "high") setSaturationMode("mono");
                      else setSaturationMode("normal");
                    }}
                  />
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="border-t border-slate-200 p-4 space-y-2 bg-white">
                <button
                  onClick={handleResetAll}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0055ff] py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#0044cc]"
                >
                  <RotateCcw size={15} />
                  Atur Ulang Semua Pengaturan Aksesibilitas
                </button>

                <button
                  onClick={() =>
                    setPosition((prev) => (prev === "right" ? "left" : "right"))
                  }
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 size={16} className="text-[#0055ff]" />
                    <span>Pindahkan Tombol Aksesibilitas ({position === "right" ? "Kanan" : "Kiri"})</span>
                  </div>
                  <span className="text-slate-400">›</span>
                </button>
              </div>

              {/* Footer Tagline USERWAY Style */}
              <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3 flex items-center justify-between text-[11px] text-slate-500">
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  Mengelola
                </span>
                <span className="font-extrabold tracking-wider text-slate-800 flex items-center gap-1">
                  <span className="text-[#0055ff]">U</span> USERWAY
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Komponen Tombol Profil Aksesibilitas (Atas)
function ProfileCard({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
        active
          ? "border-[#0055ff] bg-[#0055ff] text-white shadow-sm ring-1 ring-[#0055ff]"
          : "border-slate-200/90 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-bold leading-tight line-clamp-2">
        {label}
      </span>
      {active && (
        <span className="absolute right-2 top-2 text-white">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// Komponen Card Tombol Aksesibilitas
function AccessibilityCard({
  icon,
  label,
  active,
  onClick,
  info,
  hasIndicatorBar,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  info?: string;
  hasIndicatorBar?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
        active
          ? "border-[#0055ff] bg-white text-[#0055ff] shadow-sm ring-2 ring-[#0055ff]"
          : "border-slate-200/90 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70"
      }`}
      style={{ minHeight: "105px" }}
    >
      {info && (
        <span className="absolute left-2.5 top-2 text-[10px] text-slate-400">
          {info}
        </span>
      )}
      {active && (
        <span className="absolute right-2.5 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#0055ff] text-white">
          <Check size={10} strokeWidth={3} />
        </span>
      )}
      <div className="mb-2 flex h-7 w-7 items-center justify-center">
        {icon}
      </div>
      <span className="text-[11.5px] font-bold leading-tight line-clamp-2">
        {label}
      </span>

      {hasIndicatorBar && (
        <div className="mt-2 flex w-12 items-center gap-1">
          <span className={`h-1 flex-1 rounded-full ${active ? "bg-[#0055ff]" : "bg-slate-200"}`} />
          <span className="h-1 flex-1 rounded-full bg-slate-200" />
          <span className="h-1 flex-1 rounded-full bg-slate-200" />
        </div>
      )}
    </button>
  );
}
