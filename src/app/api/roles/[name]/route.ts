import { proxyToBackend } from "@/lib/backend-proxy";

export const PATCH = async (request: Request, { params }: { params: Promise<{ name: string }> }) => {
  const { name } = await params;
  return proxyToBackend(`/roles/${encodeURIComponent(name)}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
};

export const DELETE = async (request: Request, { params }: { params: Promise<{ name: string }> }) => {
  const { name } = await params;
  return proxyToBackend(`/roles/${encodeURIComponent(name)}/`, { method: "DELETE" });
};
