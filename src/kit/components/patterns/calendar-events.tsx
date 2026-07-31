import type { KeyboardEvent, ReactNode } from "react"

import { TableCell, TableRow } from "@/components/ui/table"
import {
  supportColorBackgroundClasses,
  supportColorBorderClasses,
  type SupportColorRole,
} from "@/lib/support-colors"
import { cn } from "@/lib/utils"

export type CalendarEventTone = SupportColorRole

export type CalendarEventAvailability = "available" | "busy" | "unavailable"

export type CalendarEventResponseStatus = "accepted" | "declined" | "tentative"

export type CalendarEventData = {
  id: string
  title: string
  calendarId: string
  calendarName: string
  tone: CalendarEventTone
  availability: CalendarEventAvailability
  allDay?: boolean
  detail?: string
  endTime?: string
  external?: boolean
  meetingUrl?: string
  responseStatus?: CalendarEventResponseStatus
  startTime?: string
}

type CalendarEventProps = {
  dateLabel?: string
  dateNumber?: string
  dateSelected?: boolean
  event: CalendarEventData
  onSelect?: (eventId: string) => void
  selected?: boolean
  showDate?: boolean
  variant: "all-day" | "timed"
}

function getAvailabilityLabel(availability: CalendarEventAvailability) {
  if (availability === "busy") {
    return "Занят"
  }

  if (availability === "unavailable") {
    return "Недоступен"
  }

  return "Свободен"
}

export function EventIndicator({
  availability,
  external,
  tone,
}: {
  availability: CalendarEventAvailability
  external?: boolean
  tone: CalendarEventTone
}) {
  return (
    <span className="flex items-center justify-center text-muted-foreground">
      <span
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0 rounded-full border",
          supportColorBorderClasses[tone],
          supportColorBackgroundClasses[tone],
          availability === "unavailable" && "opacity-60"
        )}
      />
      <span className="sr-only">
        {external ? "Внешний календарь, " : ""}
        {getAvailabilityLabel(availability)}
      </span>
    </span>
  )
}

export function CalendarEvent({
  dateLabel,
  dateNumber,
  dateSelected = false,
  event,
  onSelect,
  selected = false,
  showDate = false,
  variant,
}: CalendarEventProps) {
  const availabilityLabel = getAvailabilityLabel(event.availability)
  const timeLabel =
    event.allDay || !event.startTime
      ? "Весь день"
      : event.endTime
        ? `${event.startTime}–${event.endTime}`
        : event.startTime

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLTableRowElement>) => {
    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
      keyboardEvent.preventDefault()
      onSelect?.(event.id)
    }
  }

  return (
    <TableRow
      aria-selected={selected}
      className={cn(
        "group/event h-[5.75rem] cursor-pointer bg-background hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        selected && "bg-primary/10 hover:bg-primary/15"
      )}
      data-calendar-event-id={event.id}
      data-calendar-event-variant={variant}
      data-selected={selected}
      data-state={selected ? "selected" : undefined}
      onClick={() => onSelect?.(event.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <TableCell className="w-[8.75rem] px-4 py-5 md:w-[10.5rem] xl:w-[12rem]">
        {showDate ? (
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-full text-2xl font-semibold",
                dateSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              )}
            >
              {dateNumber}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block truncate text-base font-medium",
                  dateSelected ? "text-primary" : "text-muted-foreground"
                )}
              >
                {dateLabel}
              </span>
              {dateSelected ? (
                <span className="block truncate text-sm text-muted-foreground">
                  Сегодня
                </span>
              ) : null}
            </span>
          </div>
        ) : null}
      </TableCell>

      <TableCell className="w-12 px-2 py-5 md:w-14 xl:w-16">
        <div className="flex justify-center">
          <EventIndicator
            availability={event.availability}
            external={event.external}
            tone={event.tone}
          />
        </div>
      </TableCell>

      <TableCell className="w-28 px-2 py-5 text-sm font-medium text-foreground md:w-[8.5rem] xl:w-40">
        {timeLabel}
      </TableCell>

      <TableCell className="relative min-w-0 px-4 py-5 [white-space:normal]">
        {showDate && dateSelected ? (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute right-4 bottom-4 left-0 z-0 h-0.5",
              supportColorBackgroundClasses[event.tone]
            )}
          >
            <span
              className={cn(
                "absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full",
                supportColorBackgroundClasses[event.tone]
              )}
            />
          </span>
        ) : null}

        <div className="relative z-10 truncate text-lg font-semibold text-foreground">
          {event.title}
        </div>
        <span className="sr-only">
          {availabilityLabel}, {event.calendarName}
          {event.detail ? `, ${event.detail}` : ""}
          {event.external ? ", внешний календарь" : ""}
          {event.meetingUrl ? ", есть ссылка на встречу" : ""}
        </span>
        {event.meetingUrl ? (
          <span className="sr-only">{event.meetingUrl}</span>
        ) : null}
      </TableCell>
    </TableRow>
  )
}

export function AllDayEvent({
  event,
  onSelect,
  selected,
  ...props
}: Omit<CalendarEventProps, "variant">) {
  return (
    <CalendarEvent
      event={{ ...event, allDay: true }}
      onSelect={onSelect}
      selected={selected}
      variant="all-day"
      {...props}
    />
  )
}

export function TimedEvent({
  event,
  onSelect,
  selected,
  ...props
}: Omit<CalendarEventProps, "variant">) {
  return (
    <CalendarEvent
      event={event}
      onSelect={onSelect}
      selected={selected}
      variant="timed"
      {...props}
    />
  )
}

export function CalendarDateGroup({
  children,
}: {
  children: ReactNode
  subtitle?: string
  title: string
}) {
  return <>{children}</>
}
