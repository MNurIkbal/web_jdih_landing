"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Muncul saat user scroll ke bawah lebih dari 250px
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#0d3b73] to-[#124580] text-amber-400 shadow-xl shadow-blue-900/30 ring-2 ring-white/80 transition-all duration-300 hover:scale-110 hover:from-[#124580] hover:to-[#0d3b73] hover:text-white active:scale-95 animate-in fade-in slide-in-from-bottom-4"
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}

