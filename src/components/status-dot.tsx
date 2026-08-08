import type { DeviceStatus } from "@/app/_lib/dashboard-data";

export const StatusDot = ({ status }: { status: DeviceStatus }) => {
  const colors: Record<DeviceStatus, string> = {
    online: "bg-status-online",
    idle: "bg-status-warning",
    blocked: "bg-status-critical",
    paused: "bg-muted-foreground",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]} shrink-0`} />;
};
