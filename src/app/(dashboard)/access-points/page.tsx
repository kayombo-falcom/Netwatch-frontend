"use client";

import { Radio, EthernetPort, RefreshCw, ArrowDown, ArrowUp, Building2, MapPin } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { IconSwatch } from "@/components/icon-swatch";
import { IconButton } from "@/components/icon-button";
import { Tag } from "@/components/tag";
import { Btn } from "@/components/btn";
import { Speedometer } from "@/components/speedometer";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { useCurrentAp } from "@/hooks/use-current-ap";
import { useSpeedTest } from "@/hooks/use-speed-test";
import { useNetworkMeta } from "@/hooks/use-network-meta";

export default function AccessPointsPage() {
  const { data: ap, loading, refreshing, error, refresh } = useCurrentAp();
  const speedTest = useSpeedTest();
  const { data: meta } = useNetworkMeta();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-5 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1.5">
                <SkeletonText width="140px" />
                <SkeletonText width="180px" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="text-center space-y-1.5">
                <Skeleton className="h-5 w-10 mx-auto" />
                <SkeletonText width="40px" className="mx-auto" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </Card>
        <Card className="p-5 space-y-3">
          <SkeletonText width="100px" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <SkeletonText width="80px" />
                <SkeletonText width="120px" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 space-y-3">
          <SkeletonText width="100px" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <SkeletonText width="80px" />
                <SkeletonText width="120px" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !ap?.connected) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground/60">
          <Radio size={32} className="mb-3 opacity-30" />
          <p className="text-sm">{error ?? "Not connected to a network"}</p>
        </Card>
      </div>
    );
  }

  const isWifi = ap.type === "wifi";
  const ConnectionIcon = isWifi ? Radio : EthernetPort;

  const metrics = isWifi
    ? [
        { label: "Signal", value: ap.signalPercent != null ? `${ap.signalPercent}%` : "—" },
        { label: "RSSI", value: ap.rssiDbm != null ? `${ap.rssiDbm} dBm` : "—" },
        { label: "Channel", value: ap.channel ?? "—" },
        { label: "Band", value: ap.band ?? "—" },
        { label: "Receive", value: ap.receiveRateMbps != null ? `${ap.receiveRateMbps} Mbps` : "—" },
        { label: "Transmit", value: ap.transmitRateMbps != null ? `${ap.transmitRateMbps} Mbps` : "—" },
      ]
    : [
        { label: "Receive", value: ap.receiveRateMbps != null ? `${ap.receiveRateMbps} Mbps` : "—" },
        { label: "Transmit", value: ap.transmitRateMbps != null ? `${ap.transmitRateMbps} Mbps` : "—" },
      ];

  const networkInfoFields: [string, string | null][] = [
    ["IP Address", ap.ip],
    ["MAC Address", ap.mac],
    ...(isWifi ? ([["AP BSSID", ap.bssid]] as [string, string | null][]) : []),
    ["Gateway", ap.gateway],
    ["Subnet Mask", ap.subnet],
    ["Link-Local IPv6", ap.linkLocalIPv6],
    ["DNS Servers", ap.dnsServers],
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title={ap.networkName ?? (isWifi ? "Unknown network" : "Wired connection")}
          subtitle={ap.interfaceName ?? undefined}
          action={
            <div className="flex items-center gap-2">
              <Tag color="teal"><ConnectionIcon size={12} /> Connected</Tag>
              <IconButton
                icon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />}
                title="Refresh"
                onClick={refresh}
              />
            </div>
          }
        />
        <div className="p-5 space-y-5">
          {isWifi && (ap.protocol || ap.authentication) && (
            <div className="flex items-center gap-2">
              {ap.protocol && <Tag color="muted" bordered={false}>{ap.protocol}</Tag>}
              {ap.authentication && <Tag color="muted" bordered={false}>{ap.authentication}</Tag>}
            </div>
          )}

          <div className="flex items-center gap-3">
            <IconSwatch color="teal">
              <ConnectionIcon size={18} />
            </IconSwatch>
            <div className={`grid ${isWifi ? "grid-cols-3" : "grid-cols-2"} gap-3 flex-1`}>
              {metrics.map(m => (
                <div key={m.label} className="text-center">
                  <div className="text-lg font-bold tabular-nums text-foreground">
                    {m.value}
                  </div>
                  <div className="text-xs text-muted-foreground/60">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Speed Test"
          subtitle={
            speedTest.status === "error" ? undefined
            : speedTest.status === "running" ? `Measuring ${speedTest.phase ?? "…"}…`
            : speedTest.summary ? "Test complete"
            : "Real download/upload throughput to Cloudflare's edge network"
          }
          action={
            <Btn variant="secondary" size="xs" onClick={speedTest.toggle}>
              {speedTest.status === "running" ? "Cancel" : speedTest.summary ? "Run Again" : "Run Test"}
            </Btn>
          }
        />
        <div className="p-6">
          {speedTest.status === "error" && (
            <p className="text-xs text-destructive mb-4 text-center">{speedTest.error}</p>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center sm:items-start gap-4 shrink-0">
              <div className="flex gap-5">
                <div className="text-center sm:text-left">
                  <div className="text-sm font-semibold tabular-nums text-foreground">{speedTest.summary?.latencyMs ?? "—"}</div>
                  <div className="text-[11px] text-muted-foreground/50">Ping (ms)</div>
                </div>
                {speedTest.summary?.jitterMs != null && (
                  <div className="text-center sm:text-left">
                    <div className="text-sm font-semibold tabular-nums text-foreground">{speedTest.summary.jitterMs}</div>
                    <div className="text-[11px] text-muted-foreground/50">Jitter (ms)</div>
                  </div>
                )}
              </div>

              {(meta?.isp || meta?.city) && (
                <div className="space-y-1.5">
                  {meta.isp && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                      <Building2 size={12} className="text-muted-foreground/40 shrink-0" />
                      <span>{meta.isp}</span>
                    </div>
                  )}
                  {meta.city && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                      <MapPin size={12} className="text-muted-foreground/40 shrink-0" />
                      <span>{meta.city}{meta.region && !meta.region.toLowerCase().includes(meta.city.toLowerCase()) ? `, ${meta.region}` : ""}</span>
                    </div>
                  )}
                  {meta.publicIp && (
                    <div className="text-xs font-mono text-muted-foreground/40 pl-[18px]">{meta.publicIp}</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-10">
              <Speedometer
                value={speedTest.summary?.downloadMbps ?? null}
                icon={ArrowDown}
                label="Download"
                colorFrom="var(--chart-3)"
                colorTo="var(--chart-4)"
                size={180}
              />
              <Speedometer
                value={speedTest.summary?.uploadMbps ?? null}
                icon={ArrowUp}
                label="Upload"
                colorFrom="var(--chart-2)"
                colorTo="var(--chart-2)"
                size={180}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Adapter" />
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["Manufacturer", ap.manufacturer],
              ["Driver Version", ap.driverVersion],
              ["Description", ap.description],
            ].map(([l, v]) => (
              <div key={l as string}>
                <p className="text-muted-foreground/60 text-xs mb-0.5">{l as string}</p>
                <p className="font-mono font-medium text-foreground">{v ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Network Info" />
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {networkInfoFields.map(([l, v]) => (
              <div key={l}>
                <p className="text-muted-foreground/60 text-xs mb-0.5">{l}</p>
                <p className="font-mono font-medium text-foreground">{v ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
