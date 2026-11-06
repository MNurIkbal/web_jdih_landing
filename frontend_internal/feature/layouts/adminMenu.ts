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
  LucideIcon,
} from "lucide-react";

export interface AdminMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Slider",
    href: "/admin/slider",
    icon: Images,
  },
  {
    label: "Berita",
    href: "/admin/berita",
    icon: Newspaper,
  },
  {
    label: "Pengajuan Peraturan",
    href: "/admin/pengajuan-peraturan",
    icon: FileSpreadsheet,
  },
  {
    label: "Dokumen Hukum",
    href: "/admin/dokumen-hukum",
    icon: FileText,
  },
  {
    label: "Galeri",
    href: "/admin/galeri",
    icon: Images,
  },
  {
    label: "Survey Layanan",
    href: "/admin/survey",
    icon: ClipboardList,
  },
  {
    label: "Pengguna",
    href: "/admin/pengguna",
    icon: Users,
  },
  {
    label: "Kontak",
    href: "/admin/kontak",
    icon: MessageSquare,
  },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
  },
];

