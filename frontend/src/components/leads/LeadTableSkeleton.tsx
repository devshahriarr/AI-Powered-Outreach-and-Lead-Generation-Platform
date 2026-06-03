import React from "react";

export function LeadTableSkeleton() {
  const rows = Array.from({ length: 8 });
  const cols = [140, 110, 160, 100, 60, 90, 80, 60]; // approx col widths

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm animate-pulse">
      {/* Header */}
      <div className="grid grid-cols-8 gap-4 px-5 py-3 border-b border-border/30 bg-muted/30">
        {cols.map((w, i) => (
          <div key={i} className="h-3 rounded bg-muted" style={{ width: `${w * 0.6}px`, maxWidth: "100%" }} />
        ))}
      </div>
      {/* Rows */}
      {rows.map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="grid grid-cols-8 gap-4 px-5 py-4 border-b border-border/20 last:border-0"
        >
          {cols.map((w, colIdx) => (
            <div key={colIdx} className="h-3.5 rounded bg-muted/60" style={{ width: `${w * 0.75}px`, maxWidth: "100%" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LeadDrawerSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-3.5 bg-muted rounded w-1/3" />
      </div>
      {/* Score pill */}
      <div className="h-8 bg-muted rounded-full w-24" />
      {/* Fields */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted/70 rounded w-3/4" />
        </div>
      ))}
      <div className="pt-4 border-t border-border/30 space-y-3">
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="h-9 bg-muted rounded-lg w-full" />
      </div>
    </div>
  );
}
