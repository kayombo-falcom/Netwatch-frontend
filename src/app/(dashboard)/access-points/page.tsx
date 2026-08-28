"use client";

import { useSyncExternalStore } from "react";
import { Radio, EthernetPort, RefreshCw, ArrowDown, ArrowUp, Globe, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { IconSwatch } from "@/components/icon-swatch";
import { IconButton } from "@/components/icon-button";
import { Tag } from "@/components/tag";
import { Btn } from "@/components/btn";
import { Speedometer } from "@/components/speedometer";
import { SpeedGauge } from "@/components/speed-gauge";
import { QualityDot } from "@/components/quality-dot";
import { TooltipWrap } from "@/components/tooltip-wrap";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { useCurrentAp } from "@/hooks/use-current-ap";
import { useSpeedTest } from "@/hooks/use-speed-test";
import { useNetworkMeta } from "@/hooks/use-network-meta";
import { signalQuality, rssiQuality, pingQuality, jitterQuality, packetLossQuality, qualityStrokeColor, bandInfo, linkRateQuality } from "@/lib/wifi-quality";

// The speedometer's `size` is a plain SVG pixel dimension, not something CSS
// breakpoints can scale on their own — read the viewport width (via
// useSyncExternalStore so the server/first-paint value can't mismatch) and
// pick a bigger dial on wider screens instead of leaving it fixed.
function subscribeWindowWidth(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}
const getWindowWidth = () => window.innerWidth;
const getWindowWidthServer = () => 1024;

function useGaugeSize() {
  const width = useSyncExternalStore(subscribeWindowWidth, getWindowWidth, getWindowWidthServer);
  if (width >= 1280) return 240;
  if (width >= 1024) return 210;
  return 180;
}

export default function AccessPointsPage() {
  const { data: ap, loading, refreshing, error, refresh } = useCurrentAp();
  const speedTest = useSpeedTest();
  const { data: meta, refresh: refreshMeta } = useNetworkMeta();
  const gaugeSize = useGaugeSize();
  const miniGaugeSize = Math.round(gaugeSize * 0.5);

  const refreshAll = () => {
    refresh();
    refreshMeta();
  };

  if (loading) {
    return (
      <div className="space-y-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      <div>
        <Card className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground/60">
          <Radio size={32} className="mb-3 opacity-30" />
          <p className="text-sm">{error ?? "Not connected to a network"}</p>
        </Card>
      </div>
    );
  }

  const isWifi = ap.type === "wifi";
  const ConnectionIcon = isWifi ? Radio : EthernetPort;

  const signal = ap.signalPercent != null ? signalQuality(ap.signalPercent) : null;
  const rssi = ap.rssiDbm != null ? rssiQuality(ap.rssiDbm) : null;
  const band = ap.band ? bandInfo(ap.band) : null;
  const receiveDot = ap.receiveRateMbps != null ? linkRateQuality(ap.receiveRateMbps) : null;
  const transmitDot = ap.transmitRateMbps != null ? linkRateQuality(ap.transmitRateMbps) : null;

  const metrics = isWifi
    ? [
        { label: "Signal", value: ap.signalPercent != null ? `${ap.signalPercent}%` : "—", dot: signal },
        { label: "RSSI", value: ap.rssiDbm != null ? `${ap.rssiDbm} dBm` : "—", dot: rssi },
        { label: "Channel", value: ap.channel ?? "—" },
        { label: "Band", value: ap.band ?? "—", info: band },
        { label: "Receive", value: ap.receiveRateMbps != null ? `${ap.receiveRateMbps} Mbps` : "—", dot: receiveDot },
        { label: "Transmit", value: ap.transmitRateMbps != null ? `${ap.transmitRateMbps} Mbps` : "—", dot: transmitDot },
      ]
    : [
        { label: "Receive", value: ap.receiveRateMbps != null ? `${ap.receiveRateMbps} Mbps` : "—", dot: receiveDot },
        { label: "Transmit", value: ap.transmitRateMbps != null ? `${ap.transmitRateMbps} Mbps` : "—", dot: transmitDot },
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
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <IconButton
          icon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />}
          title="Refresh page"
          onClick={refreshAll}
        />
      </div>

      <Card>
        <CardHeader
          title={ap.networkName ?? (isWifi ? "Unknown network" : "Wired connection")}
          subtitle={ap.interfaceName ?? undefined}
          action={<Tag color="teal"><ConnectionIcon size={12} /> Connected</Tag>}
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
            <div className={`grid grid-cols-2 ${isWifi ? "sm:grid-cols-3" : ""} gap-3 flex-1`}>
              {metrics.map(m => (
                <div key={m.label} className="text-center">
                  <div className="text-lg font-bold tabular-nums text-foreground">
                    {m.value}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/60">
                    {m.label}
                    {"dot" in m && m.dot && <QualityDot label={m.dot.label} colorClass={m.dot.colorClass} />}
                    {"info" in m && m.info && (
                      <TooltipWrap label={m.info}>
                        <Info size={11} className="text-muted-foreground/50" />
                      </TooltipWrap>
                    )}
                  </div>
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
            : "Check your real download and upload speed"
          }
          action={
            <Btn variant="secondary" size="xs" onClick={speedTest.toggle}>
              {speedTest.status === "running" ? "Cancel" : speedTest.summary ? "Run Again" : "Run Test"}
            </Btn>
          }
        />
        <div className="p-6">
          {speedTest.status === "error" && (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 mb-5">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold">Speed test failed</p>
                <p className="text-xs opacity-80 mt-0.5">{speedTest.error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center sm:items-start gap-4 shrink-0">
              <div className="flex gap-4">
                <SpeedGauge
                  value={speedTest.summary?.latencyMs ?? null}
                  max={200}
                  unit="ms"
                  label="Ping"
                  size={miniGaugeSize}
                  color={speedTest.summary?.latencyMs != null ? qualityStrokeColor(pingQuality(speedTest.summary.latencyMs).colorClass) : undefined}
                />
                <SpeedGauge
                  value={speedTest.summary?.jitterMs ?? null}
                  max={30}
                  unit="ms"
                  label="Jitter"
                  size={miniGaugeSize}
                  color={speedTest.summary?.jitterMs != null ? qualityStrokeColor(jitterQuality(speedTest.summary.jitterMs).colorClass) : undefined}
                />
                <SpeedGauge
                  value={speedTest.packetLoss.status === "done" ? speedTest.packetLoss.percent : null}
                  max={10}
                  unit="%"
                  label="Packet Loss"
                  size={miniGaugeSize}
                  color={speedTest.packetLoss.status === "done" ? qualityStrokeColor(packetLossQuality(speedTest.packetLoss.percent).colorClass) : undefined}
                >
                  {speedTest.packetLoss.status === "loading" ? <Loader2 size={16} className="animate-spin text-muted-foreground/60" /> : undefined}
                </SpeedGauge>
              </div>

              {(meta?.isp || meta?.city) && (
                <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3 w-full sm:w-auto">
                  <IconSwatch color="teal">
                    <Globe size={16} />
                  </IconSwatch>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {meta.isp}
                      {meta.isp && meta.city && " · "}
                      {meta.city}{meta.region && !meta.region.toLowerCase().includes((meta.city ?? "").toLowerCase()) ? `, ${meta.region}` : ""}
                    </div>
                    {meta.publicIp && <div className="text-[11px] font-mono text-muted-foreground/70">{meta.publicIp}</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10">
              <Speedometer
                value={speedTest.summary?.downloadMbps ?? null}
                icon={ArrowDown}
                label="Download"
                colorFrom="var(--chart-3)"
                colorTo="var(--chart-4)"
                size={gaugeSize}
              />
              <Speedometer
                value={speedTest.summary?.uploadMbps ?? null}
                icon={ArrowUp}
                label="Upload"
                colorFrom="var(--chart-2)"
                colorTo="var(--chart-2)"
                size={gaugeSize}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Adapter" />
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
