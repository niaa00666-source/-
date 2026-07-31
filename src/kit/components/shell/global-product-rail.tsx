import {
  CalendarDays,
  Check,
  CircleQuestionMark,
  ContactRound,
  FlaskConical,
  Folder,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Moon,
  Shapes,
  Sun,
  Video,
} from "../../icons"
import type { ElementType } from "react"

import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type ProductRailItem = {
  badge?: string
  icon: ElementType<{ className?: string }>
  id?: string
  label: string
}

export type PrototypeScenarioItem = {
  active?: boolean
  id: string
  label: string
  onSelect: () => void
}

export type ProductRailUser = {
  name: string
  initials: string
  avatarSrc?: string
}

const products = [
  { label: "Обсуждения", icon: MessageCircle },
  { label: "Каналы", icon: Megaphone, badge: "38" },
  { label: "Чаты", icon: MessagesSquare },
  { label: "Встречи", icon: Video },
  { label: "Контакты", icon: ContactRound },
  { label: "Задачи", icon: ListChecks },
  { label: "Почта", icon: Mail },
  { label: "Календарь", icon: CalendarDays },
  { label: "Диск", icon: Folder },
  { label: "Все продукты", icon: Shapes },
] satisfies readonly ProductRailItem[]

const railIconClassName = "size-5"

type GlobalProductRailProps = {
  activeProduct: string
  contained?: boolean
  items?: readonly ProductRailItem[]
  onProductSelect?: (product: string) => void
  preview?: boolean
  prototypeScenarios?: readonly PrototypeScenarioItem[]
  prototypeScenarioTitle?: string
  user?: ProductRailUser
}

export function GlobalProductRail({
  activeProduct,
  contained = false,
  items = products,
  onProductSelect,
  preview = false,
  prototypeScenarios,
  prototypeScenarioTitle = "Сценарии прототипа",
  user,
}: GlobalProductRailProps) {
  const { theme, setTheme } = useTheme()
  const nextTheme = theme === "dark" ? "light" : "dark"
  const ThemeIcon = nextTheme === "dark" ? Moon : Sun
  const userName = user?.name ?? "Иван Глухих"
  const userInitials = user?.initials ?? "ИГ"
  const userAvatarSrc = user?.avatarSrc ?? "/user-avatar.png"

  return (
    <nav
      className={cn(
        "flex flex-col items-center gap-2 bg-product-rail text-product-rail-foreground",
        "[&_[data-slot=button]:not(:active):not([aria-current=page]):not([aria-expanded=true]):not([data-open]):not([data-popup-open]):hover]:bg-product-rail-hover [&_[data-slot=button]:not(:active):not([aria-current=page]):not([aria-expanded=true]):not([data-open]):not([data-popup-open]):hover]:text-product-rail-foreground",
        "[&_[data-slot=button]:active]:bg-product-rail-active [&_[data-slot=button]:active]:text-product-rail-active-foreground",
        "[&_[data-slot=button][aria-current=page]]:bg-product-rail-active [&_[data-slot=button][aria-current=page]]:text-product-rail-active-foreground",
        "[&_[data-slot=button][aria-expanded=true]]:bg-product-rail-active [&_[data-slot=button][aria-expanded=true]]:text-product-rail-active-foreground",
        "[&_[data-slot=button][data-open]]:bg-product-rail-active [&_[data-slot=button][data-open]]:text-product-rail-active-foreground",
        "[&_[data-slot=button][data-popup-open]]:bg-product-rail-active [&_[data-slot=button][data-popup-open]]:text-product-rail-active-foreground",
        preview
          ? "h-full min-h-0 px-1 py-2"
          : contained
            ? "h-full min-h-0 px-0 pt-3 pb-4"
            : "h-svh min-h-0 px-0 pt-3 pb-4"
      )}
      data-shell-region="GlobalProductRail"
    >
      <Avatar aria-label={userName} className="mb-1" size="default">
        <AvatarImage alt={userName} src={userAvatarSrc} />
        <AvatarFallback className="bg-product-rail-hover text-product-rail-foreground">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      {items.map(({ badge, icon: Icon, id, label }) => {
        const productId = id ?? label
        const active = productId === activeProduct || label === activeProduct
        return (
          <span className="relative inline-flex" key={productId}>
            <Button
              aria-current={active ? "page" : undefined}
              aria-label={label}
              onClick={
                onProductSelect ? () => onProductSelect(productId) : undefined
              }
              size="icon-lg"
              type="button"
              variant="ghost"
            >
              <Icon className={railIconClassName} />
            </Button>
            {badge ? (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sidebar-primary px-1 text-[10px] leading-none font-semibold text-sidebar-primary-foreground">
                {badge}
              </span>
            ) : null}
          </span>
        )
      })}

      <div className="mt-auto flex flex-col items-center gap-2">
        {prototypeScenarios && prototypeScenarios.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label="Сценарии прототипа"
                  size="icon-lg"
                  variant="ghost"
                />
              }
            >
              <FlaskConical className={railIconClassName} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-64" side="right">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{prototypeScenarioTitle}</DropdownMenuLabel>
                {prototypeScenarios.map((scenario) => (
                  <DropdownMenuItem
                    key={scenario.id}
                    onClick={scenario.onSelect}
                  >
                    <span className="flex size-4 items-center justify-center">
                      {scenario.active ? <Check /> : null}
                    </span>
                    {scenario.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Button
          aria-label={
            nextTheme === "dark"
              ? "Переключить на тёмную тему"
              : "Переключить на светлую тему"
          }
          onClick={() => setTheme(nextTheme)}
          size="icon-lg"
          variant="ghost"
        >
          <ThemeIcon className={railIconClassName} />
        </Button>
        <Button aria-label="Справка" size="icon-lg" variant="ghost">
          <CircleQuestionMark className={railIconClassName} />
        </Button>
        <Avatar className="rounded-lg after:rounded-lg" size="default">
          <AvatarFallback className="rounded-lg bg-product-rail-hover text-product-rail-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </nav>
  )
}
