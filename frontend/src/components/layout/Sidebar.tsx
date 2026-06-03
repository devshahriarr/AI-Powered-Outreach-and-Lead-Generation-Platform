"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  BadgeCheck,
  Megaphone,
  SendHorizontal,
  Workflow,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { AgentsPanel } from "@/components/navigation/AgentsPanel";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Lead Discovery", href: "/leads", icon: Search },
    { label: "Qualified Leads", href: "/leads/qualified", icon: BadgeCheck },
    { label: "Campaigns", href: "/campaigns", icon: Megaphone },
    { label: "Outreach", href: "/outreach", icon: SendHorizontal },
    { label: "Pipeline", href: "/pipeline", icon: Workflow },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 hidden md:flex flex-col bg-primary dark:bg-[#090D16] border-r border-border/20 text-white/90 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/10">
        {!isCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
            <div className="p-1.5 rounded-lg bg-accent text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-semibold text-base">Catering <span className="text-accent">AI</span></span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="p-1.5 rounded-lg bg-accent text-white">
              <Sparkles className="w-4 h-4" />
            </div>
          </Link>
        )}
        
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md text-white/60 hover:text-white hover:bg-secondary/55 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-secondary text-white border-l-4 border-accent pl-2"
                  : "text-white/65 hover:text-white hover:bg-secondary/40"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Expand for Collapsed Sidebar */}
      {isCollapsed && (
        <div className="p-2 border-t border-border/10 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-secondary/55 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Agents panel at the bottom */}
      <AgentsPanel isCollapsed={isCollapsed} />
    </aside>
  );
}
