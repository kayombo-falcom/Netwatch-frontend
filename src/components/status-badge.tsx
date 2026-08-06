import type { DeviceStatus } from "@/app/_lib/dashboard-data";
import { StatusDot } from "@/components/status-dot";

export const StatusBadge = ({ status }: { status: DeviceStatus }) => {
  const styles: Record<DeviceStatus, string> = {
    online: "bg-green-50 text-green-700 border-green-200",
    idle: "bg-amber-50 text-amber-700 border-amber-200",
    blocked: "bg-red-50 text-red-600 border-red-200",
    paused: "bg-muted text-muted-foreground border-border",
  };
  const labels: Record<DeviceStatus, string> = {
    online: "Online", idle: "Idle", blocked: "Blocked", paused: "Paused",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border font-mono ${styles[status]}`}>
      <StatusDot status={status} />
      {labels[status]}
    </span>
  );
};
