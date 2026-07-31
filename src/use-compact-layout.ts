import { useEffect, useState } from "react"

/**
 * Ниже этой ширины настольная сетка оболочки не помещается: она держит
 * минимум 1120 px (сайдбар 280 + рабочая область 784 + отступы) и не
 * перестраивается, а обрезается вьюпортом без горизонтальной прокрутки —
 * правая часть экрана вместе с кнопкой создания просто уезжает за край.
 * Поэтому ниже порога приложение рисует свою раскладку, а не подпирает чужую.
 */
export const COMPACT_LAYOUT_BREAKPOINT = 1120

export function useCompactLayout() {
  const [compact, setCompact] = useState(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < COMPACT_LAYOUT_BREAKPOINT
  })

  useEffect(() => {
    const query = window.matchMedia(
      `(max-width: ${COMPACT_LAYOUT_BREAKPOINT - 1}px)`
    )
    const sync = () => setCompact(query.matches)

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  return compact
}
