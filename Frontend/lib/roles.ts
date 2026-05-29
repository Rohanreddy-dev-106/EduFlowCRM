export const ROLES = ["admin", "manager", "agent"] as const;

export type Role = (typeof ROLES)[number];

export const PROSPECT_VIEW_ROLES = ROLES;

export const PROSPECT_EDIT_ROLES = ["admin", "manager"] as const;

export const ANALYTICS_ROLES = ["admin"] as const;

export const ADMIN_ROLES = ["admin"] as const;

export function hasRoleAccess(role: Role | string | null | undefined, allowedRoles: readonly Role[]) {
  return Boolean(role && allowedRoles.includes(role as Role));
}