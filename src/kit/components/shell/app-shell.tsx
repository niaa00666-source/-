import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
  type ReactNode,
} from "react"

import { ContextPanel } from "@/components/shell/context-panel"
import {
  GlobalProductRail,
  type ProductRailItem,
  type ProductRailUser,
  type PrototypeScenarioItem,
} from "@/components/shell/global-product-rail"
import { PrimaryWorkspace } from "@/components/shell/primary-workspace"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const AppShellToastHostContext = createContext(false)

type AppShellProps = {
  activeProduct?: string
  /** Complete Sidebar entity; AppShell supplies its provider and layout column. */
  sidebar?: ReactNode
  /** Optional product-defined header slot inside PrimaryWorkspace. */
  header?: ReactNode
  contextPanel?: ReactNode
  contextPanelMode?: "fixed" | "fill"
  children: ReactNode
  contained?: boolean
  productRailItems?: readonly ProductRailItem[]
  onProductSelect?: (product: string) => void
  preview?: boolean
  primaryWorkspaceClassName?: string
  prototypeScenarios?: readonly PrototypeScenarioItem[]
  prototypeScenarioTitle?: string
  sidebarResizable?: boolean
  // The global product rail is HOST-app chrome (the МТС Линк product switcher).
  // A product embedded as an iframe inside the host must not render it — it
  // would be a rail inside a rail. Default true (standalone shell); products
  // like Disc that live in the host pass false. Hiding it any other way (CSS on
  // the consumer side) is forbidden by the "no adjustment in the product" rule.
  showProductRail?: boolean
  user?: ProductRailUser
}

type ResizableRegion = "sidebar" | "context" | "primary"

const desktopShellBreakpoint = 1120

/**
 * Геометрия рамки приложения — ЕДИНСТВЕННОЕ объявление, и оно публичное.
 *
 * Экспортируется, потому что иначе паритет оболочки нечем проверить: продукт и
 * витрина рисуют одну рамку, но сверить их можно только с числами, а не друг с
 * другом (они разные приложения). Теперь обе стороны меряются об это объявление.
 *
 * `preview` — уменьшенный набор для встроенных демонстраций внутри витрины.
 */
export const SHELL_SIZES = {
  standard: {
    rail: 56,
    sidebar: { default: 280, min: 240, max: 320 },
    primary: { default: 320, min: 320, max: 480 },
    context: { default: 320, min: 280, max: 420 },
  },
  preview: {
    rail: 48,
    sidebar: { default: 168, min: 144, max: 220 },
    primary: { default: 192, min: 168, max: 260 },
    context: { default: 192, min: 168, max: 260 },
  },
} as const

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function ResizeHandle({
  className,
  label,
  max,
  min,
  onKeyDown,
  onPointerDown,
  value,
}: {
  className?: string
  label: string
  max: number
  min: number
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  value: number
}) {
  return (
    <div
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={Math.round(value)}
      className={cn(
        "absolute inset-y-0 z-20 w-2 cursor-col-resize touch-none bg-transparent outline-none",
        className
      )}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      role="separator"
      tabIndex={0}
    />
  )
}

export function AppShell({
  activeProduct = "Диск",
  sidebar,
  header,
  contextPanel,
  contextPanelMode = "fixed",
  children,
  contained = false,
  productRailItems,
  onProductSelect,
  preview = false,
  primaryWorkspaceClassName,
  prototypeScenarios,
  prototypeScenarioTitle,
  sidebarResizable = true,
  showProductRail = true,
  user,
}: AppShellProps) {
  const hasToastHost = useContext(AppShellToastHostContext)
  const shellRef = useRef<HTMLDivElement>(null)
  const sizes = preview ? SHELL_SIZES.preview : SHELL_SIZES.standard
  // When the rail is hidden its column collapses to 0 so the workspace reclaims
  // the width; every layout calculation below subtracts this, not sizes.rail.
  const railWidth = showProductRail ? sizes.rail : 0
  const [shellWidth, setShellWidth] = useState<number | null>(null)
  // Явный <number>: SHELL_SIZES объявлен `as const`, поэтому без аннотации тип
  // состояния сузился бы до литерала (280 | 168) и ресайз не скомпилировался бы.
  const [sidebarWidth, setSidebarWidth] = useState<number>(
    sizes.sidebar.default
  )
  const [primaryWidth, setPrimaryWidth] = useState<number>(
    sizes.primary.default
  )
  const [contextWidth, setContextWidth] = useState<number>(
    sizes.context.default
  )
  const contextPanelFillsSpace = contextPanelMode === "fill"

  const currentSidebarWidth = clamp(
    sidebarWidth,
    sizes.sidebar.min,
    sizes.sidebar.max
  )
  const currentContextWidth = clamp(
    contextWidth,
    sizes.context.min,
    sizes.context.max
  )
  const currentPrimaryWidth = clamp(
    primaryWidth,
    sizes.primary.min,
    sizes.primary.max
  )
  const minimumLayoutWidth = preview ? 0 : desktopShellBreakpoint
  const layoutWidth = Math.max(
    shellWidth ?? minimumLayoutWidth,
    minimumLayoutWidth
  )
  const fixedPrimaryMinimum = contextPanel
    ? Math.max(
        sizes.primary.min,
        desktopShellBreakpoint -
          railWidth -
          sizes.sidebar.min -
          currentContextWidth
      )
    : sizes.primary.min
  const fillContextMinimum = Math.max(
    sizes.context.min,
    desktopShellBreakpoint - railWidth - sizes.sidebar.min - sizes.primary.min
  )
  const responsiveSidebarWidth =
    contextPanel && !preview
      ? clamp(
          layoutWidth -
            railWidth -
            (contextPanelFillsSpace
              ? fillContextMinimum + sizes.primary.min
              : currentContextWidth + fixedPrimaryMinimum),
          sizes.sidebar.min,
          currentSidebarWidth
        )
      : currentSidebarWidth
  const responsivePrimaryWidth = contextPanelFillsSpace
    ? clamp(
        layoutWidth - railWidth - responsiveSidebarWidth - fillContextMinimum,
        sizes.primary.min,
        currentPrimaryWidth
      )
    : currentPrimaryWidth
  const workspaceWidth = Math.max(
    0,
    layoutWidth - railWidth - (sidebar ? responsiveSidebarWidth : 0)
  )

  useEffect(() => {
    const shell = shellRef.current

    if (!shell) {
      return
    }

    const updateShellWidth = () => {
      setShellWidth(shell.getBoundingClientRect().width)
    }

    updateShellWidth()

    const resizeObserver = new ResizeObserver(updateShellWidth)
    resizeObserver.observe(shell)

    return () => resizeObserver.disconnect()
  }, [])

  const beginResize = useCallback(
    (region: ResizableRegion, event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.currentTarget.focus()

      const startX = event.clientX
      const startWidth =
        region === "sidebar"
          ? currentSidebarWidth
          : region === "primary"
            ? currentPrimaryWidth
            : currentContextWidth
      const previousCursor = document.body.style.cursor
      const previousUserSelect = document.body.style.userSelect

      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX

        if (region === "sidebar") {
          setSidebarWidth(
            clamp(startWidth + delta, sizes.sidebar.min, sizes.sidebar.max)
          )
          return
        }

        if (region === "primary") {
          setPrimaryWidth(
            clamp(startWidth + delta, sizes.primary.min, sizes.primary.max)
          )
          return
        }

        setContextWidth(
          clamp(startWidth - delta, sizes.context.min, sizes.context.max)
        )
      }

      const stopResize = () => {
        document.body.style.cursor = previousCursor
        document.body.style.userSelect = previousUserSelect
        window.removeEventListener("pointermove", handlePointerMove)
        window.removeEventListener("pointerup", stopResize)
        window.removeEventListener("pointercancel", stopResize)
      }

      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", stopResize)
      window.addEventListener("pointercancel", stopResize)
    },
    [
      currentContextWidth,
      currentPrimaryWidth,
      currentSidebarWidth,
      sizes.context.max,
      sizes.context.min,
      sizes.primary.max,
      sizes.primary.min,
      sizes.sidebar.max,
      sizes.sidebar.min,
    ]
  )

  const handleResizeKeyDown = useCallback(
    (region: ResizableRegion, event: KeyboardEvent<HTMLDivElement>) => {
      const step = event.shiftKey ? 32 : 16

      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return
      }

      event.preventDefault()

      if (region === "sidebar") {
        if (event.key === "Home") {
          setSidebarWidth(sizes.sidebar.min)
        } else if (event.key === "End") {
          setSidebarWidth(sizes.sidebar.max)
        } else {
          setSidebarWidth((width) =>
            clamp(
              width + (event.key === "ArrowRight" ? step : -step),
              sizes.sidebar.min,
              sizes.sidebar.max
            )
          )
        }
        return
      }

      if (region === "primary") {
        if (event.key === "Home") {
          setPrimaryWidth(sizes.primary.min)
        } else if (event.key === "End") {
          setPrimaryWidth(sizes.primary.max)
        } else {
          setPrimaryWidth((width) =>
            clamp(
              width + (event.key === "ArrowRight" ? step : -step),
              sizes.primary.min,
              sizes.primary.max
            )
          )
        }
        return
      }

      if (event.key === "Home") {
        setContextWidth(sizes.context.min)
      } else if (event.key === "End") {
        setContextWidth(sizes.context.max)
      } else {
        setContextWidth((width) =>
          clamp(
            width + (event.key === "ArrowLeft" ? step : -step),
            sizes.context.min,
            sizes.context.max
          )
        )
      }
    },
    [
      sizes.context.max,
      sizes.context.min,
      sizes.primary.max,
      sizes.primary.min,
      sizes.sidebar.max,
      sizes.sidebar.min,
    ]
  )

  const shell = (
    <div
      className={cn(
        "grid w-full min-w-0 overflow-hidden bg-background",
        preview || contained
          ? "h-full max-h-full min-h-0"
          : "h-svh max-h-svh min-h-0"
      )}
      data-shell="AppShell"
      ref={shellRef}
      style={{
        gridTemplateColumns: [
          showProductRail ? `${sizes.rail}px` : null,
          sidebar ? `${responsiveSidebarWidth}px` : null,
          `${workspaceWidth}px`,
        ]
          .filter(Boolean)
          .join(" "),
      }}
    >
      {showProductRail ? (
        <GlobalProductRail
          activeProduct={activeProduct}
          contained={contained}
          items={productRailItems}
          onProductSelect={onProductSelect}
          preview={preview}
          prototypeScenarios={prototypeScenarios}
          prototypeScenarioTitle={prototypeScenarioTitle}
          user={user}
        />
      ) : null}

      {sidebar ? (
        <div
          className="relative h-full min-h-0 min-w-0 overflow-hidden"
          data-shell-slot="Sidebar"
        >
          <SidebarProvider
            className="h-full min-h-0 w-full"
            style={{ "--sidebar-width": "100%" } as CSSProperties}
          >
            {sidebar}
          </SidebarProvider>
          {sidebarResizable ? (
            <ResizeHandle
              className="right-0"
              label="Изменить ширину Sidebar"
              max={sizes.sidebar.max}
              min={sizes.sidebar.min}
              onKeyDown={(event) => handleResizeKeyDown("sidebar", event)}
              onPointerDown={(event) => beginResize("sidebar", event)}
              value={currentSidebarWidth}
            />
          ) : null}
        </div>
      ) : null}

      <main
        className={cn(
          "flex min-w-0 overflow-hidden",
          preview || contained ? "h-full min-h-0" : "h-svh min-h-0"
        )}
        data-shell-region="WorkspaceColumns"
      >
        <PrimaryWorkspace
          className={primaryWorkspaceClassName}
          header={header}
          preview={preview}
          style={
            contextPanelFillsSpace
              ? {
                  flex: "0 0 auto",
                  minWidth: sizes.primary.min,
                  width: responsivePrimaryWidth,
                }
              : contextPanel
                ? { minWidth: fixedPrimaryMinimum }
                : undefined
          }
        >
          {children}
        </PrimaryWorkspace>
        {contextPanel ? (
          <ContextPanel
            fill={contextPanelFillsSpace}
            minWidth={contextPanelFillsSpace ? fillContextMinimum : undefined}
            resizeHandle={
              contextPanelFillsSpace ? (
                <ResizeHandle
                  className="left-0"
                  label="Изменить ширину PrimaryWorkspace"
                  max={sizes.primary.max}
                  min={sizes.primary.min}
                  onKeyDown={(event) => handleResizeKeyDown("primary", event)}
                  onPointerDown={(event) => beginResize("primary", event)}
                  value={currentPrimaryWidth}
                />
              ) : (
                <ResizeHandle
                  className="left-0"
                  label="Изменить ширину ContextPanel"
                  max={sizes.context.max}
                  min={sizes.context.min}
                  onKeyDown={(event) => handleResizeKeyDown("context", event)}
                  onPointerDown={(event) => beginResize("context", event)}
                  value={currentContextWidth}
                />
              )
            }
            width={contextPanelFillsSpace ? undefined : currentContextWidth}
          >
            {contextPanel}
          </ContextPanel>
        ) : null}
      </main>
    </div>
  )

  if (hasToastHost) {
    return shell
  }

  // The outermost shell owns the single global notification viewport. A
  // standalone contained/preview shell still gets a host, while a genuinely
  // embedded shell inherits this context and does not render every toast twice.
  return (
    <AppShellToastHostContext.Provider value>
      <Toaster>{shell}</Toaster>
    </AppShellToastHostContext.Provider>
  )
}
