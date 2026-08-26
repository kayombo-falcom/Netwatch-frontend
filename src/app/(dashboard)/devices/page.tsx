"use client";

import { useState } from "react";
import { Filter, WifiOff, Pause, Ban, X, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/card";
import { Btn } from "@/components/btn";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { IconButton } from "@/components/icon-button";
import { Pagination } from "@/components/pagination";
import { Modal } from "@/components/modal";
import { FilterPill } from "@/components/filter-pill";
import { Skeleton, SkeletonTableRows } from "@/components/skeleton";
import { devicesData, type DeviceStatus } from "@/app/_lib/dashboard-data";
import { TINT } from "@/lib/colors";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useHighlightParam } from "@/hooks/use-highlight-param";

export default function DevicesPage() {
  const loading = useSimulatedLoading();
  const highlightId = useHighlightParam();
  const [filter, setFilter] = useState<"all" | DeviceStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [drawer, setDrawer] = useState<typeof devicesData[0] | null>(null);
  const [confirm, setConfirm] = useState<{ type: string; device: typeof devicesData[0] } | null>(null);

  const filtered = devicesData.filter(d => {
    if (filter !== "all" && d.status !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.user.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));

  const [appliedHighlight, setAppliedHighlight] = useState<string | null>(null);
  if (highlightId && highlightId !== appliedHighlight) {
    setAppliedHighlight(highlightId);
    const idx = devicesData.findIndex(d => String(d.id) === highlightId);
    if (idx !== -1) {
      setFilter("all");
      setSearch("");
      setPage(Math.floor(idx / perPage) + 1);
    }
  }

  const deviceUsageData = [
    { t: "Mon", v: 0.4 }, { t: "Tue", v: 0.9 }, { t: "Wed", v: 0.6 },
    { t: "Thu", v: 1.2 }, { t: "Fri", v: 2.1 }, { t: "Sat", v: 0.3 }, { t: "Sun", v: 0.1 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Filter devices or users…"
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-60"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "online", "idle", "blocked", "paused"] as const).map(s => (
            <FilterPill key={s} active={filter === s} onClick={() => { setFilter(s); setPage(1); }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </FilterPill>
          ))}
        </div>
        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} device{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Table — desktop */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Status", "Device", "OS", "IP / MAC", "Connection Type", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {loading ? <Skeleton className="h-3 w-12" /> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <SkeletonTableRows columns={6} rows={perPage} />
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground/60 text-sm">No devices match your filters.</td></tr>
              ) : paged.map(d => (
                <tr
                  key={d.id}
                  ref={el => { if (String(d.id) === highlightId) el?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                  onClick={() => setDrawer(d)}
                  className={`cursor-pointer hover:bg-tint-aqua-bg/40 transition-colors ${String(d.id) === highlightId ? "highlight-blink" : ""}`}
                >
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground text-xs">{d.name}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.os}</td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-foreground/80">{d.ip}</div>
                    <div className="font-mono text-xs text-muted-foreground/60">{d.mac}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.connectionType}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <IconButton color="destructive" title="Disconnect" onClick={() => setConfirm({ type: "disconnect", device: d })} icon={<WifiOff size={13} />} />
                      <IconButton color="amber" title="Pause" onClick={() => setConfirm({ type: "pause", device: d })} icon={<Pause size={13} />} />
                      <IconButton color="destructive" title="Block" onClick={() => setConfirm({ type: "block", device: d })} icon={<Ban size={13} />} />
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
            itemLabel="device"
          />
        )}
      </Card>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {loading ? Array.from({ length: perPage }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-lg" /><Skeleton className="h-7 w-20 rounded-lg" /><Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </Card>
        )) : paged.map(d => (
          <Card
            key={d.id}
            ref={el => { if (String(d.id) === highlightId) el?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
            onClick={() => setDrawer(d)}
            className={`p-4 cursor-pointer transition-all hover:border-primary ${String(d.id) === highlightId ? "highlight-blink" : ""}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground truncate">{d.user} · {d.type}</div>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground font-mono mb-3">
              <span>{d.ip}</span>
              <span>{d.connectionType}</span>
              <span>{d.mac}</span>
              <span>{d.data}</span>
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <Btn variant="secondary" size="xs" onClick={() => setConfirm({ type: "disconnect", device: d })}><WifiOff size={11} /> Disconnect</Btn>
              <Btn variant="secondary" size="xs" onClick={() => setConfirm({ type: "pause", device: d })}><Pause size={11} /> Pause</Btn>
              <Btn variant="outline" size="xs" onClick={() => setConfirm({ type: "block", device: d })}><Ban size={11} /> Block</Btn>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Drawer */}
      {drawer && (
        <Modal open onClose={() => setDrawer(null)} position="center" className="max-w-md w-full max-h-[85vh] rounded-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border shrink-0">
            <h2 className="font-semibold text-foreground text-sm truncate min-w-0">{drawer.name}</h2>
            <button onClick={() => setDrawer(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground shrink-0"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Status", <StatusBadge key="status" status={drawer.status} />],
                ["Type", drawer.type],
                ["IP Address", <span key="ip" className="font-mono text-xs">{drawer.ip}</span>],
                ["MAC", <span key="mac" className="font-mono text-xs">{drawer.mac}</span>],
                ["Connection Type", drawer.connectionType],
                ["Connected Since", drawer.connectedSince],
                ["Last Seen", drawer.lastSeen],
                ["Data Used", drawer.data],
                ["User", drawer.user],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <p className="text-xs text-muted-foreground/60 mb-0.5">{label as string}</p>
                  <div className="text-xs font-medium text-foreground">{val as React.ReactNode}</div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">7-Day Usage</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={deviceUsageData}>
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize: 11, background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }} formatter={(v: number) => [`${v} GB`]} />
                  <Bar dataKey="v" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Applied Policy</p>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 mb-1"><Shield size={12} className={TINT.aqua.fg} /> <span className="font-medium">Staff Default</span></div>
                <p className="text-muted-foreground">Bandwidth limit: 20 Mbps · Block: P2P, Streaming (off-hours) · Session: 12h</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-border flex gap-2 shrink-0">
            <Btn variant="secondary" size="sm" onClick={() => setConfirm({ type: "disconnect", device: drawer })}><WifiOff size={13} /> Disconnect</Btn>
            <Btn variant="secondary" size="sm" onClick={() => setConfirm({ type: "pause", device: drawer })}><Pause size={13} /> Pause</Btn>
            <Btn variant="danger" size="sm" onClick={() => setConfirm({ type: "block", device: drawer })}><Ban size={13} /> Block</Btn>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm ? `${confirm.type.charAt(0).toUpperCase() + confirm.type.slice(1)} device?` : ""}
        message={confirm ? `Are you sure you want to ${confirm.type} "${confirm.device.name}"? This action can be reversed from the Devices screen.` : ""}
        confirmLabel={confirm ? confirm.type.charAt(0).toUpperCase() + confirm.type.slice(1) : ""}
        variant={confirm?.type === "block" ? "danger" : "primary"}
        onConfirm={() => setConfirm(null)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
