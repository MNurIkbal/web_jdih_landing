"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import { AdminLayoutProvider, useAdminLayout } from "./AdminLayoutContext";
import { Scale, FileText, Loader2, ShieldAlert } from "lucide-react";
import { SessionHook } from "../web";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { menuMode, isSwitchingModule, switchingTarget, activeModule } = useAdminLayout();
  const pathname = usePathname();
  const router = useRouter();
  const session = SessionHook();
  const userRole = (session?.data?.data?.role || "").toLowerCase();

  // 1. Auth Guard: Jika belum login atau session error/tidak ada, lempar ke /auth
  const isUnauthenticated = !session.isLoading && (!session.data?.success || !session.data?.data);

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace("/auth");
    }
  }, [isUnauthenticated, router]);

  // 2. Role Protection:
  // - /admin/pengguna & /admin/pengaturan HANYA boleh diakses oleh superadmin
  // - Admin (verifikator) dan Pengguna tidak boleh akses
  const isSuperadminOnlyRoute =
    pathname.startsWith("/admin/pengguna") || pathname.startsWith("/admin/pengaturan");
  const isForbiddenForCurrentRole =
    !session.isLoading && userRole && userRole !== "superadmin" && isSuperadminOnlyRoute;

  useEffect(() => {
    if (isForbiddenForCurrentRole) {
      router.replace("/admin/dashboard");
    }
  }, [isForbiddenForCurrentRole, router]);

  // Loading screen saat session masih diperiksa
  if (session.isLoading || isUnauthenticated) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-white p-6">
        <Loader2 size={36} className="animate-spin text-blue-500 mb-3" />
        <p className="text-xs text-slate-400">Memeriksa sesi login...</p>
      </div>
    );
  }

  if (isForbiddenForCurrentRole) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-500 ring-4 ring-rose-500/20 mb-4 animate-bounce">
          <ShieldAlert size={36} />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Akses Ditolak (403 Forbidden)</h2>
        <p className="mt-1 text-xs text-slate-400 text-center max-w-sm">
          Menu ini hanya dapat diakses oleh Superadmin. Mengalihkan Anda kembali ke Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      {/* Modal/Overlay Transisi Animasi Perubahan Modul */}
      {isSwitchingModule && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900/90 to-slate-950/95 px-10 py-8 shadow-2xl shadow-black/60 text-white">
            {/* Pulsing glow background */}
            <div
              className={`absolute -inset-1 rounded-3xl opacity-30 blur-xl animate-pulse ${
                switchingTarget === "HDH" ? "bg-amber-500" : "bg-blue-600"
              }`}
            />

            <div className="relative">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl transition-all duration-500 animate-bounce ${
                  switchingTarget === "HDH"
                    ? "bg-gradient-to-tr from-amber-600 to-amber-500 text-white ring-4 ring-amber-400/30"
                    : "bg-gradient-to-tr from-blue-700 to-blue-500 text-white ring-4 ring-blue-400/30"
                }`}
              >
                {switchingTarget === "HDH" ? (
                  <Scale size={38} className="animate-pulse" />
                ) : (
                  <FileText size={38} className="animate-pulse" />
                )}
              </div>
            </div>

            <div className="text-center relative">
              <div className="text-lg font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>Memuat Modul {switchingTarget}...</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                {switchingTarget === "HDH"
                  ? "Beralih ke Harmonisasi & Telaah Dokumen Hukum"
                  : "Beralih ke Portal Peraturan & Alur Legislasi JDIH"}
              </p>
            </div>

            <div className="relative flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={16} className="animate-spin text-amber-400" />
              <span className="font-medium tracking-wide">Menyesuaikan Hak Akses & Menu...</span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: Otomatis render jika mode 'sidebar', tersembunyi jika mode 'navbar' */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Konten Utama: jika mode 'sidebar', ada padding kiri 275px; jika 'navbar', full width (pl-0) */}
      <div
        className={`w-full overflow-x-hidden transition-all duration-300 ${
          menuMode === "sidebar" ? "lg:pl-[275px]" : "pl-0"
        } ${isSwitchingModule ? "opacity-50" : "opacity-100"}`}
      >
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="w-full overflow-x-hidden">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutWrapperProps) {
  return (
    <AdminLayoutProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminLayoutProvider>
  );
}

