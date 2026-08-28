"use client";

import { useState } from "react";
import { Search, RefreshCw, X, Laptop, WifiOff, Fingerprint, IdCard, Loader2, Network } from "lucide-react";
import { Card } from "@/components/card";
import { Tag } from "@/components/tag";
import { IconButton } from "@/components/icon-button";
import { IconSwatch } from "@/components/icon-swatch";
import { Pagination } from "@/components/pagination";
import { Modal } from "@/components/modal";
import { Skeleton, SkeletonText, SkeletonTableRows } from "@/components/skeleton";
import { TooltipWrap } from "@/components/tooltip-wrap";
import { useHostnameLookup, type HostnameLookupState } from "@/hooks/use-hostname-lookup";
import { useNetworkDevices } from "@/hooks/use-network-devices";
import { useCurrentAp } from "@/hooks/use-current-ap";
import { useOsDetection, type OsDetectionState } from "@/hooks/use-os-detection";
import type { DiscoveredDevice } from "@/lib/devices";
import { maskToCidr } from "@/lib/ip";

/** Device name — falls back to an on-demand lookup result until one's been run (the bulk scan no longer resolves hostnames automatically). */
function hostnameLabel(device: DiscoveredDevice, lookup: HostnameLookupState | undefined): string {
  if (device.hostname) return device.hostname;
  if (!lookup) return "Unknown device";
  switch (lookup.status) {
    case "loading": return "Resolving…";
    case "resolved": return lookup.hostname;
    case "not_found": return "Unknown device";
    case "out_of_scope": return "Unknown device";
  }
}

/** Device name + a button to run the on-demand hostname lookup. Reused across the desktop table, mobile cards, and the detail drawer. */
function DeviceNameCell({
  device, lookup, onLookup,
}: {
  device: DiscoveredDevice; lookup: HostnameLookupState | undefined; onLookup: () => void;
}) {
  const resolving = lookup?.status === "loading";
  const alreadyNamed = !!device.hostname || lookup?.status === "resolved";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Laptop size={14} className="text-muted-foreground/60 shrink-0" />
      <span className="font-medium text-foreground text-xs truncate">{hostnameLabel(device, lookup)}</span>
      {device.isCurrentDevice && <Tag color="aqua">This device</Tag>}
      {!alreadyNamed && (
        <TooltipWrap label="Resolve device name">
          <button
            onClick={e => { e.stopPropagation(); onLookup(); }}
            disabled={resolving}
            className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
          >
            {resolving ? <Loader2 size={12} className="animate-spin" /> : <IdCard size={12} />}
          </button>
        </TooltipWrap>
      )}
    </div>
  );
}

/** Label for an active nmap detection result — falls back to the passive TTL guess (`device.os`) until one's been run. */
function osDetectionLabel(device: DiscoveredDevice, detection: OsDetectionState | undefined): string {
  if (!detection) return device.os ? `${device.os} (estimated)` : "Unknown";
  switch (detection.status) {
    case "loading": return "Detecting…";
    case "detected": return `${detection.osName} (${detection.confidence}%)`;
    case "unknown": return detection.confidence != null ? `Inconclusive (${detection.confidence}%)` : "Inconclusive";
    case "unreachable": return "Host unreachable";
    case "out_of_scope": return "Outside local network";
    case "engine_unavailable": return detection.reason;
  }
}

/** Every signal that agreed on the reported OS, plus any diagnostic note — shown so a detection isn't a black box. */
function signalsSummary(detection: OsDetectionState | undefined): string | null {
  if (!detection || (detection.status !== "detected" && detection.status !== "unknown")) return null;
  const notes = detection.status === "unknown" ? (detection.notes ?? []) : [];
  const parts = [...detection.signals.map(s => s.detail), ...notes];
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** OS value + a button to run the real nmap-backed detection in place of the passive TTL guess. Reused across the desktop table, mobile cards, and the detail drawer. */
function OsDetectionCell({
  device, detection, onDetect,
}: {
  device: DiscoveredDevice; detection: OsDetectionState | undefined; onDetect: () => void;
}) {
  const detecting = detection?.status === "loading";
  const signals = signalsSummary(detection);
  const label = <span>{osDetectionLabel(device, detection)}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      {signals ? <TooltipWrap label={signals}>{label}</TooltipWrap> : label}
      <TooltipWrap label="Run active OS detection">
        <button
          onClick={e => { e.stopPropagation(); onDetect(); }}
          disabled={detecting}
          className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {detecting ? <Loader2 size={12} className="animate-spin" /> : <Fingerprint size={12} />}
        </button>
      </TooltipWrap>
    </span>
  );
}

/** Counts of the passive TTL-based OS guess (`device.os`) across a set of devices — a rough family split, not a fingerprint. */
function osBreakdown(devices: DiscoveredDevice[]) {
  const windows = devices.filter(d => d.os === "Windows").length;
  const unixLike = devices.filter(d => d.os === "Linux / macOS / Android").length;
  const gear = devices.filter(d => d.os === "Network device").length;
  return { windows, unixLike, gear };
}

export default function DevicesPage() {
  const { data, loading, refreshing, error, refresh } = useNetworkDevices();
  const { data: ap } = useCurrentAp();
  const { results: osResults, detect: detectOs } = useOsDetection();
  const { results: hostnameResults, lookup: lookupHostname } = useHostnameLookup();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [drawer, setDrawer] = useState<DiscoveredDevice | null>(null);

  const devices = data?.devices ?? [];
  const unnamed = devices.filter(d => !d.hostname && hostnameResults[d.ip]?.status !== "resolved");
  const resolvingAll = unnamed.some(d => hostnameResults[d.ip]?.status === "loading");
  const resolveAllNames = () => unnamed.forEach(d => { if (hostnameResults[d.ip]?.status !== "loading") lookupHostname(d.ip); });

  // Excludes only confidently-detected devices — unknown/unreachable/
  // engine_unavailable stay eligible for a re-run, since those can be
  // transient (a dropped ping, nmap's own run-to-run variance) rather than
  // a real dead end, same as "not found" names stay retryable above.
  const unfingerprinted = devices.filter(d => osResults[d.ip]?.status !== "detected");
  const detectingAll = devices.some(d => osResults[d.ip]?.status === "loading");
  const detectAllOs = () => unfingerprinted.forEach(d => { if (osResults[d.ip]?.status !== "loading") detectOs(d.ip); });
  const q = search.trim().toLowerCase();
  const filtered = !q ? devices : devices.filter(d => {
    const lookup = hostnameResults[d.ip];
    const name = d.hostname ?? (lookup?.status === "resolved" ? lookup.hostname : null);
    return (name?.toLowerCase().includes(q) ?? false) || d.ip.includes(q) || d.mac.includes(q);
  });
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));

  const { windows, unixLike, gear } = osBreakdown(devices);
  const overviewStats = [
    { label: "Devices", value: devices.length },
    { label: "Windows", value: windows },
    { label: "Apple / Linux", value: unixLike },
    { label: "Network gear", value: gear },
  ];

  return (
    <div className="space-y-4">
      {/* Network overview */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <IconSwatch color="teal">
            <Network size={18} />
          </IconSwatch>

          <div className="min-w-0">
            {loading && !data ? (
              <>
                <SkeletonText width="140px" className="mb-1" />
                <SkeletonText width="180px" />
              </>
            ) : data?.localIp && data?.subnetMask ? (
              <>
                <div className="text-sm font-semibold text-foreground font-mono">
                  {data.localIp}/{maskToCidr(data.subnetMask)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Mask {data.subnetMask}
                  {ap?.gateway && ` · Gateway ${ap.gateway}`}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Not connected to a network</div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-5">
            {overviewStats.map(s => (
              <TooltipWrap key={s.label} label={s.label === "Devices" ? "Devices seen on this scan" : `${s.label} — estimated from ping response`}>
                <div className="text-center min-w-10">
                  <div className="text-lg font-bold tabular-nums text-foreground">
                    {loading && !data ? <Skeleton className="h-5 w-6 mx-auto" /> : s.value}
                  </div>
                  <div className="text-xs text-muted-foreground/60 whitespace-nowrap">{s.label}</div>
                </div>
              </TooltipWrap>
            ))}
          </div>

          <IconButton icon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />} title="Rescan network" onClick={refresh} />
        </div>
      </Card>

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
        {q && !loading && (
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {devices.length} device{devices.length !== 1 ? "s" : ""} match
          </span>
        )}
        {!loading && unnamed.length > 0 && (
          <TooltipWrap label={`Look up all ${unnamed.length} unresolved device name${unnamed.length !== 1 ? "s" : ""} at once`} className={q ? "" : "ml-auto"}>
            <button
              onClick={resolveAllNames}
              disabled={resolvingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {resolvingAll ? <Loader2 size={13} className="animate-spin" /> : <IdCard size={13} />}
              Resolve all names
            </button>
          </TooltipWrap>
        )}
        {!loading && unfingerprinted.length > 0 && (
          <TooltipWrap
            label={`Run active OS detection on all ${unfingerprinted.length} device${unfingerprinted.length !== 1 ? "s" : ""} without a result yet — an nmap scan per device, can take a while`}
            className={q || unnamed.length > 0 ? "" : "ml-auto"}
          >
            <button
              onClick={detectAllOs}
              disabled={detectingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {detectingAll ? <Loader2 size={13} className="animate-spin" /> : <Fingerprint size={13} />}
              Detect all OS
            </button>
          </TooltipWrap>
        )}
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
                    {["Device", "OS", "IP Address", "MAC Address"].map(h => (
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
                        <DeviceNameCell device={d} lookup={hostnameResults[d.ip]} onLookup={() => lookupHostname(d.ip)} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <OsDetectionCell device={d} detection={osResults[d.ip]} onDetect={() => detectOs(d.ip)} />
                      </td>
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
                <div className="mb-1.5">
                  <DeviceNameCell device={d} lookup={hostnameResults[d.ip]} onLookup={() => lookupHostname(d.ip)} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span className="font-mono">{d.ip}</span>
                  <span className="font-mono">{d.mac}</span>
                  <OsDetectionCell device={d} detection={osResults[d.ip]} onDetect={() => detectOs(d.ip)} />
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
            <h2 className="font-semibold text-foreground text-sm truncate min-w-0">{hostnameLabel(drawer, hostnameResults[drawer.ip])}</h2>
            <button onClick={() => setDrawer(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground shrink-0"><X size={16} /></button>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              ["Device", <DeviceNameCell key="device" device={drawer} lookup={hostnameResults[drawer.ip]} onLookup={() => lookupHostname(drawer.ip)} />],
              ["Status", drawer.isCurrentDevice ? <Tag key="status" color="aqua">This device</Tag> : "On network"],
              ["OS", <OsDetectionCell key="os" device={drawer} detection={osResults[drawer.ip]} onDetect={() => detectOs(drawer.ip)} />],
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
