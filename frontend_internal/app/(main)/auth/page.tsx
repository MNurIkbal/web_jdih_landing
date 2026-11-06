"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Scale,
} from "lucide-react";

import { LoginHook, SessionHook } from "@/feature/web";

type Status = "idle" | "loading" | "success";

interface CursorPos {
  x: number;
  y: number;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const [errors, setErrors] = useState<FormErrors>({});

  const [pos, setPos] = useState<CursorPos>({
    x: 50,
    y: 50,
  });

  const [checkingSession, setCheckingSession] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const loginMutation = LoginHook();

  const sessionQuery = SessionHook();

  useEffect(() => {
    if (sessionQuery.isLoading) {
      return;
    }

    if (sessionQuery.data?.success) {
      router.replace("/admin/dashboard");
      return;
    }

    setCheckingSession(false);
  }, [sessionQuery.isLoading, sessionQuery.data, router]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;

    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPos({ x, y });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      newErrors.email = "Email wajib diisi";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {
        newErrors.email = "Format email tidak valid";
      }
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loginMutation.isPending || status === "success") {
      return;
    }

    setErrors({});

    const isValid = validateForm();

    if (!isValid) {
      setStatus("idle");
      return;
    }

    try {
      setStatus("loading");

      const cleanEmail = email.trim();

      await loginMutation.mutateAsync({
        email: cleanEmail,
        password,
        remember,
      });

      setErrors({});
      setStatus("success");

      setTimeout(() => {
        router.replace("/admin/dashboard");
        router.refresh();
      }, 500);
    } catch (error: any) {
      setStatus("idle");

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Email atau password salah";

      if (
        error?.response?.status === 401 ||
        message === "Email atau password salah"
      ) {
        setErrors({
          general: "Email atau password salah",
        });

        return;
      }

      setErrors({
        general: "Terjadi kesalahan pada server. Silakan coba lagi.",
      });
    }
  };

  if (checkingSession || sessionQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-[#1358A8]" />

          <p className="text-sm text-gray-500">Memeriksa sesi pengguna...</p>
        </div>
      </div>
    );
  }

  const BLUE = "#1358A8";
  const BLUE_DARK = "#0D3B73";
  const TEXT = "#172033";
  const MUTED = "#6B7280";
  const GOLD = "#C9A15A";
  const BORDER = "#E5E7EB";
  const ERROR = "#DC2626";

  const fieldWrap = (focused: boolean, hasError: boolean): CSSProperties => ({
    borderColor: hasError ? ERROR : focused ? BLUE : BORDER,

    boxShadow: hasError
      ? "0 0 0 4px rgba(220,38,38,0.08)"
      : focused
        ? "0 0 0 4px rgba(19,88,168,0.08)"
        : "none",

    background: "#FFFFFF",
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white px-5 py-10 sm:px-8"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .jdih-sans {
          font-family: 'Inter', sans-serif;
        }

        .jdih-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes jdih-fade-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes jdih-float {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes jdih-float-small {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes jdih-pop {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }

          60% {
            transform: scale(1.08);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .jdih-in {
          opacity: 0;
          animation:
            jdih-fade-up
            0.7s
            cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        .jdih-float {
          animation: jdih-float 5s ease-in-out infinite;
        }

        .jdih-float-small {
          animation: jdih-float-small 4s ease-in-out infinite;
        }

        .jdih-input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #172033;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
        }

        .jdih-input::placeholder {
          color: #9CA3AF;
        }

        @media (prefers-reduced-motion: reduce) {
          .jdih-in,
          .jdih-float,
          .jdih-float-small {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(19,88,168,0.07), transparent 68%)",
          }}
        />

        <div
          className="absolute -bottom-48 -right-40 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,161,90,0.06), transparent 68%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(
              500px circle at ${pos.x}% ${pos.y}%,
              rgba(19,88,168,0.035),
              transparent 65%
            )`,
            transition: "background 0.35s ease-out",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(19,88,168,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(19,88,168,0.035) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_430px]">
          <div className="hidden lg:block">
            <div
              className="jdih-in"
              style={{
                animationDelay: "0.05s",
              }}
            >
              <div className="mb-8 flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: BLUE,
                    boxShadow: "0 12px 30px rgba(19,88,168,0.18)",
                  }}
                >
                  <Scale size={28} color="white" strokeWidth={1.8} />
                </div>

                <div>
                  <div
                    className="jdih-heading text-[25px] font-extrabold tracking-tight"
                    style={{
                      color: BLUE_DARK,
                    }}
                  >
                    JDIH
                  </div>

                  <div
                    className="jdih-sans text-[11px] font-medium uppercase tracking-[0.14em]"
                    style={{
                      color: MUTED,
                    }}
                  >
                    Jaringan Dokumentasi
                  </div>
                </div>
              </div>

              <h2
                className="jdih-heading max-w-xl text-4xl font-extrabold leading-[1.18] tracking-tight xl:text-5xl"
                style={{
                  color: TEXT,
                }}
              >
                Pusat Dokumentasi
                <br />
                <span style={{ color: BLUE }}>Informasi Hukum</span>
              </h2>

              <p
                className="jdih-sans mt-6 max-w-lg text-[15px] leading-7"
                style={{
                  color: MUTED,
                }}
              >
                Akses dan kelola dokumentasi serta informasi hukum secara
                terintegrasi melalui Portal JDIH. Temukan produk hukum,
                peraturan, keputusan, dan berbagai dokumen hukum dalam satu
                sistem.
              </p>

              <div className="relative mt-10 h-[300px] w-full max-w-[590px]">
                <div
                  className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(234,242,255,0.95), rgba(234,242,255,0.35) 55%, transparent 72%)",
                  }}
                />

                <div
                  className="absolute left-[18%] top-[12%] h-3 w-3 rounded-full"
                  style={{
                    background: GOLD,
                    opacity: 0.65,
                  }}
                />

                <div
                  className="absolute right-[17%] top-[23%] h-2 w-2 rounded-full"
                  style={{
                    background: BLUE,
                    opacity: 0.45,
                  }}
                />

                <div
                  className="absolute bottom-[18%] left-[27%] h-2 w-2 rounded-full"
                  style={{
                    background: GOLD,
                    opacity: 0.5,
                  }}
                />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="jdih-float">
                    <div className="jdih-archive relative h-[230px] w-[330px]">
                      <div className="jdih-archive-glow absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full" />

                      <div className="jdih-orbit-line absolute left-1/2 top-1/2 h-[190px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#1358A8]/10" />

                      <div className="jdih-dot absolute left-[25px] top-[72px] h-2 w-2 rounded-full bg-[#C9A15A]" />

                      <div className="jdih-dot jdih-dot-delay absolute right-[28px] top-[45px] h-1.5 w-1.5 rounded-full bg-[#1358A8]" />

                      <div className="jdih-dot absolute bottom-[48px] left-[54px] h-1.5 w-1.5 rounded-full bg-[#1358A8]" />

                      <div className="jdih-dot jdih-dot-delay absolute bottom-[38px] right-[62px] h-2 w-2 rounded-full bg-[#C9A15A]" />

                      <div className="jdih-document-main absolute left-1/2 top-[22px] h-[150px] w-[116px] -translate-x-1/2">
                        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[10px] border border-[#DCE5F0] bg-[#F4F7FB]" />

                        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[10px] border border-[#D5E0EC] bg-white" />

                        <div className="relative h-full rounded-[10px] border border-[#D8E1EC] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
                          <div className="absolute left-1/2 top-[17px] flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-[#D8E4F2] bg-[#F4F8FD]">
                            <div className="relative h-6 w-6">
                              <div className="absolute left-1/2 top-0 h-5 w-[3px] -translate-x-1/2 rounded-full bg-[#1358A8]" />

                              <div className="absolute left-[2px] top-[6px] h-[3px] w-5 rounded-full bg-[#1358A8]" />

                              <div className="absolute left-[3px] top-[8px] h-3 w-[5px] rounded-b-full border-b-2 border-l-2 border-r-2 border-[#1358A8]" />

                              <div className="absolute right-[3px] top-[8px] h-3 w-[5px] rounded-b-full border-b-2 border-l-2 border-r-2 border-[#1358A8]" />

                              <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#C9A15A]" />
                            </div>
                          </div>

                          <div className="absolute left-[16px] right-[16px] top-[72px]">
                            <div className="mb-2 h-1.5 w-[52px] rounded-full bg-[#1358A8]" />

                            <div className="mb-2 h-1 w-full rounded-full bg-[#E5EAF1]" />

                            <div className="mb-2 h-1 w-[82%] rounded-full bg-[#E5EAF1]" />

                            <div className="h-1 w-[65%] rounded-full bg-[#E5EAF1]" />
                          </div>

                          <div className="absolute bottom-[14px] left-[16px] flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#C9A15A]" />
                            <div className="h-1 w-[35px] rounded-full bg-[#E5EAF1]" />
                          </div>
                        </div>
                      </div>

                      <div className="jdih-document-left absolute left-[27px] top-[92px] h-[94px] w-[74px] rotate-[-8deg]">
                        <div className="relative h-full rounded-lg border border-[#DCE4EE] bg-white shadow-[0_12px_25px_rgba(15,23,42,0.08)]">
                          <div className="absolute left-[11px] top-[13px] h-1.5 w-[31px] rounded-full bg-[#C9A15A]" />

                          <div className="absolute left-[11px] top-[27px] h-1 w-[48px] rounded-full bg-[#E5EAF1]" />

                          <div className="absolute left-[11px] top-[36px] h-1 w-[42px] rounded-full bg-[#E5EAF1]" />

                          <div className="absolute left-[11px] top-[45px] h-1 w-[34px] rounded-full bg-[#E5EAF1]" />

                          <div className="absolute bottom-[12px] left-[11px] h-4 w-4 rounded-md bg-[#F0F5FB]">
                            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1358A8]" />
                          </div>
                        </div>
                      </div>

                      <div className="jdih-document-right absolute right-[25px] top-[105px] h-[82px] w-[68px] rotate-[8deg]">
                        <div className="relative h-full rounded-lg border border-[#DCE4EE] bg-white shadow-[0_12px_25px_rgba(15,23,42,0.08)]">
                          <div className="absolute left-[10px] top-[12px] h-1.5 w-[27px] rounded-full bg-[#1358A8]" />

                          <div className="absolute left-[10px] top-[26px] h-1 w-[45px] rounded-full bg-[#E5EAF1]" />

                          <div className="absolute left-[10px] top-[35px] h-1 w-[39px] rounded-full bg-[#E5EAF1]" />

                          <div className="absolute left-[10px] top-[44px] h-1 w-[29px] rounded-full bg-[#E5EAF1]" />

                          <div className="absolute bottom-[10px] right-[10px] h-2 w-2 rounded-full bg-[#C9A15A]" />
                        </div>
                      </div>

                      <div className="jdih-search absolute bottom-[25px] right-[76px] h-[58px] w-[58px]">
                        <div className="absolute left-0 top-0 h-[38px] w-[38px] rounded-full border-[5px] border-[#1358A8] bg-white shadow-[0_8px_20px_rgba(19,88,168,0.14)]">
                          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A15A]" />
                        </div>

                        <div className="absolute left-[31px] top-[31px] h-[24px] w-[6px] rotate-[-45deg] rounded-full bg-[#1358A8]" />
                      </div>

                      <div className="absolute bottom-[8px] left-1/2 flex -translate-x-1/2 items-center gap-2">
                        <div className="h-[4px] w-8 rounded-full bg-[#C9A15A]" />
                        <div className="h-[4px] w-16 rounded-full bg-[#1358A8]" />
                        <div className="h-[4px] w-8 rounded-full bg-[#C9A15A]" />
                      </div>

                      <div className="absolute left-[76px] top-[28px] text-[13px] text-[#C9A15A]">
                        ✦
                      </div>

                      <div className="jdih-star absolute right-[76px] top-[71px] text-[10px] text-[#1358A8]">
                        ✦
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-px w-10"
                  style={{
                    background: GOLD,
                  }}
                />

                <span
                  className="jdih-sans text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{
                    color: "#9CA3AF",
                  }}
                >
                  Dokumentasi • Regulasi • Informasi Hukum
                </span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div
              className="jdih-in rounded-[26px] border bg-white p-7 shadow-[0_25px_70px_rgba(15,23,42,0.08)] sm:p-9"
              style={{
                borderColor: "#E6EAF0",
                animationDelay: "0.12s",
              }}
            >
              <div className="mb-7 flex flex-col items-center lg:hidden">
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: BLUE,
                    boxShadow: "0 10px 28px rgba(19,88,168,0.2)",
                  }}
                >
                  <Scale size={27} color="white" strokeWidth={1.8} />
                </div>

                <div
                  className="jdih-heading text-xl font-extrabold"
                  style={{
                    color: BLUE_DARK,
                  }}
                >
                  JDIH
                </div>

                <div
                  className="jdih-sans mt-1 text-center text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{
                    color: MUTED,
                  }}
                >
                  Jaringan Dokumentasi & Informasi Hukum
                </div>
              </div>

              <div className="mb-8">
                <div
                  className="jdih-sans mb-2 text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{
                    color: BLUE,
                  }}
                >
                  Portal JDIH
                </div>

                <h1
                  className="jdih-heading text-[28px] font-extrabold tracking-tight"
                  style={{
                    color: TEXT,
                  }}
                >
                  Selamat Datang
                </h1>

                <p
                  className="jdih-sans mt-2 text-[13px] leading-6"
                  style={{
                    color: MUTED,
                  }}
                >
                  Masuk untuk mengakses layanan dan dokumentasi informasi hukum.
                </p>
              </div>

              {errors.general && (
                <div
                  className="mb-5 flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{
                    borderColor: "#FECACA",
                    background: "#FEF2F2",
                  }}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "#FEE2E2",
                      color: ERROR,
                    }}
                  >
                    !
                  </div>

                  <p
                    className="jdih-sans text-[13px] font-medium"
                    style={{
                      color: ERROR,
                    }}
                  >
                    {errors.general}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div
                  className="jdih-in mb-5"
                  style={{
                    animationDelay: "0.22s",
                  }}
                >
                  <label
                    className="jdih-sans mb-2 block text-xs font-semibold"
                    style={{
                      color: TEXT,
                    }}
                  >
                    Alamat Email
                  </label>

                  <div
                    className="flex h-[52px] items-center gap-3 rounded-xl border px-4 transition-all duration-200"
                    style={{
                      ...fieldWrap(emailFocused, !!errors.email),
                    }}
                  >
                    <Mail
                      size={17}
                      strokeWidth={1.8}
                      color={
                        errors.email ? ERROR : emailFocused ? BLUE : "#9CA3AF"
                      }
                    />

                    <input
                      type="email"
                      className="jdih-input"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);

                        if (errors.email) {
                          setErrors((prev) => ({
                            ...prev,
                            email: undefined,
                          }));
                        }

                        if (errors.general) {
                          setErrors((prev) => ({
                            ...prev,
                            general: undefined,
                          }));
                        }
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="Masukkan alamat email"
                      autoComplete="email"
                      disabled={loginMutation.isPending}
                    />
                  </div>

                  {errors.email && (
                    <p
                      className="jdih-sans mt-2 text-xs"
                      style={{
                        color: ERROR,
                      }}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div
                  className="jdih-in mb-4"
                  style={{
                    animationDelay: "0.27s",
                  }}
                >
                  <label
                    className="jdih-sans mb-2 block text-xs font-semibold"
                    style={{
                      color: TEXT,
                    }}
                  >
                    Kata Sandi
                  </label>

                  <div
                    className="flex h-[52px] items-center gap-3 rounded-xl border px-4 transition-all duration-200"
                    style={{
                      ...fieldWrap(passwordFocused, !!errors.password),
                    }}
                  >
                    <Lock
                      size={17}
                      strokeWidth={1.8}
                      color={
                        errors.password
                          ? ERROR
                          : passwordFocused
                            ? BLUE
                            : "#9CA3AF"
                      }
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      className="jdih-input"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        if (errors.password) {
                          setErrors((prev) => ({
                            ...prev,
                            password: undefined,
                          }));
                        }

                        if (errors.general) {
                          setErrors((prev) => ({
                            ...prev,
                            general: undefined,
                          }));
                        }
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="Masukkan kata sandi"
                      autoComplete="current-password"
                      disabled={loginMutation.isPending}
                    />

                    <button
                      type="button"
                      disabled={loginMutation.isPending}
                      onClick={() => setShowPassword((s) => !s)}
                      className="shrink-0 border-0 bg-transparent p-1"
                    >
                      {showPassword ? (
                        <EyeOff size={17} color="#9CA3AF" />
                      ) : (
                        <Eye size={17} color="#9CA3AF" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p
                      className="jdih-sans mt-2 text-xs"
                      style={{
                        color: ERROR,
                      }}
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending || status === "success"}
                  className="jdih-sans group jdih-in relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl border-0 text-sm font-semibold text-white transition-all duration-300"
                  style={{
                    background:
                      status === "success"
                        ? "#16A37A"
                        : `linear-gradient(
                            100deg,
                            ${BLUE_DARK},
                            ${BLUE}
                          )`,

                    boxShadow:
                      status === "idle"
                        ? "0 10px 24px rgba(19,88,168,0.18)"
                        : "none",

                    cursor:
                      loginMutation.isPending || status === "success"
                        ? "default"
                        : "pointer",

                    animationDelay: "0.37s",
                  }}
                >
                  {status === "idle" && (
                    <>
                      Masuk ke Portal
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}

                  {status === "loading" && (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Memproses...
                    </>
                  )}

                  {status === "success" && (
                    <span
                      className="flex items-center gap-2"
                      style={{
                        animation: "jdih-pop 0.4s ease",
                      }}
                    >
                      <Check size={17} strokeWidth={3} />
                      Berhasil
                    </span>
                  )}
                </button>
              </form>

              <div
                className="jdih-in mt-7 border-t pt-6 text-center"
                style={{
                  borderColor: "#EEF0F3",
                  animationDelay: "0.42s",
                }}
              >
                <p
                  className="jdih-sans text-[11px] leading-5"
                  style={{
                    color: "#9CA3AF",
                  }}
                >
                  Akses terbatas untuk pengguna yang telah terdaftar pada sistem
                  JDIH.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: GOLD,
                    }}
                  />

                  <span
                    className="jdih-sans text-[10px] font-medium uppercase tracking-[0.1em]"
                    style={{
                      color: "#9CA3AF",
                    }}
                  >
                    Jaringan Dokumentasi & Informasi Hukum
                  </span>

                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: BLUE,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
