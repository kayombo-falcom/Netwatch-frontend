"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserStatus } from "@/app/_lib/dashboard-data";
import { toast } from "@/lib/toast-store";
import type { UserFormValues } from "@/components/user-form-dialog";

export type StoreUser = {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: string;
  status: UserStatus;
  lastSeen: string;
  color: string;
};

type ApiUser = { id: number; name: string; email: string; role: string; status: UserStatus; last_login: string | null };

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const formatLastSeen = (iso: string | null) => {
  if (!iso) return "Never";
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const toStoreUser = (u: ApiUser): StoreUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  initials: initialsFor(u.name),
  role: u.role,
  status: u.status,
  lastSeen: formatLastSeen(u.last_login),
  color: `var(--chart-${(u.id % 5) + 1})`,
});

/** First error message found in a DRF error response, whether it's a field error or a top-level `error`/`detail`. */
const firstApiError = (body: Record<string, unknown>) => {
  const firstField = Object.values(body).find(Array.isArray) as string[] | undefined;
  return firstField?.[0] ?? (body.error as string) ?? (body.detail as string) ?? "Please try again.";
};

/**
 * Lives above the routed page (see `(dashboard)/layout.tsx`) so the user
 * list survives page navigation — otherwise a minimized "Add/Edit User"
 * dialog would submit into a users list that's already been unmounted.
 */
const UsersStoreContext = createContext<{
  users: StoreUser[];
  loading: boolean;
  addUser: (values: UserFormValues) => Promise<void>;
  updateUser: (id: number, values: UserFormValues) => Promise<void>;
  refetchUsers: () => Promise<void>;
} | null>(null);

export const UsersStoreProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refetchUsers = useCallback(
    () =>
      fetch("/api/users")
        .then(res => res.json())
        .then((data: ApiUser[]) => setUsers(data.map(toStoreUser)))
        .catch(() => { toast.error("Couldn't load users", "Please refresh the page to try again."); }),
    []
  );

  useEffect(() => {
    refetchUsers().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addUser = useCallback(async (values: UserFormValues) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name, email: values.email, role: values.role, status: values.status, password: values.password }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error("Couldn't add user", firstApiError(body));
      return;
    }
    setUsers(prev => [toStoreUser({ ...body, status: values.status, last_login: null }), ...prev]);
    toast.success("User added", `${values.name} can now sign in.`);
  }, []);

  const updateUser = useCallback(async (id: number, values: UserFormValues) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name, email: values.email, role: values.role, status: values.status }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error("Couldn't update user", firstApiError(body));
      return;
    }
    setUsers(prev => prev.map(u => (u.id === id ? { ...toStoreUser({ ...body, status: values.status, last_login: null }), lastSeen: u.lastSeen } : u)));
    toast.success("User updated", `${values.name}'s details have been saved.`);
  }, []);

  const value = useMemo(
    () => ({ users, loading, addUser, updateUser, refetchUsers }),
    [users, loading, addUser, updateUser, refetchUsers]
  );

  return <UsersStoreContext.Provider value={value}>{children}</UsersStoreContext.Provider>;
};

export const useUsersStore = () => {
  const ctx = useContext(UsersStoreContext);
  if (!ctx) throw new Error("useUsersStore must be used within a UsersStoreProvider");
  return ctx;
};
