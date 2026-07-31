import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 has-data-[slot=badge-dismiss]:pr-1 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      size: {
        default: "h-5 px-2",
        counter: "h-5 min-w-5 px-1 tabular-nums",
      },
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

function Badge({
  className,
  size = "default",
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  const badgeProps = {
    className: cn(badgeVariants({ size, variant }), className),
    "data-slot": "badge",
    "data-size": size,
    "data-variant": variant,
  } as useRender.ComponentProps<"span">

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(badgeProps, props),
    render,
    state: {
      size,
      slot: "badge",
      variant,
    },
  })
}

function BadgeDismiss({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="badge-dismiss"
      className={cn(
        "-my-0.5 -mr-1 ml-0.5 flex h-5 w-4 items-center justify-center border-l border-current/10 transition-colors hover:bg-current/10 [&_svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export { Badge, BadgeDismiss, badgeVariants }
