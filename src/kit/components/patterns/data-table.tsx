import {
  Fragment,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  MoreHorizontal,
  type LucideIcon,
} from "../../icons"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SortDirection = "asc" | "desc"

export type DataTableSort = {
  columnId: string
  direction: SortDirection
}

export type DataTableColumn<Row> = {
  cell: (row: Row) => ReactNode
  className?: string
  header: string
  headerClassName?: string
  id: string
  sortable?: boolean
  sortValue?: (row: Row) => number | string
}

export type DataTableRowAction<Row> = {
  icon?: LucideIcon
  label: string
  onSelect?: (row: Row) => void
  separatorBefore?: boolean
  variant?: "default" | "destructive"
}

export type DataTableProps<Row extends { id: string }> = {
  ariaLabel: string
  className?: string
  columns: readonly DataTableColumn<Row>[]
  defaultSelectedRowIds?: readonly string[]
  defaultSort?: DataTableSort
  getRowLabel: (row: Row) => string
  rowActions?: (row: Row) => readonly DataTableRowAction<Row>[]
  rows: readonly Row[]
}

export interface ControlledDataTableLabels {
  actions: string
  selectAll: string
  selectRow: (rowLabel: string) => string
  sortBy: (columnLabel: string) => string
}

export interface ControlledDataTableProps<Row extends { id: string }> {
  ariaLabel: string
  columns: readonly DataTableColumn<Row>[]
  empty: ReactNode
  getRowLabel: (row: Row) => string
  labels: ControlledDataTableLabels
  onSelectedRowIdsChange: (ids: Set<string>) => void
  onSortChange: (sort: DataTableSort) => void
  rowActions?: (row: Row) => readonly DataTableRowAction<Row>[]
  rows: readonly Row[]
  selectedRowIds: ReadonlySet<string>
  sort: DataTableSort
}

const collator = new Intl.Collator("ru-RU", {
  numeric: true,
  sensitivity: "base",
})

function compareValues(left: number | string, right: number | string) {
  if (typeof left === "number" && typeof right === "number") {
    return left - right
  }

  return collator.compare(String(left), String(right))
}

export function DataTable<Row extends { id: string }>({
  ariaLabel,
  className,
  columns,
  defaultSelectedRowIds = [],
  defaultSort,
  getRowLabel,
  rowActions,
  rows,
}: DataTableProps<Row>) {
  const [selectedRowIds, setSelectedRowIds] = useState(
    () => new Set(defaultSelectedRowIds)
  )
  const [sort, setSort] = useState<DataTableSort | undefined>(defaultSort)
  const selectedCount = rows.filter((row) => selectedRowIds.has(row.id)).length
  const allSelected = rows.length > 0 && selectedCount === rows.length
  const partiallySelected = selectedCount > 0 && !allSelected

  const sortedRows = useMemo(() => {
    if (!sort) return [...rows]

    const column = columns.find((item) => item.id === sort.columnId)

    if (!column?.sortValue) return [...rows]

    return [...rows].sort((left, right) => {
      const result = compareValues(
        column.sortValue?.(left) ?? "",
        column.sortValue?.(right) ?? ""
      )

      return sort.direction === "asc" ? result : -result
    })
  }, [columns, rows, sort])

  const toggleAllRows = (checked: boolean) => {
    setSelectedRowIds(checked ? new Set(rows.map((row) => row.id)) : new Set())
  }

  const toggleRow = (rowId: string, checked: boolean) => {
    setSelectedRowIds((current) => {
      const next = new Set(current)

      if (checked) {
        next.add(rowId)
      } else {
        next.delete(rowId)
      }

      return next
    })
  }

  const toggleSort = (columnId: string) => {
    setSort((current) => ({
      columnId,
      direction:
        current?.columnId === columnId && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-md border border-border bg-background",
        className
      )}
      data-pattern="DataTable"
    >
      <div className="flex h-9 items-center justify-between gap-3 border-b border-border px-2 text-xs text-muted-foreground">
        <span aria-live="polite">
          {selectedCount > 0
            ? `Выбрано: ${selectedCount}`
            : `Объектов: ${rows.length}`}
        </span>
        {selectedCount > 0 ? (
          <Button
            className="h-6 px-2"
            onClick={() => setSelectedRowIds(new Set())}
            size="xs"
            variant="ghost"
          >
            Снять выбор
          </Button>
        ) : null}
      </div>

      <Table aria-label={ariaLabel} className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                aria-label="Выбрать все строки"
                checked={allSelected}
                indeterminate={partiallySelected}
                onCheckedChange={(checked) => toggleAllRows(checked === true)}
              />
            </TableHead>
            {columns.map((column) => {
              const active = sort?.columnId === column.id
              const SortIcon = active
                ? sort.direction === "desc"
                  ? ArrowDown
                  : ArrowUp
                : ChevronsUpDown

              return (
                <TableHead
                  aria-sort={
                    active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : column.sortValue
                        ? "none"
                        : undefined
                  }
                  className={column.headerClassName}
                  key={column.id}
                >
                  {column.sortValue ? (
                    <Button
                      aria-label={`Сортировать: ${column.header}`}
                      aria-pressed={active}
                      className={cn(
                        "-ml-2 h-7 justify-start px-2 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground",
                        active && "text-foreground"
                      )}
                      onClick={() => toggleSort(column.id)}
                      size="sm"
                      variant="ghost"
                    >
                      {column.header}
                      <SortIcon
                        className={cn("size-3", !active && "opacity-50")}
                      />
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              )
            })}
            {rowActions ? (
              <TableHead className="w-10">
                <span className="sr-only">Действия</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedRows.map((row) => {
            const selected = selectedRowIds.has(row.id)
            const actions = rowActions?.(row) ?? []

            return (
              <TableRow
                aria-selected={selected}
                data-state={selected ? "selected" : undefined}
                key={row.id}
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Выбрать ${getRowLabel(row)}`}
                    checked={selected}
                    onCheckedChange={(checked) =>
                      toggleRow(row.id, checked === true)
                    }
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell className={column.className} key={column.id}>
                    {column.cell(row)}
                  </TableCell>
                ))}
                {rowActions ? (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            aria-label={`Действия для ${getRowLabel(row)}`}
                            size="icon-sm"
                            variant="ghost"
                          />
                        }
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action) => {
                          const Icon = action.icon

                          return (
                            <div key={action.label}>
                              {action.separatorBefore ? (
                                <DropdownMenuSeparator />
                              ) : null}
                              <DropdownMenuItem
                                onClick={() => action.onSelect?.(row)}
                                variant={action.variant}
                              >
                                {Icon ? <Icon /> : null}
                                {action.label}
                              </DropdownMenuItem>
                            </div>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                ) : null}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * ControlledDataTable — the host-controlled variation for server-backed lists.
 *
 * Rows arrive already filtered and sorted; selection and sort state live in the
 * host. Empty content and labels are injected. Row actions are available from
 * both the trailing button and the row context menu.
 */
export function ControlledDataTable<Row extends { id: string }>({
  ariaLabel,
  columns,
  empty,
  getRowLabel,
  labels,
  onSelectedRowIdsChange,
  onSortChange,
  rowActions,
  rows,
  selectedRowIds,
  sort,
}: ControlledDataTableProps<Row>) {
  const [contextMenuRowId, setContextMenuRowId] = useState<string | null>(null)
  const selectedCount = rows.filter((row) => selectedRowIds.has(row.id)).length
  const allSelected = rows.length > 0 && selectedCount === rows.length
  const partiallySelected = selectedCount > 0 && !allSelected

  const toggleAll = (checked: boolean) => {
    onSelectedRowIdsChange(
      checked ? new Set(rows.map((row) => row.id)) : new Set()
    )
  }

  const toggleRow = (rowId: string, checked: boolean) => {
    const next = new Set(selectedRowIds)

    if (checked) {
      next.add(rowId)
    } else {
      next.delete(rowId)
    }

    onSelectedRowIdsChange(next)
  }

  const toggleSort = (columnId: string) => {
    onSortChange({
      columnId,
      direction:
        sort.columnId === columnId && sort.direction === "asc" ? "desc" : "asc",
    })
  }

  if (rows.length === 0) return <>{empty}</>

  return (
    <Table aria-label={ariaLabel} className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10">
            <Checkbox
              aria-label={labels.selectAll}
              checked={allSelected}
              indeterminate={partiallySelected}
              onCheckedChange={(checked) => toggleAll(checked === true)}
            />
          </TableHead>
          {columns.map((column) => {
            const active = sort.columnId === column.id
            const SortIcon = active
              ? sort.direction === "desc"
                ? ArrowDown
                : ArrowUp
              : ChevronsUpDown

            return (
              <TableHead
                aria-sort={
                  active
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : column.sortable
                      ? "none"
                      : undefined
                }
                className={column.headerClassName}
                key={column.id}
              >
                {column.sortable ? (
                  <Button
                    aria-label={labels.sortBy(column.header)}
                    aria-pressed={active}
                    className={cn(
                      "-ml-2 h-7 max-w-full min-w-0 justify-start px-2 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground",
                      active && "text-foreground"
                    )}
                    onClick={() => toggleSort(column.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <span className="truncate">{column.header}</span>
                    <SortIcon
                      className={cn("size-3 shrink-0", !active && "opacity-50")}
                    />
                  </Button>
                ) : (
                  <span className="block truncate text-xs font-medium text-muted-foreground">
                    {column.header}
                  </span>
                )}
              </TableHead>
            )
          })}
          {rowActions ? (
            <TableHead className="w-10">
              <span className="sr-only">{labels.actions}</span>
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((row) => {
          const selected = selectedRowIds.has(row.id)
          const actions = rowActions?.(row) ?? []
          const rowLabel = getRowLabel(row)
          const cells = (
            <>
              <TableCell>
                <Checkbox
                  aria-label={labels.selectRow(rowLabel)}
                  checked={selected}
                  onCheckedChange={(checked) =>
                    toggleRow(row.id, checked === true)
                  }
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell className={column.className} key={column.id}>
                  {column.cell(row)}
                </TableCell>
              ))}
              {rowActions ? (
                <TableCell className="text-right">
                  {actions.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            aria-label={`${labels.actions}: ${rowLabel}`}
                            className="opacity-0 transition-opacity group-hover/dt-row:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
                            size="icon-sm"
                            variant="ghost"
                          />
                        }
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action) => {
                          const Icon = action.icon

                          return (
                            <Fragment key={action.label}>
                              {action.separatorBefore ? (
                                <DropdownMenuSeparator />
                              ) : null}
                              <DropdownMenuItem
                                onClick={() => action.onSelect?.(row)}
                                variant={action.variant}
                              >
                                {Icon ? <Icon /> : null}
                                {action.label}
                              </DropdownMenuItem>
                            </Fragment>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </TableCell>
              ) : null}
            </>
          )
          const tableRow = (
            <TableRow
              aria-selected={selected}
              className={dataTableRowClassName}
              data-context-open={
                contextMenuRowId === row.id ? "true" : undefined
              }
              data-state={selected ? "selected" : undefined}
            >
              {cells}
            </TableRow>
          )

          if (actions.length === 0) {
            return <Fragment key={row.id}>{tableRow}</Fragment>
          }

          return (
            <ContextMenu
              key={row.id}
              onOpenChange={(open) => {
                setContextMenuRowId((current) =>
                  open ? row.id : current === row.id ? null : current
                )
              }}
              open={contextMenuRowId === row.id}
            >
              <ContextMenuTrigger render={tableRow} />
              <ContextMenuContent>
                {actions.map((action) => {
                  const Icon = action.icon

                  return (
                    <Fragment key={action.label}>
                      {action.separatorBefore ? <ContextMenuSeparator /> : null}
                      <ContextMenuItem
                        onClick={() => action.onSelect?.(row)}
                        variant={action.variant}
                      >
                        {Icon ? <Icon /> : null}
                        {action.label}
                      </ContextMenuItem>
                    </Fragment>
                  )
                })}
              </ContextMenuContent>
            </ContextMenu>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ---------------------------------------------------------------------------
// Standalone table-building helpers — exported for surfaces that assemble a
// table by hand (custom header/cells) instead of via <DataTable> above. They
// are independent of the <DataTable> component.
// ---------------------------------------------------------------------------

const responsiveHideClass: Record<number, string> = {
  900: "max-[900px]:hidden",
  1024: "max-[1024px]:hidden",
  1100: "max-[1100px]:hidden",
  1120: "max-[1120px]:hidden",
  1180: "max-[1180px]:hidden",
  1320: "max-[1320px]:hidden",
}

/** The canonical `<TableRow>` chrome a hand-assembled data row can wear: fixed
 *  height plus the hover / selected / context-open tints (and dark variants). */
export const dataTableRowClassName =
  "group/dt-row h-12 cursor-pointer hover:bg-muted/50 data-[context-open=true]:bg-muted/50 data-[state=selected]:bg-primary/10 data-[state=selected]:hover:bg-primary/15 data-[state=selected]:data-[context-open=true]:bg-primary/15 dark:data-[state=selected]:bg-primary/15 dark:data-[state=selected]:hover:bg-primary/20 dark:data-[state=selected]:data-[context-open=true]:bg-primary/20"

export type DataTableSortDir = "asc" | "desc"

/** Escape-hatch props merged onto a hand-assembled row's `<tr>`. */
export type DataTableRowProps = Omit<ComponentProps<"tr">, "children"> & {
  selected?: boolean
  dropTarget?: boolean
}

export interface DataTableSortHeadProps<F extends string = string> {
  label: ReactNode
  field: F
  active: F
  order: DataTableSortDir
  onSort: (field: F) => void
  width?: number
  responsiveHide?: number
  className?: string
  disabled?: boolean
  ariaLabel?: string
}

/** DataTableSortHead — a sortable column header (ghost button whose arrow
 *  reveals on hover and locks visible once the column is the active sort). */
export function DataTableSortHead<F extends string = string>({
  label,
  field,
  active,
  order,
  onSort,
  width,
  responsiveHide,
  className,
  disabled = false,
  ariaLabel,
}: DataTableSortHeadProps<F>) {
  const isActive = active === field
  const Icon = isActive && order === "desc" ? ArrowDown : ArrowUp

  return (
    <TableHead
      aria-sort={
        isActive ? (order === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn(
        responsiveHide != null
          ? responsiveHideClass[responsiveHide]
          : undefined,
        className
      )}
      style={width != null ? { width } : undefined}
    >
      <Button
        aria-label={ariaLabel}
        aria-pressed={isActive}
        className={cn(
          "-ml-2 h-7 justify-start px-2 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-muted-foreground",
          isActive && "text-foreground hover:text-foreground"
        )}
        disabled={disabled}
        onClick={() => onSort(field)}
        size="sm"
        variant="ghost"
      >
        {label}
        <Icon
          className={cn(
            "size-3 text-muted-foreground opacity-0 transition-opacity",
            isActive &&
              "text-foreground opacity-100 group-hover/button:text-foreground",
            !isActive &&
              "group-hover/button:opacity-100 group-focus-visible/button:opacity-100"
          )}
        />
      </Button>
    </TableHead>
  )
}

export interface DataTableNameCellProps extends useRender.ComponentProps<"span"> {
  media?: ReactNode
  children: ReactNode
  indicators?: ReactNode
  variant?: "link" | "static" | "muted"
}

const nameVariantClass: Record<
  NonNullable<DataTableNameCellProps["variant"]>,
  string
> = {
  link: "cursor-pointer text-foreground underline-offset-2 hover:underline",
  static: "cursor-default text-foreground",
  muted: "cursor-default text-muted-foreground",
}

/** DataTableNameCell — the file/folder name cluster: leading media, a
 *  truncating name, and trailing indicators. The name wrapper is `render`-able
 *  so the product supplies its own link element and open semantics. */
export function DataTableNameCell({
  media,
  children,
  indicators,
  variant = "link",
  className,
  render,
  ...props
}: DataTableNameCellProps) {
  const nameWrapper = useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        className: cn(
          "flex min-w-0 items-center",
          nameVariantClass[variant],
          className
        ),
        children: <DataTableName>{children}</DataTableName>,
      },
      props
    ),
  })

  return (
    <div className="flex max-w-full min-w-0 items-center gap-3">
      {media ? <span className="inline-flex shrink-0">{media}</span> : null}
      <div className="flex min-w-0 items-center gap-1">
        {nameWrapper}
        {indicators}
      </div>
    </div>
  )
}

/** The truncating name text inside `DataTableNameCell`. */
export function DataTableName({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("min-w-0 truncate font-medium", className)}
      {...props}
    />
  )
}

export type DataTableCellTriggerProps = ComponentProps<typeof Button>

/**
 * An editable table value that reads as plain cell content at rest.
 * A subtle dotted underline signals that the value is interactive without
 * changing the cell geometry. Hover, keyboard focus and an open popup only
 * strengthen the text color. It can trigger any popup primitive.
 */
export function DataTableCellTrigger({
  children,
  className,
  disabled,
  size = "default",
  variant = "ghost",
  ...props
}: DataTableCellTriggerProps) {
  const inactive =
    disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true"

  return (
    <Button
      className={cn(
        "h-8 max-w-full min-w-0 justify-start rounded-md bg-transparent! px-0! font-normal! text-muted-foreground shadow-none hover:bg-transparent! hover:text-foreground focus-visible:bg-transparent! focus-visible:text-foreground aria-expanded:bg-transparent! aria-expanded:text-foreground data-popup-open:bg-transparent! data-popup-open:text-foreground dark:hover:bg-transparent! dark:focus-visible:bg-transparent! dark:aria-expanded:bg-transparent! data-open:bg-transparent! data-open:text-foreground",
        className
      )}
      data-slot="data-table-cell-trigger"
      disabled={disabled}
      size={size}
      variant={variant}
      {...props}
    >
      <span
        className={cn(
          "relative inline-flex max-w-full min-w-0 after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-[radial-gradient(circle,currentColor_0_0.5px,transparent_0.75px)] after:bg-[length:3px_1px] after:bg-repeat-x after:opacity-40",
          inactive && "after:hidden"
        )}
        data-slot="data-table-cell-trigger-label"
      >
        {children}
      </span>
    </Button>
  )
}

/** DataTableRowActionButton — a single trailing row action (ghost icon button
 *  with a tooltip; stops row click/context propagation). */
export function DataTableRowActionButton({
  children,
  className,
  disabled = false,
  label,
  onClick,
  variant = "ghost",
}: {
  children: ReactNode
  className?: string
  disabled?: boolean
  label: string
  onClick?: () => void
  variant?: "ghost" | "destructive"
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={(event) => {
          event.stopPropagation()
          if (disabled) return
          onClick?.()
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        render={
          <Button
            aria-label={label}
            className={cn(
              "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
              className
            )}
            disabled={disabled}
            focusableWhenDisabled
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
