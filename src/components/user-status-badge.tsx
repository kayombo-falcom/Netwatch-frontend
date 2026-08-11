import type { UserStatus } from "@/app/_lib/dashboard-data";
import { Tag } from "@/components/tag";
import { USER_STATUS_TINT, USER_STATUS_DOT, USER_STATUS_LABEL } from "@/lib/colors";

export const UserStatusBadge = ({ status }: { status: UserStatus }) => (
  <Tag color={USER_STATUS_TINT[status]} className="font-mono">
    <span className={`inline-block w-2 h-2 rounded-full ${USER_STATUS_DOT[status]} shrink-0`} />
    {USER_STATUS_LABEL[status]}
  </Tag>
);
