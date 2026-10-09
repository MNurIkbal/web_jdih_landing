
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  Newspaper,
  FileText,
  Users,
  MessageSquare,
  Settings,
  X,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const MENU = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Slider",
    href: "/admin/slider",
    icon: Images,
  },
  {
    label: "Berita",
    href: "/admin/berita",
    icon: Newspaper,
  },
  {
    label: "Dokumen Hukum",
    href: "/admin/dokumen-hukum",
    icon: FileText,
  },
  {
    label: "Pengguna",
    href: "/admin/pengguna",
    icon: Users,
  },
  {
    label: "Kontak",
    href: "/admin/kontak",
    icon: MessageSquare,
  },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
  },
];

export default function AdminSidebar({
  open = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[270px] flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{
                background:
                  "linear-gradient(135deg, #0D3B73 0%, #1358A8 100%)",
                boxShadow:
                  "0 8px 20px rgba(19, 88, 168, 0.18)",
              }}
            >
              <Image src="/images/log.png" alt="logo" height={70} width={70} />
            </div>

            <div>
              <div className="text-[18px] font-semibold tracking-tight text-slate-800">
                JDIH
              </div>

              <div className="text-[10px] font-normal uppercase tracking-[0.14em] text-slate-400">
                Admin Portal
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-5">
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
              <ShieldCheck size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-[12px] font-normal text-blue-800">
                Sistem Aktif
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <span className="text-[10px] font-normal text-blue-500">
                  Semua layanan normal
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto px-4 pb-6">
          <div className="mb-3 px-3">
            <span className="text-[11px] font-normal uppercase tracking-[0.14em] text-slate-400">
              Menu Utama
            </span>
          </div>

          <div className="space-y-1">
            {MENU.map((item) => {
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
                    text-[14px] font-normal
                    transition-all duration-200
                    ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }
                  `}
                >
                  {active && (
                    <span
                      className="absolute left-0 h-6 w-[3px] rounded-r-full"
                      style={{
                        background: "#1358A8",
                      }}
                    />
                  )}

                  <span
                    className={`
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-lg
                      transition-all duration-200
                      ${
                        active
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2 : 1.8}
                    />
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
              <FileText size={16} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-normal text-slate-700">
                Jaringan Dokumentasi
              </p>

              <p className="truncate text-[10px] font-normal text-slate-400">
                Informasi Hukum
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
