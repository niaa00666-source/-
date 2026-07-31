import type { KeyboardEvent } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  supportColorCheckedClasses,
  type SupportColorRole,
} from "@/lib/support-colors"
import { cn } from "@/lib/utils"
import { Item, ItemContent, ItemTitle } from "./item"

type CalendarSourceItemProps = {
  checked: boolean
  id: string
  label: string
  onCheckedChange: (checked: boolean) => void
  tone: SupportColorRole
}

export function CalendarSourceItem({
  checked,
  id,
  label,
  onCheckedChange,
  tone,
}: CalendarSourceItemProps) {
  const checkboxId = `calendar-source-${id}`
  const toggleChecked = () => onCheckedChange(!checked)

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLDivElement>) => {
    if (keyboardEvent.target !== keyboardEvent.currentTarget) {
      return
    }

    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
      keyboardEvent.preventDefault()
      toggleChecked()
    }
  }

  return (
    <Item
      aria-pressed={checked}
      className="gap-3"
      density="compact"
      onClick={toggleChecked}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      variant="sidebar"
    >
      <Checkbox
        aria-label={`Показывать календарь ${label}`}
        checked={checked}
        className={cn("shrink-0", supportColorCheckedClasses[tone])}
        id={checkboxId}
        onClick={(event) => event.stopPropagation()}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      />

      <ItemContent>
        <ItemTitle className="font-normal">{label}</ItemTitle>
      </ItemContent>
    </Item>
  )
}
