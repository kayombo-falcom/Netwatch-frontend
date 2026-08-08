import { Pencil } from "lucide-react";
import { Btn } from "@/components/btn";
import { Modal } from "@/components/modal";
import { Tag } from "@/components/tag";
import type { usersData } from "@/app/_lib/dashboard-data";
import { tintContrastText, USER_ROLE_TINT, USER_STATUS_TINT, USER_STATUS_DOT, USER_STATUS_LABEL } from "@/lib/colors";

export const UserViewDialog = ({
  user, onClose, onEdit,
}: {
  user: typeof usersData[number];
  onClose: () => void;
  onEdit: () => void;
}) => (
  <Modal open onClose={onClose} className="max-w-md p-6">
    <div className="flex items-center gap-3 mb-5">
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${tintContrastText(USER_ROLE_TINT[user.role] ?? "muted")}`}
        style={{ backgroundColor: user.color }}
      >{user.initials}</div>
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {[
        ["Role", <Tag key="role" color={USER_ROLE_TINT[user.role] ?? "muted"}>{user.role}</Tag>],
        ["Status", (
          <Tag key="status" color={USER_STATUS_TINT[user.status]} className="font-mono">
            <span className={`inline-block w-2 h-2 rounded-full ${USER_STATUS_DOT[user.status]} shrink-0`} />
            {USER_STATUS_LABEL[user.status]}
          </Tag>
        )],
        ["Policy", user.policy],
        ["Last Seen", user.lastSeen],
      ].map(([label, val]) => (
        <div key={label as string}>
          <p className="text-xs text-muted-foreground/60 mb-0.5">{label as string}</p>
          <div className="text-xs font-medium text-foreground">{val as React.ReactNode}</div>
        </div>
      ))}
    </div>

    <div className="flex gap-2 justify-end mt-6">
      <Btn variant="secondary" onClick={onClose}>Close</Btn>
      <Btn variant="primary" onClick={onEdit}><Pencil size={13} /> Edit</Btn>
    </div>
  </Modal>
);
