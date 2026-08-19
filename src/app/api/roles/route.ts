import { proxyToBackend } from "@/lib/backend-proxy";

export const GET = () => proxyToBackend("/roles/");

export const POST = async (request: Request) =>
  proxyToBackend("/roles/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
