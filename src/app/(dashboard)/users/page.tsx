"use client";

import { useState } from "react";
import { Search, Plus, Eye, Pencil, Ban } from "lucide-react";
import { Card } from "@/components/card";
import { Btn } from "@/components/btn";
import { Tag } from "@/components/tag";
import { IconButton } from "@/components/icon-button";
import { UserFormDialog, type UserFormValues } from "@/components/user-form-dialog";
import { UserViewDialog } from "@/components/user-view-dialog";
import { UserStatusBadge } from "@/components/user-status-badge";
import { Pagination } from "@/components/pagination";
import { usersData } from "@/app/_lib/dashboard-data";
import { tintContrastText, USER_ROLE_TINT } from "@/lib/colors";

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

export default function UsersPage() {
  const [users, setUsers] = useState(usersData);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<
    { mode: "add" } | { mode: "edit" | "view"; user: typeof usersData[number] } | null
  >(null);
  const roles = ["All", "Admins", "Staff", "Students", "Guests", "IoT"];
  const perPage = 5;

  const addUser = (values: UserFormValues) => {
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
  };

  const updateUser = (id: number, values: UserFormValues) => {
    setUsers(prev => prev.map(u => u.id === id ? {
      ...u,
      name: values.name,
      email: values.email,
      initials: initialsFor(values.name),
      role: values.role,
      policy: values.policy,
      status: values.status,
    } : u));
  };

  const filtered = users.filter(u => {
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users…"
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-56"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"}`}
            >{r}</button>
          ))}
        </div>
        <Btn variant="primary" size="sm" className="ml-auto" onClick={() => setDialog({ mode: "add" })}><Plus size={13} /> Add User</Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Full Name", "Email", "Role", "Policy", "Last Seen", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground/60 text-sm">No users match your filters.</td></tr>
              ) : paged.map(u => (
                <tr key={u.id} className="hover:bg-muted transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${tintContrastText(USER_ROLE_TINT[u.role] ?? "muted")}`}
                        style={{ backgroundColor: u.color }}
                      >{u.initials}</div>
                      <span className="font-medium text-foreground text-xs">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Tag color={USER_ROLE_TINT[u.role] ?? "muted"}>{u.role}</Tag>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.policy}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastSeen}</td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <IconButton color="aqua" title="View" onClick={() => setDialog({ mode: "view", user: u })} icon={<Eye size={13} />} />
                      <IconButton color="teal" title="Edit" onClick={() => setDialog({ mode: "edit", user: u })} icon={<Pencil size={13} />} />
                      <IconButton color="destructive" title="Disable" icon={<Ban size={13} />} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} total={filtered.length} perPage={perPage} onPageChange={setPage} itemLabel="user" />
      </Card>

      {dialog?.mode === "view" && (
        <UserViewDialog
          key={`view-${dialog.user.id}`}
          user={dialog.user}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog({ mode: "edit", user: dialog.user })}
        />
      )}

      {(dialog?.mode === "add" || dialog?.mode === "edit") && (
        <UserFormDialog
          key={dialog.mode === "edit" ? `edit-${dialog.user.id}` : "add"}
          mode={dialog.mode}
          initialValues={dialog.mode === "edit" ? dialog.user : undefined}
          onClose={() => setDialog(null)}
          onSubmit={values => {
            if (dialog.mode === "add") {
              addUser(values);
              setPage(1);
            } else {
              updateUser(dialog.user.id, values);
            }
            setDialog(null);
          }}
        />
      )}
    </div>
  );
}
