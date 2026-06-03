"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  BadgeCheck,
  Clock,
  XCircle,
  Megaphone,
  SendHorizontal,
  Workflow,
  BarChart3,
  Settings,
  X,
  Sparkles
} from "lucide-react";
import { AgentsPanel } from "@/components/navigation/AgentsPanel";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Lead Discovery", href: "/leads", icon: Search },
    { label: "Qualified Leads", href: "/leads/qualified", icon: BadgeCheck },
    { label: "Review Queue", href: "/leads/review", icon: Clock },
    { label: "Rejected", href: "/leads/rejected", icon: XCircle },
    { label: "Campaigns", href: "/campaigns", icon: Megaphone },
    { label: "Outreach", href: "/outreach", icon: SendHorizontal },
    { label: "Pipeline", href: "/pipeline", icon: Workflow },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-primary/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative flex flex-col w-72 max-w-xs bg-primary dark:bg-[#090D16] border-r border-border/20 text-white/90 shadow-2xl h-full transition-transform duration-300">
        {/* Close trigger button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/10">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white" onClick={onClose}>
            <div className="p-1.5 rounded-lg bg-accent text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-semibold text-base">Catering <span className="text-accent">AI</span></span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary/40 text-white/80 hover:text-white transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
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
                onClick={onClose}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Agents Panel at the bottom */}
        <AgentsPanel isCollapsed={false} />
      </div>
    </div>
  );
}
