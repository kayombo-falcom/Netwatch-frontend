import { proxyToBackendWithQuery } from "@/lib/backend-proxy";

export const GET = (request: Request) => proxyToBackendWithQuery(request, "/network/os-detect/");
