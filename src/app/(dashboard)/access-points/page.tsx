"use client";

import { Radio } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { StatusBadge } from "@/components/status-badge";
import { IconSwatch } from "@/components/icon-swatch";
import { Tag } from "@/components/tag";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { apsData } from "@/app/_lib/dashboard-data";
import { TINT } from "@/lib/colors";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

export default function AccessPointsPage() {
  const loading = useSimulatedLoading();
  const ap = apsData.find(a => a.status === "online");

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="text-center space-y-1.5">
                <Skeleton className="h-5 w-10 mx-auto" />
                <SkeletonText width="40px" className="mx-auto" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </Card>
        <Card className="p-5 space-y-3">
          <SkeletonText width="100px" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, j) => (
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

  if (!ap) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground/60">
          <Radio size={32} className="mb-3 opacity-30" />
          <p className="text-sm">No connected access point</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title={ap.name}
          subtitle={`${ap.location} · ${ap.model}`}
          action={<StatusBadge status={ap.status} />}
        />
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <IconSwatch color="teal">
              <Radio size={18} />
            </IconSwatch>
            <div className="grid grid-cols-4 gap-3 flex-1">
              {[
                { label: "Clients", value: ap.clients },
                { label: "Signal", value: `${ap.signal} dBm` },
                { label: "Channel", value: ap.channel },
                { label: "Load", value: `${ap.load}%` },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <div className={`text-lg font-bold tabular-nums ${m.label === "Load" && ap.load > 70 ? TINT.amber.fg : "text-foreground"}`}>
                    {m.value}
                  </div>
                  <div className="text-xs text-muted-foreground/60">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Tag color={ap.firmware === "6.4.1" ? "teal" : "amber"} bordered={false}>
              fw {ap.firmware} {ap.firmware !== "6.4.1" && "· update available"}
            </Tag>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Network Info" />
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["IP Address", ap.ip],
              ["MAC Address", ap.mac],
              ["Gateway", ap.gateway],
              ["Subnet", ap.subnet],
              ["VLAN", ap.vlan],
              ["Management IP", ap.managementIp],
            ].map(([l, v]) => (
              <div key={l as string}>
                <p className="text-muted-foreground/60 text-xs mb-0.5">{l as string}</p>
                <p className="font-mono font-medium text-foreground">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
