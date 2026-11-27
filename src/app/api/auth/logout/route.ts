import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_API_BASE } from "@/lib/backend-url";

export async function POST() {
  const refreshToken = (await cookies()).get("refresh_token")?.value;
  if (refreshToken) {
    await fetch(`${BACKEND_API_BASE}/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    }).catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
