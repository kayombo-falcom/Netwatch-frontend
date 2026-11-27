"use client";

import { UserFormDialog, type UserFormDraft } from "@/components/user-form-dialog";
import { useUsersStore } from "@/hooks/use-users-store";
import { useRolesStore } from "@/hooks/use-roles-store";
import type { DialogDescriptor } from "@/hooks/use-dialog-host";

export const UserDialogRenderer = ({
  descriptor, minimized, onClose, onMinimize, onRestore, onDraftChange,
}: {
  descriptor: DialogDescriptor;
  minimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  onDraftChange: (draft: UserFormDraft) => void;
}) => {
  const { addUser, updateUser } = useUsersStore();
  const { roles } = useRolesStore();

  return (
    <UserFormDialog
      key={descriptor.mode === "edit" ? `edit-${descriptor.userId}` : "add"}
      mode={descriptor.mode}
      draft={descriptor.draft}
      onDraftChange={onDraftChange}
      roleOptions={roles.map(r => ({ label: r.name, value: r.name }))}
      minimized={minimized}
      onMinimize={onMinimize}
      onRestore={onRestore}
      onClose={onClose}
      onSubmit={values => {
        if (descriptor.mode === "add" || descriptor.userId === undefined) addUser(values);
        else updateUser(descriptor.userId, values);
        onClose();
      }}
    />
  );
};
