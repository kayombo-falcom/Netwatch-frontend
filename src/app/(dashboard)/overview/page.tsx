"use client";

import { Monitor, Users, Radio, Activity, ShieldCheck, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { MetricCard } from "@/components/metric-card";
import { SkeletonChart, SkeletonMetricCard } from "@/components/skeleton";
import { apsData, devicesData, bwData, usersData, policiesData, policyCategories } from "@/app/_lib/dashboard-data";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

const LINK_CAPACITY_MBPS = 200;

export default function OverviewPage() {
  const loading = useSimulatedLoading();

  const guestDevices = devicesData.filter(d => d.user === "Guest").length;
  const activeUsers = usersData.filter(u => u.status === "active").length;
  const busiestAp = apsData.reduce((a, b) => (b.clients > a.clients ? b : a));
  const peakBw = Math.max(...bwData.map(d => d.down + d.up));

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          <>
            <SkeletonMetricCard /><SkeletonMetricCard /><SkeletonMetricCard /><SkeletonMetricCard /><SkeletonMetricCard />
          </>
        ) : (
          <>
            <MetricCard label="Total Devices" value={String(devicesData.length)} sub={`${devicesData.length - guestDevices} authorized · ${guestDevices} guest`} icon={<Monitor size={18} />} color="navy" />
            <MetricCard label="Active Users" value={String(activeUsers)} sub={`of ${usersData.length} registered`} icon={<Users size={18} />} color="teal" />
            <MetricCard label="Access Points" value={busiestAp.name} icon={<Radio size={18} />} color="amber" />
            <MetricCard label="Bandwidth Used" value={`${Math.round((peakBw / LINK_CAPACITY_MBPS) * 100)}%`} sub={`of ${LINK_CAPACITY_MBPS} Mbps link`} icon={<Activity size={18} />} color="aqua" />
            <MetricCard label="Active Policies" value={String(policiesData.length)} sub={`${policyCategories.length} categories`} icon={<ShieldCheck size={18} />} color="navy" />
          </>
        )}
      </div>

      {/* Bandwidth Chart */}
      <Card>
        <CardHeader
          title="Bandwidth — Today"
          subtitle="Main Office · 8AM–7PM"
          action={<Btn variant="ghost" size="xs"><Download size={12} /> Export</Btn>}
        />
        <div className="p-5">
          {loading ? <SkeletonChart height={220} /> : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={bwData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="t" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
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
            </>
          )}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground/60 text-right">Last updated: {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · Auto-refresh every 30s</p>
    </div>
  );
}
