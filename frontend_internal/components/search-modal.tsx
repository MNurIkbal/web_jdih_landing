
// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { Search, ChevronDown, X } from 'lucide-react'
// import { cn } from '@/lib/utils'

// interface SearchModalProps {
//   open: boolean
//   onClose: () => void
// }

// const KATEGORI = [
//   'Peraturan BPK',
//   'Undang-Undang',
//   'Peraturan Presiden',
//   'Peraturan Kepala BIN',
// ]

// const TAHUN = Array.from({ length: 12 }, (_, i) => String(2026 - i))

// const BIDANG = [
//   'Bidang Hukum',
//   'Kelembagaan',
//   'Administrasi Negara',
//   'Pertahanan & Keamanan',
// ]

// export function SearchModal({ open, onClose }: SearchModalProps) {
//   const router = useRouter()
//   const inputRef = useRef<HTMLInputElement>(null)

//   const [keyword, setKeyword] = useState('')
//   const [kategori, setKategori] = useState('')
//   const [tahun, setTahun] = useState('')
//   const [bidang, setBidang] = useState('')

//   useEffect(() => {
//     if (open) {
//       const t = setTimeout(() => inputRef.current?.focus(), 150)

//       const onKey = (e: KeyboardEvent) =>
//         e.key === 'Escape' && onClose()

//       document.addEventListener('keydown', onKey)
//       document.body.style.overflow = 'hidden'

//       return () => {
//         clearTimeout(t)
//         document.removeEventListener('keydown', onKey)
//         document.body.style.overflow = ''
//       }
//     }
//   }, [open, onClose])

//   if (!open) return null

//   function handleCari() {
//     const params = new URLSearchParams()

//     if (keyword) params.set('q', keyword)
//     if (kategori) params.set('kategori', kategori)
//     if (tahun) params.set('tahun', tahun)
//     if (bidang) params.set('bidang', bidang)

//     router.push(`/pencarian?${params.toString()}`)
//     onClose()
//   }

//   return (
//     <div
//       className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/40 backdrop-blur-md px-4 pt-24 sm:pt-32 animate-fade-in"
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget) onClose()
//       }}
//     >
//       <div className="w-full max-w-5xl">

//         <div className="mb-3 flex justify-end">
//           <button
//             onClick={onClose}
//             aria-label="Tutup pencarian"
//             className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-card transition-colors hover:bg-gray-100"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* CARD PUTIH - FORM TIDAK DIUBAH */}
//         <div className="animate-scale-in rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/10">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">

//             <div className="flex flex-1 items-center gap-3 px-3 py-2.5">
//               <Search className="h-5 w-5 shrink-0 text-muted-foreground" />

//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={keyword}
//                 onChange={(e) => setKeyword(e.target.value)}
//                 onKeyDown={(e) =>
//                   e.key === 'Enter' && handleCari()
//                 }
//                 placeholder="Kata kunci ..."
//                 className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
//               />
//             </div>

//             <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />

//             <FilterSelect
//               value={kategori}
//               onChange={setKategori}
//               placeholder="Peraturan BPK"
//               options={KATEGORI}
//             />

//             <FilterSelect
//               value={tahun}
//               onChange={setTahun}
//               placeholder="Tahun"
//               options={TAHUN}
//             />

//             <FilterSelect
//               value={bidang}
//               onChange={setBidang}
//               placeholder="Bidang Hukum"
//               options={BIDANG}
//             />

//             <button
//               onClick={handleCari}
//               className="shrink-0 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:brightness-110 sm:ml-1"
//             >
//               Cari
//             </button>

//           </div>
//         </div>

//         <p className="mt-4 text-center text-xs text-background/80">
//           Tekan{' '}
//           <kbd className="rounded bg-background/15 px-1.5 py-0.5">
//             Esc
//           </kbd>{' '}
//           untuk menutup pencarian
//         </p>
//       </div>
//     </div>
//   )
// }

// function FilterSelect({
//   value,
//   onChange,
//   placeholder,
//   options,
// }: {
//   value: string
//   onChange: (v: string) => void
//   placeholder: string
//   options: string[]
// }) {
//   return (
//     <div className="relative shrink-0">
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className={cn(
//           'w-full cursor-pointer appearance-none rounded-lg bg-transparent py-2.5 pl-3 pr-8 text-sm font-medium text-foreground/80 outline-none transition-colors hover:text-foreground sm:w-auto'
//         )}
//       >
//         <option value="">{placeholder}</option>

//         {options.map((o) => (
//           <option key={o} value={o}>
//             {o}
//           </option>
//         ))}
//       </select>

//       <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//     </div>
//   )
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const KATEGORI = [
  {
    value: "Perundang-Undangan",
    label: "Perundang-Undangan",
  },
  {
    value: "Keputusan",
    label: "Keputusan",
  },
  {
    value: "Peraturan",
    label: "Peraturan",
  },
];

const TAHUN = Array.from(
  { length: 15 },
  (_, i) => String(2026 - i),
);

const BIDANG = [
  {
    value: "hukum-umum",
    label: "Hukum Umum",
  },
  {
    value: "hukum-adat",
    label: "Hukum Adat",
  },
  {
    value: "hukum-agraria",
    label: "Hukum Agraria",
  },
  {
    value: "hukum-administrasi-negara",
    label: "Hukum Administrasi Negara",
  },
  {
    value: "hukum-keuangan-negara",
    label: "Hukum Keuangan Negara",
  },
  {
    value: "hukum-kepegawaian",
    label: "Hukum Kepegawaian",
  },
  {
    value: "hukum-tata-negara",
    label: "Hukum Tata Negara",
  },
];

export function SearchModal({
  open,
  onClose,
}: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState("");
  const [kategori, setKategori] = useState("");
  const [tahun, setTahun] = useState("");
  const [bidang, setBidang] = useState("");

  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleCari() {
    const params = new URLSearchParams();

    const cleanKeyword = keyword.trim();

    if (cleanKeyword) {
      params.set("search", cleanKeyword);
    }

    if (kategori) {
      params.set("kategori", kategori);
    }

    if (tahun) {
      params.set("tahun", tahun);
    }

    if (bidang) {
      params.set("bidang", bidang);
    }

    params.set("page", "1");
    params.set("size", "10");

    router.push(
      `/dokumen-hukum?${params.toString()}`,
    );

    onClose();
  }

  function handleReset() {
    setKeyword("");
    setKategori("");
    setTahun("");
    setBidang("");
  }

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-start justify-center
        bg-foreground/40
        px-4 pt-24
        backdrop-blur-md
        animate-fade-in
        sm:pt-32
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-5xl">
        {/* CLOSE */}
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pencarian"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-full
              bg-white
              text-foreground
              shadow-card
              transition-all
              hover:bg-gray-100
              hover:scale-105
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SEARCH CARD */}
        <div
          className="
            animate-scale-in
            rounded-2xl
            bg-white
            p-3
            shadow-2xl
            ring-1 ring-black/10
          "
        >
          <div
            className="
              flex flex-col gap-4
              sm:flex-row
              sm:items-center
              sm:gap-2
            "
          >
            {/* KEYWORD */}
            <div
              className="
                flex flex-1
                items-center gap-3
                rounded-lg
                px-3 py-2.5
              "
            >
              <Search
                className="
                  h-5 w-5
                  shrink-0
                  text-muted-foreground
                "
              />

              <input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={(e) =>
                  setKeyword(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCari();
                  }
                }}
                placeholder="Cari produk hukum..."
                className="
                  w-full
                  bg-transparent
                  text-sm
                  text-foreground
                  placeholder:text-muted-foreground
                  focus:outline-none
                "
              />
            </div>

            <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />

            {/* KATEGORI */}
            <FilterSelect
              value={kategori}
              onChange={setKategori}
              placeholder="Kategori"
              options={KATEGORI}
            />

            {/* TAHUN */}
            <FilterSelect
              value={tahun}
              onChange={setTahun}
              placeholder="Tahun"
              options={TAHUN.map((tahun) => ({
                value: tahun,
                label: tahun,
              }))}
            />

            {/* BIDANG */}
            <FilterSelect
              value={bidang}
              onChange={setBidang}
              placeholder="Bidang Hukum"
              options={BIDANG}
            />

            {/* CARI */}
            <button
              type="button"
              onClick={handleCari}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-7 py-3
                text-sm
                font-semibold
                text-primary-foreground
                transition-all
                hover:-translate-y-0.5
                hover:brightness-110
                hover:shadow-lg
                sm:ml-1
              "
            >
              <Search className="h-4 w-4" />
              Cari
            </button>
          </div>
        </div>

        {/* RESET */}
        {(keyword ||
          kategori ||
          tahun ||
          bidang) && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="
                text-xs
                text-background/80
                underline
                underline-offset-4
                transition-colors
                hover:text-white
              "
            >
              Reset pencarian
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-background/80">
          Tekan{" "}
          <kbd className="rounded bg-background/15 px-1.5 py-0.5">
            Esc
          </kbd>{" "}
          untuk menutup pencarian
        </p>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={cn(
          `
            w-full
            cursor-pointer
            appearance-none
            rounded-lg
            bg-transparent
            py-2.5
            pl-3
            pr-8
            text-sm
            font-medium
            text-foreground/80
            outline-none
            transition-colors
            hover:text-foreground
            sm:w-auto
          `,
        )}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          right-2
          top-1/2
          h-4 w-4
          -translate-y-1/2
          text-muted-foreground
        "
      />
    </div>
  );
}