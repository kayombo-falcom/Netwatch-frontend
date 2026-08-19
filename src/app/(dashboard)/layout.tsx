"use client";

import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Sun, Moon,
} from "lucide-react";
import { screenTitles } from "@/app/_lib/dashboard-data";
import { NotificationBell } from "@/components/notification-bell";
import { GlobalSearch } from "@/components/global-search";
import { AppSidebar } from "@/components/sidebar";
import { IconButton } from "@/components/icon-button";
import { ProfileMenu } from "@/components/profile-menu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { DialogHostProvider } from "@/hooks/use-dialog-host";
import { UsersStoreProvider } from "@/hooks/use-users-store";
import { RolesStoreProvider } from "@/hooks/use-roles-store";
import { UserDialogRenderer } from "@/components/user-dialog-renderer";
import { IdleSessionGuard } from "@/hooks/use-idle-timeout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const activeKey = pathname.slice(1);

  return (
    <UsersStoreProvider>
      <RolesStoreProvider>
        <DialogHostProvider renderDialog={(descriptor, ctx) => <UserDialogRenderer descriptor={descriptor} {...ctx} />}>
          <IdleSessionGuard />
          <SidebarProvider className="h-screen bg-background overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
            <AppSidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top bar */}
              <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 shrink-0 shadow-sm">
                <SidebarTrigger className="md:hidden text-muted-foreground hover:bg-muted" />

                <GlobalSearch />

                <div className="ml-auto flex items-center gap-1">
                  {/* Dark mode toggle */}
                  <IconButton
                    title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={toggleTheme}
                    icon={theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                    placement="bottom"
                  />

                  {/* Alerts */}
                  <NotificationBell />

                  {/* Profile */}
                  <ProfileMenu />
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
        </DialogHostProvider>
      </RolesStoreProvider>
    </UsersStoreProvider>
  );
}
