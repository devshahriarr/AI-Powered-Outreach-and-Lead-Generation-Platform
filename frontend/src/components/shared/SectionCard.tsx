import React, { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  actions,
  className = "",
}: SectionCardProps) {
  return (
    <div
      className={`rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden ${className}`}
    >
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4 border-b border-border/30 bg-muted/20 dark:bg-muted/5">
          <div className="space-y-0.5">
            {title && (
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
