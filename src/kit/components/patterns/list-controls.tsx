"use client"

import { useMemo, useState, type ReactNode } from "react"

import { ChevronDown, Search, X } from "../../icons"

import {
  Avatar,
  AvatarFallback,
  getAvatarFallbackTone,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface ListSearchInputProps {
  ariaLabel: string
  className?: string
  clearLabel: string
  onValueChange: (value: string) => void
  placeholder: string
  value: string
}

/** A compact controlled search input for list and table toolbars. */
export function ListSearchInput({
  ariaLabel,
  className,
  clearLabel,
  onValueChange,
  placeholder,
  value,
}: ListSearchInputProps) {
  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={ariaLabel}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={clearLabel}
            onClick={() => onValueChange("")}
            size="icon-xs"
            variant="ghost"
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

export interface FilterChipOption<Value extends string> {
  label: string
  value: Value
}

export interface FilterChipProps<Value extends string> {
  defaultValue: Value
  label: string
  onValueChange: (value: Value) => void
  options: readonly FilterChipOption<Value>[]
  resetLabel: string
  value: Value
}

function ResetButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            onClick={onClick}
            size="icon-sm"
            variant="secondary"
          />
        }
      >
        <X />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** A compact single-value filter with a separate reset affordance when active. */
export function FilterChip<Value extends string>({
  defaultValue,
  label,
  onValueChange,
  options,
  resetLabel,
  value,
}: FilterChipProps<Value>) {
  const active = value !== defaultValue
  const activeLabel = options.find((option) => option.value === value)?.label

  return (
    <ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>
          {active && activeLabel ? `${label}: ${activeLabel}` : label}
          <ChevronDown data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup
              onValueChange={(next) => onValueChange(next as Value)}
              value={value}
            >
              {options.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {active ? (
        <ResetButton
          label={resetLabel}
          onClick={() => onValueChange(defaultValue)}
        />
      ) : null}
    </ButtonGroup>
  )
}

export interface PersonPickerOption {
  avatarInitials: string
  email: string
  id: string
  name: string
}

function PersonOptionContent({ person }: { person: PersonPickerOption }) {
  return (
    <>
      <Avatar>
        <AvatarFallback tone={getAvatarFallbackTone(person.name)}>
          {person.avatarInitials}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate">{person.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {person.email}
        </span>
      </span>
    </>
  )
}

export interface PersonFilterChipProps<
  Person extends PersonPickerOption = PersonPickerOption,
> {
  ariaLabel: string
  emptyLabel: string
  label: string
  onValueChange: (person: Person | null) => void
  options: readonly Person[]
  placeholder: string
  resetLabel: string
  value: Person | null
  valueLabel: (name: string) => string
}

/** A searchable person filter that shares the regular filter-chip chrome. */
export function PersonFilterChip<
  Person extends PersonPickerOption = PersonPickerOption,
>({
  ariaLabel,
  emptyLabel,
  label,
  onValueChange,
  options,
  placeholder,
  resetLabel,
  value,
  valueLabel,
}: PersonFilterChipProps<Person>) {
  const [open, setOpen] = useState(false)

  return (
    <ButtonGroup>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger render={<Button size="sm" variant="secondary" />}>
          {value ? valueLabel(value.name) : label}
          <ChevronDown data-icon="inline-end" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-80 gap-0 overflow-hidden p-0"
        >
          <Command className="rounded-lg p-0">
            <CommandInput
              aria-label={ariaLabel}
              autoFocus
              placeholder={placeholder}
            />
            <CommandList className="max-h-72 p-1">
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              {options.map((person) => (
                <CommandItem
                  className="min-h-12 gap-2"
                  data-checked={value?.id === person.id}
                  key={person.id}
                  onSelect={() => {
                    onValueChange(person)
                    setOpen(false)
                  }}
                  value={`${person.name} ${person.email}`}
                >
                  <PersonOptionContent person={person} />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value ? (
        <ResetButton label={resetLabel} onClick={() => onValueChange(null)} />
      ) : null}
    </ButtonGroup>
  )
}

export interface PersonPickerProps<
  Person extends PersonPickerOption = PersonPickerOption,
> {
  ariaLabel: string
  autoFocus?: boolean
  className?: string
  empty?: ReactNode
  excludeIds?: readonly string[]
  onValueChange: (person: Person | null) => void
  options: readonly Person[]
  placeholder: string
  value: Person | null
}

/** A searchable single-person picker with the canonical avatar/name/email row. */
export function PersonPicker<
  Person extends PersonPickerOption = PersonPickerOption,
>({
  ariaLabel,
  autoFocus,
  className,
  empty,
  excludeIds = [],
  onValueChange,
  options,
  placeholder,
  value,
}: PersonPickerProps<Person>) {
  const [query, setQuery] = useState("")
  const candidates = useMemo(() => {
    const excluded = new Set(excludeIds)
    const normalized = query.trim().toLocaleLowerCase()

    return options.filter((person) => {
      if (excluded.has(person.id)) return false
      if (!normalized) return true

      return `${person.name} ${person.email}`
        .toLocaleLowerCase()
        .includes(normalized)
    })
  }, [excludeIds, options, query])

  return (
    <Combobox
      inputValue={query}
      onInputValueChange={setQuery}
      onValueChange={(next) => {
        const id = next as null | string
        onValueChange(options.find((person) => person.id === id) ?? null)
      }}
      value={value?.id ?? null}
    >
      <ComboboxInput
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        className={className}
        placeholder={value ? value.name : placeholder}
      />
      <ComboboxContent>
        <ComboboxList>
          {candidates.map((person) => (
            <ComboboxItem
              className="min-h-12"
              key={person.id}
              value={person.id}
            >
              <PersonOptionContent person={person} />
            </ComboboxItem>
          ))}
          {candidates.length === 0 ? empty : null}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
