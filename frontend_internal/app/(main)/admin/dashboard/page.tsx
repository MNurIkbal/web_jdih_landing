"use client";

import DashboardComponent from "@/feature/dashboard/components/DashboardPage";
import HdhDashboard from "@/feature/dashboard/components/HdhDashboard";
import { useAdminLayout } from "@/feature/layouts/AdminLayoutContext";

export default function AdminPage() {
  const { activeModule } = useAdminLayout();

  if (activeModule === "HDH") {
    return <HdhDashboard />;
  }

  return <DashboardComponent />;
}
