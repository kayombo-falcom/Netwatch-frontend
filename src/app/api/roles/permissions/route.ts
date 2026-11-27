import { proxyToBackend } from "@/lib/backend-proxy";

export const GET = () => proxyToBackend("/roles/permissions/");

export const PATCH = async (request: Request) =>
  proxyToBackend("/roles/permissions/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
