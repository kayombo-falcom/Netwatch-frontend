import type { DeviceStatus } from "@/app/_lib/dashboard-data";

export const StatusDot = ({ status }: { status: DeviceStatus }) => {
  const colors: Record<DeviceStatus, string> = {
    online: "bg-green-500",
    idle: "bg-amber-400",
    blocked: "bg-red-500",
    paused: "bg-slate-400",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]} shrink-0`} />;
};
