import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JDIH BIN — Jaringan Dokumentasi dan Informasi Hukum",
  description:
    "Portal Jaringan Dokumentasi dan Informasi Hukum Badan Intelijen Negara. Akses produk hukum, peraturan, dan informasi resmi.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#651420",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`bg-background ${inter.variable} ${poppins.variable}`}
    >
      <body className="antialiased flex min-h-screen flex-col">
        <QueryProvider>
          <div className="flex-1">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
