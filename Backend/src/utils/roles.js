export const ROLES = ["admin", "manager", "agent"];

export const DEFAULT_ROLE = "agent";

export const PROSPECT_VIEW_ROLES = ROLES;

export const PROSPECT_EDIT_ROLES = ["admin", "manager"];

export const ANALYTICS_ROLES = ["admin"];

export const ADMIN_ROLES = ["admin"];

export function isValidRole(role) {
	return ROLES.includes(role);
}