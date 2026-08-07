"use client";

import { useState } from "react";
import { Download, FileText, Upload, Ban, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { MetricCard } from "@/components/metric-card";
import { trafficBwData, trafficCategoryData, topUsersTraffic, peakData } from "@/app/_lib/dashboard-data";

export default function TrafficPage() {
  const [range, setRange] = useState("7d");

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {["24h", "7d", "30d", "Custom"].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${range === r ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"}`}
            >{r}</button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Btn variant="secondary" size="sm"><Download size={13} /> Export CSV</Btn>
          <Btn variant="secondary" size="sm"><FileText size={13} /> Export PDF</Btn>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Downloaded" value="1.02 TB" sub="across 7 days" icon={<Download size={18} />} color="blue" />
        <MetricCard label="Total Uploaded" value="348 GB" sub="across 7 days" icon={<Upload size={18} />} color="green" />
        <MetricCard label="Blocked Requests" value="2,341" sub="avg 334/day" icon={<Ban size={18} />} color="amber" />
        <MetricCard label="Peak Throughput" value="224 Mbps" sub="Friday 15:30" icon={<TrendingUp size={18} />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bandwidth chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Bandwidth — 7 Days" subtitle="Daily totals in GB" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trafficBwData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}G`} />
                <Tooltip contentStyle={{ fontSize: 12, background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }} formatter={(v: number, name: string) => [`${v} GB`, name === "down" ? "Download" : "Upload"]} />
                <Bar dataKey="down" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="up" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader title="Traffic by Category" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={trafficCategoryData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {trafficCategoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }} formatter={(v: number) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {trafficCategoryData.map(c => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-xs text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-foreground/80">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top users */}
        <Card>
          <CardHeader title="Top Consumers" subtitle="By data volume this week" />
          <div className="divide-y divide-border">
            {topUsersTraffic.map(u => (
              <div key={u.name} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground">{u.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{u.usage} GB</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-1 rounded-full"
                    style={{ width: `${(u.usage / u.limit) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground/60 mt-0.5 text-right">{Math.round((u.usage / u.limit) * 100)}% of limit</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak periods */}
        <Card>
          <CardHeader title="Peak Periods" subtitle="Average load by hour today" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={peakData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ fontSize: 11, background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)" }} formatter={(v: number) => [`${v}%`, "Load"]} />
                <Area type="monotone" dataKey="v" stroke="var(--chart-4)" strokeWidth={1.5} fill="var(--chart-4)" fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
