import * as React from "react"

import { cn } from "@/lib/utils"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
} & Omit<React.ComponentPropsWithoutRef<"div">, "children">

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_VALUES: Theme[] = ["dark", "light", "system"]

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

// Base UI's Dialog/Select/Menu/Tooltip popups render through a portal, which
// by default appends to `document.body` — a sibling of `.su-scope`, not a
// descendant. Our compiled CSS only matches inside `.su-scope`, so an
// unstyled portal would render as plain unstyled HTML. Every portal-using
// component in this package defaults its `container` to this instead.
const ScopeContainerContext = React.createContext<HTMLDivElement | null>(null)

function isTheme(value: string | null): value is Theme {
  if (value === null) {
    return false
  }

  return THEME_VALUES.includes(value as Theme)
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light"
}

/**
 * Wraps `children` in the `.su-scope` CSS boundary every component in this
 * package renders against, and provides `useTheme`/`setTheme`. Unlike the
 * design-lab source this is based on, it never touches
 * `document.documentElement` — the host page owns its own `<html>`, this
 * only toggles a `dark` class on its own wrapper element.
 */
export function ThemeProvider({
  children,
  className,
  defaultTheme = "system",
  storageKey = "su-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme
    }

    const stored = window.localStorage.getItem(storageKey)
    return isTheme(stored) ? stored : defaultTheme
  })

  // Only tracks the OS preference (an external system this effect
  // legitimately subscribes to) — never set outside the listener below.
  const [systemTheme, setSystemTheme] =
    React.useState<ResolvedTheme>(getSystemTheme)
  const resolvedTheme = theme === "system" ? systemTheme : theme

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      window.localStorage.setItem(storageKey, nextTheme)
      setThemeState(nextTheme)
    },
    [storageKey]
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => setSystemTheme(getSystemTheme())

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)

  return (
    <ThemeProviderContext.Provider value={value}>
      <ScopeContainerContext.Provider value={container}>
        <div
          {...props}
          className={cn(
            "su-scope",
            resolvedTheme === "dark" && "dark",
            className
          )}
          ref={setContainer}
        >
          {children}
        </div>
      </ScopeContainerContext.Provider>
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

export const useScopeContainer = () => React.useContext(ScopeContainerContext)
