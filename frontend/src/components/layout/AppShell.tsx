"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronize sidebar state from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsSidebarCollapsed(saved === "true");
    }
  }, []);

  const handleCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleCollapse}
      />

      {/* Slide-over Drawer for Mobile */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Pane */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
        }`}
      >
        {/* Topbar Header */}
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(true)} />

        {/* Content Workspace */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
