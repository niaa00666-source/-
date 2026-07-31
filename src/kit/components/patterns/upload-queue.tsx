import { useState, type ReactNode } from "react"

import { ChevronDown, ChevronUp, X } from "../../icons"

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type UploadQueueButtonVariant = "destructive" | "ghost" | "outline"
type UploadQueueStatusTone = "default" | "destructive" | "muted" | "success"

export type UploadQueueItemAction = {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick: () => void
  variant?: UploadQueueButtonVariant
}

export type UploadQueueStatusAction = {
  hoverIcon: ReactNode
  icon: ReactNode
  label: string
  onClick: () => void
}

export type UploadQueueItem = {
  actions?: UploadQueueItemAction[]
  description?: string
  detail?: string
  icon: ReactNode
  id: string
  name: string
  progress?: number
  statusAction?: UploadQueueStatusAction
  statusIcon?: ReactNode
  statusLabel: string
  statusText?: string
  statusTone?: UploadQueueStatusTone
}

const uploadQueueToneClasses: Record<UploadQueueStatusTone, string> = {
  default: "text-foreground",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
  success: "text-support-green",
}

export function UploadQueue({
  className,
  collapsedTitle,
  description,
  dismissLabel = "Закрыть загрузки",
  items,
  onDismiss,
  progress,
  title,
}: {
  className?: string
  collapsedTitle?: string
  description?: string
  dismissLabel?: string
  items: UploadQueueItem[]
  onDismiss: () => void
  progress?: number
  title: string
}) {
  const [open, setOpen] = useState(true)

  if (items.length === 0) {
    return null
  }

  return (
    <section
      aria-label={title}
      aria-live="polite"
      className={cn(
        // z-50: корень fixed без слоя уходил под липкие футеры продукта, и
        // потребители дописывали z-index снаружи. Тот же слой, что у диалогов и
        // меню; порядок «модалка поверх панели» держится на порядке в DOM —
        // портал темы монтируется после детей.
        "pointer-events-none fixed right-4 bottom-14 z-50 w-[400px] max-w-[calc(100vw-2rem)]",
        className
      )}
    >
      <Collapsible onOpenChange={setOpen} open={open}>
        <div className="pointer-events-auto overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          <header className="flex min-w-0 items-center gap-1 px-3 py-2">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-medium">
                {open ? title : (collapsedTitle ?? title)}
              </h2>
              {!open && description ? (
                <p className="truncate text-xs text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={
                      open ? "Свернуть загрузки" : "Развернуть загрузки"
                    }
                    onClick={() => setOpen((current) => !current)}
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                {open ? <ChevronDown /> : <ChevronUp />}
              </TooltipTrigger>
              <TooltipContent>
                {open ? "Свернуть загрузки" : "Развернуть загрузки"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={dismissLabel}
                    onClick={onDismiss}
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <X />
              </TooltipTrigger>
              <TooltipContent>{dismissLabel}</TooltipContent>
            </Tooltip>
          </header>

          {!open && typeof progress === "number" ? (
            <Progress
              aria-label={`Общий прогресс: ${Math.round(progress)}%`}
              className="px-3 pb-2"
              value={progress}
            />
          ) : null}

          <CollapsibleContent>
            {description ? (
              <div className="border-y border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {description}
              </div>
            ) : (
              <div className="border-t border-border" />
            )}
            <ScrollArea
              className="max-h-80"
              viewportClassName="h-auto max-h-80"
            >
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li className="px-3 py-2.5" key={item.id}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        {item.detail ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.detail}
                          </p>
                        ) : null}
                        {item.description ? (
                          <p
                            className={cn(
                              "truncate text-xs",
                              uploadQueueToneClasses[item.statusTone ?? "muted"]
                            )}
                          >
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      {item.statusAction || item.statusText ? null : (
                        <span className="sr-only">{item.statusLabel}</span>
                      )}
                      {item.statusAction ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                aria-label={item.statusAction.label}
                                className={cn(
                                  "group/status",
                                  uploadQueueToneClasses[
                                    item.statusTone ?? "muted"
                                  ]
                                )}
                                onClick={item.statusAction.onClick}
                                size="icon-sm"
                                variant="ghost"
                              />
                            }
                          >
                            <span className="flex group-hover/status:hidden">
                              {item.statusAction.icon}
                            </span>
                            <span className="hidden group-hover/status:flex">
                              {item.statusAction.hoverIcon}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {item.statusAction.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : item.statusIcon || item.statusText ? (
                        <div
                          className={cn(
                            "flex shrink-0 items-center gap-1 text-xs",
                            uploadQueueToneClasses[item.statusTone ?? "muted"]
                          )}
                        >
                          {item.statusIcon ? (
                            <span
                              aria-hidden="true"
                              className="flex size-5 items-center justify-center"
                            >
                              {item.statusIcon}
                            </span>
                          ) : null}
                          {item.statusText ? (
                            <span>{item.statusText}</span>
                          ) : null}
                        </div>
                      ) : null}
                      {item.actions && item.actions.length > 0 ? (
                        <div className="flex shrink-0 items-center gap-1">
                          {item.actions.map((action) => (
                            <Tooltip key={action.label}>
                              <TooltipTrigger
                                render={
                                  <Button
                                    aria-label={action.label}
                                    disabled={action.disabled}
                                    onClick={action.onClick}
                                    size="icon-xs"
                                    variant={action.variant ?? "ghost"}
                                  />
                                }
                              >
                                {action.icon}
                              </TooltipTrigger>
                              <TooltipContent>{action.label}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {typeof item.progress === "number" ? (
                      <Progress
                        aria-label={`${item.name}: ${item.progress}%`}
                        className="mt-2"
                        value={item.progress}
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </section>
  )
}
