import React from "react";

interface LoadingStateProps {
  type?: "card" | "list" | "table";
  count?: number;
}

export function LoadingState({ type = "card", count = 3 }: LoadingStateProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === "list") {
    return (
      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border border-border/30 rounded-xl bg-card animate-pulse"
          >
            <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
            <div className="w-16 h-6 rounded-full bg-muted shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="border border-border/30 rounded-xl bg-card overflow-hidden animate-pulse">
        <div className="h-10 bg-muted/30 border-b border-border/30" />
        <div className="divide-y divide-border/20 p-4 space-y-4">
          {items.map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/6" />
              <div className="h-4 bg-muted rounded w-1/12 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((i) => (
        <div
          key={i}
          className="p-5 border border-border/30 rounded-xl bg-card space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 bg-muted rounded w-1/4" />
            <div className="w-8 h-8 rounded-lg bg-muted" />
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
