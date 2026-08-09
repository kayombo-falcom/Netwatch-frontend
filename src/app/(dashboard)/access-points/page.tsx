"use client";

import { useState } from "react";
import { Radio, X, RefreshCw, Download, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { StatusBadge } from "@/components/status-badge";
import { IconSwatch } from "@/components/icon-swatch";
import { Tag } from "@/components/tag";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { apsData } from "@/app/_lib/dashboard-data";
import { TINT } from "@/lib/colors";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useHighlightParam } from "@/hooks/use-highlight-param";

export default function AccessPointsPage() {
  const loading = useSimulatedLoading();
  const highlightId = useHighlightParam();
  const [selected, setSelected] = useState<typeof apsData[0] | null>(null);

  const apDetailData = [
    { t: "10m", v: 35 }, { t: "20m", v: 48 }, { t: "30m", v: 61 },
    { t: "40m", v: 55 }, { t: "50m", v: 70 }, { t: "60m", v: 73 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="space-y-1.5">
                  <SkeletonText width="120px" />
                  <SkeletonText width="160px" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="text-center space-y-1.5">
                  <Skeleton className="h-5 w-10 mx-auto" />
                  <SkeletonText width="40px" className="mx-auto" />
                </div>
              ))}
            </div>
            <Skeleton className="h-1.5 w-full rounded-full mt-4" />
          </Card>
        )) : apsData.map(ap => (
          <Card
            key={ap.id}
            ref={el => { if (String(ap.id) === highlightId) el?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
            className={`cursor-pointer transition-all hover:border-primary ${selected?.id === ap.id ? "ring-2 ring-ring ring-offset-2" : ""} ${String(ap.id) === highlightId ? "highlight-blink" : ""}`}
            onClick={() => setSelected(ap)}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <IconSwatch color={ap.status === "online" ? "teal" : "amber"}>
                    <Radio size={18} />
                  </IconSwatch>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{ap.name}</h3>
                    <p className="text-xs text-muted-foreground">{ap.location} · {ap.model}</p>
                  </div>
                </div>
                <StatusBadge status={ap.status} />
              </div>
              <div className="grid grid-cols-4 gap-3">
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
              {/* Load bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground/60 mb-1">
                  <span>Load</span><span>{ap.load}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${ap.load > 80 ? "bg-status-critical" : ap.load > 60 ? "bg-status-warning" : "bg-status-online"}`}
                    style={{ width: `${ap.load}%` }}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground/60">{ap.ip}</span>
                <Tag color={ap.firmware === "6.4.1" ? "teal" : "amber"} bordered={false}>
                  fw {ap.firmware} {ap.firmware !== "6.4.1" && "· update available"}
                </Tag>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-2">
        {selected ? (
          <Card className="sticky top-4">
            <CardHeader
              title={selected.location}
              subtitle={selected.model}
              action={<button onClick={() => setSelected(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground/60"><X size={14} /></button>}
            />
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Load — Last Hour</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={apDetailData}>
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ fontSize: 11, background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }} formatter={(v: number) => [`${v}%`]} />
                    <Line type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ["IP", selected.ip],
                  ["Channel", selected.channel],
                  ["Signal", `${selected.signal} dBm`],
                  ["Clients", selected.clients],
                  ["Firmware", selected.firmware],
                  ["Status", selected.status],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <p className="text-muted-foreground/60 text-xs mb-0.5">{l as string}</p>
                    <p className="font-mono font-medium text-foreground">{v as string}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <Btn variant="secondary" size="sm"><RefreshCw size={13} /> Restart AP</Btn>
                <Btn variant="secondary" size="sm"><Download size={13} /> Update Firmware</Btn>
                <Btn variant="secondary" size="sm"><BarChart2 size={13} /> Full Report</Btn>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground/60">
            <Radio size={32} className="mb-3 opacity-30" />
            <p className="text-sm">Select an access point to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
