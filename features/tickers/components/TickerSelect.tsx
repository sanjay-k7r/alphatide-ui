"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Ticker } from "@/features/tickers/types/tickers.types"

interface TickerSelectProps {
  value: string
  onValueChange: (value: string) => void
  tickers: Ticker[]
  loading: boolean
  error: Error | null
  onRefresh?: () => void
  placeholder?: string
}

export function TickerSelect({
  value,
  onValueChange,
  tickers,
  loading,
  error,
  onRefresh,
  placeholder = "Select ticker…",
}: TickerSelectProps) {
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    return tickers.map((ticker) => ({
      id: ticker.id,
      symbol: ticker.ticker,
      name: ticker.name,
    }))
  }, [tickers])

  const selectedTicker = useMemo(() => {
    return items.find((ticker) => ticker.symbol === value)
  }, [items, value])

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-sm font-normal"
        >
          {selectedTicker ? (
            <span className="flex items-center gap-1 truncate">
              <span className="font-medium">{selectedTicker.symbol}</span>
              {selectedTicker.name && (
                <span className="truncate text-muted-foreground">
                  - {selectedTicker.name}
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0"
        align="start"
        sideOffset={4}
        side="bottom"
        avoidCollisions
      >
        <Command
          shouldFilter
          filter={(symbol, search) => {
            const ticker = items.find((item) => item.symbol === symbol)
            if (!ticker) return 0
            if (!search) return 1
            const searchLower = search.toLowerCase()
            if (ticker.symbol.toLowerCase().includes(searchLower)) return 1
            if (ticker.name?.toLowerCase().includes(searchLower)) return 1
            return 0
          }}
        >
          <CommandInput placeholder="Search tickers…" />
          <CommandList className="max-h-[240px] overflow-y-auto">
            <CommandEmpty>
              {loading
                ? "Loading…"
                : error
                  ? "Failed to load tickers"
                  : "No tickers found"}
            </CommandEmpty>
            <CommandGroup>
              {items.map((ticker) => (
                <CommandItem
                  key={ticker.id}
                  value={ticker.symbol}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue
                    onValueChange(newValue)
                    setOpen(false)
                  }}
                  className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === ticker.symbol ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-1 flex-col text-left">
                    <span className="font-medium">{ticker.symbol}</span>
                    {ticker.name && (
                      <span className="text-xs text-muted-foreground">
                        {ticker.name}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {onRefresh && (
          <div className="flex items-center justify-end border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onRefresh()
              }}
              className="flex items-center gap-1 text-xs"
            >
              <RefreshCcw className="size-3.5" />
              Refresh
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
