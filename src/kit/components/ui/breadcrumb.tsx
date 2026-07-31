import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, MoreHorizontalIcon } from "../../icons"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

/**
 * Масштаб дорожки крошек.
 *
 * `sm` (дефолт) — вспомогательная навигация, 14px. `base`/`lg` — когда дорожка
 * РАБОТАЕТ заголовком страницы: так она устроена в макете Диска
 * (`text-base font-semibold`), и продукты дописывали это классом или инлайновым
 * стилем на каждую ссылку.
 *
 * Дескендантное правило обязательно: `BreadcrumbPage` прибивает себе
 * `font-normal`, поэтому без него текущий (последний) элемент остался бы тонким
 * на фоне полужирных родителей.
 */
const breadcrumbListVariants = cva(
  "flex flex-wrap items-center gap-1.5 wrap-break-word text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-sm",
        base: "text-base font-semibold [&_[data-slot=breadcrumb-page]]:font-semibold",
        lg: "text-lg font-semibold [&_[data-slot=breadcrumb-page]]:font-semibold",
      },
    },
    defaultVariants: { size: "sm" },
  }
)

function BreadcrumbList({
  className,
  size,
  ...props
}: React.ComponentProps<"ol"> & VariantProps<typeof breadcrumbListVariants>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      data-size={size ?? "sm"}
      className={cn(breadcrumbListVariants({ size }), className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  className,
  dropActive,
  render,
  ...props
}: useRender.ComponentProps<"a"> & {
  /**
   * Крошка — активная цель перетаскивания (в Диске в папку-предка можно бросить
   * файлы). Тинт тот же, что у строки таблицы, плитки файла и навигации сайдбара:
   * до этого каждый продукт рисовал своё кольцо своим CSS-модулем.
   */
  dropActive?: boolean
}) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        ...(dropActive ? { "data-drop-active": "true" } : {}),
        className: cn(
          "rounded transition-colors hover:text-foreground data-[drop-active=true]:bg-primary/15 dark:data-[drop-active=true]:bg-primary/20",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "breadcrumb-link",
    },
  })
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
