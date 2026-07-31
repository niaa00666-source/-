"use client"

import * as React from "react"

import { X } from "../../icons"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface SelectionToolbarProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  /** The count label, e.g. "Выбрано 3" (i18n resolved by the product). */
  count: React.ReactNode
  /** Leading slot — typically the "cancel selection" (X) button. */
  lead?: React.ReactNode
  /** Canonical cancel-selection action. `lead` takes precedence when supplied. */
  clearLabel?: string
  onClear?: () => void
  /** Trailing action buttons (download / move / share / delete …). */
  actions?: React.ReactNode
  ariaLabel?: string
}

export interface IconActionButtonProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  label: string
  onClick?: () => void
  variant?: "ghost" | "destructive" | "secondary"
}

/** Compact icon-only action with a required accessible label and tooltip. */
export function IconActionButton({
  children,
  className,
  disabled,
  label,
  onClick,
  variant = "ghost",
}: IconActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            className={className}
            disabled={disabled}
            onClick={onClick}
            size="icon-sm"
            variant={variant}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** SelectionToolbar — the bulk-action bar chrome. A `h-10 rounded-lg bg-muted`
 *  strip with a truncating count label and a leading + trailing action slot.
 *  Chrome only: the product supplies every button (as `lead` / `actions`) and
 *  every string. Anatomy from disk-screen.tsx:3060. */
export function SelectionToolbar({
  count,
  lead,
  clearLabel,
  onClear,
  actions,
  ariaLabel,
  className,
  ...props
}: SelectionToolbarProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "flex h-10 w-full min-w-0 items-center gap-1 rounded-lg bg-muted px-2",
        className
      )}
      role="toolbar"
      {...props}
    >
      {lead ??
        (onClear && clearLabel ? (
          <IconActionButton label={clearLabel} onClick={onClear}>
            <X />
          </IconActionButton>
        ) : null)}
      <span className="min-w-0 truncate px-2 text-sm font-medium">{count}</span>
      {actions ? (
        <div className="ml-1 flex shrink-0 items-center gap-1">{actions}</div>
      ) : null}
    </div>
  )
}
