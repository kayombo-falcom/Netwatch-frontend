"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Lock, Pencil, Plus, Save, ShieldAlert, Trash2 } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FieldError } from "@/components/field-error";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { tintClass } from "@/lib/colors";
import { toast } from "@/lib/toast-store";
import { useRolesStore } from "@/hooks/use-roles-store";
import { useUsersStore } from "@/hooks/use-users-store";

type PermissionRow = { permission: string; label: string; roles: Record<string, boolean> };

const CATEGORY_LABELS: Record<string, string> = {
  users: "Users",
  devices: "Devices",
  access_points: "Access Points",
  policies: "Policies",
  traffic: "Traffic Reports",
  alerts: "Alerts",
  settings: "Settings",
};

const categoryOf = (permission: string) => CATEGORY_LABELS[permission.split(".")[0]] ?? permission;

const ADMIN_ROLE = "Admins";

export default function RolesPermissionsPage() {
  const { roles: storeRoles, addRole, renameRole, deleteRole } = useRolesStore();
  const { refetchUsers } = useUsersStore();
  const [rows, setRows] = useState<PermissionRow[] | null>(null);
  const [grants, setGrants] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [addAttempted, setAddAttempted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAttempted, setEditAttempted] = useState(false);
  const [editing, setEditing] = useState(false);

  const roleColumns = useMemo(
    () => [...storeRoles].sort((a, b) => Number(b.isBuiltin) - Number(a.isBuiltin) || a.name.localeCompare(b.name)),
    [storeRoles]
  );

  const grantsFromRows = (data: PermissionRow[]) => {
    const next: Record<string, Record<string, boolean>> = {};
    for (const row of data) {
      for (const [role, granted] of Object.entries(row.roles)) {
        next[role] = { ...(next[role] ?? {}), [row.permission]: granted };
      }
    }
    return next;
  };

  const loadMatrix = () =>
    fetch("/api/roles/permissions")
      .then(res => {
        if (res.status === 403) {
          setForbidden(true);
          return null;
        }
        return res.json();
      })
      .then((data: PermissionRow[] | null) => {
        if (!data) return;
        setRows(data);
        setGrants(grantsFromRows(data));
      })
      .catch(() => toast.error("Couldn't load roles & permissions", "Please refresh the page to try again."));

  useEffect(() => {
    loadMatrix().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    if (!rows) return [];
    const byCategory = new Map<string, PermissionRow[]>();
    for (const row of rows) {
      const category = categoryOf(row.permission);
      byCategory.set(category, [...(byCategory.get(category) ?? []), row]);
    }
    return [...byCategory.entries()];
  }, [rows]);

  const dirty = useMemo(() => {
    if (!rows) return false;
    return rows.some(r =>
      roleColumns.some(role => role.name !== ADMIN_ROLE && !!grants[role.name]?.[r.permission] !== !!r.roles[role.name])
    );
  }, [rows, grants, roleColumns]);

  const toggle = (role: string, permission: string) => {
    setGrants(prev => ({ ...prev, [role]: { ...prev[role], [permission]: !prev[role]?.[permission] } }));
  };

  const handleSave = async () => {
    if (!rows) return;
    const updates = rows.flatMap(r =>
      roleColumns
        .filter(role => role.name !== ADMIN_ROLE && !!grants[role.name]?.[r.permission] !== !!r.roles[role.name])
        .map(role => ({ role: role.name, permission: r.permission, granted: !!grants[role.name]?.[r.permission] }))
    );
    if (!updates.length) return;

    setSaving(true);
    const res = await fetch("/api/roles/permissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    }).catch(() => null);
    setSaving(false);

    if (!res || !res.ok) {
      toast.error("Couldn't save changes", "Please try again.");
      return;
    }
    const data: PermissionRow[] = await res.json();
    setRows(data);
    setGrants(grantsFromRows(data));
    toast.success("Permissions updated", "Access has been saved.");
  };

  const handleDiscard = () => {
    if (!rows) return;
    setGrants(grantsFromRows(rows));
  };

  const handleAddRole = async () => {
    setAddAttempted(true);
    const name = newRoleName.trim();
    if (!name) return;
    setAdding(true);
    const ok = await addRole(name);
    setAdding(false);
    if (!ok) return;
    setAddOpen(false);
    setNewRoleName("");
    setAddAttempted(false);
    await loadMatrix();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget;
    setDeleteTarget(null);
    const ok = await deleteRole(name);
    if (ok) await loadMatrix();
  };

  const openEditRole = (name: string) => {
    setEditTarget(name);
    setEditName(name);
    setEditAttempted(false);
  };

  const handleRenameRole = async () => {
    setEditAttempted(true);
    const name = editName.trim();
    if (!name || !editTarget) return;
    setEditing(true);
    const ok = await renameRole(editTarget, name);
    setEditing(false);
    if (!ok) return;
    setEditTarget(null);
    // The rename cascades to every user on that role — refresh the users list
    // so their role label doesn't keep showing the old name.
    await Promise.all([loadMatrix(), refetchUsers()]);
  };

  if (forbidden) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 flex flex-col items-center text-center gap-2">
          <ShieldAlert size={28} className="text-muted-foreground/60" />
          <h3 className="font-semibold text-foreground">Admins only</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Only Admins can view or change the roles &amp; permissions matrix.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Roles &amp; Permissions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Admins always have full access. Add roles and choose what each can see and do.
          </p>
        </div>
        <Btn variant="primary" size="sm" onClick={() => setAddOpen(true)}><Plus size={13} /> Add Role</Btn>
      </div>

      <Card>
        <CardHeader title="Permission matrix" subtitle="Toggle access per feature, per role" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Permission</th>
                {loading
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <th key={i} className="px-5 py-3 w-28"><SkeletonText width="60%" className="mx-auto" /></th>
                    ))
                  : roleColumns.map(role => (
                      <th key={role.name} className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">
                        <span className="inline-flex items-center gap-1.5 normal-case">
                          {role.name}
                          {!role.isBuiltin && (
                            <>
                              <button
                                type="button"
                                title={`Rename ${role.name}`}
                                onClick={() => openEditRole(role.name)}
                                className="text-muted-foreground/50 hover:text-foreground transition-colors"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                type="button"
                                title={`Delete ${role.name}`}
                                onClick={() => setDeleteTarget(role.name)}
                                className="text-muted-foreground/50 hover:text-destructive transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </span>
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3"><SkeletonText width="60%" /></td>
                    <td className="px-5 py-3"><Skeleton className="w-4 h-4 rounded mx-auto" /></td>
                    <td className="px-5 py-3"><Skeleton className="w-4 h-4 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : (
                grouped.map(([category, permissions]) => (
                  <Fragment key={category}>
                    <tr className="bg-muted/30">
                      <td colSpan={1 + roleColumns.length} className="px-5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {category}
                      </td>
                    </tr>
                    {permissions.map(row => (
                      <tr key={row.permission}>
                        <td className="px-5 py-3 text-foreground">{row.label}</td>
                        {roleColumns.map(role =>
                          role.name === ADMIN_ROLE ? (
                            <td key={role.name} className="px-5 py-3 text-center">
                              <span title="Admins always have full access" className="inline-flex items-center justify-center text-muted-foreground/50">
                                <Lock size={13} />
                              </span>
                            </td>
                          ) : (
                            <td key={role.name} className="px-5 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={!!grants[role.name]?.[row.permission]}
                                onChange={() => toggle(role.name, row.permission)}
                                className="w-4 h-4 accent-primary cursor-pointer"
                              />
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="flex gap-2 justify-end px-5 py-4 border-t border-border">
            <Btn variant="secondary" size="sm" onClick={handleDiscard} disabled={!dirty || saving}>Discard</Btn>
            <Btn variant="primary" size="sm" onClick={handleSave} disabled={!dirty || saving}>
              <Save size={13} /> {saving ? "Saving…" : "Save Changes"}
            </Btn>
          </div>
        )}
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} className="max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`p-2 rounded-full ${tintClass("teal")}`}><Plus size={18} /></span>
          <h3 className="font-semibold text-foreground">Add Role</h3>
        </div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Role name</label>
        <input
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${addAttempted && !newRoleName.trim() ? "border-destructive focus:ring-destructive" : "border-border"}`}
          value={newRoleName}
          onChange={e => setNewRoleName(e.target.value)}
          placeholder="e.g. Managers"
          autoFocus
          onKeyDown={e => { if (e.key === "Enter") handleAddRole(); }}
        />
        {addAttempted && !newRoleName.trim() && <FieldError message="Role name is required." />}
        <p className="text-xs text-muted-foreground/60 mt-3">New roles start with no access — grant permissions from the matrix once it&apos;s added.</p>
        <div className="flex gap-2 justify-end mt-5">
          <Btn variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleAddRole} disabled={adding}>{adding ? "Adding…" : "Add Role"}</Btn>
        </div>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} className="max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`p-2 rounded-full ${tintClass("teal")}`}><Pencil size={18} /></span>
          <h3 className="font-semibold text-foreground">Rename Role</h3>
        </div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Role name</label>
        <input
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${editAttempted && !editName.trim() ? "border-destructive focus:ring-destructive" : "border-border"}`}
          value={editName}
          onChange={e => setEditName(e.target.value)}
          autoFocus
          onKeyDown={e => { if (e.key === "Enter") handleRenameRole(); }}
        />
        {editAttempted && !editName.trim() && <FieldError message="Role name is required." />}
        <p className="text-xs text-muted-foreground/60 mt-3">Users on this role and its saved permissions move to the new name automatically.</p>
        <div className="flex gap-2 justify-end mt-5">
          <Btn variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleRenameRole} disabled={editing}>{editing ? "Saving…" : "Save"}</Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete role?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget}"? Users on this role must be reassigned first.` : ""}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
