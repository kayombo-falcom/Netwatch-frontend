"use client";

import { useEffect, useRef, useState } from "react";
import { Filter, Plus, Eye, Pencil, Ban, UserCheck } from "lucide-react";
import { Card } from "@/components/card";
import { Btn } from "@/components/btn";
import { Tag } from "@/components/tag";
import { IconButton } from "@/components/icon-button";
import { emptyUserDraft, userToDraft } from "@/components/user-form-dialog";
import { FilterPill } from "@/components/filter-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { UserViewDialog } from "@/components/user-view-dialog";
import { UserStatusBadge } from "@/components/user-status-badge";
import { Pagination } from "@/components/pagination";
import { Skeleton, SkeletonTableRows } from "@/components/skeleton";
import { usersData } from "@/app/_lib/dashboard-data";
import { tintContrastText, USER_ROLE_TINT } from "@/lib/colors";
import { useDialogHost } from "@/hooks/use-dialog-host";
import { useUsersStore } from "@/hooks/use-users-store";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useHighlightParam } from "@/hooks/use-highlight-param";

export default function UsersPage() {
  const loading = useSimulatedLoading();
  const highlightId = useHighlightParam();
  const { users, updateUser } = useUsersStore();
  const { openDialog } = useDialogHost();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [dialog, setDialog] = useState<{ mode: "view"; user: typeof usersData[number] } | null>(null);
  const [statusAction, setStatusAction] = useState<{ type: "disable" | "enable"; user: typeof usersData[number] } | null>(null);
  const roles = ["All", "Admins", "Staff", "Students", "Guests", "IoT"];

  const prevUserCount = useRef(users.length);
  useEffect(() => {
    if (users.length > prevUserCount.current) setPage(1);
    prevUserCount.current = users.length;
  }, [users.length]);

  const [appliedHighlight, setAppliedHighlight] = useState<string | null>(null);
  if (highlightId && highlightId !== appliedHighlight) {
    setAppliedHighlight(highlightId);
    const idx = users.findIndex(u => String(u.id) === highlightId);
    if (idx !== -1) {
      setRoleFilter("All");
      setSearch("");
      setPage(Math.floor(idx / perPage) + 1);
    }
  }

  const openUserForm = (mode: "add" | "edit", user?: typeof usersData[number]) => {
    openDialog({ mode, userId: user?.id, draft: user ? userToDraft(user) : emptyUserDraft });
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
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Filter users…"
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-56"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {roles.map(r => (
            <FilterPill key={r} active={roleFilter === r} onClick={() => { setRoleFilter(r); setPage(1); }}>{r}</FilterPill>
          ))}
        </div>
        <Btn variant="primary" size="sm" className="ml-auto" onClick={() => openUserForm("add")}><Plus size={13} /> Add User</Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Full Name", "Email", "Role", "Policy", "Last Seen", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {loading ? <Skeleton className="h-3 w-12" /> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <SkeletonTableRows columns={7} rows={perPage} />
              ) : paged.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground/60 text-sm">No users match your filters.</td></tr>
              ) : paged.map(u => (
                <tr
                  key={u.id}
                  ref={el => { if (String(u.id) === highlightId) el?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                  className={`hover:bg-tint-aqua-bg/40 transition-colors ${String(u.id) === highlightId ? "highlight-blink" : ""}`}
                >
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
                      <IconButton color="teal" title="Edit" onClick={() => openUserForm("edit", u)} icon={<Pencil size={13} />} />
                      {u.status === "suspended" ? (
                        <IconButton color="teal" title="Enable" onClick={() => setStatusAction({ type: "enable", user: u })} icon={<UserCheck size={13} />} />
                      ) : (
                        <IconButton color="destructive" title="Disable" onClick={() => setStatusAction({ type: "disable", user: u })} icon={<Ban size={13} />} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <Pagination
            page={page}
            pages={pages}
            total={filtered.length}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={n => { setPerPage(n); setPage(1); }}
            itemLabel="user"
          />
        )}
      </Card>

      {dialog?.mode === "view" && (
        <UserViewDialog
          key={`view-${dialog.user.id}`}
          user={dialog.user}
          onClose={() => setDialog(null)}
          onEdit={() => { setDialog(null); openUserForm("edit", dialog.user); }}
        />
      )}

      <ConfirmDialog
        open={!!statusAction}
        title={statusAction?.type === "enable" ? "Enable user?" : "Disable user?"}
        message={statusAction ? (
          statusAction.type === "enable"
            ? `Are you sure you want to enable "${statusAction.user.name}"? They'll regain access immediately.`
            : `Are you sure you want to disable "${statusAction.user.name}"? They'll be marked as suspended and lose access until reactivated.`
        ) : ""}
        confirmLabel={statusAction?.type === "enable" ? "Enable" : "Disable"}
        variant={statusAction?.type === "enable" ? "primary" : "danger"}
        onConfirm={() => {
          if (statusAction) {
            const { user } = statusAction;
            updateUser(user.id, {
              name: user.name,
              email: user.email,
              role: user.role,
              policy: user.policy,
              status: statusAction.type === "enable" ? "active" : "suspended",
            });
          }
          setStatusAction(null);
        }}
        onCancel={() => setStatusAction(null)}
      />
    </div>
  );
}
