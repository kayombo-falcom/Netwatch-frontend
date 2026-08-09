"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usersData } from "@/app/_lib/dashboard-data";
import type { UserFormValues } from "@/components/user-form-dialog";

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

/**
 * Lives above the routed page (see `(dashboard)/layout.tsx`) so the user
 * list survives page navigation — otherwise a minimized "Add/Edit User"
 * dialog would submit into a users list that's already been unmounted.
 */
const UsersStoreContext = createContext<{
  users: typeof usersData;
  addUser: (values: UserFormValues) => void;
  updateUser: (id: number, values: UserFormValues) => void;
} | null>(null);

export const UsersStoreProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState(usersData);

  const addUser = useCallback((values: UserFormValues) => {
    setUsers(prev => [{
      id: Math.max(0, ...prev.map(u => u.id)) + 1,
      name: values.name,
      email: values.email,
      initials: initialsFor(values.name),
      role: values.role,
      status: values.status,
      policy: values.policy,
      lastSeen: "Never",
      color: `var(--chart-${(prev.length % 5) + 1})`,
    }, ...prev]);
  }, []);

  const updateUser = useCallback((id: number, values: UserFormValues) => {
    setUsers(prev => prev.map(u => u.id === id ? {
      ...u,
      name: values.name,
      email: values.email,
      initials: initialsFor(values.name),
      role: values.role,
      policy: values.policy,
      status: values.status,
    } : u));
  }, []);

  const value = useMemo(() => ({ users, addUser, updateUser }), [users, addUser, updateUser]);

  return <UsersStoreContext.Provider value={value}>{children}</UsersStoreContext.Provider>;
};

export const useUsersStore = () => {
  const ctx = useContext(UsersStoreContext);
  if (!ctx) throw new Error("useUsersStore must be used within a UsersStoreProvider");
  return ctx;
};
