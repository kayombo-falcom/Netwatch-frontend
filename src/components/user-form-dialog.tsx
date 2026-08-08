"use client";

import { useState } from "react";
import { UserPlus, Pencil } from "lucide-react";
import { Btn } from "@/components/btn";
import { Modal } from "@/components/modal";
import { Dropdown } from "@/components/dropdown";
import type { UserStatus } from "@/app/_lib/dashboard-data";
import { tintClass } from "@/lib/colors";

const ROLES = ["Admins", "Staff", "Students", "Guests", "IoT"].map(r => ({ label: r, value: r }));
const POLICIES = ["Full Access", "Staff Default", "Student Tier", "Guest Wi-Fi", "IoT Isolated"].map(p => ({ label: p, value: p }));
const STATUSES = [{ label: "Active", value: "active" }, { label: "Suspended", value: "suspended" }];

const fieldClass = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-xs font-medium text-muted-foreground mb-1 block";

export type UserFormValues = { name: string; email: string; role: string; policy: string; status: UserStatus };

export const UserFormDialog = ({
  mode, initialValues, onClose, onSubmit,
}: {
  mode: "add" | "edit";
  initialValues?: UserFormValues;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}) => {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [role, setRole] = useState(initialValues?.role ?? ROLES[0].value);
  const [policy, setPolicy] = useState(initialValues?.policy ?? POLICIES[0].value);
  const [status, setStatus] = useState<UserStatus>(initialValues?.status ?? "active");

  const submit = () => {
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name: name.trim(), email: email.trim(), role, policy, status });
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
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            className={fieldClass}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Jordan Reyes"
            autoFocus
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={fieldClass}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jordan.reyes@netwatch.io"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Role</label>
            <Dropdown options={ROLES} value={role} onChange={setRole} />
          </div>
          <div>
            <label className={labelClass}>Policy</label>
            <Dropdown options={POLICIES} value={policy} onChange={setPolicy} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <Dropdown options={STATUSES} value={status} onChange={v => setStatus(v as UserStatus)} />
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-6">
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit} disabled={!name.trim() || !email.trim()}>
          <Icon size={13} /> {submitLabel}
        </Btn>
      </div>
    </Modal>
  );
};
