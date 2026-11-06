"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ShieldCheck, PanelLeftClose } from "lucide-react";
import Image from "next/image";
import { ADMIN_MENU_ITEMS } from "./adminMenu";
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
  const { menuMode, setMenuMode } = useAdminLayout();

  // Jika mode "navbar" aktif, sidebar disembunyikan/ditiadakan
  if (menuMode === "navbar") {
    return null;
  }

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
                JDIH <span className="text-amber-400 font-black">BIN</span>
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-slate-300/80">
                Admin Portal
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


        <nav className="mt-4 flex-1 overflow-y-auto px-3.5 pb-6 custom-scrollbar">
          <div className="mb-2 px-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400/90">
              Menu Navigasi
            </span>
          </div>

          <div className="space-y-1">
            {ADMIN_MENU_ITEMS.map((item) => {
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
                  className={`
                    group relative flex items-center
                    gap-3 rounded-xl px-3 py-2.5
                    text-[13.5px] font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-gradient-to-r from-blue-600/90 to-blue-700/80 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-400/40"
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
                Sistem JDIH Terenkripsi
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
