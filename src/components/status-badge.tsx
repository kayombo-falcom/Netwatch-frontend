import type { DeviceStatus } from "@/app/_lib/dashboard-data";
import { StatusDot } from "@/components/status-dot";

export const StatusBadge = ({ status }: { status: DeviceStatus }) => {
  const styles: Record<DeviceStatus, string> = {
    online: "bg-tint-teal-bg text-tint-teal-fg border-border",
    idle: "bg-tint-amber-bg text-tint-amber-fg border-border",
    blocked: "bg-tint-navy-bg text-tint-navy-fg border-border",
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
