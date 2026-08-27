"use client";

import { useState } from "react";
import { Search, RefreshCw, X, Laptop, WifiOff } from "lucide-react";
import { Card } from "@/components/card";
import { Tag } from "@/components/tag";
import { IconButton } from "@/components/icon-button";
import { Pagination } from "@/components/pagination";
import { Modal } from "@/components/modal";
import { Skeleton, SkeletonTableRows } from "@/components/skeleton";
import { useNetworkDevices } from "@/hooks/use-network-devices";
import type { DiscoveredDevice } from "@/lib/devices";

export default function DevicesPage() {
  const { data, loading, refreshing, error, refresh } = useNetworkDevices();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [drawer, setDrawer] = useState<DiscoveredDevice | null>(null);

  const devices = data?.devices ?? [];
  const q = search.trim().toLowerCase();
  const filtered = !q ? devices : devices.filter(d =>
    (d.hostname?.toLowerCase().includes(q) ?? false) || d.ip.includes(q) || d.mac.includes(q)
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by hostname, IP, or MAC…"
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-64"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {loading ? "Scanning…" : `${filtered.length} device${filtered.length !== 1 ? "s" : ""}`}
            {data?.subnetMask && ` on ${data.localIp}/${data.subnetMask}`}
          </span>
          <IconButton icon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />} title="Rescan network" onClick={refresh} />
        </div>
      </div>

      {error ? (
        <Card className="p-10 flex flex-col items-center gap-2 text-center">
          <WifiOff size={20} className="text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </Card>
      ) : !loading && devices.length === 0 ? (
        <Card className="p-10 flex flex-col items-center gap-2 text-center">
          <WifiOff size={20} className="text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Not connected to a network.</p>
        </Card>
      ) : (
        <>
          {/* Table — desktop */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["Device", "OS (est.)", "IP Address", "MAC Address"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {loading ? <Skeleton className="h-3 w-12" /> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <SkeletonTableRows columns={4} rows={perPage} />
                  ) : paged.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground/60 text-sm">No devices match your search.</td></tr>
                  ) : paged.map(d => (
                    <tr key={d.mac} onClick={() => setDrawer(d)} className="cursor-pointer hover:bg-tint-aqua-bg/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Laptop size={14} className="text-muted-foreground/60 shrink-0" />
                          <span className="font-medium text-foreground text-xs">{d.hostname ?? "Unknown device"}</span>
                          {d.isCurrentDevice && <Tag color="aqua">This device</Tag>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.os ?? "Unknown"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground/80">{d.ip}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60">{d.mac}</td>
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
              <Card key={i} className="p-4 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </Card>
            )) : paged.map(d => (
              <Card key={d.mac} onClick={() => setDrawer(d)} className="p-4 cursor-pointer transition-all hover:border-primary">
                <div className="flex items-center gap-2 mb-1.5">
                  <Laptop size={14} className="text-muted-foreground/60 shrink-0" />
                  <span className="font-medium text-sm text-foreground truncate">{d.hostname ?? "Unknown device"}</span>
                  {d.isCurrentDevice && <Tag color="aqua">This device</Tag>}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span className="font-mono">{d.ip}</span>
                  <span className="font-mono">{d.mac}</span>
                  <span>{d.os ?? "Unknown"}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Detail Drawer */}
      {drawer && (
        <Modal open onClose={() => setDrawer(null)} position="center" className="max-w-sm w-full rounded-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border shrink-0">
            <h2 className="font-semibold text-foreground text-sm truncate min-w-0">{drawer.hostname ?? "Unknown device"}</h2>
            <button onClick={() => setDrawer(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground shrink-0"><X size={16} /></button>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              ["Status", drawer.isCurrentDevice ? <Tag key="status" color="aqua">This device</Tag> : "On network"],
              ["OS (estimated)", drawer.os ?? "Unknown"],
              ["IP Address", <span key="ip" className="font-mono text-xs">{drawer.ip}</span>],
              ["MAC Address", <span key="mac" className="font-mono text-xs">{drawer.mac}</span>],
            ].map(([label, val]) => (
              <div key={label as string}>
                <p className="text-xs text-muted-foreground/60 mb-0.5">{label as string}</p>
                <div className="text-xs font-medium text-foreground">{val as React.ReactNode}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
