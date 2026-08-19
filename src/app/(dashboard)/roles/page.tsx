"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell, Check, KeyRound, Lock, Monitor, Pencil, Plus, Radio, Save, Search,
  Settings, ShieldAlert, ShieldCheck, Trash2, Users, BarChart2, X,
} from "lucide-react";
import { Card } from "@/components/card";
import { Btn } from "@/components/btn";
import { Tag } from "@/components/tag";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FieldError } from "@/components/field-error";
import { SegmentedToggle } from "@/components/segmented-toggle";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/skeleton";
import { tintClass, USER_ROLE_TINT, type TintColor } from "@/lib/colors";
import { toast } from "@/lib/toast-store";
import { useRolesStore } from "@/hooks/use-roles-store";
import { useUsersStore } from "@/hooks/use-users-store";

type PermissionRow = { permission: string; label: string; roles: Record<string, boolean> };

const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  users: { label: "Users", icon: Users },
  devices: { label: "Devices", icon: Monitor },
  access_points: { label: "Access Points", icon: Radio },
  policies: { label: "Policies", icon: ShieldCheck },
  traffic: { label: "Traffic Reports", icon: BarChart2 },
  alerts: { label: "Alerts", icon: Bell },
  settings: { label: "Settings", icon: Settings },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_META);
const CUSTOM_ROLE_TINTS: TintColor[] = ["aqua", "teal", "amber", "navy"];

const categoryKeyOf = (permission: string) => permission.split(".")[0];
const categoryMetaOf = (key: string) => CATEGORY_META[key] ?? { label: key, icon: KeyRound };
const roleTint = (name: string): TintColor => {
  if (USER_ROLE_TINT[name]) return USER_ROLE_TINT[name];
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  return CUSTOM_ROLE_TINTS[hash % CUSTOM_ROLE_TINTS.length];
};

const ADMIN_ROLE = "Admins";
const SELECTED_ROLE_TINT: TintColor = "navy";

export default function RolesPermissionsPage() {
  const { roles: storeRoles, addRole, renameRole, deleteRole } = useRolesStore();
  const { refetchUsers } = useUsersStore();
  const [rows, setRows] = useState<PermissionRow[] | null>(null);
  const [grants, setGrants] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRoleState, setSelectedRoleState] = useState<string | null>(null);
  const [permSearch, setPermSearch] = useState("");
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

  const selectedRole = selectedRoleState && roleColumns.some(r => r.name === selectedRoleState)
    ? selectedRoleState
    : (roleColumns[0]?.name ?? null);

  const selectRole = (name: string) => {
    setSelectedRoleState(name);
    setPermSearch("");
  };

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
        if (!res.ok) throw new Error("roles permissions request failed");
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

  const grantedCountFor = (roleName: string) => (rows ? rows.filter(r => !!grants[roleName]?.[r.permission]).length : 0);

  const grouped = useMemo(() => {
    if (!rows) return [];
    const q = permSearch.trim().toLowerCase();
    const filteredRows = q
      ? rows.filter(r => {
          const category = categoryMetaOf(categoryKeyOf(r.permission)).label;
          return r.label.toLowerCase().includes(q) || r.permission.toLowerCase().includes(q) || category.toLowerCase().includes(q);
        })
      : rows;
    const byCategory = new Map<string, PermissionRow[]>();
    for (const row of filteredRows) {
      const key = categoryKeyOf(row.permission);
      byCategory.set(key, [...(byCategory.get(key) ?? []), row]);
    }
    const keys = [...byCategory.keys()].sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a);
      const ib = CATEGORY_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return keys.map(key => [key, byCategory.get(key)!] as const);
  }, [rows, permSearch]);

  const dirtyRoleNames = useMemo(() => {
    if (!rows) return new Set<string>();
    return new Set(
      roleColumns
        .filter(role => role.name !== ADMIN_ROLE && rows.some(r => !!grants[role.name]?.[r.permission] !== !!r.roles[role.name]))
        .map(role => role.name)
    );
  }, [rows, grants, roleColumns]);

  const dirty = dirtyRoleNames.size > 0;

  const toggle = (role: string, permission: string) => {
    setGrants(prev => ({ ...prev, [role]: { ...prev[role], [permission]: !prev[role]?.[permission] } }));
  };

  const setAllPermissions = (role: string, granted: boolean) => {
    if (!rows) return;
    setGrants(prev => ({
      ...prev,
      [role]: Object.fromEntries(rows.map(row => [row.permission, granted])),
    }));
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
    selectRole(name);
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
    selectRole(name);
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

  const selectedRoleObj = roleColumns.find(r => r.name === selectedRole);
  const isAdminSelected = selectedRole === ADMIN_ROLE;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="px-4 py-3 flex items-center gap-3">
          <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${tintClass("navy")}`}><Users size={17} /></span>
          <div><p className="text-xs text-muted-foreground">Total roles</p><p className="text-lg font-semibold text-foreground">{loading ? "—" : roleColumns.length}</p></div>
        </Card>
        <Card className="px-4 py-3 flex items-center gap-3">
          <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${tintClass("teal")}`}><KeyRound size={17} /></span>
          <div><p className="text-xs text-muted-foreground">Available permissions</p><p className="text-lg font-semibold text-foreground">{loading ? "—" : rows?.length ?? 0}</p></div>
        </Card>
        <Card className="px-4 py-3 flex items-center gap-3">
          <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${tintClass("amber")}`}><Check size={17} /></span>
          <div><p className="text-xs text-muted-foreground">Selected role access</p><p className="text-lg font-semibold text-foreground">{loading || !selectedRole ? "—" : isAdminSelected ? "All" : `${grantedCountFor(selectedRole)} / ${rows?.length ?? 0}`}</p></div>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Role rail */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Roles</h3>
            <div className="flex items-center gap-3">
              {!loading && <span className="text-xs text-muted-foreground">{roleColumns.length}</span>}
              <Btn variant="primary" size="xs" onClick={() => setAddOpen(true)}><Plus size={12} /> Add Role</Btn>
            </div>
          </div>
          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto" aria-label="Available roles">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <SkeletonCircle size={32} />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonText width="70%" />
                      <SkeletonText width="45%" />
                    </div>
                  </div>
                ))
              : roleColumns.map(role => {
                  const active = role.name === selectedRole;
                  const tint = roleTint(role.name);
                  const granted = grantedCountFor(role.name);
                  return (
                    <div
                      key={role.name}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${role.name} role`}
                      onClick={() => selectRole(role.name)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectRole(role.name);
                        }
                      }}
                      className={`group w-full text-left px-3 py-2.5 rounded-lg border border-border flex items-center gap-3 cursor-pointer transition-colors ${
                        active ? `${tintClass(SELECTED_ROLE_TINT)} border-primary/30 ring-1 ring-inset ring-primary/20` : "hover:bg-muted hover:border-primary/30"
                      }`}
                    >
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${tintClass(active ? SELECTED_ROLE_TINT : tint)}`}>
                        {role.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground truncate">{role.name}</span>
                          {dirtyRoleNames.has(role.name) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" title="Unsaved changes" />
                          )}
                        </span>
                        <span className="block text-xs text-muted-foreground/70 truncate">
                          {role.name === ADMIN_ROLE ? "Full access" : `${granted}/${rows?.length ?? 0} permissions`}
                        </span>
                      </span>
                      {!role.isBuiltin && (
                        <span
                          className="flex items-center gap-1 shrink-0"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            title={`Edit ${role.name}`}
                            onClick={() => openEditRole(role.name)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-tint-aqua-bg hover:text-tint-aqua-fg focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            title={`Delete ${role.name}`}
                            onClick={() => setDeleteTarget(role.name)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </span>
                      )}
                    </div>
                  );
                })}
          </div>
        </Card>

        {/* Permission detail */}
        <Card className="min-h-[420px] flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border">
            {loading ? (
              <div className="flex items-center gap-3">
                <SkeletonCircle size={36} />
                <div className="space-y-1.5">
                  <SkeletonText width="120px" />
                  <SkeletonText width="180px" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <span className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold shrink-0 ${tintClass(SELECTED_ROLE_TINT)}`}>
                  {selectedRole?.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{selectedRole}</h3>
                    <Tag color={SELECTED_ROLE_TINT} className="text-[10px] shrink-0">
                      {selectedRoleObj?.isBuiltin ? "Built-in" : "Custom"}
                    </Tag>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAdminSelected
                      ? "Always has full access to every feature."
                      : `${grantedCountFor(selectedRole ?? "")} of ${rows?.length ?? 0} permissions granted`}
                  </p>
                </div>
              </div>
            )}

            {!loading && !isAdminSelected && (
              <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                <div className="relative shrink-0">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    value={permSearch}
                    onChange={e => setPermSearch(e.target.value)}
                    placeholder="Filter permissions…"
                    aria-label="Filter permissions"
                    className="pl-7 pr-7 py-1.5 text-xs border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-44 sm:w-48"
                  />
                  {permSearch && (
                    <button
                      onClick={() => setPermSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
                      aria-label="Clear filter"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Btn variant="ghost" size="xs" onClick={() => setAllPermissions(selectedRole ?? "", true)}>Grant all</Btn>
                  <Btn variant="ghost" size="xs" onClick={() => setAllPermissions(selectedRole ?? "", false)}>Clear all</Btn>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 max-h-[min(560px,calc(100vh-18rem))] overflow-y-auto">
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <SkeletonText width="55%" />
                    <Skeleton className="w-16 h-6.5 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : isAdminSelected ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-16 px-6">
                <span className={`p-3 rounded-full ${tintClass("navy")}`}><Lock size={20} /></span>
                <p className="text-sm font-medium text-foreground">Admins always have full access</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  This role can&apos;t be restricted. Create or select another role to customize permissions.
                </p>
              </div>
            ) : grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-16 px-6">
                <Search size={20} className="text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No permissions match &quot;{permSearch}&quot;.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {grouped.map(([categoryKey, permissions]) => {
                  const meta = categoryMetaOf(categoryKey);
                  const CategoryIcon = meta.icon;
                  return (
                    <div key={categoryKey} className="px-5 py-3">
                      <div className="flex items-center gap-2 py-1.5">
                        <CategoryIcon size={14} className="text-muted-foreground/60" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{meta.label}</span>
                      </div>
                      <div className="divide-y divide-border">
                        {permissions.map(row => (
                          <div key={row.permission} className="flex items-center justify-between gap-4 py-2.5">
                            <div className="min-w-0">
                              <p className="text-sm text-foreground">{row.label}</p>
                              <p className="text-[11px] text-muted-foreground/50 font-mono mt-0.5 truncate">{row.permission}</p>
                            </div>
                            <SegmentedToggle
                              on={!!grants[selectedRole ?? ""]?.[row.permission]}
                              label={row.label}
                              onChange={() => toggle(selectedRole ?? "", row.permission)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {!loading && (
        <div
          className={`sticky bottom-4 flex items-center justify-between gap-3 px-5 py-3 rounded-xl border border-border bg-card shadow-lg transition-opacity ${
            dirty ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <p className="text-xs text-muted-foreground">
            Unsaved changes to <span className="font-medium text-foreground">{dirtyRoleNames.size}</span> role{dirtyRoleNames.size === 1 ? "" : "s"}.
          </p>
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm" onClick={handleDiscard} disabled={saving}>Discard</Btn>
            <Btn variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              <Save size={13} /> {saving ? "Saving…" : "Save Changes"}
            </Btn>
          </div>
        </div>
      )}

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
        <p className="text-xs text-muted-foreground/60 mt-3">New roles start with no access — grant permissions from the list once it&apos;s added.</p>
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
