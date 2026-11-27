import { proxyToBackend } from "@/lib/backend-proxy";

export const GET = () => proxyToBackend("/users/");

export const POST = async (request: Request) =>
  proxyToBackend("/users/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
