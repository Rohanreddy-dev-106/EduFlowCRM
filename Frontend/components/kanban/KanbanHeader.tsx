"use client";

import { AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanHeaderProps {
  overdueCount: number;
  totalCount: number;
}

export function KanbanHeader({
  overdueCount,
  totalCount,
}: KanbanHeaderProps) {
  return (
    <div className="border-b border-ink-5 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 text-ink-4">
          <Users className="h-4 w-4" />
          <span className="text-sm font-mono">{totalCount} prospects</span>
        </div>

        <div className="hidden h-4 w-px bg-ink-5 sm:block" />

        <button
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition-colors",
            overdueCount > 0 ? "bg-danger-muted text-danger hover:bg-danger/20" : "text-ink-4 hover:text-ink-3"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {overdueCount} overdue
        </button>

      </div>
    </div>
  );
}
