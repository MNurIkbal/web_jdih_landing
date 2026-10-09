"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  Scale,
  BookOpen,
  Gavel,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useWebKontakHookAll } from "@/feature/web";
import Image from "next/image";

const TAUTAN = [
  { href: "/", label: "Beranda" },
  { href: "/dokumen-hukum", label: "Dokumen Hukum" },
  { href: "/kontak", label: "Kontak" },
  { href: "/chat", label: "ACS" },
];

const LAYANAN = [
  { href: "#", label: "Produk Hukum" },
  { href: "#", label: "Dokumentasi Hukum" },
  { href: "#", label: "Informasi Hukum" },
  { href: "#", label: "Pencarian Dokumen" },
  { href: "#", label: "Permohonan Informasi" },
];

export function SiteFooter() {
  const { data, isLoading, isError } = useWebKontakHookAll();

  const alamat = (data as any)?.data?.alamat ?? "";
  const no_hp = (data as any)?.data?.no_hp ?? "";
  const email = (data as any)?.data?.email ?? "";
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative mt-auto overflow-hidden bg-primary text-white">
      <div
        className="
          pointer-events-none
          absolute
          -right-40
          -top-40
          h-[600px]
          w-[600px]
          rounded-full
          bg-blue-500/10
          blur-[100px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[25%]
          top-[35%]
          h-[300px]
          w-[300px]
          rounded-full
          bg-cyan-400/5
          blur-[90px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-30px]
          top-16
          hidden
          h-[500px]
          w-[520px]
          lg:block
          xl:right-0
        "
      >
        <div
          className="
            absolute
            right-16
            top-10
            h-[360px]
            w-[360px]
            rounded-full
            border
            border-white/[0.04]
          "
        />

        <div
          className="
            absolute
            right-28
            top-20
            h-[300px]
            w-[300px]
            rounded-full
            border
            border-white/[0.04]
          "
        />

        <div
          className="
            absolute
            bottom-12
            right-10
            h-[125px]
            w-[260px]
            rotate-[-4deg]
            rounded-xl
            border
            border-blue-200/10
            bg-gradient-to-br
            from-white/[0.10]
            to-white/[0.02]
            shadow-2xl
            backdrop-blur-sm
          "
        >
          <div
            className="
              absolute
              bottom-0
              left-0
              top-0
              w-5
              rounded-l-xl
              border-r
              border-white/10
              bg-blue-200/5
            "
          />

          <div className="flex h-full flex-col justify-center pl-10">
            <BookOpen
              className="
                mb-2
                h-7
                w-7
                text-blue-200/35
              "
            />

            <span
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-white/45
              "
            >
              Peraturan
            </span>

            <span
              className="
                mt-1
                text-[10px]
                uppercase
                tracking-wider
                text-white/25
              "
            >
              Perundang-undangan
            </span>
          </div>
        </div>

        <div
          className="
            absolute
            right-20
            top-20
            flex
            h-[260px]
            w-[260px]
            items-center
            justify-center
          "
        >
          <div
            className="
              absolute
              h-[220px]
              w-[220px]
              rounded-full
              bg-blue-400/[0.025]
              blur-2xl
            "
          />

          <Scale
            className="
              relative
              h-[185px]
              w-[185px]
              rotate-[-2deg]
              text-blue-100/20
              stroke-[1]
            "
          />
        </div>


        <div
          className="
            absolute
            bottom-4
            left-16
            rotate-[-35deg]
          "
        >
          <Gavel
            className="
              h-[120px]
              w-[120px]
              text-blue-100/15
              stroke-[1]
            "
          />
        </div>

        <div
          className="
            absolute
            right-28
            top-4
            rounded-full
            border
            border-white/10
            bg-white/[0.03]
            p-3
          "
        >
          <ShieldCheck
            className="
              h-6
              w-6
              text-blue-200/25
            "
          />
        </div>

        <div
          className="
            absolute
            -bottom-2
            right-[-100px]
            h-24
            w-[650px]
            rotate-[-5deg]
            rounded-[50%]
            border-t
            border-blue-300/10
          "
        />

        <div
          className="
            absolute
            bottom-5
            right-[-100px]
            h-24
            w-[650px]
            rotate-[-5deg]
            rounded-[50%]
            border-t
            border-blue-300/[0.07]
          "
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div
          className="
            grid
            grid-cols-1
            gap-12

            sm:grid-cols-2

            lg:grid-cols-[1.55fr_0.8fr_1fr_0.9fr]
            lg:gap-0
          "
        >
          <div
            className="
              max-w-md
              lg:pr-12
            "
          >
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/images/log.png"
                alt="Logo JDIH BIN"
                height={100}
                width={100}
                className="
                  h-14
                  w-14
                  rounded-xl
                  object-cover
                  shadow-lg
                "
              />

              <div>
                <div
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-white
                  "
                >
                  JDIH
                </div>
                <div
                  className="
                    mt-0.5
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.22em]
                    text-white/50
                  "
                >
                  BADAN INTELIJEN NEGARA
                </div>
              </div>
            </Link>

            <div className="mt-6">
              <p
                className="
                  max-w-sm
                  text-sm
                  leading-7
                  text-white
                "
              >
                Jaringan Dokumentasi dan Informasi Hukum Badan Intelijen Negara
                Republik Indonesia merupakan portal resmi yang menyediakan
                dokumentasi dan informasi hukum secara terintegrasi, mudah
                diakses, dan terpercaya.
              </p>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-white
                "
              >
                <ShieldCheck
                  className="
                    h-4
                    w-4
                    text-blue-300/60
                  "
                />

                <span>Informasi Hukum Resmi dan Terpercaya</span>
              </div>
            </div>
          </div>

          <div
            className="
              border-white/10
              sm:border-l
              sm:pl-8
              lg:pl-10
            "
          >
            <h3 className="text-base font-semibold text-white">Tautan</h3>

            <div className="mt-2 h-px w-8 bg-blue-400" />

            <ul className="mt-6 space-y-4">
              {TAUTAN.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-white
                      transition-all
                      duration-200
                      hover:translate-x-1
                      hover:text-white
                    "
                  >
                    <span
                      className="
                        h-1
                        w-1
                        shrink-0
                        rounded-full
                        bg-white/30
                        transition-all
                        group-hover:w-3
                        group-hover:bg-blue-400
                      "
                    />

                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="
              border-white/10
              lg:border-l
              lg:pl-10
            "
          >
            <h3 className="text-base font-semibold text-white">Layanan</h3>

            <div className="mt-2 h-px w-8 bg-blue-400" />

            <ul className="mt-6 space-y-4">
              {LAYANAN.map((item) => (
                <li key={item.label}>
                  <p
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-white
                      transition-all
                      duration-200
                      hover:translate-x-1
                      hover:text-white
                    "
                  >
                    <span
                      className="
                        h-1
                        w-1
                        shrink-0
                        rounded-full
                        bg-white/30
                        transition-all
                        group-hover:w-3
                        group-hover:bg-blue-400
                      "
                    />

                    {item.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="
              border-white/10
              lg:border-l
              lg:pl-10
            "
          >
            <h3 className="text-base font-semibold text-white">Kontak</h3>

            <div className="mt-2 h-px w-8 bg-blue-400" />

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <MapPin
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-white
                  "
                />

                <p
                  className="
                    text-sm
                    leading-relaxed
                    text-white
                  "
                >
                  {alamat || ""}
                </p>
              </div>
              <div className="flex gap-3">
                <Phone
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-white
                  "
                />

                <a
                  href="tel:0217806000"
                  className="
                    text-sm
                    text-white
                    transition-colors
                    hover:text-white
                  "
                >
                  {no_hp || ""}
                </a>
              </div>

              {/* Email */}
              <div className="flex gap-3">
                <Mail
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-white
                  "
                />

                <a
                  href={"mailto:" + email}
                  className="
                    break-all
                    text-sm
                    text-white
                    transition-colors
                    hover:text-white
                  "
                >
                  {email || ""}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10">
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-2
            px-6
            py-5
            text-xs
            text-white
            sm:flex-row
            sm:items-center
            sm:justify-between

            lg:px-10
          "
        >
          <p>
            © {new Date().getFullYear()} Jaringan Dokumentasi dan Informasi
            Hukum
          </p>

          <p>Portal Resmi JDIH BIN</p>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
        className={`
          fixed
          bottom-6
          right-6
          z-50
          flex
          bg-primary
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          border
          border-white/20
          text-white
          shadow-xl
          backdrop-blur-md
          transition-all
          duration-300
          hover:-translate-y-1
          hover:bg-white
          hover:text-[#031b49]
          hover:shadow-2xl
          cursor-pointer
          focus:outline-none
          focus:ring-2
          focus:ring-white/50

          ${
            showScrollTop
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }
        `}
      >
        <ArrowUp className="h-5 w-5 stroke-[2.5]  " />
      </button>
    </footer>
  );
}
