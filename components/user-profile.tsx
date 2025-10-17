"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { toast } from "sonner"

interface UserProfileProps {
  userEmail?: string
}

export function UserProfile({ userEmail }: UserProfileProps) {
  const router = useRouter()

  const getInitials = (email?: string) => {
    if (!email) return "U"
    return email.charAt(0).toUpperCase()
  }

  const handleLogout = async () => {
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
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/20">
        <Avatar className="size-6">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials(userEmail)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-xs text-muted-foreground sm:inline-block">
          {userEmail || "No email"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <User className="size-4" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userEmail || "No email"}</span>
            <span className="text-xs text-gray-500">Manage account</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
