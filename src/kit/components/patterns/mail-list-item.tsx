import * as React from "react"

import { Paperclip, ShieldAlert, Star } from "@/icons"
import {
  supportColorEventTitleClasses,
  supportColorTintBackgroundClasses,
  type SupportColorRole,
} from "@/lib/support-colors"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarFallbackTone,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Item, ItemMedia } from "@/components/ui/item"

type MailListItemCategory = {
  id: string
  label: string
  tone: SupportColorRole
}

type MailListItemLabels = {
  attachment: string
  draft: string
  favorite: string
  important: string
  unread: string
}

const ruMailListItemLabels: MailListItemLabels = {
  attachment: "Есть вложение",
  draft: "Черновик",
  favorite: "В избранном",
  important: "Важное письмо",
  unread: "Непрочитанное письмо",
}

type MailListItemProps = Omit<React.ComponentProps<typeof Item>, "children"> & {
  active?: boolean
  attachment?: boolean
  avatarAlt?: string
  avatarFallback: string
  avatarFallbackTone?: AvatarFallbackTone | "default"
  avatarSrc?: string
  categories?: readonly MailListItemCategory[]
  date: string
  draft?: boolean
  dragging?: boolean
  favorite?: boolean
  important?: boolean
  labels: MailListItemLabels
  nextActive?: boolean
  preview: string
  searchFolderLabel?: string
  selectionEnd?: boolean
  selectionStart?: boolean
  sender: string
  subject: string
  threadCount?: number
  unread?: boolean
}

const MailListItem = React.forwardRef<HTMLDivElement, MailListItemProps>(
  function MailListItem(
    {
      active = false,
      attachment = false,
      avatarAlt,
      avatarFallback,
      avatarFallbackTone = "default",
      avatarSrc,
      categories = [],
      className,
      date,
      draft = false,
      dragging = false,
      favorite = false,
      important = false,
      labels,
      nextActive = false,
      preview,
      searchFolderLabel,
      selectionEnd = false,
      selectionStart = false,
      sender,
      subject,
      threadCount,
      unread = false,
      ...props
    },
    ref
  ) {
    return (
      <Item
        aria-selected={active || dragging}
        className={cn(
          "group/mail-list-item relative min-w-0 cursor-default flex-nowrap gap-2 rounded-none border-x-0! border-t-0! border-b border-border px-2 py-3 text-left transition-[background-color,border-color,border-radius] [&:has(+_[data-context-menu-open=true])]:border-b-transparent [&:has(+_[data-pattern=mail-list-item]:hover)]:border-b-transparent",
          active
            ? "border-b-transparent! bg-primary/10 hover:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/20"
            : "hover:z-[1] hover:rounded-lg hover:border-b-transparent! hover:bg-muted/50 data-[context-menu-open=true]:z-[1] data-[context-menu-open=true]:rounded-lg data-[context-menu-open=true]:border-b-transparent! data-[context-menu-open=true]:bg-muted/50",
          selectionStart && "rounded-t-lg!",
          selectionEnd && "rounded-b-lg!",
          nextActive && "border-b-transparent!",
          dragging &&
            "z-[1] cursor-grabbing rounded-lg! border-b-transparent! bg-primary/10 hover:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/20",
          className
        )}
        data-active={active || undefined}
        data-dragging={dragging || undefined}
        data-pattern="mail-list-item"
        data-selection-end={selectionEnd || undefined}
        data-selection-start={selectionStart || undefined}
        ref={ref}
        variant="interactive"
        {...props}
      >
        <span
          aria-hidden="true"
          className="flex w-2 shrink-0 self-start pt-4"
          data-slot="mail-unread-indicator"
        >
          {unread ? <span className="size-2 rounded-full bg-primary" /> : null}
        </span>

        <ItemMedia className="pt-1">
          <Avatar size="lg">
            {avatarSrc ? (
              <AvatarImage alt={avatarAlt ?? sender} src={avatarSrc} />
            ) : null}
            <AvatarFallback tone={avatarFallbackTone}>
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </ItemMedia>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                unread ? "font-semibold" : "font-normal"
              )}
            >
              {sender}
            </div>
            {threadCount && threadCount > 1 ? (
              <Badge size="counter" variant="secondary">
                {threadCount}
              </Badge>
            ) : null}
            <div className="pointer-events-none flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              {draft ? <Badge variant="outline">{labels.draft}</Badge> : null}
              {important ? (
                <ShieldAlert
                  aria-label={labels.important}
                  className="size-3.5 text-primary"
                />
              ) : null}
              {favorite ? (
                <Star
                  aria-label={labels.favorite}
                  className="size-3.5 fill-current text-primary"
                />
              ) : null}
              {attachment ? (
                <Paperclip
                  aria-label={labels.attachment}
                  className="size-3.5"
                />
              ) : null}
              <span>{date}</span>
              {unread ? <span className="sr-only">{labels.unread}</span> : null}
            </div>
          </div>

          <div
            className={cn(
              "truncate text-sm text-foreground",
              unread ? "font-semibold" : "font-normal"
            )}
          >
            {subject}
          </div>

          {searchFolderLabel ? (
            <Badge className="w-fit" variant="outline">
              {searchFolderLabel}
            </Badge>
          ) : null}

          {categories.length > 0 ? (
            <div
              className="flex min-w-0 flex-wrap gap-1"
              data-slot="mail-list-item-categories"
            >
              {categories.map((category) => (
                <Badge
                  className={cn(
                    "px-1.5",
                    supportColorTintBackgroundClasses[category.tone],
                    supportColorEventTitleClasses[category.tone]
                  )}
                  key={category.id}
                  variant="secondary"
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          ) : null}

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {preview}
          </p>
        </div>
      </Item>
    )
  }
)

export {
  MailListItem,
  ruMailListItemLabels,
  type MailListItemCategory,
  type MailListItemLabels,
  type MailListItemProps,
}
