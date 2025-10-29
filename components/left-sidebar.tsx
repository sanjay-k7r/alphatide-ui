"use client"

import type { ComponentProps } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Bot,
  MessageCircle,
  MoreVertical,
  Radar,
  Settings2,
  Waves,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { TAB_STORAGE_KEY } from "@/lib/navigation"
import { useAuth } from "@/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

type NavItem = {
  id: "chat" | "radar" | "assistant"
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "chat",
    label: "Chat",
    href: "/",
    icon: MessageCircle,
  },
  {
    id: "radar",
    label: "Radar",
    href: "/radar",
    icon: Radar,
  },
  {
    id: "assistant",
    label: "Assistant",
    href: "/assistant",
    icon: Bot,
  },
]


export function LeftSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { isMobile } = useSidebar()

  const userEmail = user?.email ?? ""
  const userInitials = useMemo(() => {
    const metadata = user?.user_metadata as { full_name?: string } | undefined
    if (metadata?.full_name && metadata.full_name.trim().length > 0) {
      const parts = metadata.full_name.trim().split(/\s+/)
      const initials = parts.slice(0, 2).map((part) => part[0] ?? "")
      return initials.join("").toUpperCase()
    }
    if (userEmail) {
      const local = userEmail.split("@")[0] ?? ""
      if (local.length >= 2) {
        return local.slice(0, 2).toUpperCase()
      }
      if (local.length === 1) {
        return local.toUpperCase()
      }
    }
    return "US"
  }, [user?.user_metadata, userEmail])

  const activeTab = pathname?.startsWith("/radar")
    ? "radar"
    : pathname?.startsWith("/assistant")
    ? "assistant"
    : "chat"
  const onSettingsRoute = pathname?.startsWith("/settings") ?? false

  useEffect(() => {
    for (const item of NAV_ITEMS) {
      void router.prefetch(item.href)
    }
    void router.prefetch("/settings")
  }, [router])

  const handleNavigate = useCallback(
    (item: NavItem) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(TAB_STORAGE_KEY, item.id)
      }
      if (pathname !== item.href) {
        router.push(item.href)
      }
    },
    [pathname, router]
  )

  const handleSettingsNavigation = useCallback(() => {
    if (pathname !== "/settings") {
      router.push("/settings")
    }
  }, [pathname, router])

  const handleLogout = useCallback(async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error("Failed to log out", { description: error.message })
        return
      }

      toast.success("Logged out successfully")
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Unexpected logout error:", error)
      toast.error("An unexpected error occurred during logout")
    }
  }, [router])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-base font-semibold"
              onClick={() => handleNavigate(NAV_ITEMS[0])}
            >
              <Waves className="size-5" />
              <span>Alphatide</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={item.id === activeTab}
                      onClick={() => handleNavigate(item)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={onSettingsRoute}
                  onClick={handleSettingsNavigation}
                >
                  <Settings2 />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userInitials}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail || "No email available"}
                    </span>
                  </div>
                  <MoreVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{userInitials}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {userEmail || "No email available"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    handleSettingsNavigation()
                  }}
                >
                  <Settings2 className="mr-2 size-4" />
                  Open settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleLogout()
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
