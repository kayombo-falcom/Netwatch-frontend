"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "@/lib/toast-store";

export type StoreRole = { name: string; isBuiltin: boolean };

type ApiRole = { name: string; is_builtin: boolean };

const toStoreRole = (r: ApiRole): StoreRole => ({ name: r.name, isBuiltin: r.is_builtin });

const firstApiError = (body: Record<string, unknown>) => {
  const firstField = Object.values(body).find(Array.isArray) as string[] | undefined;
  return firstField?.[0] ?? (body.error as string) ?? (body.detail as string) ?? "Please try again.";
};

/** Lives above the routed page (see `(dashboard)/layout.tsx`) — the Users page's
 * role filter, the Add/Edit User dialog's role dropdown, and the Roles &
 * Permissions page all need the same live role list. */
const RolesStoreContext = createContext<{
  roles: StoreRole[];
  loading: boolean;
  addRole: (name: string) => Promise<boolean>;
  renameRole: (oldName: string, newName: string) => Promise<boolean>;
  deleteRole: (name: string) => Promise<boolean>;
} | null>(null);

export const RolesStoreProvider = ({ children }: { children: ReactNode }) => {
  const [roles, setRoles] = useState<StoreRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/roles")
      .then(res => (res.ok ? res.json() : []))
      .then((data: ApiRole[]) => setRoles(data.map(toStoreRole)))
      .catch(() => toast.error("Couldn't load roles", "Please refresh the page to try again."))
      .finally(() => setLoading(false));
  }, []);

  const addRole = useCallback(async (name: string) => {
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error("Couldn't add role", firstApiError(body));
      return false;
    }
    setRoles(prev => [...prev, toStoreRole(body)]);
    toast.success("Role added", `"${name}" is ready to configure.`);
    return true;
  }, []);

  const renameRole = useCallback(async (oldName: string, newName: string) => {
    const res = await fetch(`/api/roles/${encodeURIComponent(oldName)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error("Couldn't rename role", firstApiError(body));
      return false;
    }
    setRoles(prev => prev.map(r => (r.name === oldName ? toStoreRole(body) : r)));
    toast.success("Role renamed", `"${oldName}" is now "${newName}".`);
    return true;
  }, []);

  const deleteRole = useCallback(async (name: string) => {
    const res = await fetch(`/api/roles/${encodeURIComponent(name)}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error("Couldn't delete role", firstApiError(body));
      return false;
    }
    setRoles(prev => prev.filter(r => r.name !== name));
    toast.success("Role deleted", `"${name}" has been removed.`);
    return true;
  }, []);

  const value = useMemo(
    () => ({ roles, loading, addRole, renameRole, deleteRole }),
    [roles, loading, addRole, renameRole, deleteRole]
  );

  return <RolesStoreContext.Provider value={value}>{children}</RolesStoreContext.Provider>;
};

export const useRolesStore = () => {
  const ctx = useContext(RolesStoreContext);
  if (!ctx) throw new Error("useRolesStore must be used within a RolesStoreProvider");
  return ctx;
};
