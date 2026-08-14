import { proxyToBackend } from "@/lib/backend-proxy";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return proxyToBackend(`/api/users/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
};
