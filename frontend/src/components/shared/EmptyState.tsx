import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-border/80 rounded-xl bg-muted/10 dark:bg-muted/5 max-w-lg mx-auto">
      <div className="p-4 rounded-full bg-accent/10 text-accent mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-accent text-white px-4 py-2 text-xs font-semibold hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
