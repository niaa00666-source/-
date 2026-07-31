import * as React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const ariaInvalid = props["aria-invalid"]
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    ariaInvalid === "grammar" ||
    ariaInvalid === "spelling"

  return (
    <ScrollArea
      data-disabled={props.disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-slot="textarea-root"
      className={cn(
        "max-h-48 min-h-16 w-full overflow-hidden rounded-lg border border-input bg-transparent text-sm transition-colors has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-3 has-[textarea:focus-visible]:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50 dark:data-disabled:bg-input/80",
        className
      )}
      viewportClassName="h-auto min-h-[inherit] max-h-[inherit]"
    >
      <textarea
        data-slot="textarea"
        className="block field-sizing-content min-h-[inherit] w-full resize-none overflow-hidden border-0 bg-transparent px-2.5 py-2 pr-4 text-inherit outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        {...props}
      />
    </ScrollArea>
  )
}

export { Textarea }
