import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_API_BASE } from "@/lib/backend-url";

const backendAuthHeaders = async (): Promise<Record<string, string> | null> => {
  const token = (await cookies()).get("access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
};

/** Proxies a request to the Django API with the caller's bearer token, relaying its JSON body and status back.
 * `path` is relative to the versioned API base, e.g. "/users/" not "/api/users/". */
export const proxyToBackend = async (path: string, init?: RequestInit) => {
  const authHeaders = await backendAuthHeaders();
  if (!authHeaders) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const res = await fetch(`${BACKEND_API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders, ...init?.headers },
  }).catch(() => null);
  if (!res) return NextResponse.json({ error: "The backend is unreachable. Please try again later." }, { status: 502 });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
};

/** Like proxyToBackend, but forwards the incoming request's query string too — for GET routes that just pass query params through. */
export const proxyToBackendWithQuery = (request: Request, path: string) =>
  proxyToBackend(`${path}${new URL(request.url).search}`);
