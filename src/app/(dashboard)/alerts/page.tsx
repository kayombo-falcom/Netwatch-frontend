"use client";

import { useState } from "react";
import { Eye, X, Clock, ArrowUpRight, CheckCircle } from "lucide-react";
import { Card } from "@/components/card";
import { SeverityBadge } from "@/components/severity-badge";
import { SeverityIcon } from "@/components/severity-icon";
import { IconButton } from "@/components/icon-button";
import { alertsData, type Severity } from "@/app/_lib/dashboard-data";
import { STATUS, SEVERITY_STATUS } from "@/lib/colors";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(alertsData);
  const [filter, setFilter] = useState<"all" | Severity>("all");

  const markRead = (id: number) => setAlerts(a => a.map(x => x.id === id ? { ...x, read: true } : x));
  const markAllRead = () => setAlerts(a => a.map(x => ({ ...x, read: true })));
  const dismiss = (id: number) => setAlerts(a => a.filter(x => x.id !== id));

  const filtered = alerts.filter(a => filter === "all" || a.severity === filter);
  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["all", "critical", "warning", "info"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"}`}
            >{s === "all" ? `All (${alerts.length})` : s}</button>
          ))}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="ml-auto text-xs text-primary hover:underline">
            Mark all {unread} as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <CheckCircle size={32} className="mx-auto text-status-online mb-3" />
            <p className="text-sm font-medium text-foreground/80">No alerts</p>
            <p className="text-xs text-muted-foreground/60 mt-1">All clear for this category.</p>
          </Card>
        ) : filtered.map(a => (
          <Card
            key={a.id}
            className={`transition-all ${!a.read ? `border-l-4 ${STATUS[SEVERITY_STATUS[a.severity]].borderLeft}` : ""}`}
          >
            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5"><SeverityIcon severity={a.severity} size={16} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${!a.read ? "text-foreground" : "text-muted-foreground"}`}>{a.title}</p>
                    <SeverityBadge severity={a.severity} />
                    {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!a.read && (
                      <IconButton color="aqua" title="Mark read" onClick={() => markRead(a.id)} icon={<Eye size={12} />} />
                    )}
                    <IconButton color="destructive" title="Dismiss" onClick={() => dismiss(a.id)} icon={<X size={12} />} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground/60 flex items-center gap-1"><Clock size={10} />{a.time}</span>
                  {a.action && (
                    <button className="text-xs text-primary hover:underline flex items-center gap-0.5">
                      {a.action} <ArrowUpRight size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
