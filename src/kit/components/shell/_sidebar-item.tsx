// INTERNAL helper for SidebarNavigation ONLY. Do NOT re-export from
// index.ts. This is the lab's lightweight `patterns/item.tsx` (cva with
// `density` + sidebar/sidebarSelected variants), which is a DIFFERENT component
// from the kit's public `ui/item.tsx` (the large shadcn Item). Keeping it
// private avoids a name collision on the public `Item` export.
import type { ComponentProps, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const itemVariants = cva(
  "group/item flex min-w-0 items-center rounded-lg text-foreground transition-colors",
  {
    defaultVariants: {
      density: "default",
      variant: "default",
    },
    variants: {
      density: {
        compact: "gap-2 px-2 py-1",
        default: "gap-2 px-2 py-1.5",
      },
      variant: {
        default: "focus-within:bg-muted/50 hover:bg-muted/50",
        plain: "",
        selected: "bg-muted focus-within:bg-muted hover:bg-muted",
        sidebar:
          "h-8 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none",
        sidebarSelected:
          "h-8 cursor-pointer bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none",
      },
    },
  }
)

function Item({
  className,
  density,
  variant,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof itemVariants>) {
  return (
    <div
      data-slot="item"
      className={cn(itemVariants({ density, variant }), className)}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="item-content"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  )
}

function ItemTitle({
  children,
  className,
  ...props
}: ComponentProps<"span"> & {
  children: ReactNode
}) {
  return (
    <span
      data-slot="item-title"
      className={cn("block truncate text-sm leading-5 font-medium", className)}
      {...props}
    >
      {children}
    </span>
  )
}

function ItemActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("ml-auto flex shrink-0 items-center", className)}
      {...props}
    />
  )
}

export { Item, ItemActions, ItemContent, ItemTitle }
