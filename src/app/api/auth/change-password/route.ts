import { proxyToBackend } from "@/lib/backend-proxy";

// Clears session cookies server-side so a password change always forces logout, even if the client never runs its follow-up logic.
export async function POST(request: Request) {
  const res = await proxyToBackend("/auth/change-password/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });

  if (res.status === 200) {
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
  }
  return res;
}
