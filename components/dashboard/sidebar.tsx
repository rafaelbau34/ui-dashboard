"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, isActive: true, iconColor: "text-primary" },
  { title: "Project", icon: FolderKanban, iconColor: "text-emerald-500" },
  { title: "Calendar", icon: Calendar, iconColor: "text-orange-500" },
  { title: "Reports", icon: BarChart3, iconColor: "text-rose-500" },
  { title: "Settings", icon: Settings, iconColor: "text-muted-foreground" },
];

export function DashboardSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  return (
    <Sidebar collapsible="offcanvas" className="!border-r-0" {...props}>
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center justify-end w-full">
          <Avatar className="size-8 border-2 border-sidebar shrink-0">
            <AvatarImage src="/ln.png" />
            <AvatarFallback>LN</AvatarFallback>
          </Avatar>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="h-9"
                  >
                    <Link href="#">
                      <item.icon className={cn("size-4 shrink-0", item.iconColor)} />
                      <span className="text-sm">{item.title}</span>

                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
