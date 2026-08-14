"use client";

import { useState } from "react";
import { UserPlus, Pencil } from "lucide-react";
import { Btn } from "@/components/btn";
import { Modal } from "@/components/modal";
import { Dropdown } from "@/components/dropdown";
import { FieldError } from "@/components/field-error";
import { RequiredMark } from "@/components/required-mark";
import type { UserStatus } from "@/app/_lib/dashboard-data";
import { tintClass } from "@/lib/colors";
import { isValidEmail } from "@/lib/validation";

const ROLES = ["Admins", "Staff", "Students", "Guests", "IoT"].map(r => ({ label: r, value: r }));
const STATUSES = [{ label: "Active", value: "active" }, { label: "Suspended", value: "suspended" }];

const fieldClass = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-xs font-medium text-muted-foreground mb-1 block";

export type UserFormValues = { name: string; email: string; role: string; status: UserStatus; password: string };

/** Draft shape mirrors the form fields (name split, status optional) so a dialog can be reopened mid-edit — from a minimized bar or a persisted session — without having produced a valid `UserFormValues` yet. */
export type UserFormDraft = { firstName: string; lastName: string; email: string; role: string; status: UserStatus | ""; password: string };

export const emptyUserDraft: UserFormDraft = { firstName: "", lastName: "", email: "", role: "", status: "", password: "" };

export const userToDraft = (user: Omit<UserFormValues, "password">): UserFormDraft => {
  const [firstName = "", ...rest] = user.name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" "), email: user.email, role: user.role, status: user.status, password: "" };
};

export const UserFormDialog = ({
  mode, draft, onDraftChange, onClose, onSubmit, minimized = false, onMinimize, onRestore,
}: {
  mode: "add" | "edit";
  draft: UserFormDraft;
  onDraftChange: (draft: UserFormDraft) => void;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  minimized?: boolean;
  onMinimize?: () => void;
  onRestore?: () => void;
}) => {
  const { firstName, lastName, email, role, status, password } = draft;
  const patch = (changes: Partial<UserFormDraft>) => onDraftChange({ ...draft, ...changes });

  const [touched, setTouched] = useState<{ firstName?: boolean; lastName?: boolean; email?: boolean; password?: boolean }>({});
  const [attempted, setAttempted] = useState(false);

  const firstNameError = !firstName.trim() ? "First name is required." : null;
  const lastNameError = !lastName.trim() ? "Last name is required." : null;
  const emailError = !email.trim() ? "Email is required." : !isValidEmail(email) ? "Enter a valid email address." : null;
  const passwordError = mode === "add" && password.length < 8 ? "Password must be at least 8 characters." : null;

  const canSubmit = !firstNameError && !lastNameError && !emailError && !passwordError && role && status;

  const submit = () => {
    setAttempted(true);
    if (!canSubmit) return;
    onSubmit({ name: `${firstName.trim()} ${lastName.trim()}`, email: email.trim(), role, status: status as UserStatus, password });
  };

  const Icon = mode === "add" ? UserPlus : Pencil;
  const title = mode === "add" ? "Add User" : "Edit User";
  const submitLabel = mode === "add" ? "Add User" : "Save Changes";

  return (
    <Modal open onClose={onClose} title={title} minimizable minimized={minimized} onMinimize={onMinimize} onRestore={onRestore} className="max-w-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className={`p-2 rounded-full ${tintClass("teal")}`}><Icon size={18} /></span>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First Name<RequiredMark /></label>
            <input
              className={`${fieldClass} ${(touched.firstName || attempted) && firstNameError ? "border-destructive focus:ring-destructive" : ""}`}
              value={firstName}
              onChange={e => patch({ firstName: e.target.value })}
              onBlur={() => setTouched(t => ({ ...t, firstName: true }))}
              placeholder="e.g. Jordan"
              autoFocus
            />
            {(touched.firstName || attempted) && <FieldError message={firstNameError ?? undefined} />}
          </div>
          <div>
            <label className={labelClass}>Last Name<RequiredMark /></label>
            <input
              className={`${fieldClass} ${(touched.lastName || attempted) && lastNameError ? "border-destructive focus:ring-destructive" : ""}`}
              value={lastName}
              onChange={e => patch({ lastName: e.target.value })}
              onBlur={() => setTouched(t => ({ ...t, lastName: true }))}
              placeholder="e.g. Reyes"
            />
            {(touched.lastName || attempted) && <FieldError message={lastNameError ?? undefined} />}
          </div>
        </div>
        <div>
          <label className={labelClass}>Email<RequiredMark /></label>
          <input
            type="email"
            className={`${fieldClass} ${(touched.email || attempted) && emailError ? "border-destructive focus:ring-destructive" : ""}`}
            value={email}
            onChange={e => patch({ email: e.target.value })}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            placeholder="jordan.reyes@netwatch.io"
          />
          {(touched.email || attempted) && <FieldError message={emailError ?? undefined} />}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Role<RequiredMark /></label>
            <Dropdown options={ROLES} value={role} onChange={v => patch({ role: v })} />
          </div>
          <div>
            <label className={labelClass}>Status<RequiredMark /></label>
            <Dropdown options={STATUSES} value={status} onChange={v => patch({ status: v as UserStatus })} />
          </div>
        </div>
        {mode === "add" && (
          <div>
            <label className={labelClass}>Password<RequiredMark /></label>
            <input
              type="password"
              className={`${fieldClass} ${(touched.password || attempted) && passwordError ? "border-destructive focus:ring-destructive" : ""}`}
              value={password}
              onChange={e => patch({ password: e.target.value })}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              placeholder="At least 8 characters"
            />
            {(touched.password || attempted) && <FieldError message={passwordError ?? undefined} />}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end mt-6">
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit} disabled={!canSubmit}>
          <Icon size={13} /> {submitLabel}
        </Btn>
      </div>
    </Modal>
  );
};
