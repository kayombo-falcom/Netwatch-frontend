import { proxyToBackend } from "@/lib/backend-proxy";

export const DELETE = async (request: Request, { params }: { params: Promise<{ name: string }> }) => {
  const { name } = await params;
  return proxyToBackend(`/roles/${encodeURIComponent(name)}/`, { method: "DELETE" });
};
