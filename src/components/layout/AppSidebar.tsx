import { useState } from "react"
import { 
  Home, 
  Upload, 
  Settings, 
  Search, 
  FileText, 
  TrendingUp,
  User,
  Bell,
  ChevronRight
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Job Discovery", url: "/jobs", icon: Search },
  { title: "Applications", url: "/applications", icon: FileText },
  { title: "Resume Upload", url: "/resume", icon: Upload },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-card backdrop-blur-sm border-r border-border/50">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  JobFlow AI
                </h1>
                <p className="text-xs text-muted-foreground">Smart Applications</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="flex-1 p-4">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="w-full rounded-lg transition-all duration-200"
                  >
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="font-medium">{item.title}</span>
                          <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="p-4 border-t border-border/50">
            <div className="bg-gradient-card rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Quick Stats</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Applications sent:</span>
                  <span className="text-foreground font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span>Responses:</span>
                  <span className="text-success font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Success rate:</span>
                  <span className="text-primary font-medium">33%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}