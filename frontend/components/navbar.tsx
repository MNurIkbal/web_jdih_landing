"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { SearchModal } from "./search-modal";

type NavChild = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  label: string;
  children?: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Beranda",
  },
  {
    href: "#",
    label: "Tentang JDIH",
    children: [
      {
        href: "/struktur-organisasi",
        label: "Struktur Organisasi",
      },
      {
        href: "/tentang",
        label: "Tentang JDIH",
      },
      {
        href: "/sejarah",
        label: "Sejarah",
      },
      {
        href: "/dasar-hukum",
        label: "Dasar Hukum",
      },
      {
        href: "/jdih-perwakilan",
        label: "JDIH Perwakilan",
      },
    ],
  },
  {
    href: "/dokumen-hukum",
    label: "Dokumen  Hukum",
  },
  {
    href: "/kontak",
    label: "Kontak",
  },
  {
    href: "/chat",
    label: "AI Chat",
  },
];

function isPathActive(
  pathname: string,
  href: string
) {
  if (!href || href === "#") {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function Navbar() {
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [mobileSubOpen, setMobileSubOpen] =
    useState<string | null>(null);

  const [openDropdown, setOpenDropdown] =
    useState<string | null>(null);

  const [scrolled, setScrolled] =
    useState(false);

  const closeTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /*
   * =========================================================
   * SCROLL HEADER
   * =========================================================
   */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * =========================================================
   * TUTUP MOBILE SAAT PINDAH HALAMAN
   * =========================================================
   */

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * =========================================================
   * CEK CHILD AKTIF
   * =========================================================
   */

  function isChildActive(child: NavChild) {
    return isPathActive(
      pathname,
      child.href
    );
  }

  /*
   * =========================================================
   * CEK MENU AKTIF
   * =========================================================
   */

  function isItemActive(item: NavItem) {
    if (item.children?.length) {
      return item.children.some((child) =>
        isChildActive(child)
      );
    }

    return isPathActive(
      pathname,
      item.href
    );
  }

  /*
   * =========================================================
   * CEK PARENT MEMILIKI CHILD AKTIF
   * =========================================================
   */

  function hasActiveChild(item: NavItem) {
    if (!item.children?.length) {
      return false;
    }

    return item.children.some((child) =>
      isChildActive(child)
    );
  }

  /*
   * =========================================================
   * BUKA DROPDOWN
   * =========================================================
   */

  function openNow(label: string) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setOpenDropdown(label);
  }

  /*
   * =========================================================
   * TUTUP DROPDOWN
   * =========================================================
   */

  function closeSoon() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    closeTimer.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  }

  /*
   * =========================================================
   * OTOMATIS BUKA PARENT AKTIF
   * =========================================================
   */

  useEffect(() => {
    const activeParent =
      NAV_ITEMS.find((item) =>
        hasActiveChild(item)
      );

    if (activeParent) {
      setOpenDropdown(
        activeParent.label
      );

      setMobileSubOpen(
        activeParent.label
      );
    } else {
      setOpenDropdown(null);
      setMobileSubOpen(null);
    }
  }, [pathname]);

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50",
          "border-b",
          "transition-all duration-500",
          scrolled
            ? "border-white/10 bg-primary/95 shadow-lg shadow-black/10 backdrop-blur-md"
            : "border-transparent bg-primary",
        ].join(" ")}
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <div
          className={[
            "mx-auto flex max-w-6xl",
            "items-center justify-between",
            "px-4 sm:px-6",
            "transition-all duration-500",
            scrolled
              ? "h-16"
              : "h-24",
          ].join(" ")}
        >
          {/* =================================================
              LOGO BIN
              ================================================= */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            {/* Logo BIN */}

            <span
              className={[
                "relative flex shrink-0",
                "items-center justify-center",
                "overflow-hidden",
                "transition-all duration-500",
                "group-hover:-translate-y-0.5",
                "group-hover:scale-105",
                scrolled
                  ? "h-10 w-10"
                  : "h-14 w-14",
              ].join(" ")}
            >
              <Image
                src="/images/log.png"
                alt="Logo BIN"
                width={64}
                height={64}
                priority
                className={[
                  "relative z-10",
                  "h-full w-full",
                  "object-contain",
                  "transition-all duration-500",
                  "group-hover:scale-110",
                ].join(" ")}
              />

              {/* Animasi shine */}

              <span
                className={[
                  "pointer-events-none",
                  "absolute inset-0 z-20",
                  "-translate-x-full",
                  "bg-gradient-to-r",
                  "from-transparent",
                  "via-white/30",
                  "to-transparent",
                  "transition-transform duration-700",
                  "group-hover:translate-x-full",
                ].join(" ")}
              />
            </span>

            {/* Text Logo */}

            <span className="overflow-hidden">
              <span
                className={[
                  "block",
                  "font-semibold",
                  "leading-none",
                  "text-primary-foreground",
                  "transition-all duration-500",
                  scrolled
                    ? "text-[15px]"
                    : "text-[18px]",
                ].join(" ")}
              >
                JDIH
              </span>

              <span
                className={[
                  "mt-1 block",
                  "overflow-hidden",
                  "text-[10px]",
                  "uppercase tracking-widest",
                  "text-accent/90",
                  "transition-all duration-500",
                  scrolled
                    ? "max-h-0 opacity-0"
                    : "max-h-4 opacity-100",
                ].join(" ")}
              >
                Badan Intelijen Negara
              </span>
            </span>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
              ================================================= */}

          <nav className="hidden h-full items-stretch gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active =
                isItemActive(item);

              const hasChildren =
                !!item.children?.length;

              const isOpen =
                openDropdown ===
                item.label;

              const parentHasActiveChild =
                hasActiveChild(item);

              return (
                <div
                  key={item.label}
                  className="relative flex h-full items-center"
                  onMouseEnter={() => {
                    if (hasChildren) {
                      openNow(item.label);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hasChildren) {
                      closeSoon();
                    }
                  }}
                >
                  {/* MENU UTAMA */}

                  <Link
                    href={
                      hasChildren
                        ? "#"
                        : item.href
                    }
                    onClick={(event) => {
                      if (hasChildren) {
                        event.preventDefault();

                        setOpenDropdown(
                          isOpen
                            ? null
                            : item.label
                        );
                      }
                    }}
                    className={[
                      "group relative flex",
                      "items-center gap-1",
                      "rounded-lg px-4 py-2.5",
                      "text-sm font-medium",
                      "transition-all duration-300",
                      active
                        ? "bg-white/10 text-primary-foreground ring-1 ring-white/15"
                        : "text-primary-foreground/65 hover:bg-white/5 hover:text-primary-foreground",
                    ].join(" ")}
                  >
                    <span className="relative z-10">
                      {item.label}
                    </span>

                    {hasChildren && (
                      <ChevronDown
                        className={[
                          "relative z-10",
                          "h-3.5 w-3.5",
                          "transition-transform duration-300",
                          isOpen
                            ? "rotate-180"
                            : "",
                        ].join(" ")}
                      />
                    )}

                    {/* GARIS ACTIVE */}

                    <span
                      className={[
                        "absolute inset-x-4",
                        "-bottom-[1px]",
                        "h-[2px]",
                        "rounded-full",
                        "bg-accent",
                        "transition-transform duration-300",
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100",
                      ].join(" ")}
                    />
                  </Link>

                  {/* =================================================
                      DROPDOWN
                      ================================================= */}

                  {hasChildren && (
                    <div
                      className={[
                        "absolute left-1/2 top-full",
                        "z-50 w-72",
                        "-translate-x-1/2",
                        "transition-all duration-300",
                        isOpen
                          ? "pointer-events-auto translate-y-0 opacity-100"
                          : "pointer-events-none -translate-y-2 opacity-0",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "overflow-hidden",
                          "rounded-b-xl",
                          "border border-white/10",
                          "bg-primary",
                          "shadow-2xl",
                          "shadow-black/40",
                        ].join(" ")}
                      >
                        {/* Garis aksen */}

                        <div
                          className={[
                            "h-[2px]",
                            "w-full",
                            "bg-gradient-to-r",
                            "from-transparent",
                            "via-accent",
                            "to-transparent",
                          ].join(" ")}
                        />

                        <div className="p-2">
                          {item.children!.map(
                            (
                              child,
                              index
                            ) => {
                              const childActive =
                                isChildActive(
                                  child
                                );

                              return (
                                <Link
                                  key={
                                    child.label
                                  }
                                  href={
                                    child.href
                                  }
                                  onClick={() => {
                                    setOpenDropdown(
                                      null
                                    );
                                  }}
                                  className={[
                                    "group/item",
                                    "relative flex",
                                    "items-center",
                                    "overflow-hidden",
                                    "rounded-lg",
                                    "px-3 py-3",
                                    "text-sm font-medium",
                                    "transition-all duration-300",
                                    childActive
                                      ? "bg-white/10 text-primary-foreground"
                                      : "text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground",
                                  ].join(
                                    " "
                                  )}
                                  style={{
                                    transitionDelay:
                                      isOpen
                                        ? `${index * 45}ms`
                                        : "0ms",
                                  }}
                                >
                                  {/* Background animasi */}

                                  <span
                                    className={[
                                      "absolute inset-0",
                                      "origin-left",
                                      "scale-x-0",
                                      "bg-white/[0.04]",
                                      "transition-transform duration-300",
                                      "group-hover/item:scale-x-100",
                                    ].join(
                                      " "
                                    )}
                                  />

                                  {/* Active bar */}

                                  <span
                                    className={[
                                      "absolute left-0",
                                      "inset-y-2",
                                      "w-[3px]",
                                      "rounded-r-full",
                                      "bg-accent",
                                      "transition-transform duration-300",
                                      childActive
                                        ? "scale-y-100"
                                        : "scale-y-0 group-hover/item:scale-y-100",
                                    ].join(
                                      " "
                                    )}
                                  />

                                  {/* Arrow */}

                                  <span
                                    className={[
                                      "relative z-10",
                                      "mr-2",
                                      "text-accent",
                                      "opacity-0",
                                      "-translate-x-2",
                                      "transition-all duration-300",
                                      "group-hover/item:translate-x-0",
                                      "group-hover/item:opacity-100",
                                      childActive
                                        ? "translate-x-0 opacity-100"
                                        : "",
                                    ].join(
                                      " "
                                    )}
                                  >
                                    →
                                  </span>

                                  {/* Text */}

                                  <span
                                    className={[
                                      "relative z-10",
                                      "transition-transform duration-300",
                                      "group-hover/item:translate-x-1",
                                      childActive
                                        ? "font-semibold text-primary-foreground"
                                        : "",
                                    ].join(
                                      " "
                                    )}
                                  >
                                    {
                                      child.label
                                    }
                                  </span>
                                </Link>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (value) => !value
                )
              }
              aria-label={
                mobileOpen
                  ? "Tutup menu"
                  : "Buka menu"
              }
              className={[
                "flex md:hidden",
                "h-10 w-10",
                "items-center justify-center",
                "rounded-lg",
                "text-primary-foreground",
                "transition-all duration-200",
                "hover:bg-white/10",
                "hover:scale-105",
              ].join(" ")}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* =================================================
            MOBILE NAVIGATION
            ================================================= */}

        <nav
          className={[
            "overflow-hidden",
            "border-t border-white/10",
            "bg-primary",
            "transition-all duration-300",
            "md:hidden",
            mobileOpen
              ? "max-h-[800px] opacity-100"
              : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {NAV_ITEMS.map((item) => {
              const active =
                isItemActive(item);

              const hasChildren =
                !!item.children?.length;

              const subOpen =
                mobileSubOpen ===
                item.label;

              return (
                <div
                  key={item.label}
                  className="overflow-hidden"
                >
                  <Link
                    href={
                      hasChildren
                        ? "#"
                        : item.href
                    }
                    onClick={(event) => {
                      if (hasChildren) {
                        event.preventDefault();

                        setMobileSubOpen(
                          subOpen
                            ? null
                            : item.label
                        );

                        return;
                      }

                      setMobileOpen(false);
                      setMobileSubOpen(null);
                    }}
                    className={[
                      "group relative flex",
                      "items-center justify-between",
                      "rounded-lg px-4 py-3",
                      "text-sm font-medium",
                      "transition-all duration-300",
                      active
                        ? "bg-white/10 text-primary-foreground ring-1 ring-white/15"
                        : "text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground",
                    ].join(" ")}
                  >
                    <span>
                      {item.label}
                    </span>

                    {hasChildren && (
                      <ChevronDown
                        className={[
                          "h-4 w-4",
                          "transition-transform duration-300",
                          subOpen
                            ? "rotate-180"
                            : "",
                        ].join(" ")}
                      />
                    )}
                  </Link>

                  {/* MOBILE SUBMENU */}

                  {hasChildren && (
                    <div
                      className={[
                        "grid overflow-hidden",
                        "transition-all duration-300",
                        subOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="min-h-0">
                        <div className="flex flex-col gap-1 py-1 pl-4">
                          {item.children!.map(
                            (
                              child,
                              index
                            ) => {
                              const childActive =
                                isChildActive(
                                  child
                                );

                              return (
                                <Link
                                  key={
                                    child.label
                                  }
                                  href={
                                    child.href
                                  }
                                  onClick={() => {
                                    setMobileOpen(
                                      false
                                    );

                                    setMobileSubOpen(
                                      null
                                    );
                                  }}
                                  className={[
                                    "group/mobile-item",
                                    "relative flex",
                                    "items-center",
                                    "overflow-hidden",
                                    "rounded-lg",
                                    "px-4 py-2.5",
                                    "text-sm",
                                    "transition-all duration-300",
                                    childActive
                                      ? "bg-white/10 font-semibold text-primary-foreground"
                                      : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground",
                                  ].join(
                                    " "
                                  )}
                                  style={{
                                    transitionDelay:
                                      subOpen
                                        ? `${index * 45}ms`
                                        : "0ms",
                                  }}
                                >
                                  {/* Active line */}

                                  <span
                                    className={[
                                      "absolute left-0",
                                      "inset-y-1.5",
                                      "w-[2px]",
                                      "rounded-full",
                                      "bg-accent",
                                      "transition-transform duration-300",
                                      childActive
                                        ? "scale-y-100"
                                        : "scale-y-0 group-hover/mobile-item:scale-y-100",
                                    ].join(
                                      " "
                                    )}
                                  />

                                  {/* Arrow */}

                                  <span
                                    className={[
                                      "mr-2",
                                      "text-accent",
                                      "opacity-0",
                                      "-translate-x-2",
                                      "transition-all duration-300",
                                      "group-hover/mobile-item:translate-x-0",
                                      "group-hover/mobile-item:opacity-100",
                                      childActive
                                        ? "translate-x-0 opacity-100"
                                        : "",
                                    ].join(
                                      " "
                                    )}
                                  >
                                    →
                                  </span>

                                  <span className="relative z-10 transition-transform duration-300 group-hover/mobile-item:translate-x-1">
                                    {
                                      child.label
                                    }
                                  </span>
                                </Link>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </header>

    </>
  );
}