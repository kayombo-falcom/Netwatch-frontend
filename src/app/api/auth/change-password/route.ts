import { proxyToBackend } from "@/lib/backend-proxy";

/** Proxies to the backend, then clears the session cookies server-side on success —
 * a changed password must force logout even if the client never gets to run its
 * own follow-up logic. */
export async function POST(request: Request) {
  const res = await proxyToBackend("/api/auth/change-password/", {
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
