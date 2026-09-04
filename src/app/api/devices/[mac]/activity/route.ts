import { proxyToBackend } from "@/lib/backend-proxy";

export const GET = async (_request: Request, { params }: { params: Promise<{ mac: string }> }) => {
  const { mac } = await params;
  return proxyToBackend(`/devices/${encodeURIComponent(mac)}/activity/`);
};
