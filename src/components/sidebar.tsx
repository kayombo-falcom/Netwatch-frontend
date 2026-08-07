"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Wifi } from "lucide-react";
import { navItems, alertsData } from "@/app/_lib/dashboard-data";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const unreadAlerts = alertsData.filter(a => !a.read).length;

export const AppSidebar = () => {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    toggleSidebar();
  };

  return (
    <SidebarPrimitive collapsible="icon" className="border-sidebar-border cursor-pointer" onClick={handleBackgroundClick}>
      <SidebarHeader className="gap-3 border-b border-sidebar-border py-4">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
            <Wifi size={14} className="text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="text-sidebar-foreground font-bold text-sm tracking-tight truncate">NetWatch</div>
            <div className="text-sidebar-foreground/60 text-xs truncate">Admin Console</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-primary/15 data-active:text-sidebar-primary data-active:font-medium"
                      render={
                        <Link href={item.href}>
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                    {item.href === "/alerts" && unreadAlerts > 0 && (
                      <SidebarMenuBadge className="bg-sidebar-primary text-sidebar-primary-foreground rounded-full font-bold">
                        {unreadAlerts}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-1 border-t border-sidebar-border py-3">
        <SidebarMenuButton
          tooltip="Sign out"
          className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-xs"
        >
          <LogOut size={13} />
          <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarFooter>

      <SidebarRail />
    </SidebarPrimitive>
  );
};
