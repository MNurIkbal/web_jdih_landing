"use client";

import {
  Menu,
  ChevronDown,
  User,
  LogOut,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import { useState } from "react";
import { useUpdatePassword } from "../pengguna/hooks/Pengguna.hooks";
import Toast from "@/components/ui/Toast";
import { LogoutHook, SessionHook } from "../web";
import { useRouter } from "next/navigation";

interface AdminNavbarProps {
  onMenuClick?: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

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

  const handleChangePassword = (id:any) => {
    
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
      {
        id,
        password: newPassword,
      },
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

        onError: (error: any) => {
          setToast({
            open: true,
            type: "error",
            title: "Gagal",
            message:
              error?.response?.data?.message ?? "Gagal memperbarui password.",
          });
        },
      },
    );
  };

  const isSubmitting = updatePassword.isPending;

  return (
    <>
      <header className="sticky top-0 z-40 h-[72px] border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-full items-center justify-between px-4 lg:px-7">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="hidden md:block">
              <h1 className="text-[17px] font-normal text-slate-800">
                Dashboard
              </h1>

              <p className="mt-0.5 text-[12px] font-normal text-slate-400">
                Portal Administrasi JDIH
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{
                    background: "linear-gradient(135deg,#0D3B73,#1358A8)",
                  }}
                >
                  <User size={18} />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-[13px] font-normal text-slate-700">
                    {nama}
                  </p>

                  <p className="text-[11px] font-normal text-slate-400">
                    Admin JDIH
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`
                    hidden
                    text-slate-400
                    transition-transform
                    sm:block
                    ${profileOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[56px] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="text-[12px] font-normal text-slate-400">
                      Akun
                    </p>
                    <p className="mt-0.5 text-[14px] font-normal text-slate-700">
                      {nama}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    onClick={handleOpenPasswordModal}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-normal text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    <LockKeyhole size={17} className="text-slate-400" />
                    <span>Ganti Password</span>
                  </button>
                  <div className="my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <LogOut size={18} />
                    {logoutMutation.isPending ? "Keluar..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LockKeyhole size={19} />
                </div>
                <div>
                  <h2 className="text-[17px] font-normal text-slate-800">
                    Ganti Password
                  </h2>
                  <p className="mt-0.5 text-[11px] font-normal text-slate-400">
                    Perbarui password akun administrator
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-1.5 block text-[13px] font-normal text-slate-700">
                  Password Baru
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-[13px] font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    disabled={isSubmitting}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-normal text-slate-700">
                  Ulangi Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    disabled={isSubmitting}
                    className={`
                      h-11
                      w-full
                      rounded-xl
                      border
                      bg-white
                      px-3
                      pr-11
                      text-[13px]
                      font-normal
                      text-slate-700
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:ring-2
                      focus:ring-blue-500/10
                      disabled:bg-slate-50
                      ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-400 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={isSubmitting}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1.5 text-[11px] text-red-500">
                    Password tidak sama
                  </p>
                )}

                {confirmPassword && newPassword === confirmPassword && (
                  <p className="mt-1.5 text-[11px] text-emerald-600">
                    Password sudah sama
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-normal text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleChangePassword(id_data)}
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-normal text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </>
  );
}
