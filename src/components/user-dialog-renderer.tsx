"use client";

import { UserFormDialog, type UserFormDraft } from "@/components/user-form-dialog";
import { useUsersStore } from "@/hooks/use-users-store";
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

  return (
    <UserFormDialog
      key={descriptor.mode === "edit" ? `edit-${descriptor.userId}` : "add"}
      mode={descriptor.mode}
      draft={descriptor.draft}
      onDraftChange={onDraftChange}
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
