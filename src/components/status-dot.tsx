import type { DeviceStatus } from "@/app/_lib/dashboard-data";
import { DEVICE_STATUS_DOT } from "@/lib/colors";

export const StatusDot = ({ status }: { status: DeviceStatus }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${DEVICE_STATUS_DOT[status]} shrink-0`} />
);
