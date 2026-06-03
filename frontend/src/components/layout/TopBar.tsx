"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, Search, Menu, Sparkles } from "lucide-react";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid Hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-card/85 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground md:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Platform logo */}
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight md:hidden">
          <div className="p-1 rounded bg-accent text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">Catering <span className="text-accent">AI</span></span>
        </div>

        {/* Global Search Input (UI Only, command bar style) */}
        <div className="hidden sm:flex items-center gap-2 w-72 md:w-96 px-3 py-1.5 rounded-lg border border-border bg-background hover:border-accent/40 transition-colors cursor-pointer group">
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <input
            type="text"
            placeholder="Search leads, campaigns, agents..."
            disabled
            className="bg-transparent border-0 outline-none text-xs w-full text-foreground placeholder:text-muted-foreground/70 cursor-pointer"
          />
          <kbd className="hidden lg:inline-flex select-none items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search trigger for mobile */}
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground sm:hidden" title="Search">
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all duration-200"
          title="Toggle Theme"
        >
          {mounted && (resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5 text-accent animate-pulse-slow" />
          ) : (
            <Moon className="w-5 h-5 text-primary" />
          ))}
          {!mounted && <div className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-card" />
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-border/60" />

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/25 border border-accent/45 text-accent font-semibold text-xs select-none">
            SB
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground">Shahiar Betopia</span>
            <span className="text-[9px] text-muted-foreground">Platform Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
