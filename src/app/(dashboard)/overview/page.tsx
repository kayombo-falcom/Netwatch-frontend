"use client";

import { Monitor, Users, Radio, Activity, Download, Plus, Zap, RefreshCw, XCircle, AlertTriangle, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { StatusDot } from "@/components/status-dot";
import { StatusBadge } from "@/components/status-badge";
import { MetricCard } from "@/components/metric-card";
import { alertsData, apsData, devicesData, bwData } from "@/app/_lib/dashboard-data";

export default function OverviewPage() {
  const recentAlerts = alertsData.slice(0, 3);
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Devices" value="42" sub="38 authorized · 4 guest" icon={<Monitor size={18} />} color="blue" trend={{ val: "+3 today", up: true }} />
        <MetricCard label="Active Users" value="31" sub="of 48 registered" icon={<Users size={18} />} color="green" />
        <MetricCard label="Access Points" value="3/4" sub="1 at high load" icon={<Radio size={18} />} color="amber" />
        <MetricCard label="Bandwidth Used" value="68%" sub="of 200 Mbps link" icon={<Activity size={18} />} color="purple" trend={{ val: "↑ 12% vs. last hr", up: false }} />
      </div>

      {/* Bandwidth Chart */}
      <Card>
        <CardHeader
          title="Bandwidth — Today"
          subtitle="Main Office · 8AM–7PM"
          action={<Btn variant="ghost" size="xs"><Download size={12} /> Export</Btn>}
        />
        <div className="p-5">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bwData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
                formatter={(v: number, name: string) => [`${v} Mbps`, name === "down" ? "Download" : "Upload"]}
              />
              <Area type="monotone" dataKey="down" stroke="var(--chart-1)" strokeWidth={1.5} fill="var(--chart-1)" fillOpacity={0.15} />
              <Area type="monotone" dataKey="up" stroke="var(--chart-2)" strokeWidth={1.5} fill="var(--chart-2)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-chart-1 inline-block rounded" /> Download</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-chart-2 inline-block rounded" /> Upload</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Table */}
        <Card className="lg:col-span-2">
          <CardHeader title="Active Devices" subtitle="Showing top 6 by session time" action={<Btn variant="ghost" size="xs">View all</Btn>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Device", "User", "AP", "Data", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devicesData.slice(0, 6).map(d => (
                  <tr key={d.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground text-xs truncate max-w-[160px]">{d.name}</div>
                      <div className="text-xs text-muted-foreground/60 font-mono">{d.ip}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{d.user}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{d.ap}</td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground/80">{d.data}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* AP Health + Alerts */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="AP Health" />
            <div className="divide-y divide-border">
              {apsData.map(ap => (
                <div key={ap.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <StatusDot status={ap.status} />
                    <div>
                      <div className="text-xs font-medium text-foreground">{ap.location}</div>
                      <div className="text-xs text-muted-foreground/60">{ap.clients} clients</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-mono font-semibold ${ap.load > 70 ? "text-tint-amber-fg" : "text-foreground/80"}`}>{ap.load}%</div>
                    <div className="text-xs text-muted-foreground/60">load</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent Alerts" action={<Btn variant="ghost" size="xs">All</Btn>} />
            <div className="divide-y divide-border">
              {recentAlerts.map(a => (
                <div key={a.id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 shrink-0 ${a.severity === "critical" ? "text-status-critical" : a.severity === "warning" ? "text-status-warning" : "text-status-online"}`}>
                      {a.severity === "critical" ? <XCircle size={13} /> : a.severity === "warning" ? <AlertTriangle size={13} /> : <Info size={13} />}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-foreground leading-snug">{a.title}</div>
                      <div className="text-xs text-muted-foreground/60 mt-0.5">{a.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="flex flex-wrap gap-3 p-4">
          {[
            { label: "Add Device", icon: <Plus size={14} />, variant: "primary" as const },
            { label: "Run Speed Test", icon: <Zap size={14} />, variant: "secondary" as const },
            { label: "Export Report", icon: <Download size={14} />, variant: "secondary" as const },
            { label: "Sync Firmware", icon: <RefreshCw size={14} />, variant: "secondary" as const },
            { label: "Restart All APs", icon: <Radio size={14} />, variant: "outline" as const },
          ].map(a => (
            <Btn key={a.label} variant={a.variant} size="sm">{a.icon} {a.label}</Btn>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground/60 text-right">Last updated: {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · Auto-refresh every 30s</p>
    </div>
  );
}
