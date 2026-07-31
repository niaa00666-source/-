import type { ComponentProps, ElementType, ReactNode } from "react"

import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"

type DragPreviewProps = Omit<ComponentProps<typeof Item>, "children"> & {
  icon?: ElementType<{ className?: string }>
  label: ReactNode
  media?: ReactNode
  tone?: "neutral" | "primary"
}

function DragPreview({
  className,
  icon: Icon,
  label,
  media,
  tone = "primary",
  ...props
}: DragPreviewProps) {
  return (
    <Item
      className={cn(
        "flex-nowrap opacity-100 shadow-lg",
        tone === "neutral"
          ? "h-12 w-64 border-border bg-popover text-popover-foreground"
          : "w-max max-w-96 border-transparent bg-primary text-primary-foreground",
        className
      )}
      data-slot="drag-preview"
      size="default"
      variant="default"
      {...props}
    >
      <ItemMedia variant="icon">
        {media ?? (Icon ? <Icon aria-hidden="true" /> : null)}
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="block w-full truncate">{label}</ItemTitle>
      </ItemContent>
    </Item>
  )
}

export { DragPreview, type DragPreviewProps }
