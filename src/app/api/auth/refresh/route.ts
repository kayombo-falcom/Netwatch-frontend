import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE, authCookieOptions } from "@/lib/auth-cookies";

/** Renews the access token from the refresh token, then touches an authenticated
 * endpoint so the backend's idle-session clock resets immediately. Used to both
 * silently refresh a session and to fulfil "stay signed in" from the idle-timeout prompt. */
export async function POST() {
  const refreshToken = (await cookies()).get("refresh_token")?.value;
  if (!refreshToken) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const refreshRes = await fetch(`${process.env.BACKEND_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  }).catch(() => null);

  if (!refreshRes || !refreshRes.ok) {
    return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
  }

  const { access, refresh } = await refreshRes.json();

  await fetch(`${process.env.BACKEND_URL}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  }).catch(() => null);

  const response = NextResponse.json({ success: true });
  response.cookies.set("access_token", access, authCookieOptions(ACCESS_TOKEN_MAX_AGE));
  if (refresh) response.cookies.set("refresh_token", refresh, authCookieOptions(REFRESH_TOKEN_MAX_AGE));
  return response;
}
