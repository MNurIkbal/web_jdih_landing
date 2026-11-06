"use client";

import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import { AdminLayoutProvider, useAdminLayout } from "./AdminLayoutContext";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { menuMode } = useAdminLayout();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar: Otomatis render jika mode 'sidebar', tersembunyi jika mode 'navbar' */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Konten Utama: jika mode 'sidebar', ada padding kiri 275px; jika 'navbar', full width (pl-0) */}
      <div
        className={`transition-all duration-300 ${
          menuMode === "sidebar" ? "lg:pl-[275px]" : "pl-0"
        }`}
      >
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main>{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutWrapperProps) {
  return (
    <AdminLayoutProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminLayoutProvider>
  );
}

