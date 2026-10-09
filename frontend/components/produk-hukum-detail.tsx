"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Info,
  RotateCcw,
  Scale,
  Link2,
} from "lucide-react";

import { APP_BASE_URL } from "@/constanta/GlobalConstanta";
import {
  useDokumenHukumWebDetail,
  useDownload,
  usePriview,
  useWebDokumenHukumRelated,
} from "@/feature/web";
import { Navbar } from "./navbar";
import { SiteFooter } from "./site-footer";

export type StatusRelasi = {
  aksi: string;
  label: string;
  href?: string;
};

export type ProdukHukum = {
  id?: number;

  tipe_dokumen: string;
  jenis: string;
  nomor: string | number;
  tahun: string | number;

  tentang: string;
  judul: string;

  teu?: string;
  bentuk?: string;
  bentukSingkat?: string;

  tempat_penetapan?: string;
  tanggal_penetapan?: string;
  tanggal_pengundangan?: string;
  tanggal_berlaku?: string;

  sumber?: string;
  subjek?: string;
  status?: string;
  bahasa?: string;
  lokasi?: string;
  bidang?: string;
  terjemahan?: string;

  dilihat?: number;
  downloads: number;

  file_dokumen: string;
  file_abstrak?: string;

  abstrak?: string[];
  catatan?: string[];

  statusRelasi?: StatusRelasi[];
  peraturanTerkait?: StatusRelasi[];
  peraturanPelaksanaan?: StatusRelasi[];
  hasilUjiMateri?: StatusRelasi[];
};

type ActiveView = "metadata" | "teks" | "preview-abstrak" | "preview-peraturan";

export function ProdukHukumDetail({ id }: { id: number }) {
  const { data, isLoading, isError, refetch } = useDokumenHukumWebDetail(id);
  const { data: relatedResponse, isLoading: relatedLoading } =
    useWebDokumenHukumRelated(id);
  const relatedData = relatedResponse?.data ?? [];
  const [view, setView] = useState<ActiveView>("metadata");
  const { mutate: updatePreview, isPending: isPreviewPending } = usePriview();

  const { mutate: updateDownload, isPending: isDownloadPending } =
    useDownload();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <p className="mt-4 text-sm font-medium text-foreground">
            Memuat dokumen hukum...
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Silakan tunggu sebentar.
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />

          <h2 className="mt-4 text-lg font-bold text-foreground">
            Dokumen tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Data dokumen hukum tidak dapat ditemukan atau gagal dimuat.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const produk = data as any as ProdukHukum;

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.08] via-card to-secondary/30 shadow-sm">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/[0.07] blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-primary/[0.05] blur-3xl" />

            <BookOpen
              className="absolute -right-8 top-8 h-52 w-52 rotate-12 text-primary/[0.055]"
              strokeWidth={0.8}
              aria-hidden="true"
            />

            <Scale
              className="absolute bottom-[-25px] left-[-20px] h-36 w-36 -rotate-12 text-primary/[0.035]"
              strokeWidth={0.8}
              aria-hidden="true"
            />
          </div>

          <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/15 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                Dokumen Hukum
              </span>

              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

              <span className="text-xs font-medium text-muted-foreground">
                {produk.tipe_dokumen}
              </span>
            </div>

            <div className="mt-5 max-w-5xl">
              <p className="text-sm font-semibold text-muted-foreground">
                {produk.jenis} Nomor {produk.nomor} Tahun {produk.tahun}
              </p>

              <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {produk.tentang}
              </h1>

              {produk.judul && produk.judul !== produk.tentang && (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {produk.judul}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-h-[420px] rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {view === "metadata" && <MetadataView produk={produk} />}

            {view === "teks" && <TeksAbstrakView produk={produk} />}

            {view === "preview-abstrak" && (
              <PreviewAbstrakView produk={produk} />
            )}

            {view === "preview-peraturan" && (
              <PreviewPeraturanView produk={produk} />
            )}
          </div>

          <aside className="space-y-5">
            <button
              type="button"
              onClick={() => setView("metadata")}
              className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all ${view === "metadata"
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/[0.03]"
                }`}
            >
              <span className="flex items-center gap-2.5">
                <Info className="h-4 w-4" />
                <span className="text-sm font-semibold">Metadata</span>
              </span>

              <ChevronRight className="h-4 w-4" />
            </button>

            {produk.file_abstrak && (
              <SidebarSection
                title="Abstrak"
                icon={<FileText className="h-4 w-4" />}
              >
                <div className="flex flex-wrap gap-2">
                  <PillButton
                    active={view === "preview-abstrak"}
                    onClick={() => setView("preview-abstrak")}
                    disabled={!produk.file_abstrak}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </PillButton>

                  <button
                    type="button"
                    disabled={!produk.file_abstrak}
                    onClick={() => {
                      if (produk.file_abstrak) {
                        handleDownloadAbstrak(produk.file_abstrak);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${produk.file_abstrak
                      ? "bg-secondary text-secondary-foreground hover:bg-border"
                      : "cursor-not-allowed bg-secondary/50 text-muted-foreground/40"
                      }`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>

                {!produk.file_abstrak && (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    File abstrak belum tersedia.
                  </p>
                )}
              </SidebarSection>
            )}

            <SidebarSection
              title="File Lampiran"
              icon={<BookOpen className="h-4 w-4" />}
            >
              <div className="flex flex-wrap gap-2">
                <PillButton
                  active={view === "preview-peraturan"}
                  onClick={() => {
                    setView("preview-peraturan");

                    updatePreview((produk as any).id);
                  }}
                  disabled={!produk.file_dokumen || isPreviewPending}
                >
                  <Eye className="h-3.5 w-3.5" />

                  {isPreviewPending ? "Memproses..." : "Preview"}
                </PillButton>

                <button
                  type="button"
                  disabled={!produk.file_dokumen || isDownloadPending}
                  onClick={() => {
                    if (!produk.file_dokumen) return;

                    updateDownload((produk as any).id);

                    handleDownloadPeraturan(produk);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${produk.file_dokumen && !isDownloadPending
                    ? "bg-secondary text-secondary-foreground hover:bg-border"
                    : "cursor-not-allowed bg-secondary/50 text-muted-foreground/40"
                    }`}
                >
                  <Download className="h-3.5 w-3.5" />

                  {isDownloadPending ? "Memproses..." : "Download"}
                </button>
              </div>
              {!produk.file_dokumen && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  File peraturan belum tersedia.
                </p>
              )}
            </SidebarSection>

            <SidebarSection
              title="Dokumen Lainnya"
              icon={<BookOpen className="h-4 w-4" />}
            >
              <div className="space-y-2.5">
                {relatedLoading ? (
                  [1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-xl border border-border bg-card p-3.5"
                    >
                      <div className="h-4 w-4/5 rounded bg-muted" />
                      <div className="mt-2 h-3 w-3/5 rounded bg-muted" />
                      <div className="mt-3 h-3 w-2/5 rounded bg-muted" />
                    </div>
                  ))
                ) : relatedData.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center">
                    <FileText className="mx-auto h-5 w-5 text-muted-foreground/50" />

                    <p className="mt-2 text-xs text-muted-foreground">
                      Belum ada dokumen terkait.
                    </p>
                  </div>
                ) : (
                  relatedData.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/dokumen-hukum/${item.id}`}
                      className="group block"
                    >
                      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <FileText className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">
                              {item.judul}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted-foreground">
                              <span>{item.kategori}</span>
                              <span>•</span>
                              <span>{item.tahun}</span>
                            </div>

                            <div className="mt-2.5 flex items-center gap-3">
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {item.dilihat ?? 0}
                              </span>

                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Download className="h-3 w-3" />
                                {item.download ?? 0}
                              </span>

                              {item.status && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.status === "Berlaku"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                  {item.status}
                                </span>
                              )}
                            </div>
                          </div>

                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </SidebarSection>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
function getDocumentBaseUrl() {
  return `${APP_BASE_URL}/`;
}

function getFileName(file?: string | null) {
  if (!file) {
    return "";
  }

  return file.split("/").pop() ?? "";
}

function getPeraturanFileUrl(produk: ProdukHukum) {
  if (!produk.file_dokumen) {
    return "";
  }

  const fileName = getFileName(produk.file_dokumen);

  if (!fileName) {
    return "";
  }

  return `${getDocumentBaseUrl()}/${encodeURIComponent(fileName)}`;
}

function getAbstrakFileUrl(produk: ProdukHukum) {
  if (!produk.file_abstrak) {
    return "";
  }

  const fileName = getFileName(produk.file_abstrak);

  if (!fileName) {
    return "";
  }

  return `${getDocumentBaseUrl()}/${encodeURIComponent(fileName)}`;
}

async function handleDownloadAbstrak(file: string) {
  try {
    const fileName = getFileName(file) || "peraturan.pdf";

    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Gagal mengambil file: ${response.status}`);
    }

    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) { }
}

async function handleDownloadPeraturan(produk: ProdukHukum) {
  try {
    const fileName = getFileName(produk.file_dokumen) || "peraturan.pdf";

    const response = await fetch(produk.file_dokumen);

    if (!response.ok) {
      throw new Error(`Gagal mengambil file: ${response.status}`);
    }

    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) { }
}
export const formatTanggal = (value?: string | Date | null): string => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

function MetadataView({ produk }: { produk: ProdukHukum }) {
  const rows: [string, string | number | undefined | null][] = [
    ["Judul", produk.judul],
    ["Nomor", produk.nomor],
    ["Tahun", produk.tahun],
    ["Tipe Dokumen", produk.tipe_dokumen],
    ["Tempat Penetapan", produk.tempat_penetapan],
    ["Tanggal Penetapan", formatTanggal(produk.tanggal_penetapan)],
    ["Tanggal Pengundangan", formatTanggal(produk.tanggal_pengundangan)],
    ["Tanggal Berlaku", formatTanggal(produk.tanggal_berlaku)],
    ["Sumber", produk.sumber],
    ["Subjek", produk.subjek],
    ["Status", produk.status],
    ["Bidang", produk.bidang],
    [
      "Dilihat",
      produk.dilihat != null ? `${produk.dilihat} kali` : undefined,
    ],
    ["Diunduh", `${(produk as any).download ?? 0} kali`],
  ];

  const optionalFields = new Set([
    "Tipe Dokumen",
    "Tempat Penetapan",
    "Sumber",
    "Subjek",
  ]);

  const filteredRows = rows.filter(([label, value]) => {
    if (!optionalFields.has(label)) {
      return true;
    }

    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    );
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="h-4 w-4" />
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Metadata Dokumen
            </h2>

            <p className="text-sm text-muted-foreground">
              Informasi lengkap mengenai dokumen hukum.
            </p>
          </div>
        </div>
      </div>

      <dl className="divide-y divide-border">
        {filteredRows.map(([label, value]) => {
          const hasValue =
            value !== null &&
            value !== undefined &&
            String(value).trim() !== "";

          return (
            <div
              key={label}
              className="grid grid-cols-[145px_1fr] gap-4 py-3 text-sm sm:grid-cols-[190px_1fr]"
            >
              <dt className="font-semibold text-foreground">
                {label}
              </dt>

              <dd className="break-words text-muted-foreground">
                {hasValue ? (
                  String(value).startsWith("http") ? (
                    <a
                      href={String(value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )
                ) : (
                  <span className="italic text-muted-foreground/60">
                    – belum diisi –
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function TeksAbstrakView({ produk }: { produk: ProdukHukum }) {
  const abstrak = produk.abstrak ?? [];
  const catatan = produk.catatan ?? [];

  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <div>
        <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
          {produk.tentang}
        </p>

        <p className="mt-1 text-muted-foreground">{produk.tahun}</p>

        <p className="mt-1 text-muted-foreground">
          {produk.jenis} No. {produk.nomor}
          {produk.sumber ? `, ${produk.sumber}` : ""}
        </p>

        <p className="mt-3 font-display text-sm font-bold uppercase tracking-wide text-foreground">
          {produk.jenis} tentang {produk.tentang}
        </p>
      </div>

      {abstrak.length > 0 && (
        <div>
          <span className="font-bold text-foreground">ABSTRAK:</span>

          <ul className="mt-2 space-y-2">
            {abstrak.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground">-</span>

                <span className="text-foreground">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {catatan.length > 0 && (
        <div>
          <span className="font-bold text-foreground">CATATAN:</span>

          <ul className="mt-2 space-y-2">
            {catatan.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground">-</span>

                <span className="text-foreground">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {abstrak.length === 0 && catatan.length === 0 && <EmptyNote />}
    </div>
  );
}

function PreviewAbstrakView({ produk }: { produk: ProdukHukum }) {
  const [loaded, setLoaded] = useState(false);

  const [failed, setFailed] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const fileUrl = getAbstrakFileUrl(produk);

  const fileName = produk.file_abstrak ? getFileName(produk.file_abstrak) : "";

  if (!produk.file_abstrak) {
    return (
      <EmptyFilePreview
        title="Preview Abstrak"
        message="File abstrak belum tersedia."
      />
    );
  }

  const handleRetry = () => {
    setLoaded(false);
    setFailed(false);
    setReloadKey((k) => k + 1);
  };

  return (
    <div>
      <PreviewHeader
        title="Preview Abstrak"
        description={fileName}
        icon={<FileText className="h-5 w-5 text-primary" />}
      />

      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <div className="relative h-[650px] bg-secondary/30">
          {!loaded && !failed && <LoadingPreview />}

          {failed ? (
            <FailedPreview
              fileUrl={produk.file_abstrak}
              onRetry={handleRetry}
            />
          ) : (
            <iframe
              key={reloadKey}
              src={produk.file_abstrak}
              title={`Preview abstrak ${produk.judul}`}
              className={`h-full w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"
                }`}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewPeraturanView({ produk }: { produk: ProdukHukum }) {
  const [loaded, setLoaded] = useState(false);

  const [failed, setFailed] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const fileUrl = getPeraturanFileUrl(produk);

  const fileName = getFileName(produk.file_dokumen);

  const handleRetry = () => {
    setLoaded(false);
    setFailed(false);
    setReloadKey((k) => k + 1);
  };

  return (
    <div>
      <PreviewHeader
        title="Preview File Lampiran"
        description={fileName}
        icon={<BookOpen className="h-5 w-5 text-primary" />}
      />

      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <div className="relative h-[650px] bg-secondary/30">
          {!loaded && !failed && <LoadingPreview />}

          {failed ? (
            <FailedPreview
              fileUrl={produk.file_dokumen}
              onRetry={handleRetry}
            />
          ) : (
            <iframe
              key={reloadKey}
              src={produk.file_dokumen}
              title={`Preview peraturan ${produk.judul}`}
              className={`h-full w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"
                }`}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="font-display text-lg font-bold text-foreground">
          {title}
        </h2>
      </div>
    </div>
  );
}

function LoadingPreview() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-pulse rounded-lg bg-secondary" />

      <p className="text-sm text-muted-foreground">Memuat pratinjau…</p>
    </div>
  );
}

function FailedPreview({
  fileUrl,
  onRetry,
}: {
  fileUrl: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <FileText className="h-10 w-10 text-muted-foreground/50" />

      <p className="max-w-sm text-sm text-muted-foreground">
        Pratinjau tidak dapat ditampilkan di sini. Pastikan file bisa diakses
        langsung atau buka melalui tombol di bawah.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-border"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Coba lagi
        </button>

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Buka di tab baru
        </a>
      </div>
    </div>
  );
}

function EmptyFilePreview({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div>
      <PreviewHeader
        title={title}
        description="Dokumen tidak tersedia"
        icon={<FileText className="h-5 w-5 text-primary" />}
      />

      <div className="flex h-[500px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/30" />

        <p className="mt-4 text-sm font-medium text-foreground">{message}</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Silakan hubungi administrator jika file seharusnya tersedia.
        </p>
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}

        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>

      <div className="mt-3">{children}</div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${disabled
        ? "cursor-not-allowed bg-secondary/50 text-muted-foreground/40"
        : active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-secondary text-secondary-foreground hover:bg-border"
        }`}
    >
      {children}
    </button>
  );
}

function RelasiSection({
  title,
  items,
}: {
  title: string;
  items?: StatusRelasi[];
}) {
  const hasItems = !!items && items.length > 0;

  return (
    <SidebarSection title={title} icon={<Link2 className="h-4 w-4" />}>
      {hasItems ? (
        <ul className="space-y-3">
          {items!.map((r, i) => (
            <li
              key={i}
              className="border-t border-border pt-3 first:border-t-0 first:pt-0"
            >
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                <div className="min-w-0">
                  {r.aksi && (
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {r.aksi}
                    </p>
                  )}

                  {r.href ? (
                    <Link
                      href={r.href}
                      className="text-sm leading-relaxed text-primary hover:underline"
                    >
                      {r.label}
                    </Link>
                  ) : (
                    <span className="text-sm leading-relaxed text-foreground">
                      {r.label}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote />
      )}
    </SidebarSection>
  );
}

function EmptyNote() {
  return (
    <p className="text-sm italic text-muted-foreground/70">Belum ada data.</p>
  );
}
