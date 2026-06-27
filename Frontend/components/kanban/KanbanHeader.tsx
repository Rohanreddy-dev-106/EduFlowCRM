"use client";

import { useState } from "react";
import { AlertTriangle, CalendarClock, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatDate } from "@/lib/utils";
import type { Prospect } from "@/types";

interface KanbanHeaderProps {
  overdueCount: number;
  dueTodayCount: number;
  totalCount: number;
  overdueProspects: Prospect[];
  dueTodayProspects: Prospect[];
  onProspectClick: (prospect: Prospect) => void;
}

export function KanbanHeader({
  overdueCount,
  dueTodayCount,
  totalCount,
  overdueProspects,
  dueTodayProspects,
  onProspectClick,
}: KanbanHeaderProps) {
  const [expanded, setExpanded] = useState<"overdue" | "today" | null>(null);

  return (
    <div className="flex flex-col gap-2 border-b border-ink-5 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 text-ink-4">
          <Users className="h-4 w-4" />
          <span className="text-sm font-mono">{totalCount} prospects</span>
        </div>

        <div className="hidden h-4 w-px bg-ink-5 sm:block" />

        <button
          onClick={() => setExpanded(expanded === "overdue" ? null : "overdue")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition-colors",
            overdueCount > 0 ? "bg-danger-muted text-danger hover:bg-danger/20" : "text-ink-4 hover:text-ink-3"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {overdueCount} overdue
        </button>

        <button
          onClick={() => setExpanded(expanded === "today" ? null : "today")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition-colors",
            dueTodayCount > 0 ? "bg-warning-muted text-warning hover:bg-warning/20" : "text-ink-4 hover:text-ink-3"
          )}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          {dueTodayCount} due today
        </button>
      </div>

      {expanded && (
        <div className="animate-fade-in rounded-lg border border-ink-5 bg-surface-2 p-3">
          <p className="mb-2 text-[11px] font-mono uppercase tracking-widest text-ink-4">
            {expanded === "overdue" ? "Overdue Follow-ups" : "Due Today"}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(expanded === "overdue" ? overdueProspects : dueTodayProspects).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onProspectClick(p);
                  setExpanded(null);
                }}
                className="flex items-center gap-2 rounded-lg border border-ink-5 bg-surface-3 px-3 py-1.5 text-left transition-colors hover:bg-surface-4"
              >
                <Avatar name={p.name} size="sm" />
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-semibold text-ink-1">{p.name}</p>
                  <p className="truncate text-[11px] font-mono text-ink-4">{formatDate(p.nextFollowUpDate)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
