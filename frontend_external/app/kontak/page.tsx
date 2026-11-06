"use client";

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Building2,
  MessageSquare,
} from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { useWebKontakHookAll } from "@/feature/web";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

export default function KontakContent() {
  const { data, isLoading, isError } = useWebKontakHookAll();

  const kontak = (data as any)?.data;
  const alamat = kontak?.alamat || "Informasi alamat belum tersedia";

  const telepon =
    kontak?.no_hp || kontak?.no_hp || "Informasi telepon belum tersedia";

  const email = kontak?.email || "Informasi email belum tersedia";

  const jamLayanan = "Senin - Jumat: 08.00 - 16.00 WIB";

  const infos = [
    {
      icon: MapPin,
      title: "Alamat",
      value: alamat,
      description: "Lokasi kantor JDIH BIN",
    },
    {
      icon: Phone,
      title: "Telepon",
      value: telepon,
      description: "Hubungi kami melalui telepon",
    },
    {
      icon: Mail,
      title: "Email",
      value: email,
      description: "Kirim pertanyaan melalui email",
    },
    {
      icon: Clock,
      title: "Jam Layanan",
      value: jamLayanan,
      description: "Waktu pelayanan informasi",
    },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-8 w-44 animate-pulse rounded bg-muted" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
            <div className="h-[460px] animate-pulse rounded-2xl bg-muted" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.06] via-background to-secondary/40">
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="absolute -bottom-32 left-[38%] h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

            <div className="absolute right-[8%] top-1/2 hidden -translate-y-1/2 lg:block">
              <div className="relative h-40 w-40">
                <div className="absolute right-0 top-0 h-24 w-32 rounded-2xl border border-primary/10 bg-background/20 rotate-6" />

                <div className="absolute bottom-0 left-0 h-24 w-32 rounded-2xl border border-primary/10 bg-background/20 -rotate-6" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary backdrop-blur-sm">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-9">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <MessageSquare className="h-5 w-5" />

                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                </div>

                <div>
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    JDIH BIN
                  </p>

                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    Hubungi Kami
                  </h1>

                  <div className="mt-1.5 h-0.5 w-10 rounded-full bg-primary" />
                </div>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                Silakan gunakan informasi di bawah ini untuk menghubungi
                Jaringan Dokumentasi dan Informasi Hukum Badan Intelijen Negara.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Beranda</span>

                <span className="text-primary">/</span>

                <span>Kontak</span>
              </div>
            </div>

            <div className="absolute bottom-0 right-8 hidden items-end gap-1 lg:flex">
              <span className="h-5 w-1 rounded-t-full bg-primary/10" />
              <span className="h-8 w-1 rounded-t-full bg-primary/15" />
              <span className="h-12 w-1 rounded-t-full bg-primary/20" />
              <span className="h-16 w-1 rounded-t-full bg-primary/25" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {isError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
              Data kontak tidak dapat dimuat. Silakan coba kembali beberapa saat
              lagi.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {infos.map((info) => {
                const Icon = info.icon;

                return (
                  <div
                    key={info.title}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        {info.title}
                      </p>

                      <p className="mt-2 min-h-[48px] break-words text-sm font-semibold leading-6 text-foreground">
                        {info.value}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{info.description}</span>

                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {/* Header */}
              <div className="border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-display text-base font-bold text-foreground">
                      Lokasi Kami
                    </h2>

                    <p className="text-xs text-muted-foreground">
                      Temukan lokasi kantor JDIH BIN
                    </p>
                  </div>
                </div>
              </div>

              {/* Maps */}
              <div className="relative h-full w-full">
                <iframe
                  title="Peta Lokasi Badan Intelijen Negara"
                  src="https://www.google.com/maps?q=Badan%20Intelijen%20Negara%20Republik%20Indonesia%2C%20Jl.%20Seno%20Raya%2C%20Pejaten%20Timur%2C%20Pasar%20Minggu%2C%20Jakarta%20Selatan&output=embed"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Info Card */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Building2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-gray-900">
                        Badan Intelijen Negara
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                  Kirim Pesan
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sampaikan pertanyaan, masukan, atau kebutuhan informasi kepada
                  kami melalui formulir berikut.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
