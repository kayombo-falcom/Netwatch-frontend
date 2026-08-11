"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, XCircle, AlertTriangle, Info, CheckCheck } from "lucide-react";
import { alertsData, type Severity } from "@/app/_lib/dashboard-data";
import { IconButton } from "@/components/icon-button";
import { systemHoverClass } from "@/lib/colors";

const severityIcon = (s: Severity) => ({
  critical: <XCircle size={14} className="text-status-critical shrink-0" />,
  warning: <AlertTriangle size={14} className="text-status-warning shrink-0" />,
  info: <Info size={14} className="text-status-online shrink-0" />,
}[s]);

export const NotificationBell = () => {
  const [alerts, setAlerts] = useState(alertsData);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = alerts.filter(a => !a.read).length;
  const recent = alerts.slice(0, 5);

  const markAllRead = () => setAlerts(a => a.map(x => ({ ...x, read: true })));
  const markRead = (id: number) => setAlerts(a => a.map(x => x.id === id ? { ...x, read: true } : x));

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <IconButton
        title="Notifications"
        onClick={() => setOpen(o => !o)}
        placement="bottom"
        icon={
          <>
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </>
        }
      />

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {recent.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground/60">No notifications</p>
            ) : recent.map(a => (
              <button
                key={a.id}
                onClick={() => markRead(a.id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-2.5 transition-colors ${systemHoverClass} ${!a.read ? "bg-muted/40" : ""}`}
              >
                {severityIcon(a.severity)}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs leading-snug ${!a.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>{a.title}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{a.time}</p>
                </div>
                {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />}
              </button>
            ))}
          </div>

          <Link
            href="/alerts"
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-medium text-primary hover:underline px-4 py-3 border-t border-border"
          >
            View all alerts
          </Link>
        </div>
      )}
    </div>
  );
};
