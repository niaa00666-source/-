import type { CSSProperties, ReactNode } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type PrimaryWorkspaceProps = {
  children: ReactNode
  className?: string
  /** Optional product-defined header slot for titles, search and actions. */
  header?: ReactNode
  preview?: boolean
  style?: CSSProperties
}

export function PrimaryWorkspace({
  children,
  className,
  header,
  preview = false,
  style,
}: PrimaryWorkspaceProps) {
  return (
    <section
      className={cn("flex min-w-0 flex-1 flex-col overflow-hidden", className)}
      data-shell-region="PrimaryWorkspace"
      style={style}
    >
      {header ? (
        <header
          className={cn(
            "flex shrink-0 items-center border-b border-border",
            preview ? "h-12 px-4" : "h-14 px-4"
          )}
          data-shell-region="PageHeader"
        >
          {header}
        </header>
      ) : null}
      <ScrollArea
        className="min-h-0 min-w-0 flex-1"
        data-shell-region="PageContent"
      >
        {children}
      </ScrollArea>
    </section>
  )
}
