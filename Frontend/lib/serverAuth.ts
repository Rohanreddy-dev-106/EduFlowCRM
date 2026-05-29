import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api";
import type { Role } from "@/lib/roles";
import { hasRoleAccess } from "@/lib/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthResult =
  | { ok: true; user: AuthUser; token: string }
  | { ok: false; response: NextResponse };

export async function requireAuth(allowedRoles?: readonly Role[]): Promise<AuthResult> {
  const token = cookies().get("token")?.value;
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  try {
    const res = await backendFetch("/api/auth/me", { token });
    const json = await res.json();
    if (!res.ok || !json?.data) {
      return { ok: false, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
    }

    const user = json.data as AuthUser;
    if (allowedRoles && !hasRoleAccess(user.role, allowedRoles)) {
      return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { ok: true, user, token };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
}

