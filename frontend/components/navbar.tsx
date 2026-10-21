// "use client";

// import { useEffect, useRef, useState } from "react";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Search,
//   Menu,
//   X,
//   ChevronDown,
// } from "lucide-react";
// import { SearchModal } from "./search-modal";

// type NavChild = {
//   href: string;
//   label: string;
// };

// type NavItem = {
//   href: string;
//   label: string;
//   children?: NavChild[];
// };

// const NAV_ITEMS: NavItem[] = [
//   {
//     href: "/",
//     label: "Beranda",
//   },
//   {
//     href: "#",
//     label: "Tentang JDIH",
//     children: [
//       {
//         href: "/struktur-organisasi",
//         label: "Struktur Organisasi",
//       },
//       {
//         href: "/tentang",
//         label: "Tentang JDIH",
//       },
//       {
//         href: "/sejarah",
//         label: "Sejarah",
//       },
//       {
//         href: "/dasar-hukum",
//         label: "Dasar Hukum",
//       },
//       {
//         href: "/jdih-perwakilan",
//         label: "JDIH Perwakilan",
//       },
//     ],
//   },
//   {
//     href: "/dokumen-hukum",
//     label: "Dokumen  Hukum",
//   },
//   {
//     href: "/galeri",
//     label: "Galeri",
//   },
//   {
//     href: "/kontak",
//     label: "Kontak",
//   },
//   {
//     href: "/chat",
//     label: "LARAS",
//   },
// ];

// function isPathActive(
//   pathname: string,
//   href: string
// ) {
//   if (!href || href === "#") {
//     return false;
//   }

//   if (href === "/") {
//     return pathname === "/";
//   }

//   return (
//     pathname === href ||
//     pathname.startsWith(`${href}/`)
//   );
// }

// export function Navbar() {
//   const pathname = usePathname();

//   const [searchOpen, setSearchOpen] =
//     useState(false);

//   const [mobileOpen, setMobileOpen] =
//     useState(false);

//   const [mobileSubOpen, setMobileSubOpen] =
//     useState<string | null>(null);

//   const [openDropdown, setOpenDropdown] =
//     useState<string | null>(null);

//   const [scrolled, setScrolled] =
//     useState(false);

//   const closeTimer =
//     useRef<ReturnType<typeof setTimeout> | null>(
//       null
//     );

//   /*
//    * =========================================================
//    * SCROLL HEADER
//    * =========================================================
//    */

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 24);
//     };

//     handleScroll();

//     window.addEventListener(
//       "scroll",
//       handleScroll,
//       {
//         passive: true,
//       }
//     );

//     return () => {
//       window.removeEventListener(
//         "scroll",
//         handleScroll
//       );
//     };
//   }, []);

//   /*
//    * =========================================================
//    * TUTUP MOBILE SAAT PINDAH HALAMAN
//    * =========================================================
//    */

//   useEffect(() => {
//     setMobileOpen(false);
//   }, [pathname]);

//   /*
//    * =========================================================
//    * CEK CHILD AKTIF
//    * =========================================================
//    */

//   function isChildActive(child: NavChild) {
//     return isPathActive(
//       pathname,
//       child.href
//     );
//   }

//   /*
//    * =========================================================
//    * CEK MENU AKTIF
//    * =========================================================
//    */

//   function isItemActive(item: NavItem) {
//     if (item.children?.length) {
//       return item.children.some((child) =>
//         isChildActive(child)
//       );
//     }

//     return isPathActive(
//       pathname,
//       item.href
//     );
//   }

//   /*
//    * =========================================================
//    * CEK PARENT MEMILIKI CHILD AKTIF
//    * =========================================================
//    */

//   function hasActiveChild(item: NavItem) {
//     if (!item.children?.length) {
//       return false;
//     }

//     return item.children.some((child) =>
//       isChildActive(child)
//     );
//   }

//   /*
//    * =========================================================
//    * BUKA DROPDOWN
//    * =========================================================
//    */

//   function openNow(label: string) {
//     if (closeTimer.current) {
//       clearTimeout(closeTimer.current);
//     }

//     setOpenDropdown(label);
//   }

//   /*
//    * =========================================================
//    * TUTUP DROPDOWN
//    * =========================================================
//    */

//   function closeSoon() {
//     if (closeTimer.current) {
//       clearTimeout(closeTimer.current);
//     }

//     closeTimer.current = setTimeout(() => {
//       setOpenDropdown(null);
//     }, 180);
//   }

//   /*
//    * =========================================================
//    * OTOMATIS BUKA PARENT AKTIF
//    * =========================================================
//    */

//   useEffect(() => {
//     const activeParent =
//       NAV_ITEMS.find((item) =>
//         hasActiveChild(item)
//       );

//     if (activeParent) {
//       setOpenDropdown(
//         activeParent.label
//       );

//       setMobileSubOpen(
//         activeParent.label
//       );
//     } else {
//       setOpenDropdown(null);
//       setMobileSubOpen(null);
//     }
//   }, [pathname]);

//   /*
//    * =========================================================
//    * RENDER
//    * =========================================================
//    */

//   return (
//     <>
//       <header
//         className={[
//           "sticky top-0 z-50",
//           "border-b",
//           "transition-all duration-500",
//           scrolled
//             ? "border-white/10 bg-primary/95 shadow-lg shadow-black/10 backdrop-blur-md"
//             : "border-transparent bg-primary",
//         ].join(" ")}
//       >
//         {/* =================================================
//             HEADER
//             ================================================= */}

//         <div
//           className={[
//             "mx-auto flex max-w-6xl",
//             "items-center justify-between",
//             "px-4 sm:px-6",
//             "transition-all duration-500",
//             scrolled
//               ? "h-16"
//               : "h-24",
//           ].join(" ")}
//         >
//           {/* =================================================
//               LOGO BIN
//               ================================================= */}

//           <Link
//             href="/"
//             className="group flex items-center gap-2.5 sm:gap-3 -translate-x-6 sm:-translate-x-12"
//           >
//             {/* Logo Kiri (logo1.png) */}
//             <span
//               className={[
//                 "relative flex shrink-0",
//                 "items-center justify-center",
//                 "transition-all duration-500",
//                 "group-hover:-translate-y-0.5",
//                 "group-hover:scale-105",
//                 scrolled
//                   ? "h-9 w-28 sm:h-10 sm:w-36"
//                   : "h-11 w-36 sm:h-13 sm:w-48",
//               ].join(" ")}
//             >
//               <Image
//                 src="/images/logo1.png"
//                 alt="Logo JDIH"
//                 width={200}
//                 height={60}
//                 priority
//                 className={[
//                   "relative z-10",
//                   "h-full w-full",
//                   "object-contain",
//                   "transition-all duration-500",
//                   "group-hover:scale-110",
//                 ].join(" ")}
//               />
//             </span>

//             {/* Logo BIN (Kanan) */}
//             <span
//               className={[
//                 "relative flex shrink-0",
//                 "items-center justify-center",
//                 "overflow-hidden",
//                 "transition-all duration-500",
//                 "group-hover:-translate-y-0.5",
//                 "group-hover:scale-105",
//                 scrolled
//                   ? "h-10 w-10 sm:h-11 sm:w-11"
//                   : "h-13 w-13 sm:h-14 sm:w-14",
//               ].join(" ")}
//             >
//               <Image
//                 src="/images/log.png"
//                 alt="Logo BIN"
//                 width={70}
//                 height={70}
//                 priority
//                 className={[
//                   "relative z-10",
//                   "h-full w-full",
//                   "object-contain",
//                   "transition-all duration-500",
//                   "group-hover:scale-110",
//                 ].join(" ")}
//               />

//               {/* Animasi shine */}
//               <span
//                 className={[
//                   "pointer-events-none",
//                   "absolute inset-0 z-20",
//                   "-translate-x-full",
//                   "bg-gradient-to-r",
//                   "from-transparent",
//                   "via-white/30",
//                   "to-transparent",
//                   "transition-transform duration-700",
//                   "group-hover:translate-x-full",
//                 ].join(" ")}
//               />
//             </span>

//             {/* Text Logo: JDIH BIN sejajar di tengah setara logo */}
//             <span className="flex items-center">
//               <span
//                 className={[
//                   "font-bold",
//                   "tracking-wide",
//                   "leading-none",
//                   "text-primary-foreground",
//                   "transition-all duration-500",
//                   scrolled
//                     ? "text-[16px] sm:text-[18px]"
//                     : "text-[20px] sm:text-[22px]",
//                 ].join(" ")}
//               >
//                 <span>JDIH</span>{" "}
//                 <span className="text-accent">BIN</span>
//               </span>
//             </span>
//           </Link>

//           {/* =================================================
//               DESKTOP NAVIGATION
//               ================================================= */}

//           <nav className="hidden h-full items-stretch gap-1 md:flex">
//             {NAV_ITEMS.map((item) => {
//               const active =
//                 isItemActive(item);

//               const hasChildren =
//                 !!item.children?.length;

//               const isOpen =
//                 openDropdown ===
//                 item.label;

//               const parentHasActiveChild =
//                 hasActiveChild(item);

//               return (
//                 <div
//                   key={item.label}
//                   className="relative flex h-full items-center"
//                   onMouseEnter={() => {
//                     if (hasChildren) {
//                       openNow(item.label);
//                     }
//                   }}
//                   onMouseLeave={() => {
//                     if (hasChildren) {
//                       closeSoon();
//                     }
//                   }}
//                 >
//                   {/* MENU UTAMA */}

//                   <Link
//                     href={
//                       hasChildren
//                         ? "#"
//                         : item.href
//                     }
//                     onClick={(event) => {
//                       if (hasChildren) {
//                         event.preventDefault();

//                         setOpenDropdown(
//                           isOpen
//                             ? null
//                             : item.label
//                         );
//                       }
//                     }}
//                     className={[
//                       "group relative flex",
//                       "items-center gap-1",
//                       "rounded-lg px-4 py-2.5",
//                       "text-sm font-medium",
//                       "transition-all duration-300",
//                       active
//                         ? "bg-white/10 text-primary-foreground ring-1 ring-white/15"
//                         : "text-primary-foreground/65 hover:bg-white/5 hover:text-primary-foreground",
//                     ].join(" ")}
//                   >
//                     <span className="relative z-10">
//                       {item.label}
//                     </span>

//                     {hasChildren && (
//                       <ChevronDown
//                         className={[
//                           "relative z-10",
//                           "h-3.5 w-3.5",
//                           "transition-transform duration-300",
//                           isOpen
//                             ? "rotate-180"
//                             : "",
//                         ].join(" ")}
//                       />
//                     )}

//                     {/* GARIS ACTIVE */}

//                     <span
//                       className={[
//                         "absolute inset-x-4",
//                         "-bottom-[1px]",
//                         "h-[2px]",
//                         "rounded-full",
//                         "bg-accent",
//                         "transition-transform duration-300",
//                         active
//                           ? "scale-x-100"
//                           : "scale-x-0 group-hover:scale-x-100",
//                       ].join(" ")}
//                     />
//                   </Link>

//                   {/* =================================================
//                       DROPDOWN
//                       ================================================= */}

//                   {hasChildren && (
//                     <div
//                       className={[
//                         "absolute left-1/2 top-full",
//                         "z-50 w-72",
//                         "-translate-x-1/2",
//                         "transition-all duration-300",
//                         isOpen
//                           ? "pointer-events-auto translate-y-0 opacity-100"
//                           : "pointer-events-none -translate-y-2 opacity-0",
//                       ].join(" ")}
//                     >
//                       <div
//                         className={[
//                           "overflow-hidden",
//                           "rounded-b-xl",
//                           "border border-white/10",
//                           "bg-primary",
//                           "shadow-2xl",
//                           "shadow-black/40",
//                         ].join(" ")}
//                       >
//                         {/* Garis aksen */}

//                         <div
//                           className={[
//                             "h-[2px]",
//                             "w-full",
//                             "bg-gradient-to-r",
//                             "from-transparent",
//                             "via-accent",
//                             "to-transparent",
//                           ].join(" ")}
//                         />

//                         <div className="p-2">
//                           {item.children!.map(
//                             (
//                               child,
//                               index
//                             ) => {
//                               const childActive =
//                                 isChildActive(
//                                   child
//                                 );

//                               return (
//                                 <Link
//                                   key={
//                                     child.label
//                                   }
//                                   href={
//                                     child.href
//                                   }
//                                   onClick={() => {
//                                     setOpenDropdown(
//                                       null
//                                     );
//                                   }}
//                                   className={[
//                                     "group/item",
//                                     "relative flex",
//                                     "items-center",
//                                     "overflow-hidden",
//                                     "rounded-lg",
//                                     "px-3 py-3",
//                                     "text-sm font-medium",
//                                     "transition-all duration-300",
//                                     childActive
//                                       ? "bg-white/10 text-primary-foreground"
//                                       : "text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground",
//                                   ].join(
//                                     " "
//                                   )}
//                                   style={{
//                                     transitionDelay:
//                                       isOpen
//                                         ? `${index * 45}ms`
//                                         : "0ms",
//                                   }}
//                                 >
//                                   {/* Background animasi */}

//                                   <span
//                                     className={[
//                                       "absolute inset-0",
//                                       "origin-left",
//                                       "scale-x-0",
//                                       "bg-white/[0.04]",
//                                       "transition-transform duration-300",
//                                       "group-hover/item:scale-x-100",
//                                     ].join(
//                                       " "
//                                     )}
//                                   />

//                                   {/* Active bar */}

//                                   <span
//                                     className={[
//                                       "absolute left-0",
//                                       "inset-y-2",
//                                       "w-[3px]",
//                                       "rounded-r-full",
//                                       "bg-accent",
//                                       "transition-transform duration-300",
//                                       childActive
//                                         ? "scale-y-100"
//                                         : "scale-y-0 group-hover/item:scale-y-100",
//                                     ].join(
//                                       " "
//                                     )}
//                                   />

//                                   {/* Arrow */}

//                                   <span
//                                     className={[
//                                       "relative z-10",
//                                       "mr-2",
//                                       "text-accent",
//                                       "opacity-0",
//                                       "-translate-x-2",
//                                       "transition-all duration-300",
//                                       "group-hover/item:translate-x-0",
//                                       "group-hover/item:opacity-100",
//                                       childActive
//                                         ? "translate-x-0 opacity-100"
//                                         : "",
//                                     ].join(
//                                       " "
//                                     )}
//                                   >
//                                     →
//                                   </span>

//                                   {/* Text */}

//                                   <span
//                                     className={[
//                                       "relative z-10",
//                                       "transition-transform duration-300",
//                                       "group-hover/item:translate-x-1",
//                                       childActive
//                                         ? "font-semibold text-primary-foreground"
//                                         : "",
//                                     ].join(
//                                       " "
//                                     )}
//                                   >
//                                     {
//                                       child.label
//                                     }
//                                   </span>
//                                 </Link>
//                               );
//                             }
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>
//           <div className="flex items-center gap-2">

//             <button
//               type="button"
//               onClick={() =>
//                 setMobileOpen(
//                   (value) => !value
//                 )
//               }
//               aria-label={
//                 mobileOpen
//                   ? "Tutup menu"
//                   : "Buka menu"
//               }
//               className={[
//                 "flex md:hidden",
//                 "h-10 w-10",
//                 "items-center justify-center",
//                 "rounded-lg",
//                 "text-primary-foreground",
//                 "transition-all duration-200",
//                 "hover:bg-white/10",
//                 "hover:scale-105",
//               ].join(" ")}
//             >
//               {mobileOpen ? (
//                 <X className="h-5 w-5" />
//               ) : (
//                 <Menu className="h-5 w-5" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* =================================================
//             MOBILE NAVIGATION
//             ================================================= */}

//         <nav
//           className={[
//             "overflow-hidden",
//             "border-t border-white/10",
//             "bg-primary",
//             "transition-all duration-300",
//             "md:hidden",
//             mobileOpen
//               ? "max-h-[800px] opacity-100"
//               : "max-h-0 opacity-0",
//           ].join(" ")}
//         >
//           <div className="flex flex-col gap-1 px-4 py-3">
//             {NAV_ITEMS.map((item) => {
//               const active =
//                 isItemActive(item);

//               const hasChildren =
//                 !!item.children?.length;

//               const subOpen =
//                 mobileSubOpen ===
//                 item.label;

//               return (
//                 <div
//                   key={item.label}
//                   className="overflow-hidden"
//                 >
//                   <Link
//                     href={
//                       hasChildren
//                         ? "#"
//                         : item.href
//                     }
//                     onClick={(event) => {
//                       if (hasChildren) {
//                         event.preventDefault();

//                         setMobileSubOpen(
//                           subOpen
//                             ? null
//                             : item.label
//                         );

//                         return;
//                       }

//                       setMobileOpen(false);
//                       setMobileSubOpen(null);
//                     }}
//                     className={[
//                       "group relative flex",
//                       "items-center justify-between",
//                       "rounded-lg px-4 py-3",
//                       "text-sm font-medium",
//                       "transition-all duration-300",
//                       active
//                         ? "bg-white/10 text-primary-foreground ring-1 ring-white/15"
//                         : "text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground",
//                     ].join(" ")}
//                   >
//                     <span>
//                       {item.label}
//                     </span>

//                     {hasChildren && (
//                       <ChevronDown
//                         className={[
//                           "h-4 w-4",
//                           "transition-transform duration-300",
//                           subOpen
//                             ? "rotate-180"
//                             : "",
//                         ].join(" ")}
//                       />
//                     )}
//                   </Link>

//                   {/* MOBILE SUBMENU */}

//                   {hasChildren && (
//                     <div
//                       className={[
//                         "grid overflow-hidden",
//                         "transition-all duration-300",
//                         subOpen
//                           ? "grid-rows-[1fr] opacity-100"
//                           : "grid-rows-[0fr] opacity-0",
//                       ].join(" ")}
//                     >
//                       <div className="min-h-0">
//                         <div className="flex flex-col gap-1 py-1 pl-4">
//                           {item.children!.map(
//                             (
//                               child,
//                               index
//                             ) => {
//                               const childActive =
//                                 isChildActive(
//                                   child
//                                 );

//                               return (
//                                 <Link
//                                   key={
//                                     child.label
//                                   }
//                                   href={
//                                     child.href
//                                   }
//                                   onClick={() => {
//                                     setMobileOpen(
//                                       false
//                                     );

//                                     setMobileSubOpen(
//                                       null
//                                     );
//                                   }}
//                                   className={[
//                                     "group/mobile-item",
//                                     "relative flex",
//                                     "items-center",
//                                     "overflow-hidden",
//                                     "rounded-lg",
//                                     "px-4 py-2.5",
//                                     "text-sm",
//                                     "transition-all duration-300",
//                                     childActive
//                                       ? "bg-white/10 font-semibold text-primary-foreground"
//                                       : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground",
//                                   ].join(
//                                     " "
//                                   )}
//                                   style={{
//                                     transitionDelay:
//                                       subOpen
//                                         ? `${index * 45}ms`
//                                         : "0ms",
//                                   }}
//                                 >
//                                   {/* Active line */}

//                                   <span
//                                     className={[
//                                       "absolute left-0",
//                                       "inset-y-1.5",
//                                       "w-[2px]",
//                                       "rounded-full",
//                                       "bg-accent",
//                                       "transition-transform duration-300",
//                                       childActive
//                                         ? "scale-y-100"
//                                         : "scale-y-0 group-hover/mobile-item:scale-y-100",
//                                     ].join(
//                                       " "
//                                     )}
//                                   />

//                                   {/* Arrow */}

//                                   <span
//                                     className={[
//                                       "mr-2",
//                                       "text-accent",
//                                       "opacity-0",
//                                       "-translate-x-2",
//                                       "transition-all duration-300",
//                                       "group-hover/mobile-item:translate-x-0",
//                                       "group-hover/mobile-item:opacity-100",
//                                       childActive
//                                         ? "translate-x-0 opacity-100"
//                                         : "",
//                                     ].join(
//                                       " "
//                                     )}
//                                   >
//                                     →
//                                   </span>

//                                   <span className="relative z-10 transition-transform duration-300 group-hover/mobile-item:translate-x-1">
//                                     {
//                                       child.label
//                                     }
//                                   </span>
//                                 </Link>
//                               );
//                             }
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </nav>
//       </header>

//     </>
//   );
// }
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

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
    label: "Dokumen Hukum",
  },
  {
    href: "/galeri",
    label: "Galeri",
  },
  {
    href: "/kontak",
    label: "Kontak",
  },
  {
    href: "/chat",
    label: "LARAS",
  },
];

function isPathActive(pathname: string, href: string) {
  if (!href || href === "#") {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSubOpen(null);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  function isChildActive(child: NavChild) {
    return isPathActive(pathname, child.href);
  }

  function isItemActive(item: NavItem) {
    if (item.children?.length) {
      return item.children.some((child) => isChildActive(child));
    }

    return isPathActive(pathname, item.href);
  }

  function hasActiveChild(item: NavItem) {
    if (!item.children?.length) {
      return false;
    }

    return item.children.some((child) => isChildActive(child));
  }

  function openNow(label: string) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setOpenDropdown(label);
  }

  function closeSoon() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    closeTimer.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  }

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full border-b",
        "transition-all duration-300",
        scrolled
          ? "border-white/10 bg-primary/95 shadow-lg shadow-black/10 backdrop-blur-md"
          : "border-transparent bg-primary",
      ].join(" ")}
    >
      <div
        className={[
          "relative mx-auto flex w-full max-w-7xl",
          "items-center justify-between",
          "px-3 min-[380px]:px-4 sm:px-6 lg:px-8",
          "transition-all duration-300",
          scrolled ? "h-16" : "h-20 sm:h-24",
        ].join(" ")}
      >
        <Link
  href="/"
  aria-label="Beranda JDIH BIN"
  className={[
    "absolute left-1/2 top-1/2 z-10",
    "-translate-x-1/2 -translate-y-1/2",
    "flex max-w-[calc(100%-56px)] items-center",
    "gap-1 min-[380px]:gap-1.5 sm:gap-2 lg:gap-3",
    "transition-all duration-300",
    "lg:static lg:max-w-none lg:translate-x-0 lg:translate-y-0",
  ].join(" ")}
>
  <span
    className={[
      "relative flex min-w-0 shrink items-center justify-center",
      "transition-all duration-300",
      scrolled
        ? "h-7 w-[clamp(48px,19vw,112px)] sm:h-9 sm:w-28 lg:h-10 lg:w-36"
        : "h-8 w-[clamp(56px,22vw,128px)] sm:h-10 sm:w-36 lg:h-13 lg:w-48",
    ].join(" ")}
  >
    <Image
      src="/images/logo1.png"
      alt="Logo JDIH"
      width={200}
      height={60}
      priority
      sizes="(max-width: 379px) 22vw, (max-width: 639px) 128px, (max-width: 1023px) 144px, 192px"
      className="h-full w-full object-contain"
    />
  </span>

  <span
    className={[
      "relative flex shrink-0 items-center justify-center",
      "transition-all duration-300",
      scrolled
        ? "h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
        : "h-8 w-8 sm:h-10 sm:w-10 lg:h-14 lg:w-14",
    ].join(" ")}
  >
    <Image
      src="/images/log.png"
      alt="Logo BIN"
      width={70}
      height={70}
      priority
      sizes="(max-width: 639px) 32px, (max-width: 1023px) 40px, 56px"
      className="h-full w-full object-contain"
    />
  </span>

  <span className="hidden shrink-0 items-center sm:flex">
    <span
      className={[
        "whitespace-nowrap font-bold leading-none tracking-wide",
        "text-primary-foreground transition-all duration-300",
        scrolled
          ? "text-sm sm:text-base lg:text-lg"
          : "text-base sm:text-lg lg:text-[22px]",
      ].join(" ")}
    >
      <span>JDIH</span>{" "}
      <span className="text-accent">BIN</span>
    </span>
  </span>
</Link>

        <nav className="hidden h-full items-stretch gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openDropdown === item.label;
            const parentHasActiveChild = hasActiveChild(item);

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
                <Link
                  href={hasChildren ? "#" : item.href}
                  onClick={(event) => {
                    if (hasChildren) {
                      event.preventDefault();
                      setOpenDropdown(isOpen ? null : item.label);
                    }
                  }}
                  className={[
                    "group relative flex items-center gap-1",
                    "rounded-lg px-3 py-2.5 xl:px-4",
                    "text-sm font-medium transition-all duration-300",
                    active || parentHasActiveChild
                      ? "bg-white/10 text-primary-foreground ring-1 ring-white/15"
                      : "text-primary-foreground/65 hover:bg-white/5 hover:text-primary-foreground",
                  ].join(" ")}
                >
                  <span className="relative z-10">{item.label}</span>

                  {hasChildren && (
                    <ChevronDown
                      className={[
                        "relative z-10 h-3.5 w-3.5",
                        "transition-transform duration-300",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  )}

                  <span
                    className={[
                      "absolute inset-x-4 -bottom-px",
                      "h-[2px] rounded-full bg-accent",
                      "transition-transform duration-300",
                      active || parentHasActiveChild
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    ].join(" ")}
                  />
                </Link>

                {hasChildren && (
                  <div
                    className={[
                      "absolute left-1/2 top-full z-50 w-72",
                      "-translate-x-1/2 transition-all duration-300",
                      isOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-2 opacity-0",
                    ].join(" ")}
                  >
                    <div className="overflow-hidden rounded-b-xl border border-white/10 bg-primary shadow-2xl shadow-black/40">
                      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent to-transparent" />

                      <div className="p-2">
                        {item.children!.map((child, index) => {
                          const childActive = isChildActive(child);

                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => setOpenDropdown(null)}
                              style={{
                                transitionDelay: isOpen
                                  ? `${index * 45}ms`
                                  : "0ms",
                              }}
                              className={[
                                "group/item relative flex items-center",
                                "overflow-hidden rounded-lg px-3 py-3",
                                "text-sm font-medium transition-all duration-300",
                                childActive
                                  ? "bg-white/10 text-primary-foreground"
                                  : "text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground",
                              ].join(" ")}
                            >
                              <span className="absolute inset-0 origin-left scale-x-0 bg-white/[0.04] transition-transform duration-300 group-hover/item:scale-x-100" />

                              <span
                                className={[
                                  "absolute left-0 inset-y-2 w-[3px]",
                                  "rounded-r-full bg-accent",
                                  "transition-transform duration-300",
                                  childActive
                                    ? "scale-y-100"
                                    : "scale-y-0 group-hover/item:scale-y-100",
                                ].join(" ")}
                              />

                              <span
                                className={[
                                  "relative z-10 mr-2 text-accent",
                                  "opacity-0 -translate-x-2",
                                  "transition-all duration-300",
                                  "group-hover/item:translate-x-0",
                                  "group-hover/item:opacity-100",
                                  childActive
                                    ? "translate-x-0 opacity-100"
                                    : "",
                                ].join(" ")}
                              >
                                →
                              </span>

                              <span
                                className={[
                                  "relative z-10 transition-transform duration-300",
                                  "group-hover/item:translate-x-1",
                                  childActive
                                    ? "font-semibold text-primary-foreground"
                                    : "",
                                ].join(" ")}
                              >
                                {child.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="relative z-20 ml-auto flex shrink-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            className={[
              "flex h-10 w-10 items-center justify-center",
              "rounded-lg text-primary-foreground",
              "transition-all duration-200",
              "hover:bg-white/10 hover:scale-105",
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

      <nav
        className={[
          "overflow-hidden border-t border-white/10 bg-primary",
          "transition-all duration-300 lg:hidden",
          mobileOpen
            ? "max-h-[1000px] opacity-100"
            : "max-h-0 border-t-transparent opacity-0",
        ].join(" ")}
      >
        <div className="flex flex-col gap-1 px-4 py-3 sm:px-6">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const hasChildren = Boolean(item.children?.length);
            const subOpen = mobileSubOpen === item.label;
            const parentHasActiveChild = hasActiveChild(item);

            return (
              <div key={item.label} className="overflow-hidden">
                <Link
                  href={hasChildren ? "#" : item.href}
                  onClick={(event) => {
                    if (hasChildren) {
                      event.preventDefault();
                      setMobileSubOpen(subOpen ? null : item.label);
                      return;
                    }

                    setMobileOpen(false);
                    setMobileSubOpen(null);
                  }}
                  className={[
                    "group relative flex items-center justify-between",
                    "rounded-lg px-4 py-3",
                    "text-sm font-medium transition-all duration-300",
                    active || parentHasActiveChild
                      ? "bg-white/10 text-primary-foreground ring-1 ring-white/15"
                      : "text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground",
                  ].join(" ")}
                >
                  <span>{item.label}</span>

                  {hasChildren && (
                    <ChevronDown
                      className={[
                        "h-4 w-4 transition-transform duration-300",
                        subOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  )}
                </Link>

                {hasChildren && (
                  <div
                    className={[
                      "grid overflow-hidden transition-all duration-300",
                      subOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}
                  >
                    <div className="min-h-0">
                      <div className="flex flex-col gap-1 py-1 pl-4">
                        {item.children!.map((child, index) => {
                          const childActive = isChildActive(child);

                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => {
                                setMobileOpen(false);
                                setMobileSubOpen(null);
                              }}
                              style={{
                                transitionDelay: subOpen
                                  ? `${index * 45}ms`
                                  : "0ms",
                              }}
                              className={[
                                "group/mobile-item relative flex items-center",
                                "overflow-hidden rounded-lg px-4 py-2.5",
                                "text-sm transition-all duration-300",
                                childActive
                                  ? "bg-white/10 font-semibold text-primary-foreground"
                                  : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "absolute left-0 inset-y-1.5 w-[2px]",
                                  "rounded-full bg-accent",
                                  "transition-transform duration-300",
                                  childActive
                                    ? "scale-y-100"
                                    : "scale-y-0 group-hover/mobile-item:scale-y-100",
                                ].join(" ")}
                              />

                              <span
                                className={[
                                  "mr-2 text-accent opacity-0 -translate-x-2",
                                  "transition-all duration-300",
                                  "group-hover/mobile-item:translate-x-0",
                                  "group-hover/mobile-item:opacity-100",
                                  childActive
                                    ? "translate-x-0 opacity-100"
                                    : "",
                                ].join(" ")}
                              >
                                →
                              </span>

                              <span className="relative z-10 transition-transform duration-300 group-hover/mobile-item:translate-x-1">
                                {child.label}
                              </span>
                            </Link>
                          );
                        })}
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
  );
}