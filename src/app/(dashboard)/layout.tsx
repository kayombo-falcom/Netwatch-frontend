"use client";

import { usePathname } from "next/navigation";
import {
  ChevronRight, Search,
  Sun, Moon,
} from "lucide-react";
import { screenTitles } from "@/app/_lib/dashboard-data";
import { NotificationBell } from "@/components/notification-bell";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const activeKey = pathname.slice(1);

  return (
    <SidebarProvider className="h-screen bg-background overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      <AppSidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 shrink-0 shadow-sm">
          <SidebarTrigger className="md:hidden text-muted-foreground hover:bg-muted" />

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search devices, users, IPs…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card transition-colors"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Alerts */}
            <NotificationBell />

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
                  <div className="w-1.5 h-1.5 rounded-full bg-status-online animate-pulse" />
                  Live monitoring active
                </div>
              )}
            </div>

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
