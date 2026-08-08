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
const POLICIES = ["Full Access", "Staff Default", "Student Tier", "Guest Wi-Fi", "IoT Isolated"].map(p => ({ label: p, value: p }));
const STATUSES = [{ label: "Active", value: "active" }, { label: "Suspended", value: "suspended" }];

const fieldClass = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-xs font-medium text-muted-foreground mb-1 block";

export type UserFormValues = { name: string; email: string; role: string; policy: string; status: UserStatus };

const splitName = (fullName: string) => {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
};

export const UserFormDialog = ({
  mode, initialValues, onClose, onSubmit,
}: {
  mode: "add" | "edit";
  initialValues?: UserFormValues;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}) => {
  const initialName = initialValues ? splitName(initialValues.name) : { firstName: "", lastName: "" };
  const [firstName, setFirstName] = useState(initialName.firstName);
  const [lastName, setLastName] = useState(initialName.lastName);
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [role, setRole] = useState(initialValues?.role ?? "");
  const [policy, setPolicy] = useState(initialValues?.policy ?? "");
  const [status, setStatus] = useState<UserStatus | "">(initialValues?.status ?? "");
  const [touched, setTouched] = useState<{ firstName?: boolean; lastName?: boolean; email?: boolean }>({});
  const [attempted, setAttempted] = useState(false);

  const firstNameError = !firstName.trim() ? "First name is required." : null;
  const lastNameError = !lastName.trim() ? "Last name is required." : null;
  const emailError = !email.trim() ? "Email is required." : !isValidEmail(email) ? "Enter a valid email address." : null;

  const canSubmit = !firstNameError && !lastNameError && !emailError && role && policy && status;

  const submit = () => {
    setAttempted(true);
    if (!canSubmit) return;
    onSubmit({ name: `${firstName.trim()} ${lastName.trim()}`, email: email.trim(), role, policy, status: status as UserStatus });
  };

  const Icon = mode === "add" ? UserPlus : Pencil;
  const title = mode === "add" ? "Add User" : "Edit User";
  const submitLabel = mode === "add" ? "Add User" : "Save Changes";

  return (
    <Modal open onClose={onClose} className="max-w-md p-6">
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
              onChange={e => setFirstName(e.target.value)}
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
              onChange={e => setLastName(e.target.value)}
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
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            placeholder="jordan.reyes@netwatch.io"
          />
          {(touched.email || attempted) && <FieldError message={emailError ?? undefined} />}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Role<RequiredMark /></label>
            <Dropdown options={ROLES} value={role} onChange={setRole} />
          </div>
          <div>
            <label className={labelClass}>Policy<RequiredMark /></label>
            <Dropdown options={POLICIES} value={policy} onChange={setPolicy} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Status<RequiredMark /></label>
          <Dropdown options={STATUSES} value={status} onChange={v => setStatus(v as UserStatus)} />
        </div>
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
