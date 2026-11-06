"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AdminMenuMode = "sidebar" | "navbar";

interface AdminLayoutContextType {
  menuMode: AdminMenuMode;
  setMenuMode: (mode: AdminMenuMode) => void;
  toggleMenuMode: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: React.ReactNode }) {
  const [menuMode, setMenuModeState] = useState<AdminMenuMode>("sidebar");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("admin_menu_layout_mode") as AdminMenuMode;
      if (savedMode === "sidebar" || savedMode === "navbar") {
        setMenuModeState(savedMode);
      }
    } catch (e) {
      // Ignore localStorage error
    }
  }, []);

  const setMenuMode = (mode: AdminMenuMode) => {
    setMenuModeState(mode);
    try {
      localStorage.setItem("admin_menu_layout_mode", mode);
    } catch (e) {}
  };

  const toggleMenuMode = () => {
    setMenuMode(menuMode === "sidebar" ? "navbar" : "sidebar");
  };

  return (
    <AdminLayoutContext.Provider
      value={{
        menuMode,
        setMenuMode,
        toggleMenuMode,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    // Memberikan fallback aman jika context tidak dibungkus provider
    return {
      menuMode: "sidebar" as AdminMenuMode,
      setMenuMode: () => {},
      toggleMenuMode: () => {},
      sidebarOpen: false,
      setSidebarOpen: () => {},
    };
  }
  return context;
}

