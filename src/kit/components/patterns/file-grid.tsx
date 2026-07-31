"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

// Tile chrome lifted from disk-screen.tsx:3308 so the selected / hover /
// context-open tints (with dark variants, mirroring the DataTable row) live in
// the kit. `aspect-square` + `p-3` + `content-between` give the tile its shape,
// its padding and the header/media/title spread.
//
// `aspect-square`, not `min-h-36`: the mockup this pattern was lifted FROM draws a
// square tile, and the extraction quietly replaced that with a minimum height —
// so the tile grew into a rectangle whose proportions changed with the content,
// and Disc's grid stopped looking like the design. `p-3` likewise restores the
// mockup's 12px padding (tailwind-merge drops the `size` variant's `px-3 py-2.5`
// in its favour, exactly as it does in the mockup's own call). Nothing compared
// tiles when this drifted — the calibration harness only ever rendered the list
// view; it now has a tile tier.
const fileTileClass =
  // data-[drop-target=true]: проп `dropTarget` и атрибут существовали, а ВИДА не
  // было — индикатор перетаскивания в сетке не рисовался вообще. Тинт тот же, что
  // у строки таблицы и у макета.
  "aspect-square cursor-pointer content-between p-3 hover:bg-muted/50 data-[drop-target=true]:bg-primary/15 dark:data-[drop-target=true]:bg-primary/20 data-[context-open=true]:bg-muted/50 data-[state=selected]:bg-primary/10 data-[state=selected]:hover:bg-primary/15 data-[state=selected]:data-[context-open=true]:bg-primary/15 dark:data-[state=selected]:bg-primary/15 dark:data-[state=selected]:hover:bg-primary/20 dark:data-[state=selected]:data-[context-open=true]:bg-primary/20"

export interface FileGridProps extends React.ComponentProps<"div"> {
  ariaLabel?: string
}

/** FileGrid — the responsive tile container. `repeat(auto-fill, minmax(180px,
 *  1fr))`, `gap-3`, `role="list"`. Anatomy from disk-screen.tsx:3556. */
export function FileGrid({
  ariaLabel,
  className,
  children,
  ...props
}: FileGridProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3",
        className
      )}
      role="list"
      {...props}
    >
      {children}
    </div>
  )
}

/** Escape-hatch props merged onto a tile's `<Item>` (a div) so the product keeps
 *  its open / selection / drag-drop behaviour as config. `dropTarget` is lifted
 *  to `data-drop-target`; the rest spreads onto the tile. */
// `contextMenu` is omitted from the div props too: React.ComponentProps<"div">
// carries the deprecated DOM `contextMenu?: string` attribute, which would
// intersect with our `contextMenu?: React.ReactNode` below to the unusable
// `string & ReactNode`. Omitting it lets our ReactNode declaration stand alone.
export type FileTileProps = Omit<
  React.ComponentProps<"div">,
  "title" | "contextMenu"
> & {
  /** The leading media (a product icon adapter / `FileTypeIcon`). */
  media?: React.ReactNode
  /** The tile title text (truncates). */
  title: React.ReactNode
  /** Trailing title indicators (favourite star / share status). */
  indicators?: React.ReactNode
  /** Secondary line (owner · date, type · date, …). */
  description?: React.ReactNode
  /** Header-left slot — the selection checkbox. */
  checkbox?: React.ReactNode
  /** Header-right slot — the ⋯ menu / restore action buttons. */
  actions?: React.ReactNode
  selected?: boolean
  dropTarget?: boolean
  /** Right-click menu body (kit ContextMenu content). The tile is wrapped so it
   *  opens natively at the cursor; the pattern owns the context-open tint. */
  contextMenu?: React.ReactNode
  onContextMenuOpenChange?: (open: boolean) => void
}

/** FileTile — a single grid tile, built on the kit `Item variant="outline"`.
 *  Header (checkbox + actions) / media / title (+ indicators) / description
 *  slots, with the selected / hover / context-open tints owned by the kit. The
 *  open / selection / drag-drop behaviour comes from the product via the
 *  spread-through props (`onClick`, `draggable`, `data-*`, …). */
export function FileTile({
  media,
  title,
  indicators,
  description,
  checkbox,
  actions,
  selected,
  dropTarget,
  contextMenu,
  onContextMenuOpenChange,
  className,
  ...props
}: FileTileProps) {
  const [contextOpen, setContextOpen] = React.useState(false)

  const body = (
    <>
      {checkbox || actions ? (
        <ItemHeader>
          {checkbox ?? <span />}
          {actions ? <ItemActions>{actions}</ItemActions> : null}
        </ItemHeader>
      ) : null}
      <ItemMedia className="basis-full py-2">{media}</ItemMedia>
      <ItemContent className="min-w-0 basis-full">
        <ItemTitle className="max-w-full">
          <span className="truncate">{title}</span>
          {indicators}
        </ItemTitle>
        {description ? <ItemDescription>{description}</ItemDescription> : null}
      </ItemContent>
    </>
  )

  const sharedProps = {
    "aria-selected": selected,
    className: cn(fileTileClass, className),
    "data-context-open": contextOpen,
    "data-state": selected ? "selected" : undefined,
    "data-drop-target": dropTarget || undefined,
    role: "listitem",
    variant: "outline" as const,
    ...props,
  }

  if (contextMenu) {
    return (
      <ContextMenu
        onOpenChange={(open) => {
          setContextOpen(open)
          onContextMenuOpenChange?.(open)
        }}
      >
        <ContextMenuTrigger render={<Item {...sharedProps} />}>
          {body}
        </ContextMenuTrigger>
        {contextMenu}
      </ContextMenu>
    )
  }

  return <Item {...sharedProps}>{body}</Item>
}
