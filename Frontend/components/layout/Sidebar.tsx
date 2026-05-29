// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Kanban, Settings, Zap, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { ANALYTICS_ROLES, PROSPECT_VIEW_ROLES, hasRoleAccess, type Role } from "@/lib/roles";
import type { ComponentType } from "react";

const NAV_ITEMS = [
  { href: "/", icon: Kanban, label: "Pipeline", allowedRoles: PROSPECT_VIEW_ROLES },
  { href: "/admin/crm/analytics", icon: BarChart3, label: "Analytics", allowedRoles: ANALYTICS_ROLES },
  { href: "/settings", icon: Settings, label: "Settings", allowedRoles: PROSPECT_VIEW_ROLES },
];

type NavItem = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  allowedRoles: readonly Role[];
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col w-[220px] shrink-0 bg-surface-1 border-r border-ink-5 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-ink-5">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-ink-1 leading-none">KALNET</p>
          <p className="text-[10px] font-mono text-ink-4 mt-0.5">CRM · Internal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-mono font-semibold text-ink-5 uppercase tracking-widest px-2 mb-2">
          Menu
        </p>
        {NAV_ITEMS.filter(({ allowedRoles }: NavItem) => hasRoleAccess(user?.role, allowedRoles)).map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-brand-500/15 text-brand-400 font-medium"
                  : "text-ink-4 hover:text-ink-2 hover:bg-surface-3"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="px-3 py-3 border-t border-ink-5">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-brand-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink-1 truncate">{user.name}</p>
                <p className="text-[10px] font-mono text-ink-4 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-ink-4 hover:text-danger hover:bg-danger-muted transition-colors w-full"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="px-2">
            <p className="text-[10px] font-mono text-ink-5">System 3 · Full Stack</p>
          </div>
        )}
      </div>
    </aside>
  );
}
