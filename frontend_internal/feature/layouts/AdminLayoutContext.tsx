"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AdminMenuMode = "sidebar" | "navbar";
export type AdminActiveModule = "JDIH" | "HDH";

interface AdminLayoutContextType {
  menuMode: AdminMenuMode;
  setMenuMode: (mode: AdminMenuMode) => void;
  toggleMenuMode: () => void;
  activeModule: AdminActiveModule;
  setActiveModule: (mod: AdminActiveModule) => void;
  isSwitchingModule: boolean;
  switchingTarget: AdminActiveModule | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: React.ReactNode }) {
  const [menuMode, setMenuModeState] = useState<AdminMenuMode>("sidebar");
  const [activeModule, setActiveModuleState] = useState<AdminActiveModule>("JDIH");
  const [isSwitchingModule, setIsSwitchingModule] = useState(false);
  const [switchingTarget, setSwitchingTarget] = useState<AdminActiveModule | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("admin_menu_layout_mode") as AdminMenuMode;
      if (savedMode === "sidebar" || savedMode === "navbar") {
        setMenuModeState(savedMode);
      }
      const savedMod = localStorage.getItem("admin_active_module") as AdminActiveModule;
      if (savedMod === "JDIH" || savedMod === "HDH") {
        setActiveModuleState(savedMod);
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

  const setActiveModule = (mod: AdminActiveModule) => {
    if (mod === activeModule || isSwitchingModule) return;

    // Mulai proses animasi transisi pergantian modul
    setIsSwitchingModule(true);
    setSwitchingTarget(mod);

    // Setelah proses animasi singkat (fade-in & scanner), terapkan modul baru
    setTimeout(() => {
      setActiveModuleState(mod);
      try {
        localStorage.setItem("admin_active_module", mod);
      } catch (e) {}

      // Selesaikan proses transisi
      setTimeout(() => {
        setIsSwitchingModule(false);
        setSwitchingTarget(null);
      }, 450);
    }, 450);
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
        activeModule,
        setActiveModule,
        isSwitchingModule,
        switchingTarget,
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
    return {
      menuMode: "sidebar" as AdminMenuMode,
      setMenuMode: () => {},
      toggleMenuMode: () => {},
      activeModule: "JDIH" as AdminActiveModule,
      setActiveModule: () => {},
      isSwitchingModule: false,
      switchingTarget: null,
      sidebarOpen: false,
      setSidebarOpen: () => {},
    };
  }
  return context;
}
