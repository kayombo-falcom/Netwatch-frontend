"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Wifi } from "lucide-react";
import { navItems, alertsData } from "@/app/_lib/dashboard-data";
import { hoverTintClass, systemHoverClass } from "@/lib/colors";
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
  const router = useRouter();
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    toggleSidebar();
  };

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarPrimitive collapsible="icon" className="border-sidebar-border cursor-pointer" onClick={handleBackgroundClick}>
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border py-0">
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
                      className={`text-sidebar-foreground ${isActive
                        ? "data-active:bg-(--brand-navy) data-active:text-white data-active:font-medium data-active:hover:bg-(--brand-navy) data-active:hover:text-white data-active:active:bg-(--brand-navy) data-active:active:text-white dark:data-active:bg-tint-navy-bg dark:data-active:text-tint-navy-fg dark:data-active:hover:bg-tint-navy-bg dark:data-active:hover:text-tint-navy-fg dark:data-active:active:bg-tint-navy-bg dark:data-active:active:text-tint-navy-fg"
                        : `${systemHoverClass} active:bg-tint-aqua-bg active:text-tint-aqua-fg`
                      }`}
                      render={
                        <Link href={item.href} onClick={handleNavClick}>
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                    {item.href === "/alerts" && unreadAlerts > 0 && (
                      <SidebarMenuBadge className="bg-(--brand-navy) text-white dark:bg-tint-navy-bg dark:text-tint-navy-fg rounded-full font-bold">
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
          onClick={() => router.push("/login")}
          className={`text-sidebar-foreground/60 text-xs active:bg-destructive/10 active:text-destructive ${hoverTintClass("destructive")}`}
        >
          <LogOut size={13} />
          <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarFooter>

      <SidebarRail />
    </SidebarPrimitive>
  );
};
