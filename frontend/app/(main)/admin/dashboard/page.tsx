
"use client";

import { useState } from "react";

import AdminNavbar from "@/feature/layouts/AdminNavbar";
import AdminSidebar from "@/feature/layouts/AdminSidebar";
import AdminFooter from "@/feature/layouts/AdminFooter";
import DashboardComponent from "@/feature/dashboard/components/DashboardPage";

export default function AdminPage() {
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

        <DashboardComponent />

        <AdminFooter />
      </div>
    </div>
  );
}
