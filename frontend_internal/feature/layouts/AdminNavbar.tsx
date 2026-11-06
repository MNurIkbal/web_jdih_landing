"use client";

import {
  Menu,
  User,
  LogOut,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  LayoutGrid,
  Sidebar as SidebarIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdatePassword } from "../pengguna/hooks/Pengguna.hooks";
import Toast from "@/components/ui/Toast";
import { LogoutHook, SessionHook } from "../web";
import { JDIH_MENU_ITEMS, HDH_MENU_ITEMS } from "./adminMenu";
import { useAdminLayout } from "./AdminLayoutContext";

interface AdminNavbarProps {
  onMenuClick?: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { menuMode, setMenuMode, activeModule, setActiveModule, isSwitchingModule, switchingTarget } = useAdminLayout();
  const currentMenuItems = activeModule === "HDH" ? HDH_MENU_ITEMS : JDIH_MENU_ITEMS;

  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const logoutMutation = LogoutHook();
  const sessionHooks = SessionHook();
  const nama = sessionHooks ? (sessionHooks.data?.data?.nama ?? "Admin") : "";
  const id_data = sessionHooks ? (sessionHooks.data?.data?.id ?? "Administrator") : "";

  const handleLogout = async () => {
    if (logoutMutation.isPending) return;
    try {
      await logoutMutation.mutateAsync();
      router.replace("/auth");
    } catch (error) {}
  };

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const updatePassword = useUpdatePassword();

  const handleOpenPasswordModal = () => {
    setProfileOpen(false);
    setPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = (id: any) => {
    if (!newPassword.trim()) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "Password baru wajib diisi.",
      });
      return;
    }

    if (!confirmPassword.trim()) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "Ulangi password wajib diisi.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "Password baru dan ulangi password harus sama.",
      });
      return;
    }

    updatePassword.mutate(
      { id, password: newPassword },
      {
        onSuccess: () => {
          setToast({
            open: true,
            type: "success",
            title: "Berhasil",
            message: "Password berhasil diperbarui.",
          });
          handleClosePasswordModal();
        },
        onError: () => {
          setToast({
            open: true,
            type: "error",
            title: "Gagal",
            message: "Terjadi kesalahan saat mengubah password.",
          });
        },
      }
    );
  };

  const isSubmitting = updatePassword.isPending;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
        {/* Main Header Bar */}
        <div className="flex h-[72px] items-center justify-between px-4 lg:px-7">
          <div className="flex items-center gap-4">
            {menuMode === "sidebar" && (
              <button
                type="button"
                onClick={onMenuClick}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
              >
                <Menu size={21} />
              </button>
            )}

            {/* Jika mode navbar aktif: tampilkan Logo JDIH BIN di navbar */}
            {menuMode === "navbar" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 pr-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D3B73] to-[#1358A8] p-1.5 shadow-md shadow-blue-900/20">
                  <Image
                    src="/images/log.png"
                    alt="logo"
                    height={40}
                    width={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-[17px] font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                    JDIH <span className="text-amber-600 font-black">BIN</span>
                  </div>
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Admin Portal
                  </div>
                </div>
              </Link>
            )}

            {menuMode === "sidebar" && (
              <div className="hidden md:block">
                <h1 className="text-[17px] font-bold text-slate-800">
                  Portal Admin JDIH
                </h1>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  Badan Intelijen Negara
                </p>
              </div>
            )}
          </div>

          {/* Right Header: Layout Mode Toggle + Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Toggle Switcher: Sidebar vs Navbar */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setMenuMode("sidebar")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  menuMode === "sidebar"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tampilkan menu di Sidebar kiri (Sidebar Image)"
              >
                <SidebarIcon size={14} />
                Sidebar Menu
              </button>
              <button
                type="button"
                onClick={() => setMenuMode("navbar")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  menuMode === "navbar"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Pindahkan menu ke Navbar atas dan hapus Sidebar"
              >
                <LayoutGrid size={14} />
                Navbar Menu
              </button>
            </div>

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition hover:bg-slate-50 border border-slate-200/70"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #0D3B73 0%, #1358A8 100%)",
                  }}
                >
                  <User size={16} />
                </div>

                <div className="hidden text-left md:block">
                  <div className="text-[13px] font-semibold text-slate-800">
                    {nama}
                  </div>
                  <div className="text-[10.5px] text-slate-400">
                    Administrator
                  </div>
                </div>
              </button>

              {profileOpen && (
                <>
                  <div
                    onClick={() => setProfileOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <p className="text-xs font-bold text-slate-800">{nama}</p>
                      <p className="text-[11px] text-slate-400">Sistem JDIH BIN</p>
                    </div>

                    {/* Mobile Switch Layout Mode inside dropdown */}
                    <div className="block sm:hidden border-b border-slate-100 p-2">
                      <p className="text-[10px] font-bold uppercase text-slate-400 px-1 mb-1">
                        Posisi Menu
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuMode("sidebar");
                            setProfileOpen(false);
                          }}
                          className={`rounded-lg px-2 py-1 text-center text-xs font-semibold ${
                            menuMode === "sidebar"
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Sidebar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuMode("navbar");
                            setProfileOpen(false);
                          }}
                          className={`rounded-lg px-2 py-1 text-center text-xs font-semibold ${
                            menuMode === "navbar"
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Navbar
                        </button>
                      </div>
                    </div>

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={handleOpenPasswordModal}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <LockKeyhole size={15} className="text-slate-400" />
                        Ganti Password
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={15} />
                        {logoutMutation.isPending ? "Keluar..." : "Keluar Sistem"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Jika mode "navbar" aktif: render baris menu horizontal di Navbar */}
        {menuMode === "navbar" && (
          <nav className="border-t border-slate-100 bg-slate-50/70 px-4 lg:px-7 py-2 overflow-x-auto custom-scrollbar">
            <div className="flex items-center justify-between gap-4 min-w-max">
              <div
                className={`flex items-center gap-1.5 transition-all duration-300 ${
                  isSwitchingModule
                    ? "opacity-30 translate-x-2 filter blur-[1px] pointer-events-none"
                    : "opacity-100 translate-x-0 filter blur-0"
                }`}
              >
                {currentMenuItems.map((item) => {
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
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? activeModule === "HDH"
                            ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm ring-1 ring-amber-700/50"
                            : "bg-gradient-to-r from-[#0d3b73] to-[#124580] text-white shadow-sm ring-1 ring-blue-700/50"
                          : "text-slate-600 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Modul Switcher Mini di Navbar dengan Animasi Glider */}
              <div className="relative flex items-center p-1 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out shadow-sm ${
                    activeModule === "JDIH"
                      ? "left-1 bg-blue-600"
                      : "left-[calc(50%+2px)] bg-amber-600"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setActiveModule("JDIH")}
                  disabled={isSwitchingModule}
                  className={`relative z-10 px-3 py-1 text-[11px] font-bold rounded-lg transition-colors duration-200 ${
                    activeModule === "JDIH"
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Modul JDIH
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModule("HDH")}
                  disabled={isSwitchingModule}
                  className={`relative z-10 px-3 py-1 text-[11px] font-bold rounded-lg transition-colors duration-200 ${
                    activeModule === "HDH"
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Modul HDH
                </button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Modal Ubah Password */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LockKeyhole size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Ubah Password
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Perbarui keamanan akun Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Password Baru *
                </label>
                <div className="relative mt-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Ulangi Password Baru *
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-500">
                    Password belum cocok
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="mt-1 text-[11px] text-emerald-600">
                    Password cocok
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleChangePassword(id_data)}
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
