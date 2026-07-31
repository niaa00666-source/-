"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cva, type VariantProps } from "class-variance-authority"

import {
  supportColorEventBackgroundClasses,
  supportColorEventTitleClasses,
} from "@/lib/support-colors"
import { cn } from "@/lib/utils"

const avatarFallbackVariants = cva(
  "flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs",
  {
    variants: {
      tone: {
        default: "bg-muted text-muted-foreground",
        rose: cn(
          supportColorEventBackgroundClasses["support-rose"],
          supportColorEventTitleClasses["support-rose"]
        ),
        tomato: cn(
          supportColorEventBackgroundClasses["support-tomato"],
          supportColorEventTitleClasses["support-tomato"]
        ),
        amber: cn(
          supportColorEventBackgroundClasses["support-amber"],
          supportColorEventTitleClasses["support-amber"]
        ),
        lime: cn(
          supportColorEventBackgroundClasses["support-lime"],
          supportColorEventTitleClasses["support-lime"]
        ),
        green: cn(
          supportColorEventBackgroundClasses["support-green"],
          supportColorEventTitleClasses["support-green"]
        ),
        teal: cn(
          supportColorEventBackgroundClasses["support-teal"],
          supportColorEventTitleClasses["support-teal"]
        ),
        azure: cn(
          supportColorEventBackgroundClasses["support-azure"],
          supportColorEventTitleClasses["support-azure"]
        ),
        brown: cn(
          supportColorEventBackgroundClasses["support-brown"],
          supportColorEventTitleClasses["support-brown"]
        ),
        gray: cn(
          supportColorEventBackgroundClasses["support-gray"],
          supportColorEventTitleClasses["support-gray"]
        ),
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

const avatarFallbackTones = [
  "rose",
  "tomato",
  "amber",
  "lime",
  "green",
  "teal",
  "azure",
  "brown",
  "gray",
] as const satisfies ReadonlyArray<
  Exclude<
    NonNullable<VariantProps<typeof avatarFallbackVariants>["tone"]>,
    "default"
  >
>

type AvatarFallbackTone = (typeof avatarFallbackTones)[number]

function getAvatarFallbackTone(seed: string): AvatarFallbackTone {
  let hash = 0

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return avatarFallbackTones[hash % avatarFallbackTones.length]
}

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-transparent data-[size=lg]:size-10 data-[size=sm]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  tone = "default",
  ...props
}: AvatarPrimitive.Fallback.Props &
  VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      data-tone={tone}
      className={cn(avatarFallbackVariants({ tone }), className)}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-transparent *:data-[slot=tooltip-trigger]:ring-2 *:data-[slot=tooltip-trigger]:ring-transparent",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--foreground)_6%,var(--background))] text-sm text-muted-foreground ring-2 ring-transparent group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
  avatarFallbackTones,
  getAvatarFallbackTone,
}
export type { AvatarFallbackTone }
