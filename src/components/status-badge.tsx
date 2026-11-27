import type { DeviceStatus } from "@/app/_lib/dashboard-data";
import { StatusDot } from "@/components/status-dot";
import { Tag } from "@/components/tag";
import { DEVICE_STATUS_TINT } from "@/lib/colors";

const LABELS: Record<DeviceStatus, string> = {
  online: "Online", idle: "Idle", blocked: "Blocked", paused: "Paused",
};

export const StatusBadge = ({ status }: { status: DeviceStatus }) => (
  <Tag color={DEVICE_STATUS_TINT[status]} className="font-mono">
    <StatusDot status={status} />
    {LABELS[status]}
  </Tag>
);
