import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ContextPanelProps = {
  children: ReactNode
  fill?: boolean
  minWidth?: number
  resizeHandle?: ReactNode
  width?: number
}

export function ContextPanel({
  children,
  fill = false,
  minWidth,
  resizeHandle,
  width,
}: ContextPanelProps) {
  return (
    <aside
      className={cn(
        "relative block min-h-0 overflow-hidden border-l border-border bg-background",
        fill ? "min-w-0 flex-1" : "shrink-0"
      )}
      data-shell-region="ContextPanel"
      style={fill ? { minWidth } : { width }}
    >
      {resizeHandle}
      {children}
    </aside>
  )
}
