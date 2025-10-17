"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useColorScheme } from "@/hooks/useColorScheme"

export function ThemeToggle() {
  const { scheme, setScheme } = useColorScheme()

  const toggleTheme = () => {
    setScheme(scheme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-8 rounded-md"
      aria-label="Toggle theme"
    >
      {scheme === "dark" ? (
        <Sun className="size-4 text-foreground" />
      ) : (
        <Moon className="size-4 text-foreground" />
      )}
    </Button>
  )
}
