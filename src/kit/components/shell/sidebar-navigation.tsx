import {
  useId,
  type ComponentProps,
  type DragEvent,
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { ChevronDown, ChevronRight } from "../../icons"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/patterns/item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  supportColorCheckedClasses,
  type SupportColorRole,
} from "@/lib/support-colors"
import { cn } from "@/lib/utils"

type SidebarItemBase = {
  disabled?: boolean
  icon?: ElementType<{ className?: string }>
  id: string
  label: ReactNode
}

export type SidebarNavigationItem = SidebarItemBase & {
  action?: ReactNode
  badge?: ReactNode
  badgeSize?: ComponentProps<typeof Badge>["size"]
  badgeVariant?: ComponentProps<typeof Badge>["variant"]
  children?: readonly SidebarNavigationItem[]
  count?: ReactNode
  contextMenu?: ReactNode
  nestingIndent?: "compact" | "default"
}

export type SidebarCheckboxItem = SidebarItemBase & {
  tone?: SupportColorRole
}

export type SidebarActionItem = SidebarItemBase & {
  badge?: ReactNode
}

type SidebarSectionBase = {
  ariaLabel?: string
  id: string
  label?: ReactNode
  separatorBefore?: boolean
}

export type SidebarNavigationSection = SidebarSectionBase & {
  items: readonly SidebarNavigationItem[]
  kind: "navigation"
  labelAction?: ReactNode
}

export type SidebarCheckboxSection = SidebarSectionBase & {
  items: readonly SidebarCheckboxItem[]
  kind: "checkboxes"
}

export type SidebarActionSection = SidebarSectionBase & {
  items: readonly SidebarActionItem[]
  kind: "actions"
}

export type SidebarSection =
  SidebarNavigationSection | SidebarCheckboxSection | SidebarActionSection

type SidebarNavigationRowProps = {
  active?: boolean
  density?: "compact" | "default"
  dropActive?: boolean
  expanded?: boolean
  item: SidebarNavigationItem | SidebarActionItem
  onActivate?: (id: string) => void
  onDragLeave?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onDragOver?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onDrop?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onExpandedChange?: (id: string, expanded: boolean) => void
}

function handleKeyboardActivation(
  event: KeyboardEvent<HTMLDivElement>,
  id: string,
  disabled: boolean,
  onActivate?: (id: string) => void
) {
  if (disabled || !onActivate) {
    return
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    onActivate(id)
  }
}

function SidebarNavigationRow({
  active = false,
  density = "default",
  dropActive = false,
  expanded = true,
  item,
  onActivate,
  onDragLeave,
  onDragOver,
  onDrop,
  onExpandedChange,
}: SidebarNavigationRowProps) {
  const titleId = useId()
  const Icon = item.icon
  const disabled = item.disabled ?? false
  const navigationItem =
    "children" in item ||
    "action" in item ||
    "badgeSize" in item ||
    "badgeVariant" in item ||
    "count" in item ||
    "contextMenu" in item
      ? item
      : undefined
  const hasChildren = Boolean(navigationItem?.children?.length)
  const action = navigationItem?.action
  const badgeSize = navigationItem?.badgeSize
  const badgeVariant = navigationItem?.badgeVariant
  const count = navigationItem?.count

  const row = (
    <Item
      aria-labelledby={hasChildren && onExpandedChange ? titleId : undefined}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
      aria-expanded={hasChildren ? expanded : undefined}
      className={cn(
        "w-full data-[drop-active=true]:bg-primary/15 data-[drop-active=true]:hover:bg-primary/15 [&:has(:focus-visible)_[data-navigation-item-badge]]:opacity-0 [&:has(:focus-visible)_[data-navigation-item-count]]:opacity-0 [&:has(:focus-visible)_[data-slot=navigation-item-action]]:pointer-events-auto [&:has(:focus-visible)_[data-slot=navigation-item-action]]:opacity-100 [&:has(:focus-visible)_[data-slot=navigation-item-chevron]]:opacity-100 [&:has(:focus-visible)_[data-slot=navigation-item-icon]]:opacity-0 [&:hover_[data-slot=navigation-item-action]]:pointer-events-auto [&:hover_[data-slot=navigation-item-action]]:opacity-100 [&:hover_[data-slot=navigation-item-chevron]]:opacity-100 [&:hover_[data-slot=navigation-item-icon]]:opacity-0",
        disabled && "pointer-events-none opacity-50"
      )}
      density={density}
      data-drop-active={dropActive || undefined}
      onClick={() => {
        if (!disabled) {
          onActivate?.(item.id)
        }
      }}
      onKeyDown={(event) =>
        handleKeyboardActivation(event, item.id, disabled, onActivate)
      }
      onDragLeave={(event) => {
        if (!disabled) {
          onDragLeave?.(item.id, event)
        }
      }}
      onDragOver={(event) => {
        if (!disabled) {
          onDragOver?.(item.id, event)
        }
      }}
      onDrop={(event) => {
        if (!disabled) {
          onDrop?.(item.id, event)
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      variant={active ? "sidebarSelected" : "sidebar"}
    >
      {Icon || (hasChildren && onExpandedChange) ? (
        <span className="relative flex size-4 shrink-0 items-center justify-center">
          {Icon ? (
            <Icon
              aria-hidden="true"
              className="size-4 transition-opacity"
              data-slot={
                hasChildren && onExpandedChange
                  ? "navigation-item-icon"
                  : undefined
              }
            />
          ) : null}
          {hasChildren && onExpandedChange ? (
            <Button
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? "Свернуть вложенные папки"
                  : "Развернуть вложенные папки"
              }
              className="absolute -inset-1 opacity-0 transition-opacity"
              data-slot="navigation-item-chevron"
              onClick={(event) => {
                event.stopPropagation()
                onExpandedChange(item.id, !expanded)
              }}
              onKeyDown={(event) => event.stopPropagation()}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </Button>
          ) : null}
        </span>
      ) : null}
      <ItemContent>
        <ItemTitle className="font-normal" id={titleId}>
          {item.label}
        </ItemTitle>
      </ItemContent>
      {item.badge !== undefined || count !== undefined || action ? (
        <ItemActions
          className="relative h-8 min-w-6 justify-center gap-1"
          onClick={action ? (event) => event.stopPropagation() : undefined}
          onKeyDown={action ? (event) => event.stopPropagation() : undefined}
        >
          {count !== undefined ? (
            <span
              className={cn(
                "text-xs leading-none text-sidebar-foreground/70 tabular-nums",
                action && "group-hover/item:opacity-0"
              )}
              data-navigation-item-count=""
            >
              {count}
            </span>
          ) : null}
          {item.badge !== undefined ? (
            <Badge
              className={cn(action && "group-hover/item:opacity-0")}
              data-navigation-item-badge={action ? "" : undefined}
              size={badgeSize}
              variant={badgeVariant ?? (active ? "default" : "secondary")}
            >
              {item.badge}
            </Badge>
          ) : null}
          {action ? (
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity"
              data-slot="navigation-item-action"
            >
              {action}
            </span>
          ) : null}
        </ItemActions>
      ) : null}
    </Item>
  )

  if (!navigationItem?.contextMenu) {
    return row
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger render={row} />
      {navigationItem.contextMenu}
    </ContextMenu>
  )
}

function SidebarNestedNavigationItem({
  activeItemId,
  dropTargetItemId,
  expandedItemIds,
  item,
  onItemDragLeave,
  onItemDragOver,
  onItemDrop,
  onItemExpandedChange,
  onItemSelect,
}: {
  activeItemId?: string
  dropTargetItemId?: string
  expandedItemIds?: ReadonlySet<string>
  item: SidebarNavigationItem
  onItemDragLeave?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDragOver?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDrop?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemExpandedChange?: (id: string, expanded: boolean) => void
  onItemSelect?: (id: string) => void
}) {
  const expanded = expandedItemIds?.has(item.id) ?? true

  return (
    <SidebarMenuSubItem>
      <SidebarNavigationRow
        active={activeItemId === item.id}
        density="compact"
        dropActive={dropTargetItemId === item.id}
        expanded={expanded}
        item={item}
        onActivate={onItemSelect}
        onDragLeave={onItemDragLeave}
        onDragOver={onItemDragOver}
        onDrop={onItemDrop}
        onExpandedChange={onItemExpandedChange}
      />
      {item.children?.length && expanded ? (
        <SidebarMenuSub
          className={cn(
            "mr-0 pr-0",
            item.nestingIndent !== "compact" && "pl-2!",
            item.nestingIndent === "compact" &&
              "ml-1 translate-x-0! border-l-0 pl-1"
          )}
        >
          {item.children.map((child) => (
            <SidebarNestedNavigationItem
              activeItemId={activeItemId}
              dropTargetItemId={dropTargetItemId}
              expandedItemIds={expandedItemIds}
              item={child}
              key={child.id}
              onItemDragLeave={onItemDragLeave}
              onItemDragOver={onItemDragOver}
              onItemDrop={onItemDrop}
              onItemExpandedChange={onItemExpandedChange}
              onItemSelect={onItemSelect}
            />
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuSubItem>
  )
}

export function SidebarNavigationItemRow({
  activeItemId,
  dropTargetItemId,
  expandedItemIds,
  item,
  onItemDragLeave,
  onItemDragOver,
  onItemDrop,
  onItemExpandedChange,
  onItemSelect,
}: {
  activeItemId?: string
  dropTargetItemId?: string
  expandedItemIds?: ReadonlySet<string>
  item: SidebarNavigationItem
  onItemDragLeave?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDragOver?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDrop?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemExpandedChange?: (id: string, expanded: boolean) => void
  onItemSelect?: (id: string) => void
}) {
  const expanded = expandedItemIds?.has(item.id) ?? true

  return (
    <SidebarMenuItem data-pattern-part="navigation-item">
      <SidebarNavigationRow
        active={activeItemId === item.id}
        dropActive={dropTargetItemId === item.id}
        expanded={expanded}
        item={item}
        onActivate={onItemSelect}
        onDragLeave={onItemDragLeave}
        onDragOver={onItemDragOver}
        onDrop={onItemDrop}
        onExpandedChange={onItemExpandedChange}
      />
      {item.children?.length && expanded ? (
        <SidebarMenuSub
          className={cn(
            "mr-0 pr-0",
            item.nestingIndent !== "compact" && "pl-2!",
            item.nestingIndent === "compact" &&
              "ml-1 translate-x-0! border-l-0 pl-1"
          )}
        >
          {item.children.map((child) => (
            <SidebarNestedNavigationItem
              activeItemId={activeItemId}
              dropTargetItemId={dropTargetItemId}
              expandedItemIds={expandedItemIds}
              item={child}
              key={child.id}
              onItemDragLeave={onItemDragLeave}
              onItemDragOver={onItemDragOver}
              onItemDrop={onItemDrop}
              onItemExpandedChange={onItemExpandedChange}
              onItemSelect={onItemSelect}
            />
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  )
}

export function SidebarCheckboxItemRow({
  checked,
  item,
  onCheckedChange,
  sectionId,
}: {
  checked: boolean
  item: SidebarCheckboxItem
  onCheckedChange?: (id: string, checked: boolean) => void
  sectionId: string
}) {
  const checkboxId = `sidebar-${sectionId}-${item.id}`
  const Icon = item.icon

  return (
    <SidebarMenuItem data-pattern-part="checkbox-item">
      <label
        className={cn(
          "block",
          item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
        htmlFor={checkboxId}
      >
        <Item
          aria-disabled={item.disabled || undefined}
          className="w-full"
          density="compact"
          variant="sidebar"
        >
          <Checkbox
            checked={checked}
            className={cn(
              "shrink-0",
              item.tone ? supportColorCheckedClasses[item.tone] : undefined
            )}
            disabled={item.disabled}
            id={checkboxId}
            onCheckedChange={(value) =>
              onCheckedChange?.(item.id, Boolean(value))
            }
          />
          {Icon ? (
            <Icon aria-hidden="true" className="size-4 shrink-0" />
          ) : null}
          <ItemContent>
            <ItemTitle className="font-normal">{item.label}</ItemTitle>
          </ItemContent>
        </Item>
      </label>
    </SidebarMenuItem>
  )
}

export function SidebarActionItemRow({
  item,
  onAction,
}: {
  item: SidebarActionItem
  onAction?: (id: string) => void
}) {
  return (
    <SidebarMenuItem data-pattern-part="action-item">
      <SidebarNavigationRow item={item} onActivate={onAction} />
    </SidebarMenuItem>
  )
}

function getSectionAriaLabel(section: SidebarSection, fallback: string) {
  if (section.ariaLabel) {
    return section.ariaLabel
  }

  if (typeof section.label === "string") {
    return section.label
  }

  return fallback
}

export type SidebarNavigationSectionProps = {
  activeItemId?: string
  ariaLabel: string
  dropTargetItemId?: string
  expandedItemIds?: ReadonlySet<string>
  onItemDragLeave?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDragOver?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDrop?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemExpandedChange?: (id: string, expanded: boolean) => void
  onItemSelect?: (id: string) => void
  section: SidebarNavigationSection
}

export function SidebarNavigationSection({
  activeItemId,
  ariaLabel,
  dropTargetItemId,
  expandedItemIds,
  onItemDragLeave,
  onItemDragOver,
  onItemDrop,
  onItemExpandedChange,
  onItemSelect,
  section,
}: SidebarNavigationSectionProps) {
  const sectionAriaLabel = getSectionAriaLabel(section, ariaLabel)

  return (
    <SidebarGroup className="p-0" data-pattern-part="navigation-section">
      {section.label ? (
        <SidebarGroupLabel
          className={cn(
            section.labelAction &&
              "group/section-label gap-2 pr-0 [&:has(:focus-visible)_[data-slot=section-label-action]]:pointer-events-auto [&:has(:focus-visible)_[data-slot=section-label-action]]:opacity-100"
          )}
        >
          <span className="min-w-0 flex-1 truncate">{section.label}</span>
          {section.labelAction ? (
            <span
              className="pointer-events-none mr-1 ml-auto flex shrink-0 items-center opacity-0 transition-opacity group-hover/section-label:pointer-events-auto group-hover/section-label:opacity-100"
              data-slot="section-label-action"
            >
              {section.labelAction}
            </span>
          ) : null}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <nav aria-label={sectionAriaLabel}>
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarNavigationItemRow
                activeItemId={activeItemId}
                dropTargetItemId={dropTargetItemId}
                expandedItemIds={expandedItemIds}
                item={item}
                key={item.id}
                onItemDragLeave={onItemDragLeave}
                onItemDragOver={onItemDragOver}
                onItemDrop={onItemDrop}
                onItemExpandedChange={onItemExpandedChange}
                onItemSelect={onItemSelect}
              />
            ))}
          </SidebarMenu>
        </nav>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export type SidebarCheckboxSectionProps = {
  ariaLabel: string
  checkedItemIds?: Readonly<Record<string, boolean>>
  onCheckedChange?: (id: string, checked: boolean) => void
  section: SidebarCheckboxSection
}

export function SidebarCheckboxSection({
  ariaLabel,
  checkedItemIds = {},
  onCheckedChange,
  section,
}: SidebarCheckboxSectionProps) {
  const sectionAriaLabel = getSectionAriaLabel(section, ariaLabel)

  return (
    <SidebarGroup className="p-0" data-pattern-part="checkbox-section">
      <FieldSet className="gap-0">
        <FieldLegend
          className={cn(
            "mb-0 flex h-8 items-center px-2 text-xs text-sidebar-foreground/70",
            !section.label && "sr-only"
          )}
          variant="label"
        >
          {section.label ?? sectionAriaLabel}
        </FieldLegend>
        <SidebarGroupContent>
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarCheckboxItemRow
                checked={checkedItemIds[item.id] ?? false}
                item={item}
                key={item.id}
                onCheckedChange={onCheckedChange}
                sectionId={section.id}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </FieldSet>
    </SidebarGroup>
  )
}

export type SidebarActionSectionProps = {
  ariaLabel: string
  onAction?: (id: string) => void
  section: SidebarActionSection
}

export function SidebarActionSection({
  ariaLabel,
  onAction,
  section,
}: SidebarActionSectionProps) {
  const sectionAriaLabel = getSectionAriaLabel(section, ariaLabel)

  return (
    <SidebarGroup className="p-0" data-pattern-part="action-section">
      {section.label ? (
        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <div aria-label={sectionAriaLabel} role="group">
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarActionItemRow
                item={item}
                key={item.id}
                onAction={onAction}
              />
            ))}
          </SidebarMenu>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export type SidebarSectionRendererProps = {
  activeItemId?: string
  ariaLabel: string
  checkedItemIds?: Readonly<Record<string, boolean>>
  dropTargetItemId?: string
  expandedItemIds?: ReadonlySet<string>
  index?: number
  onAction?: (id: string) => void
  onCheckedChange?: (id: string, checked: boolean) => void
  onItemDragLeave?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDragOver?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDrop?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemExpandedChange?: (id: string, expanded: boolean) => void
  onItemSelect?: (id: string) => void
  section: SidebarSection
}

export function SidebarSectionRenderer({
  activeItemId,
  ariaLabel,
  checkedItemIds = {},
  dropTargetItemId,
  expandedItemIds,
  index = 0,
  onAction,
  onCheckedChange,
  onItemDragLeave,
  onItemDragOver,
  onItemDrop,
  onItemExpandedChange,
  onItemSelect,
  section,
}: SidebarSectionRendererProps) {
  const showSeparator = section.separatorBefore ?? index > 0
  const sectionAriaLabel = getSectionAriaLabel(section, ariaLabel)

  return (
    <div data-section-kind={section.kind} data-section-id={section.id}>
      {showSeparator ? <SidebarSeparator className="mx-1 my-2" /> : null}

      {section.kind === "checkboxes" ? (
        <SidebarCheckboxSection
          ariaLabel={sectionAriaLabel}
          checkedItemIds={checkedItemIds}
          onCheckedChange={onCheckedChange}
          section={section}
        />
      ) : section.kind === "navigation" ? (
        <SidebarNavigationSection
          activeItemId={activeItemId}
          ariaLabel={sectionAriaLabel}
          dropTargetItemId={dropTargetItemId}
          expandedItemIds={expandedItemIds}
          onItemDragLeave={onItemDragLeave}
          onItemDragOver={onItemDragOver}
          onItemDrop={onItemDrop}
          onItemExpandedChange={onItemExpandedChange}
          onItemSelect={onItemSelect}
          section={section}
        />
      ) : (
        <SidebarActionSection
          ariaLabel={sectionAriaLabel}
          onAction={onAction}
          section={section}
        />
      )}
    </div>
  )
}

export type SidebarNavigationProps = {
  action?: ReactNode
  activeItemId?: string
  ariaLabel: string
  checkedItemIds?: Readonly<Record<string, boolean>>
  className?: string
  dropTargetItemId?: string
  expandedItemIds?: ReadonlySet<string>
  lead?: ReactNode
  onAction?: (id: string) => void
  onCheckedChange?: (id: string, checked: boolean) => void
  onItemDragLeave?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDragOver?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemDrop?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onItemExpandedChange?: (id: string, expanded: boolean) => void
  onItemSelect?: (id: string) => void
  sections: readonly SidebarSection[]
}

export function SidebarNavigation({
  action,
  activeItemId,
  ariaLabel,
  checkedItemIds,
  className,
  dropTargetItemId,
  expandedItemIds,
  lead,
  onAction,
  onCheckedChange,
  onItemDragLeave,
  onItemDragOver,
  onItemDrop,
  onItemExpandedChange,
  onItemSelect,
  sections,
}: SidebarNavigationProps) {
  return (
    <SidebarContent
      className={cn("gap-0", className)}
      data-pattern="sidebar-navigation"
      data-pattern-part="root"
    >
      {action ? <div className="shrink-0 px-3 pb-3">{action}</div> : null}
      {lead ? (
        <div className="flex flex-col gap-3 px-3 pb-3">{lead}</div>
      ) : null}
      <div className="flex flex-col px-3 pb-3">
        {sections.map((section, index) => (
          <SidebarSectionRenderer
            activeItemId={activeItemId}
            ariaLabel={ariaLabel}
            checkedItemIds={checkedItemIds}
            dropTargetItemId={dropTargetItemId}
            expandedItemIds={expandedItemIds}
            index={index}
            key={section.id}
            onAction={onAction}
            onCheckedChange={onCheckedChange}
            onItemDragLeave={onItemDragLeave}
            onItemDragOver={onItemDragOver}
            onItemDrop={onItemDrop}
            onItemExpandedChange={onItemExpandedChange}
            onItemSelect={onItemSelect}
            section={section}
          />
        ))}
      </div>
    </SidebarContent>
  )
}
