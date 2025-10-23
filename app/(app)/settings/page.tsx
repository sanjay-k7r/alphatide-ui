"use client"

import { useCallback, useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useColorScheme, type ColorSchemePreference } from "@/hooks/useColorScheme"
import { cn } from "@/lib/utils"

const THEME_OPTIONS: Array<{
  label: string
  value: ColorSchemePreference
  icon: typeof Sun
  description: string
}> = [
  {
    label: "Light",
    value: "light",
    icon: Sun,
    description: "Always use light theme"
  },
  {
    label: "Dark",
    value: "dark",
    icon: Moon,
    description: "Always use dark theme"
  },
  {
    label: "System",
    value: "system",
    icon: Monitor,
    description: "Match system settings"
  },
]

const DEBUG_STORAGE_KEY = "alphatide:debug-mode"
const DEBUG_EVENT_NAME = "alphatide:debug-mode-change"

type DebugModeChangeEvent = CustomEvent<{ enabled: boolean }>

function readDebugPreference(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  try {
    return window.localStorage.getItem(DEBUG_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

function writeDebugPreference(enabled: boolean) {
  if (typeof window === "undefined") {
    return
  }
  try {
    if (enabled) {
      window.localStorage.setItem(DEBUG_STORAGE_KEY, "true")
    } else {
      window.localStorage.removeItem(DEBUG_STORAGE_KEY)
    }
  } catch {
    // noop - storage can fail in private mode
  }
}

function broadcastDebugPreference(enabled: boolean) {
  if (typeof window === "undefined") {
    return
  }
  const event: DebugModeChangeEvent = new CustomEvent(DEBUG_EVENT_NAME, {
    detail: { enabled },
  })
  window.dispatchEvent(event)
}

function useDebugPreference() {
  const [enabled, setEnabled] = useState<boolean>(() => readDebugPreference())

  const updatePreference = useCallback(
    (next: boolean) => {
      setEnabled(next)
      writeDebugPreference(next)
      broadcastDebugPreference(next)
    },
    []
  )

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DEBUG_STORAGE_KEY) {
        return
      }
      setEnabled(readDebugPreference())
    }

    const handleDebugEvent = (event: Event) => {
      const detail = (event as DebugModeChangeEvent).detail
      if (typeof detail?.enabled === "boolean") {
        setEnabled(detail.enabled)
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener(DEBUG_EVENT_NAME, handleDebugEvent as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener(
        DEBUG_EVENT_NAME,
        handleDebugEvent as EventListener
      )
    }
  }, [])

  return { enabled, setEnabled: updatePreference }
}

export default function SettingsPage() {
  const { preference, setPreference } = useColorScheme()
  const { enabled: debugEnabled, setEnabled: setDebugEnabled } =
    useDebugPreference()

  const handleThemeChange = useCallback(
    (value: ColorSchemePreference) => {
      setPreference(value)
    },
    [setPreference]
  )

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your application preferences
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Theme
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isActive = preference === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleThemeChange(option.value)}
                        className={cn(
                          "relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all hover:bg-accent/50",
                          isActive
                            ? "border-primary bg-accent"
                            : "border-border bg-background"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn(
                            "size-5",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "font-medium",
                            isActive ? "text-foreground" : "text-foreground"
                          )}>
                            {option.label}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                        {isActive && (
                          <div className="absolute right-3 top-3 size-2 rounded-full bg-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Developer</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug-mode" className="text-sm font-medium">
                    Debug Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable debug mode to see additional information in the console
                  </p>
                </div>
                <Switch
                  id="debug-mode"
                  checked={debugEnabled}
                  onCheckedChange={setDebugEnabled}
                  aria-label="Toggle debug mode"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
