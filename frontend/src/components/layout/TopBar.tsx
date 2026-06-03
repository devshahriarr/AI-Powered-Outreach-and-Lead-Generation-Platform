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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Avoid Hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to keyboard shortcut (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 w-96 md:w-[420px] lg:w-[540px] px-3.5 py-2 rounded-lg border border-border bg-background hover:border-accent/40 hover:bg-muted/10 transition-all text-left group cursor-pointer"
        >
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-xs text-muted-foreground/75 flex-1 select-none">
            Search leads, campaigns, agents...
          </span>
          <kbd className="hidden lg:inline-flex select-none items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search trigger for mobile */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground sm:hidden transition-colors" 
          title="Search"
        >
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

      {/* Global Command Palette Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-primary/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          />
          
          {/* Command Card */}
          <div className="relative w-full max-w-xl rounded-xl border border-border/40 bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search leads, campaigns, status updates..."
                autoFocus
                className="bg-transparent border-0 outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/75"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-[10px] font-semibold border border-border bg-muted px-2 py-1 rounded hover:bg-muted/80 text-muted-foreground transition-colors shrink-0"
              >
                ESC
              </button>
            </div>
            
            {/* Results / Help */}
            <div className="p-4 max-h-[300px] overflow-y-auto space-y-4">
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Recent Discoveries
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 cursor-pointer text-xs transition-colors">
                    <span className="font-medium text-foreground">Atlantic Sandwich Co.</span>
                    <span className="text-[10px] text-success font-semibold uppercase">Qualified</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 cursor-pointer text-xs transition-colors">
                    <span className="font-medium text-foreground">Apex Corporate Tech Hub</span>
                    <span className="text-[10px] text-blue-500 font-semibold uppercase">Discovered</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Campaign Shortcuts
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 cursor-pointer text-xs transition-colors">
                    <span className="font-medium text-foreground">Summer Corporate catering promo</span>
                    <span className="text-[10px] text-muted-foreground">Campaign #2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
