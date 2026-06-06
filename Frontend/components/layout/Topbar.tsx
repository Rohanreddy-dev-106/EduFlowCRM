// components/layout/Topbar.tsx
"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "./NotificationBell";

interface TopbarProps {
  title: string;
  onAddProspect?: () => void;
}

export function Topbar({ title, onAddProspect }: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-ink-5 bg-surface-1">
      <h1 className="text-base font-semibold text-ink-1">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-5 pointer-events-none" />
          <input
            type="search"
            placeholder="Search prospects…"
            className="bg-surface-3 border border-ink-5 rounded-md pl-8 pr-3 py-1.5 text-sm text-ink-1 placeholder:text-ink-5 focus:outline-none focus:border-brand-500 w-52"
          />
        </div>
        <NotificationBell />
        {onAddProspect && (
          <Button size="sm" onClick={onAddProspect}>
            <Plus className="w-4 h-4" />
            Add Prospect
          </Button>
        )}
      </div>
    </header>
  );
}
