import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_MAX_AGE, authCookieOptions } from "@/lib/auth-cookies";
import { BACKEND_API_BASE } from "@/lib/backend-url";

const LOGIN_URL = "/login";

const redirectToLogin = (request: NextRequest) => {
  const response = NextResponse.redirect(new URL(LOGIN_URL, request.url));
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
};

/** Exchanges the refresh token cookie for a new access token via Django. */
const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const res = await fetch(`${BACKEND_API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  }).catch(() => null);

  if (!res?.ok) return null;
  const { access } = await res.json();
  return access;
};

/**
 * Gates every dashboard route behind a real backend check: the access token must
 * be valid AND its user must still exist and be active. A merely-present cookie
 * isn't enough — Django's /me/ endpoint re-queries the user per request, so a
 * deleted or deactivated account is kicked out immediately, not just when its
 * token happens to expire.
 */
export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) return redirectToLogin(request);

  const meResponse = await fetch(`${BACKEND_API_BASE}/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null);

  if (meResponse?.ok) return NextResponse.next();

  const refreshToken = request.cookies.get("refresh_token")?.value;
  const newAccessToken = refreshToken ? await refreshAccessToken(refreshToken) : null;
  if (!newAccessToken) return redirectToLogin(request);

  const response = NextResponse.next();
  response.cookies.set("access_token", newAccessToken, authCookieOptions(ACCESS_TOKEN_MAX_AGE));
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*|login|forgot-password).*)"],
};
