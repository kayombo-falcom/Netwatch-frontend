import { NextResponse } from "next/server";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE, authCookieOptions } from "@/lib/auth-cookies";
import { BACKEND_API_BASE } from "@/lib/backend-url";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json({ error: "The backend is unreachable. Please try again later." }, { status: 502 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const { access, refresh } = await backendResponse.json();

  const meResponse = await fetch(`${BACKEND_API_BASE}/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  }).catch(() => null);
  const name = meResponse?.ok ? (await meResponse.json()).name : undefined;

  const response = NextResponse.json({ success: true, name });
  response.cookies.set("access_token", access, authCookieOptions(ACCESS_TOKEN_MAX_AGE));
  response.cookies.set("refresh_token", refresh, authCookieOptions(REFRESH_TOKEN_MAX_AGE));
  return response;
}
