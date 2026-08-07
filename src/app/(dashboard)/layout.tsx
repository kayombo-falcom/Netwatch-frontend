"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown, ChevronRight, Search, HelpCircle, LogOut, Wifi,
  Menu, Bell, Sun, Moon,
} from "lucide-react";
import { navItems, networks, alertsData, screenTitles } from "@/app/_lib/dashboard-data";

const unreadAlerts = alertsData.filter(a => !a.read).length;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [network, setNetwork] = useState(networks[0]);
  const [time, setTime] = useState(new Date());
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const activeKey = pathname.slice(1);

  return (
    <div className={`flex h-screen bg-background overflow-hidden${dark ? " dark" : ""}`} style={{ fontFamily: "var(--font-sans)" }}>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-56 flex-shrink-0 flex flex-col bg-sidebar transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Wifi size={14} className="text-sidebar-primary-foreground" />
            </div>
            <div>
              <div className="text-sidebar-foreground font-bold text-sm tracking-tight">NetWatch</div>
              <div className="text-sidebar-foreground/60 text-xs">Admin Console</div>
            </div>
          </div>

          {/* Network selector */}
          <div className="mt-4 relative">
            <select
              value={network}
              onChange={e => setNetwork(e.target.value)}
              className="w-full bg-sidebar-accent text-sidebar-foreground text-xs rounded-lg px-3 py-2 appearance-none border border-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-ring cursor-pointer"
            >
              {networks.map(n => <option key={n} value={n} style={{ background: "var(--sidebar-accent)", color: "var(--sidebar-foreground)" }}>{n}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sidebar-foreground/60 pointer-events-none" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left relative ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon size={16} />
                {item.label}
                {item.href === "/alerts" && unreadAlerts > 0 && (
                  <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 border-t border-sidebar-border space-y-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold shrink-0">SC</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-sidebar-foreground truncate">Sarah Chen</div>
              <div className="text-xs text-sidebar-foreground/60">Administrator</div>
            </div>
          </div>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent text-xs transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search devices, users, IPs…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card transition-colors"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* Time */}
            <div className="hidden sm:block text-xs text-muted-foreground font-mono mr-2">
              {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} &nbsp;
              {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Alerts icon */}
            <Link
              href="/alerts"
              className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell size={17} />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </Link>

            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <HelpCircle size={17} />
            </button>

            {/* Profile */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold ml-1 cursor-pointer">
              SC
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Breadcrumbs + Title */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <span>NetWatch</span>
              <ChevronRight size={12} />
              <span className="text-foreground font-medium">{screenTitles[activeKey]}</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-foreground">{screenTitles[activeKey]}</h1>
              {activeKey === "overview" && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-(--brand-teal) animate-pulse" />
                  Live monitoring active
                </div>
              )}
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
