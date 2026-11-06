import {
  LayoutDashboard,
  Images,
  Newspaper,
  FileSpreadsheet,
  FileText,
  Users,
  MessageSquare,
  Settings,
  ClipboardList,
  Scale,
  FileCheck2,
  LucideIcon,
} from "lucide-react";

export interface AdminMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  module: "JDIH" | "HDH";
}

// Menu Navigasi Modul JDIH
export const JDIH_MENU_ITEMS: AdminMenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    module: "JDIH",
  },
  {
    label: "Pengajuan Peraturan",
    href: "/admin/pengajuan-peraturan",
    icon: FileSpreadsheet,
    module: "JDIH",
  },
  {
    label: "Dokumen Hukum",
    href: "/admin/dokumen-hukum",
    icon: FileText,
    module: "JDIH",
  },
  {
    label: "Berita",
    href: "/admin/berita",
    icon: Newspaper,
    module: "JDIH",
  },
  {
    label: "Slider",
    href: "/admin/slider",
    icon: Images,
    module: "JDIH",
  },
  {
    label: "Galeri",
    href: "/admin/galeri",
    icon: Images,
    module: "JDIH",
  },
  {
    label: "Survey Layanan",
    href: "/admin/survey",
    icon: ClipboardList,
    module: "JDIH",
  },
  {
    label: "Pengguna",
    href: "/admin/pengguna",
    icon: Users,
    module: "JDIH",
  },
  {
    label: "Kontak",
    href: "/admin/kontak",
    icon: MessageSquare,
    module: "JDIH",
  },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
    module: "JDIH",
  },
];

// Menu Navigasi Modul HDH (Harmonisasi Dokumen Hukum)
export const HDH_MENU_ITEMS: AdminMenuItem[] = [
  {
    label: "Harmonisasi Peraturan",
    href: "/admin/pengajuan-peraturan?tahapan=Harmonisasi",
    icon: Scale,
    module: "HDH",
  },
  {
    label: "Telaah Dokumen",
    href: "/admin/pengajuan-peraturan",
    icon: FileCheck2,
    module: "HDH",
  },
];

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = JDIH_MENU_ITEMS;
