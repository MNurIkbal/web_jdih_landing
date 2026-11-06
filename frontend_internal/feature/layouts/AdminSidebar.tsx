"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ShieldCheck, Scale, FileText } from "lucide-react";
import Image from "next/image";
import { JDIH_MENU_ITEMS, HDH_MENU_ITEMS } from "./adminMenu";
import { useAdminLayout } from "./AdminLayoutContext";

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({
  open = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { menuMode, activeModule, setActiveModule, isSwitchingModule, switchingTarget } = useAdminLayout();

  // Jika mode "navbar" aktif, sidebar disembunyikan/ditiadakan
  if (menuMode === "navbar") {
    return null;
  }

  // Pilih daftar menu berdasarkan modul aktif (JDIH atau HDH)
  const currentMenuItems = activeModule === "HDH" ? HDH_MENU_ITEMS : JDIH_MENU_ITEMS;

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[275px] flex-col
          border-r border-slate-800/80
          text-white
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Background Image Keren dengan Overlay Gradasi Navy & Gold Gelap */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/images/hero.png"
            alt="Sidebar Background"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          {/* Multi-layered dark intelligence overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#091b33]/95 via-[#0b2548]/93 to-[#061426]/98" />
          <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] opacity-30 [background-size:16px_16px]" />
          <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        {/* Top Header Logo */}
        <div className="relative flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5 backdrop-blur-md">
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-amber-500/20 p-1.5 shadow-lg shadow-black/40 ring-1 ring-white/20 transition group-hover:scale-105">
              <Image src="/images/log.png" alt="logo" height={55} width={55} className="object-contain drop-shadow" />
            </div>

            <div>
              <div className="text-[17px] font-extrabold tracking-tight text-white flex items-center gap-1.5">
                {activeModule === "HDH" ? (
                  <>
                    HDH <span className="text-amber-400 font-black">BIN</span>
                  </>
                ) : (
                  <>
                    JDIH <span className="text-amber-400 font-black">BIN</span>
                  </>
                )}
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-slate-300/80">
                {activeModule === "HDH" ? "Harmonisasi Dokumen" : "Portal Legislasi"}
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODUL SWITCHER (HDH vs JDIH) DI ATAS MENU NAVIGATION */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative rounded-xl border border-white/15 bg-white/5 p-1 backdrop-blur-md overflow-hidden">
            {/* Background pill glider */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out shadow-md ${
                activeModule === "JDIH"
                  ? "left-1 bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-900/50 ring-1 ring-blue-400/50"
                  : "left-[calc(50%+2px)] bg-gradient-to-r from-amber-600 to-amber-700 shadow-amber-900/50 ring-1 ring-amber-400/50"
              }`}
            />

            <div className="relative z-10 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveModule("JDIH")}
                disabled={isSwitchingModule}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all duration-200 ${
                  activeModule === "JDIH"
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <FileText
                  size={14}
                  className={`transition-transform duration-300 ${
                    activeModule === "JDIH" ? "scale-110" : "opacity-70"
                  } ${isSwitchingModule && switchingTarget === "JDIH" ? "animate-bounce" : ""}`}
                />
                <span>Modul JDIH</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule("HDH")}
                disabled={isSwitchingModule}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all duration-200 ${
                  activeModule === "HDH"
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Scale
                  size={14}
                  className={`transition-transform duration-300 ${
                    activeModule === "HDH" ? "scale-110" : "opacity-70"
                  } ${isSwitchingModule && switchingTarget === "HDH" ? "animate-bounce" : ""}`}
                />
                <span>Modul HDH</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu List */}
        <nav
          className={`mt-2 flex-1 overflow-y-auto px-3.5 pb-6 custom-scrollbar transition-all duration-300 ${
            isSwitchingModule
              ? "opacity-30 translate-y-2 filter blur-[1px] pointer-events-none"
              : "opacity-100 translate-y-0 filter blur-0"
          }`}
        >
          <div className="mb-2 px-3 flex items-center justify-between transition-colors duration-300">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400/90 flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                  activeModule === "HDH" ? "bg-amber-400" : "bg-blue-400"
                }`}
              />
              Navigasi {activeModule}
            </span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ring-1 transition-all duration-300 ${
                activeModule === "HDH"
                  ? "bg-amber-500/20 text-amber-300 ring-amber-400/30"
                  : "bg-blue-500/20 text-blue-300 ring-blue-400/30"
              }`}
            >
              {activeModule === "HDH" ? "Harmonisasi" : "Regulasi"}
            </span>
          </div>

          <div className="space-y-1">
            {currentMenuItems.map((item, index) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    animationDelay: `${index * 40}ms`,
                  }}
                  className={`
                    group relative flex items-center
                    gap-3 rounded-xl px-3 py-2.5
                    text-[13.5px] font-medium
                    transition-all duration-200
                    ${
                      active
                        ? activeModule === "HDH"
                          ? "bg-gradient-to-r from-amber-600/90 to-amber-700/80 text-white shadow-md ring-1 ring-amber-400/40"
                          : "bg-gradient-to-r from-blue-600/90 to-blue-700/80 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-400/40"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                  )}

                  <span
                    className={`
                      flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-lg
                      transition-all duration-200
                      ${
                        active
                          ? "bg-white/20 text-white"
                          : "text-slate-400 group-hover:bg-white/10 group-hover:text-amber-300"
                      }
                    `}
                  >
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  </span>

                  <span className="truncate tracking-wide">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Info Badge */}
        <div className="border-t border-white/10 p-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldCheck size={16} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-slate-200">
                Badan Intelijen Negara
              </p>
              <p className="truncate text-[9.5px] text-slate-400">
                {activeModule === "HDH" ? "Harmonisasi Dokumen Hukum" : "Sistem JDIH Terenkripsi"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
