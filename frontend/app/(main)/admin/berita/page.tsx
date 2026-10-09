
"use client";

import { useState } from "react";

import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";

import BeritaComponent from "@/feature/berita/components/BeritaComponent";

export default function BeritaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[270px]">

        <AdminNavbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <BeritaComponent />

        <AdminFooter />
      </div>
    </div>
  );
}
