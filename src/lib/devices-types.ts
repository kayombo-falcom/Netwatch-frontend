// Response shape for GET /api/devices/[mac]/activity — just the JSON contract, no logic.

export type DeviceActivity = {
  id: number;
  domain: string;
  source: string;
  timestamp: string;
  flagged: boolean;
};
