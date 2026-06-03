"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const CONFIG: Record<ToastType, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle className="w-4 h-4 shrink-0 text-success" />,
    classes: "border-success/30 bg-card",
  },
  error: {
    icon: <XCircle className="w-4 h-4 shrink-0 text-rose-500" />,
    classes: "border-rose-500/30 bg-card",
  },
  info: {
    icon: <Info className="w-4 h-4 shrink-0 text-blue-500" />,
    classes: "border-blue-500/30 bg-card",
  },
};

export function Toast({ message, type, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIG[type];

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-[380px] transition-all duration-300 ${cfg.classes} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {cfg.icon}
      <p className="text-sm text-foreground font-medium flex-1 leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
