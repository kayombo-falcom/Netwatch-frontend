// Response shape for GET /api/devices/[mac]/activity — no logic here, just
// the JSON contract the proxy route passes through untouched.

export type DeviceActivity = {
  id: number;
  domain: string;
  source: string;
  timestamp: string;
  flagged: boolean;
};
