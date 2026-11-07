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
  roles?: ("superadmin" | "admin" | "pengguna")[];
}

// Menu Navigasi Modul JDIH
// superadmin: semua menu
// admin (verifikator): semua menu KECUALI Pengguna dan Pengaturan
// pengguna: Pengajuan Peraturan & Dokumen Hukum
export const JDIH_MENU_ITEMS: AdminMenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    module: "JDIH",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Pengajuan Peraturan",
    href: "/admin/pengajuan-peraturan",
    icon: FileSpreadsheet,
    module: "JDIH",
    roles: ["superadmin", "admin", "pengguna"],
  },
  {
    label: "Dokumen Hukum",
    href: "/admin/dokumen-hukum",
    icon: FileText,
    module: "JDIH",
    roles: ["superadmin", "admin", "pengguna"],
  },
  {
    label: "Berita",
    href: "/admin/berita",
    icon: Newspaper,
    module: "JDIH",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Slider",
    href: "/admin/slider",
    icon: Images,
    module: "JDIH",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Galeri",
    href: "/admin/galeri",
    icon: Images,
    module: "JDIH",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Survey Layanan",
    href: "/admin/survey",
    icon: ClipboardList,
    module: "JDIH",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Pengguna",
    href: "/admin/pengguna",
    icon: Users,
    module: "JDIH",
    roles: ["superadmin"], // Khusus Superadmin
  },
  {
    label: "Kontak",
    href: "/admin/kontak",
    icon: MessageSquare,
    module: "JDIH",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
    module: "JDIH",
    roles: ["superadmin"], // Khusus Superadmin
  },
];

// Menu Navigasi Modul HDH (Harmonisasi Dokumen Hukum)
export const HDH_MENU_ITEMS: AdminMenuItem[] = [
  {
    label: "Harmonisasi Peraturan",
    href: "/admin/pengajuan-peraturan",
    icon: Scale,
    module: "HDH",
    roles: ["superadmin", "admin", "pengguna"],
  },
];

export const filterMenuItemsByRole = (
  items: AdminMenuItem[],
  role?: string | null
): AdminMenuItem[] => {
  const normalizedRole = (role || "pengguna").toLowerCase() as "superadmin" | "admin" | "pengguna";
  return items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (normalizedRole === "superadmin") return true;
    return item.roles.includes(normalizedRole);
  });
};

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = JDIH_MENU_ITEMS;
