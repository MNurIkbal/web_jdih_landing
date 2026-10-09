import { ScrollText } from "lucide-react";
import { ProdukHukumTable } from "@/components/produk-hukum-table";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

export default function ProdukHukumPage() {
  return (
    <>
      <Navbar />

      <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.07] via-background to-secondary/50">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

          <div className="absolute right-[8%] top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative h-44 w-56">
              <div className="absolute right-2 top-5 h-32 w-24 rotate-6 rounded-xl border border-primary/10 bg-background/30 shadow-sm backdrop-blur-sm">
                <div className="absolute left-4 right-4 top-7 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-7 top-12 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-5 top-17 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-9 top-22 h-1 rounded-full bg-primary/10" />
              </div>

              <div className="absolute bottom-3 left-8 h-32 w-24 -rotate-6 rounded-xl border border-primary/10 bg-background/40 shadow-sm backdrop-blur-sm">
                <div className="absolute left-4 right-4 top-7 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-6 top-12 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-4 top-17 h-1 rounded-full bg-primary/10" />
                <div className="absolute left-4 right-8 top-22 h-1 rounded-full bg-primary/10" />
              </div>

              <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <ScrollText className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-9">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <ScrollText className="h-5 w-5" />

                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
              </div>

              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  JDIH BIN
                </p>

                <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Dokumen Hukum
                </h1>

                <div className="mt-1.5 h-0.5 w-10 rounded-full bg-primary" />
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Akses dan telusuri koleksi dokumen hukum, peraturan, keputusan,
              serta berbagai produk hukum yang tersedia dalam JDIH BIN.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Beranda</span>

              <span className="text-primary">/</span>

              <span>Dokumen Hukum</span>
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

      <main>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProdukHukumTable />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
