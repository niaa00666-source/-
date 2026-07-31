import { useEffect, useRef, useState } from "react"
import { ru } from "date-fns/locale"
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Download,
  Eye,
  EyeOff,
  Globe2,
  Link2,
  LockKeyhole,
  Settings,
  ShieldCheck,
  TriangleAlert,
  UserRoundX,
  UsersRound,
  X,
} from "../../icons"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  getAvatarFallbackTone,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ruShareAccessLabels,
  type ShareAccessLabels,
} from "@/components/patterns/share-access-labels"
import {
  clampShareRole,
  resolveShareRoleOptions,
  validateShareAccessSettings,
  type ShareAccessCapabilities,
  type ShareAccessRequest,
  type ShareAccessMode,
  type ShareAccessSettings,
  type ShareMemberProfile,
  type SharePerson,
  type ShareRole,
  type ShareVisibility,
} from "@/components/patterns/share-access-model"
import { cn } from "@/lib/utils"

type ShareSuggestion = {
  avatarUrl?: string
  email: string
  id: string
  name: string
}

const shareSuggestions = [
  {
    email: "anna@link.example",
    id: "anna",
    name: "Анна Смирнова",
  },
  {
    email: "maxim@link.example",
    id: "maxim",
    name: "Максим Волков",
  },
  {
    email: "alexey@partner.example",
    id: "alexey",
    name: "Алексей Орлов",
  },
] as const

const halfHourTimeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2)
  const minutes = index % 2 === 0 ? "00" : "30"
  return `${String(hours).padStart(2, "0")}:${minutes}`
})

function toLocalDateTimeValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function parseDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function getPersonInitial(name: string) {
  return name.trim().charAt(0).toLocaleUpperCase("ru-RU")
}

/**
 * Лицо участника: фото, если место его знает, и инициал, если нет. Одним
 * хелпером, а не разметкой по месту, потому что лицо рисуется в ШЕСТИ местах
 * (владелец, человек в списке, запрос доступа, два баннера запросов, подсказки
 * поиска) — и расходиться в том, когда показывается фото, они не должны: именно
 * так аватары и потерялись, оставшись только у владельца.
 *
 * `AvatarFallback` рендерится ВСЕГДА: base-ui показывает его, пока картинка не
 * загрузилась, и оставляет, если она не загрузится вовсе, — битая ссылка сама
 * деградирует до инициала.
 */
function MemberAvatarContent({
  avatarUrl,
  name,
}: {
  avatarUrl?: string
  name: string
}) {
  return (
    <>
      {avatarUrl ? <AvatarImage alt={name} src={avatarUrl} /> : null}
      <AvatarFallback tone={getAvatarFallbackTone(name)}>
        {getPersonInitial(name)}
      </AvatarFallback>
    </>
  )
}

/**
 * То же лицо вместе с корнем аватара. Отдельно от `MemberAvatarContent`, потому
 * что в баннере запросов корень создаёт `TooltipTrigger` через `render`, и там
 * нужно только содержимое.
 */
function MemberAvatar({
  avatarUrl,
  name,
  size,
}: {
  avatarUrl?: string
  name: string
  size?: "default" | "lg" | "sm"
}) {
  return (
    <Avatar size={size}>
      <MemberAvatarContent avatarUrl={avatarUrl} name={name} />
    </Avatar>
  )
}

function updateShareSettings(
  settings: ShareAccessSettings,
  update: Partial<ShareAccessSettings>
) {
  return {
    ...settings,
    ...update,
  }
}

function ShareRoleSelect({
  ariaLabel,
  capabilities,
  disabled,
  labels,
  onValueChange,
  size = "default",
  value,
}: {
  ariaLabel?: string
  /**
   * ОБЯЗАТЕЛЬНЫЙ (пусть и допускающий `undefined`) проп внутреннего компонента:
   * так typecheck сам ловит пропущенное место выбора роли. Дырявый гейт хуже
   * отсутствующего — он создаёт ложное чувство закрытости, а мест выбора роли в
   * этом файле пять.
   */
  capabilities: ShareAccessCapabilities | undefined
  disabled?: boolean
  labels: ShareAccessLabels
  onValueChange: (role: ShareRole) => void
  size?: "sm" | "default"
  value: ShareRole
}) {
  return (
    <Select
      disabled={disabled}
      onValueChange={(nextValue) => onValueChange(nextValue as ShareRole)}
      value={value}
    >
      <SelectTrigger
        aria-label={ariaLabel ?? labels.roleSelectAriaLabel}
        size={size}
        width="content"
      >
        <SelectValue>{labels.roleNames[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent className="w-44">
        <SelectGroup>
          {resolveShareRoleOptions(value, capabilities).map((option) => (
            <SelectItem
              disabled={option.disabled}
              key={option.role}
              value={option.role}
            >
              {labels.roleNames[option.role]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function AddPeopleCombobox({
  anchor,
  autoFocus,
  existingPeople,
  inputValue,
  labels,
  onInputValueChange,
  onKeyDown,
  onValueChange,
  searchLoading,
  searchResults,
  showDescription = true,
  value,
}: {
  anchor: React.RefObject<HTMLDivElement | null>
  autoFocus?: boolean
  existingPeople: SharePerson[]
  inputValue: string
  labels: ShareAccessLabels
  onInputValueChange: (value: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onValueChange: (value: string[]) => void
  searchLoading?: boolean
  searchResults?: ShareMemberProfile[]
  showDescription?: boolean
  value: string[]
}) {
  // Оба источника подсказок (живой поиск и фикстура) приведены к ОДНОМУ типу,
  // поэтому рисует их одна разметка и фото не может остаться прочитанным лишь у
  // одной ветви — именно так `avatarUrl` из результатов поиска и мапился в никуда.
  // У фикстуры фото просто нет: ключ там отсутствует, и строка рисует инициал.
  const suggestions: ShareSuggestion[] = searchResults
    ? searchResults.map((member) => ({
        ...(member.avatarUrl ? { avatarUrl: member.avatarUrl } : {}),
        email: member.email,
        id: member.userId,
        name: member.name,
      }))
    : [...shareSuggestions]
  const searchStatus = searchResults
    ? searchLoading
      ? labels.searchLoading
      : inputValue.trim() && searchResults.length === 0
        ? labels.searchNoResults
        : ""
    : ""

  return (
    <Field>
      <Combobox
        filter={(candidate, query) => {
          const email = String(candidate)
          const suggestion = suggestions.find(
            (person) => person.email === email
          )
          const searchable = suggestion
            ? `${suggestion.name} ${suggestion.email}`
            : email

          return searchable
            .toLocaleLowerCase("ru-RU")
            .includes(query.trim().toLocaleLowerCase("ru-RU"))
        }}
        inputValue={inputValue}
        multiple
        onInputValueChange={onInputValueChange}
        onValueChange={(next) => onValueChange(next as string[])}
        value={value}
      >
        <ComboboxChips ref={anchor}>
          {value.map((email) => {
            const suggestion = suggestions.find(
              (person) => person.email === email
            )

            return (
              <ComboboxChip key={email}>
                {suggestion?.name ?? email}
              </ComboboxChip>
            )
          })}
          <ComboboxChipsInput
            aria-label={labels.addPeopleInputAriaLabel}
            autoFocus={autoFocus}
            // Neither the id nor the name may look account-shaped: "email" in an
            // identifier is one of the strongest signals a browser uses to decide
            // a field is a login username. A concrete, non-credential name also
            // defeats the empty-name heuristic. The autofill-suppressing
            // attributes come from ComboboxChipsInput.
            id="share-add-people"
            name="share-add-people"
            onKeyDown={onKeyDown}
            placeholder={
              value.length > 0 ? undefined : labels.addPeopleInputPlaceholder
            }
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          {searchResults ? (
            <ComboboxStatus
              className={searchStatus ? undefined : "sr-only p-0"}
            >
              {searchStatus}
            </ComboboxStatus>
          ) : null}
          <ComboboxList>
            {suggestions
              .filter(
                (person) =>
                  !existingPeople.some(
                    (existing) => existing.email === person.email
                  )
              )
              .map((person) => (
                <ComboboxItem
                  className="min-h-12"
                  key={person.id}
                  value={person.email}
                >
                  <MemberAvatar
                    avatarUrl={person.avatarUrl}
                    name={person.name}
                  />
                  <span className="min-w-0">
                    <span className="block truncate" title={person.name}>
                      {person.name}
                    </span>
                    <span
                      className="block truncate text-xs text-muted-foreground"
                      title={person.email}
                    >
                      {person.email}
                    </span>
                  </span>
                </ComboboxItem>
              ))}
            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue) &&
            !value.includes(inputValue) &&
            !existingPeople.some((person) => person.email === inputValue) ? (
              <ComboboxItem className="min-h-12" value={inputValue}>
                <Avatar>
                  <AvatarFallback tone={getAvatarFallbackTone(inputValue)}>
                    @
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate">{inputValue}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {labels.addByEmailHint}
                  </span>
                </span>
              </ComboboxItem>
            ) : null}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {showDescription ? (
        <FieldDescription>{labels.addPeopleFieldDescription}</FieldDescription>
      ) : null}
    </Field>
  )
}

function OrganizationAccessSelect({
  capabilities,
  labels,
  onSettingsChange,
  settings,
}: {
  // Собственный Select, а не ShareRoleSelect (к ролям здесь примешана
  // видимость), поэтому набор ролей приходится ограничивать и тут: пропусти это
  // место — и на режиме «МТС Линк» гейт был бы дырявым.
  capabilities: ShareAccessCapabilities | undefined
  labels: ShareAccessLabels
  onSettingsChange: (settings: ShareAccessSettings) => void
  settings: ShareAccessSettings
}) {
  return (
    <Select
      onValueChange={(value) => {
        const nextValue = value as ShareRole | ShareVisibility

        if (nextValue === "available" || nextValue === "link-only") {
          onSettingsChange(
            updateShareSettings(settings, { visibility: nextValue })
          )
          return
        }
        onSettingsChange(updateShareSettings(settings, { linkRole: nextValue }))
      }}
      value={settings.linkRole}
    >
      <SelectTrigger
        aria-label={labels.organizationRoleAriaLabel}
        className="w-36"
      >
        <SelectValue>{labels.roleNames[settings.linkRole]}</SelectValue>
      </SelectTrigger>
      <SelectContent className="w-80">
        <SelectGroup>
          {resolveShareRoleOptions(settings.linkRole, capabilities).map(
            (option) => (
              <SelectItem
                disabled={option.disabled}
                key={option.role}
                value={option.role}
              >
                {labels.roleNames[option.role]}
              </SelectItem>
            )
          )}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectItem
            className="pr-8 [&_[data-slot=select-item-text]]:overflow-visible [&_[data-slot=select-item-text]]:whitespace-normal"
            value="available"
          >
            {labels.visibilityNames.available}
            {settings.visibility === "available" ? (
              <Check className="pointer-events-none absolute right-2 size-4" />
            ) : null}
          </SelectItem>
          <SelectItem
            className="pr-8 [&_[data-slot=select-item-text]]:overflow-visible [&_[data-slot=select-item-text]]:whitespace-normal"
            value="link-only"
          >
            {labels.visibilityNames["link-only"]}
            {settings.visibility === "link-only" ? (
              <Check className="pointer-events-none absolute right-2 size-4" />
            ) : null}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function ShareStatusIndicators({
  itemName,
  labels,
  onOpenAccess,
  settings,
}: {
  itemName?: string
  labels: ShareAccessLabels
  onOpenAccess?: () => void
  settings?: ShareAccessSettings
}) {
  const shared =
    settings !== undefined &&
    (settings.accessMode !== "restricted" || settings.people.length > 0)

  if (!settings || !shared) {
    return null
  }

  return (
    <div
      aria-label={labels.statusIndicators.groupAriaLabel}
      className="flex shrink-0 items-center gap-1 text-muted-foreground"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            onOpenAccess ? (
              <Button
                aria-label={labels.statusIndicators.openAccessAriaLabel(
                  itemName
                )}
                className="size-5 text-muted-foreground"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenAccess()
                }}
                size="icon-xs"
                variant="ghost"
              />
            ) : (
              <span className="inline-flex size-5 items-center justify-center" />
            )
          }
        >
          <UsersRound className="size-4" />
        </TooltipTrigger>
        <TooltipContent>
          {onOpenAccess
            ? labels.statusIndicators.openAccessTooltip
            : labels.statusIndicators.sharedTooltip}
        </TooltipContent>
      </Tooltip>
      {settings.passwordEnabled ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="inline-flex size-5 items-center justify-center" />
            }
          >
            <LockKeyhole className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>
            {labels.statusIndicators.passwordProtectedTooltip}
          </TooltipContent>
        </Tooltip>
      ) : null}
      {!settings.viewersCanDownload ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="inline-flex size-5 items-center justify-center" />
            }
          >
            <ShieldCheck className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>
            {labels.statusIndicators.downloadDisabledTooltip}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}

export function ShareAccessDialog({
  capabilities,
  itemName,
  labels,
  linkUrl,
  onOpenChange,
  onSave,
  onSearchMembers,
  onSettingsChange,
  open,
  settings,
}: {
  /**
   * Что место разрешает предлагать на ЭТОМ объекте: набор ролей и наличие
   * пароля/срока у ссылки. Необязателен — без него диалог ведёт себя ровно как
   * раньше (три роли, полная безопасность ссылки).
   *
   * Знание, чего объект не умеет, принадлежит месту: тип узла и его политику
   * знает продукт, а не паттерн. Поэтому это не выводится из `itemKind` —
   * «файл» и «папка» ничего не говорят о том, живой ли это документ.
   */
  capabilities?: ShareAccessCapabilities
  itemKind?: "file" | "folder" | "multiple"
  itemName: string
  labels: ShareAccessLabels
  /**
   * The item's real share URL, copied by «Скопировать ссылку». The place owns
   * it: only the place knows the product's URL shape, and for most it exists
   * only once a link has actually been issued. Without it the footer button is
   * not rendered at all — better than offering a copy that yields nothing.
   */
  linkUrl?: string
  onOpenChange: (open: boolean) => void
  onSave: (settings: ShareAccessSettings) => void
  onSearchMembers?: (query: string) => Promise<ShareMemberProfile[]>
  onSettingsChange: (settings: ShareAccessSettings) => void
  open: boolean
  settings: ShareAccessSettings
}) {
  const [pendingEmails, setPendingEmails] = useState<string[]>([])
  const [pendingInputValue, setPendingInputValue] = useState("")
  const [pendingRole, setPendingRole] = useState<ShareRole>("viewer")
  const [memberResults, setMemberResults] = useState<ShareMemberProfile[]>([])
  const [memberSearchLoading, setMemberSearchLoading] = useState(false)
  const [notifyPeople, setNotifyPeople] = useState(true)
  const [notifyMessage, setNotifyMessage] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [expirationPickerOpen, setExpirationPickerOpen] = useState(false)
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [validationTimestamp, setValidationTimestamp] = useState(0)
  const [view, setView] = useState<"main" | "add" | "requests" | "settings">(
    "main"
  )
  const [peopleListCanScrollUp, setPeopleListCanScrollUp] = useState(false)
  const [peopleListCanScrollDown, setPeopleListCanScrollDown] = useState(false)
  const shareChipsAnchor = useComboboxAnchor()
  const peopleListViewportRef = useRef<HTMLDivElement | null>(null)
  const firstAccessRequest = settings.accessRequests[0]

  useEffect(() => {
    if (!onSearchMembers || pendingInputValue.trim().length < 1) {
      return
    }

    let active = true
    const timeout = window.setTimeout(() => {
      setMemberSearchLoading(true)
      void onSearchMembers(pendingInputValue.trim())
        .then((results) => {
          if (active) setMemberResults(results)
        })
        .finally(() => {
          if (active) setMemberSearchLoading(false)
        })
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [onSearchMembers, pendingInputValue])

  useEffect(() => {
    const viewport = peopleListViewportRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    )

    if (!viewport) {
      return
    }

    const updateScrollState = () => {
      setPeopleListCanScrollUp(viewport.scrollTop > 1)
      setPeopleListCanScrollDown(
        viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1
      )
    }

    updateScrollState()
    viewport.addEventListener("scroll", updateScrollState)
    return () => viewport.removeEventListener("scroll", updateScrollState)
  }, [settings.people.length, view])

  // Пароль и срок действия ссылки: и контролы, и их проверка живут под одним
  // флагом — предложить поле, которое сервер откажется принять, значит обещать
  // невозможное, а проверять поле, которого на экране нет, значит молча не
  // сохранять.
  const linkSecurityOffered = capabilities?.linkPasswordAndExpiration !== false
  // Роль будущих приглашений понижается до разрешённой ещё до отправки: иначе
  // «viewer» по умолчанию (или роль, оставшаяся от прошлого объекта) создала бы
  // грант вне набора.
  const offeredPendingRole = clampShareRole(pendingRole, capabilities)
  const { downloadLimitInvalid, expirationInvalid, passwordInvalid } =
    validateShareAccessSettings(settings, validationTimestamp, capabilities)
  const passwordErrorVisible = validationAttempted && passwordInvalid
  const expirationErrorVisible = validationAttempted && expirationInvalid
  const downloadLimitErrorVisible = validationAttempted && downloadLimitInvalid
  const expirationDate = parseDateTime(settings.expiresAt)
  const expirationTime = expirationDate
    ? `${String(expirationDate.getHours()).padStart(2, "0")}:${String(
        expirationDate.getMinutes()
      ).padStart(2, "0")}`
    : ""
  const expirationTimeOptions =
    expirationTime && !halfHourTimeOptions.includes(expirationTime)
      ? [...halfHourTimeOptions, expirationTime].sort()
      : halfHourTimeOptions

  const updateExpirationDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      return
    }

    const nextDate = new Date(selectedDate)
    const currentDate = expirationDate ?? new Date()
    nextDate.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0)
    onSettingsChange(
      updateShareSettings(settings, {
        expiresAt: toLocalDateTimeValue(nextDate),
      })
    )
    setExpirationPickerOpen(false)
  }

  const updateExpirationTime = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number)

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return
    }

    const nextDate = expirationDate ? new Date(expirationDate) : new Date()

    if (!expirationDate) {
      nextDate.setDate(nextDate.getDate() + 1)
    }

    nextDate.setHours(hours, minutes, 0, 0)
    onSettingsChange(
      updateShareSettings(settings, {
        expiresAt: toLocalDateTimeValue(nextDate),
      })
    )
  }

  const cancelPendingInvites = () => {
    setPendingEmails([])
    setPendingInputValue("")
    setNotifyPeople(true)
    setNotifyMessage("")
    setPendingRole("viewer")
    setView("main")
  }

  const goToMainView = () => setView("main")

  const sendInvites = () => {
    const newPeople: SharePerson[] = pendingEmails
      .filter(
        (email) => !settings.people.some((person) => person.email === email)
      )
      .map((email) => {
        const member = memberResults.find((person) => person.email === email)
        const suggestion =
          member ?? shareSuggestions.find((person) => person.email === email)

        return {
          // Фото приглашённого известно ровно в момент приглашения — из
          // результата поиска. Не перенеся его в строку, диалог показал бы
          // аватар в подсказке и инициал в той же самой строке секундой позже.
          //
          // Ключ появляется только когда фото ЕСТЬ: у строк, пришедших от места,
          // его при неизвестном фото нет вовсе, и две дороги в один список не
          // должны давать объекты разной формы — иначе `"avatarUrl" in person`
          // перестаёт значить «фото известно».
          ...(member?.avatarUrl ? { avatarUrl: member.avatarUrl } : {}),
          canDownload:
            offeredPendingRole === "editor"
              ? true
              : settings.viewersCanDownload,
          email,
          id: suggestion
            ? "userId" in suggestion
              ? `user-${suggestion.userId}`
              : suggestion.id
            : `invite-${email}`,
          name: suggestion?.name ?? email,
          role: offeredPendingRole,
        }
      })

    if (newPeople.length > 0) {
      onSettingsChange(
        updateShareSettings(settings, {
          people: [...settings.people, ...newPeople],
        })
      )
    }

    cancelPendingInvites()
  }

  const handlePendingValueChange = (value: string[]) => {
    if (view === "add" && pendingEmails.length > 0 && value.length === 0) {
      setView("main")
    }

    if (view === "main" && value.length > pendingEmails.length) {
      setView("add")
    }
    setPendingEmails(value)
    setPendingInputValue("")
  }

  const handlePendingKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const email = pendingInputValue.trim()

    if (
      event.key === "Enter" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      !pendingEmails.includes(email)
    ) {
      event.preventDefault()
      if (view === "main") {
        setView("add")
      }
      setPendingEmails((current) => [...current, email])
      setPendingInputValue("")
    }
  }

  const updatePerson = (
    personId: string,
    update: Partial<Pick<SharePerson, "canDownload" | "role">>
  ) => {
    onSettingsChange(
      updateShareSettings(settings, {
        people: settings.people.map((person) =>
          person.id === personId ? { ...person, ...update } : person
        ),
      })
    )
  }

  const removePerson = (personId: string) => {
    onSettingsChange(
      updateShareSettings(settings, {
        people: settings.people.filter((person) => person.id !== personId),
      })
    )
  }

  const updateAccessRequestRole = (
    requestId: string,
    requestedRole: ShareRole
  ) => {
    onSettingsChange(
      updateShareSettings(settings, {
        accessRequests: settings.accessRequests.map((request) =>
          request.id === requestId ? { ...request, requestedRole } : request
        ),
      })
    )
  }

  const rejectAccessRequest = (requestId: string) => {
    const accessRequests = settings.accessRequests.filter(
      (request) => request.id !== requestId
    )

    onSettingsChange(updateShareSettings(settings, { accessRequests }))

    if (accessRequests.length === 0) {
      setView("main")
    }
  }

  const acceptAccessRequest = (request: ShareAccessRequest) => {
    const existingPerson = settings.people.find(
      (person) => person.email === request.email
    )
    const accessRequests = settings.accessRequests.filter(
      (candidate) => candidate.id !== request.id
    )
    // Запрошенная роль остаётся видна в списке запросов как есть — это правда о
    // том, что человек просил. А ВЫДАЁТСЯ разрешённая: грант, который продукт
    // не может исполнить, показал бы владельцу одно, а сервер сохранил бы
    // другое, молча понизив роль.
    const grantedRole = clampShareRole(request.requestedRole, capabilities)
    const personUpdate = {
      canDownload:
        grantedRole === "editor" ? true : settings.viewersCanDownload,
      role: grantedRole,
    }
    const people = existingPerson
      ? settings.people.map((person) =>
          person.id === existingPerson.id
            ? { ...person, ...personUpdate }
            : person
        )
      : [
          ...settings.people,
          {
            ...personUpdate,
            // Лицо просителя место уже показывало в списке запросов — в строке
            // доступа оно то же самое. Ключ, как и при приглашении, появляется
            // только когда фото есть.
            ...(request.avatarUrl ? { avatarUrl: request.avatarUrl } : {}),
            email: request.email,
            id: `access-${request.id}`,
            name: request.name,
          },
        ]

    onSettingsChange(
      updateShareSettings(settings, {
        accessRequests,
        people,
      })
    )

    if (accessRequests.length === 0) {
      setView("main")
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      cancelPendingInvites()
      setLinkCopied(false)
      setShowPassword(false)
      setValidationAttempted(false)
      setValidationTimestamp(0)
    }

    onOpenChange(nextOpen)
  }

  const handleDone = () => {
    const submittedAt = Date.now()
    // Пересчёт по времени НАЖАТИЯ, а не по стейлому `validationTimestamp`:
    // иначе срок, истёкший пока диалог открыт, прошёл бы как валидный.
    const submission = validateShareAccessSettings(
      settings,
      submittedAt,
      capabilities
    )

    setValidationTimestamp(submittedAt)

    if (!submission.valid) {
      setValidationAttempted(true)
      return
    }

    setValidationAttempted(false)
    setValidationTimestamp(0)
    setView("main")
    // Пробельный черновик отдаётся как ПУСТОЙ, потому что именно так диалог его и
    // судил: проверка смотрит на `trim()`, то есть «   » для неё — незаполненное
    // поле, и при уже установленном пароле она пропускает сохранение со словами
    // «прежний пароль сохранится». На сервере же «пусто» и «восемь пробелов» —
    // разные ветви: первая оставляет хеш, вторая проходит проверку длины и МОЛЧА
    // заменяет пароль на пробелы. Отдать черновик как есть значило бы сделать то,
    // о чём владельцу только что сказали обратное.
    onSave(
      settings.password.length > 0 && settings.password.trim().length === 0
        ? updateShareSettings(settings, { password: "" })
        : settings
    )
  }

  const copyShareLink = () => {
    if (!linkUrl) return

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(linkUrl)
    }

    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 1800)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className="grid-rows-[auto_minmax(0,1fr)_auto] p-0"
        scrollable
        size="xl"
        initialFocus={() =>
          document.querySelector<HTMLInputElement>(
            `[aria-label="${labels.addPeopleInputAriaLabel}"]`
          )
        }
        showCloseButton={false}
      >
        {view === "main" ? (
          <>
            <DialogHeader className="flex-row items-center gap-2 px-4 pt-4">
              {/* `title` — не украшение: обрезанное многоточием имя иначе
                  НЕДОСТИЖИМО ничем, даже наведением, а имя файла и есть ответ на
                  «чем я делюсь». Тот же атрибут стоит на каждой строке, которую
                  диалог тримает: имена людей, адреса, имя объекта в остальных
                  трёх видах. */}
              <DialogTitle
                className="flex-1 text-lg"
                title={labels.dialogTitle(itemName)}
                truncate
              >
                {labels.dialogTitle(itemName)}
              </DialogTitle>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label={labels.settingsButtonAriaLabel}
                      onClick={() => setView("settings")}
                      size="icon-sm"
                      variant="ghost"
                    />
                  }
                >
                  <Settings />
                </TooltipTrigger>
                <TooltipContent>{labels.settingsTooltip}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DialogClose
                      render={
                        <Button
                          aria-label={labels.closeButtonAriaLabel}
                          size="icon-sm"
                          variant="ghost"
                        />
                      }
                    />
                  }
                >
                  <X />
                </TooltipTrigger>
                <TooltipContent>{labels.closeTooltip}</TooltipContent>
              </Tooltip>
              <DialogDescription className="sr-only">
                {labels.dialogDescription}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="min-h-0">
              <FieldGroup className="gap-4 px-4 pt-1 pb-0">
                {settings.accessRequests.length > 1 ? (
                  <Alert className="flex items-center gap-3 rounded-lg border-0 bg-muted/50 p-3 has-data-[slot=alert-action]:pr-3 *:[svg]:translate-y-0">
                    <AvatarGroup>
                      {settings.accessRequests.slice(0, 3).map((request) => (
                        <Tooltip key={request.id}>
                          <TooltipTrigger
                            render={
                              <Avatar aria-label={request.name} size="sm" />
                            }
                          >
                            <MemberAvatarContent
                              avatarUrl={request.avatarUrl}
                              name={request.name}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{request.name}</TooltipContent>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                    <AlertTitle className="min-w-0 flex-1">
                      {labels.accessRequestCount(
                        settings.accessRequests.length
                      )}
                    </AlertTitle>
                    <AlertAction className="static">
                      <Button
                        onClick={() => setView("requests")}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        {labels.viewRequestsButton}
                      </Button>
                    </AlertAction>
                  </Alert>
                ) : firstAccessRequest ? (
                  // Кнопка — обычный флекс-сосед (`AlertAction className="static"`),
                  // как в соседнем виде с несколькими запросами, а не абсолютный
                  // блок с резервом `pr-28`. Резерв был меньше кнопки: измерено —
                  // «Посмотреть» шире 112px, и бокс имени заходил ПОД кнопку на
                  // 36px, то есть достаточно чуть более длинного ФИО, чтобы текст
                  // печатался под ней. Реальная раскладка не может разъехаться с
                  // шириной кнопки, магическое число — может (и в другом языке
                  // разъедется наверняка).
                  <Alert className="flex items-center gap-3 has-data-[slot=alert-action]:pr-2.5">
                    <MemberAvatar
                      avatarUrl={firstAccessRequest.avatarUrl}
                      name={firstAccessRequest.name}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <AlertTitle
                        className="truncate"
                        title={firstAccessRequest.name}
                      >
                        {firstAccessRequest.name}
                      </AlertTitle>
                      <AlertDescription>
                        {labels.requestsRoleRequested(
                          labels.roleNames[firstAccessRequest.requestedRole]
                        )}
                      </AlertDescription>
                    </span>
                    <AlertAction className="static shrink-0">
                      <Button
                        onClick={() => setView("requests")}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        {labels.viewRequestsButton}
                      </Button>
                    </AlertAction>
                  </Alert>
                ) : null}

                <AddPeopleCombobox
                  anchor={shareChipsAnchor}
                  existingPeople={settings.people}
                  inputValue={pendingInputValue}
                  labels={labels}
                  onInputValueChange={setPendingInputValue}
                  onKeyDown={handlePendingKeyDown}
                  onValueChange={handlePendingValueChange}
                  searchLoading={
                    pendingInputValue.trim() ? memberSearchLoading : false
                  }
                  searchResults={
                    onSearchMembers
                      ? pendingInputValue.trim()
                        ? memberResults
                        : []
                      : undefined
                  }
                  showDescription={false}
                  value={pendingEmails}
                />

                <FieldSet>
                  <FieldLegend className="font-semibold text-muted-foreground data-[variant=legend]:text-xs">
                    {labels.peopleWithAccessLegend}
                  </FieldLegend>
                  <div className="relative">
                    <ScrollArea
                      className="max-h-72"
                      ref={peopleListViewportRef}
                      viewportClassName="max-h-72"
                    >
                      <ItemGroup className="!gap-1">
                        {settings.owner ? (
                          <Item className="px-0 py-1" size="sm">
                            <ItemMedia>
                              <MemberAvatar
                                avatarUrl={settings.owner.avatarUrl}
                                name={settings.owner.name}
                                size="lg"
                              />
                            </ItemMedia>
                            <ItemContent>
                              {/* Имя — в `<span className="truncate">`, а не
                                  текстом прямо в `ItemTitle`: у того `display:flex`,
                                  а `text-overflow` к анонимному флекс-элементу с
                                  текстом не применяется, так что без потомка имя не
                                  тримается, а на неразрывном значении (адрес вместо
                                  имени — обычный случай у потребителя) ещё и
                                  переносится во вторую строку. Тот же приём и в
                                  `file-grid`. */}
                              <ItemTitle title={settings.owner.name}>
                                <span className="truncate">
                                  {settings.owner.name}
                                </span>
                              </ItemTitle>
                              <span
                                className="truncate text-xs text-muted-foreground"
                                title={settings.owner.email}
                              >
                                {settings.owner.email}
                              </span>
                            </ItemContent>
                            <ItemActions>
                              <span className="text-sm text-muted-foreground">
                                {labels.ownerRoleLabel}
                              </span>
                            </ItemActions>
                          </Item>
                        ) : null}
                        {settings.people.map((person) => (
                          <Item className="px-0 py-1" key={person.id} size="sm">
                            <ItemMedia>
                              <MemberAvatar
                                avatarUrl={person.avatarUrl}
                                name={person.name}
                                size="lg"
                              />
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle title={person.name}>
                                <span className="truncate">{person.name}</span>
                              </ItemTitle>
                              <span
                                className="truncate text-xs text-muted-foreground"
                                title={person.email}
                              >
                                {person.email}
                              </span>
                            </ItemContent>
                            <ItemActions className="ml-auto">
                              <ShareRoleSelect
                                capabilities={capabilities}
                                labels={labels}
                                onValueChange={(role) =>
                                  updatePerson(person.id, {
                                    canDownload:
                                      role === "editor"
                                        ? true
                                        : person.canDownload,
                                    role,
                                  })
                                }
                                value={person.role}
                              />
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      aria-label={labels.removePersonAriaLabel(
                                        person.name
                                      )}
                                      onClick={() => removePerson(person.id)}
                                      size="icon"
                                      variant="ghost"
                                    />
                                  }
                                >
                                  <UserRoundX />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {labels.removePersonTooltip}
                                </TooltipContent>
                              </Tooltip>
                            </ItemActions>
                          </Item>
                        ))}
                      </ItemGroup>
                    </ScrollArea>
                    <div
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-popover to-transparent transition-opacity",
                        peopleListCanScrollUp ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-popover to-transparent transition-opacity",
                        peopleListCanScrollDown ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </FieldSet>

                <Separator className="-mt-2" />

                <FieldSet>
                  <FieldLegend className="font-semibold text-muted-foreground data-[variant=legend]:text-xs">
                    {labels.generalAccessLegend}
                  </FieldLegend>
                  <Item className="px-0" size="sm">
                    <ItemMedia
                      className="mt-0.5 size-10 self-start rounded-full bg-muted"
                      variant="icon"
                    >
                      {settings.accessMode === "restricted" ? (
                        <LockKeyhole />
                      ) : settings.accessMode === "organization" ? (
                        <UsersRound />
                      ) : (
                        <Globe2 />
                      )}
                    </ItemMedia>
                    <ItemContent>
                      <Select
                        onValueChange={(value) =>
                          onSettingsChange(
                            updateShareSettings(settings, {
                              accessMode: value as ShareAccessMode,
                            })
                          )
                        }
                        value={settings.accessMode}
                      >
                        <SelectTrigger
                          aria-label={labels.accessModeAriaLabel}
                          id="share-access-mode"
                          width="content"
                        >
                          <SelectValue>
                            {labels.modeNames[settings.accessMode]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-64">
                          <SelectGroup>
                            <SelectItem
                              className="[&_[data-slot=select-item-text]]:overflow-visible [&_[data-slot=select-item-text]]:whitespace-normal"
                              value="restricted"
                            >
                              {labels.modeNames.restricted}
                            </SelectItem>
                            <SelectItem
                              className="[&_[data-slot=select-item-text]]:overflow-visible [&_[data-slot=select-item-text]]:whitespace-normal"
                              value="link"
                            >
                              {labels.modeNames.link}
                            </SelectItem>
                            <SelectItem
                              className="[&_[data-slot=select-item-text]]:overflow-visible [&_[data-slot=select-item-text]]:whitespace-normal"
                              value="organization"
                            >
                              {labels.modeNames.organization}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {labels.accessModeDescriptions[settings.accessMode]}
                      </FieldDescription>
                    </ItemContent>
                    {settings.accessMode !== "restricted" ? (
                      <ItemActions className="ml-auto">
                        {settings.accessMode === "organization" ? (
                          <OrganizationAccessSelect
                            capabilities={capabilities}
                            labels={labels}
                            onSettingsChange={onSettingsChange}
                            settings={settings}
                          />
                        ) : (
                          <ShareRoleSelect
                            capabilities={capabilities}
                            labels={labels}
                            onValueChange={(linkRole) =>
                              onSettingsChange(
                                updateShareSettings(settings, { linkRole })
                              )
                            }
                            value={settings.linkRole}
                          />
                        )}
                      </ItemActions>
                    ) : null}
                  </Item>
                </FieldSet>
              </FieldGroup>
            </ScrollArea>

            <DialogFooter className="m-0 rounded-b-xl px-4 py-4 sm:justify-between">
              {linkUrl ? (
                <Button onClick={copyShareLink} type="button" variant="outline">
                  <Link2 data-icon="inline-start" />
                  {linkCopied ? labels.linkCopied : labels.copyLink}
                </Button>
              ) : (
                <span />
              )}
              <Button onClick={handleDone} type="button">
                {labels.done}
              </Button>
            </DialogFooter>
          </>
        ) : view === "add" ? (
          <>
            <DialogHeader className="flex-row items-center gap-2 px-4 pt-4">
              <Button
                aria-label={labels.backButtonAriaLabel}
                onClick={goToMainView}
                size="icon-sm"
                variant="ghost"
              >
                <ArrowLeft />
              </Button>
              <span className="min-w-0">
                <DialogTitle className="text-lg">
                  {labels.addPeopleTitle}
                </DialogTitle>
                <DialogDescription className="mt-1 truncate" title={itemName}>
                  {itemName}
                </DialogDescription>
              </span>
            </DialogHeader>

            <ScrollArea className="min-h-0">
              <FieldGroup className="gap-4 px-4 pt-1 pb-4">
                <AddPeopleCombobox
                  anchor={shareChipsAnchor}
                  autoFocus
                  existingPeople={settings.people}
                  inputValue={pendingInputValue}
                  labels={labels}
                  onInputValueChange={setPendingInputValue}
                  onKeyDown={handlePendingKeyDown}
                  onValueChange={handlePendingValueChange}
                  searchLoading={
                    pendingInputValue.trim() ? memberSearchLoading : false
                  }
                  searchResults={
                    onSearchMembers
                      ? pendingInputValue.trim()
                        ? memberResults
                        : []
                      : undefined
                  }
                  showDescription={false}
                  value={pendingEmails}
                />

                <FieldSet>
                  <FieldLegend>{labels.newPeopleRoleLegend}</FieldLegend>
                  <ShareRoleSelect
                    capabilities={capabilities}
                    labels={labels}
                    onValueChange={setPendingRole}
                    value={offeredPendingRole}
                  />
                </FieldSet>

                <Separator />

                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{labels.notifyTitle}</FieldTitle>
                  </FieldContent>
                  <Switch
                    aria-label={labels.notifyAriaLabel}
                    checked={notifyPeople}
                    onCheckedChange={setNotifyPeople}
                  />
                </Field>
                {notifyPeople ? (
                  <Textarea
                    aria-label={labels.messageAriaLabel}
                    onChange={(event) => setNotifyMessage(event.target.value)}
                    placeholder={labels.messagePlaceholder}
                    value={notifyMessage}
                  />
                ) : null}
              </FieldGroup>
            </ScrollArea>

            <DialogFooter className="m-0 rounded-b-xl px-4 py-4">
              <Button onClick={goToMainView} type="button" variant="outline">
                {labels.back}
              </Button>
              <Button
                disabled={pendingEmails.length === 0}
                onClick={sendInvites}
                type="button"
              >
                {notifyPeople ? labels.send : labels.share}
              </Button>
            </DialogFooter>
          </>
        ) : view === "requests" ? (
          <>
            <DialogHeader className="flex-row items-start gap-3 px-4 pt-4">
              <Button
                aria-label={labels.backButtonAriaLabel}
                onClick={goToMainView}
                size="icon-sm"
                variant="ghost"
              >
                <ArrowLeft />
              </Button>
              <DialogTitle
                className="flex-1 text-lg"
                title={labels.requestsTitle(itemName)}
                truncate
              >
                {labels.requestsTitle(itemName)}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="min-h-0">
              <FieldGroup className="gap-4 px-4 pt-1 pb-0">
                <ItemGroup className="gap-1">
                  {settings.accessRequests.map((request) => (
                    <Item
                      className="flex-nowrap px-0 py-1.5"
                      key={request.id}
                      size="sm"
                    >
                      <ItemMedia>
                        <MemberAvatar
                          avatarUrl={request.avatarUrl}
                          name={request.name}
                          size="lg"
                        />
                      </ItemMedia>
                      <ItemContent className="min-w-0">
                        <ItemTitle title={request.name}>
                          <span className="truncate">{request.name}</span>
                        </ItemTitle>
                        <span
                          className="truncate text-xs text-muted-foreground"
                          title={request.email}
                        >
                          {request.email}
                        </span>
                      </ItemContent>
                      <ItemActions className="ml-auto shrink-0">
                        <ShareRoleSelect
                          ariaLabel={labels.roleForPersonAriaLabel(
                            request.name
                          )}
                          capabilities={capabilities}
                          labels={labels}
                          onValueChange={(requestedRole) =>
                            updateAccessRequestRole(request.id, requestedRole)
                          }
                          size="sm"
                          value={request.requestedRole}
                        />
                        <Button
                          onClick={() => rejectAccessRequest(request.id)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          {labels.reject}
                        </Button>
                        <Button
                          onClick={() => acceptAccessRequest(request)}
                          size="sm"
                          type="button"
                        >
                          {labels.accept}
                        </Button>
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
              </FieldGroup>
            </ScrollArea>
          </>
        ) : (
          <>
            <DialogHeader className="flex-row items-start gap-3 px-4 pt-4">
              <Button
                aria-label={labels.backButtonAriaLabel}
                onClick={goToMainView}
                size="icon-sm"
                variant="ghost"
              >
                <ArrowLeft />
              </Button>
              <span className="min-w-0">
                <DialogTitle className="text-lg">
                  {labels.settingsTitle}
                </DialogTitle>
                <DialogDescription className="mt-1 truncate" title={itemName}>
                  {itemName}
                </DialogDescription>
              </span>
            </DialogHeader>

            <ScrollArea className="min-h-0">
              <FieldGroup className="gap-4 px-4 pt-1 pb-4">
                <FieldSet>
                  <FieldLegend>{labels.generalPermissionsLegend}</FieldLegend>
                  {/* Скрыт, а не заблокирован: выключенный переключатель читается как
                      «выключено», хотя на самом деле он может быть включён — просто
                      этому человеку его не менять. Показать неверное состояние хуже,
                      чем не показать никакого. */}
                  {capabilities?.manageEditorResharing !== false ? (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{labels.editorsCanManageTitle}</FieldTitle>
                        <FieldDescription>
                          {labels.editorsCanManageDescription}
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        aria-label={labels.editorsCanManageAriaLabel}
                        checked={settings.editorsCanManage}
                        onCheckedChange={(editorsCanManage) =>
                          onSettingsChange(
                            updateShareSettings(settings, { editorsCanManage })
                          )
                        }
                      />
                    </Field>
                  ) : null}
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{labels.viewersCanDownloadTitle}</FieldTitle>
                      <FieldDescription>
                        {labels.viewersCanDownloadDescription}
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      aria-label={labels.viewersCanDownloadAriaLabel}
                      checked={settings.viewersCanDownload}
                      onCheckedChange={(viewersCanDownload) =>
                        onSettingsChange(
                          updateShareSettings(settings, {
                            people: settings.people.map((person) => ({
                              ...person,
                              canDownload:
                                person.role === "editor"
                                  ? true
                                  : viewersCanDownload,
                            })),
                            viewersCanDownload,
                          })
                        )
                      }
                    />
                  </Field>
                </FieldSet>

                {settings.people.some((person) => person.role !== "editor") ? (
                  <>
                    <Separator />
                    <FieldSet>
                      <FieldLegend>{labels.userPermissionsLegend}</FieldLegend>
                      {settings.people
                        .filter((person) => person.role !== "editor")
                        .map((person) => (
                          <Field key={person.id} orientation="horizontal">
                            <FieldContent>
                              {/* Имя — в обрезающем потомке и с `title`, как в
                                  списке доступа: подпись поля это имя человека, то
                                  есть строка неограниченной длины и без гарантии
                                  точек переноса. */}
                              <FieldTitle title={person.name}>
                                <span className="truncate">{person.name}</span>
                              </FieldTitle>
                              <FieldDescription>
                                {labels.perPersonDownloadDescription}
                              </FieldDescription>
                            </FieldContent>
                            <Switch
                              aria-label={labels.perPersonDownloadAriaLabel(
                                person.name
                              )}
                              checked={person.canDownload}
                              onCheckedChange={(checked) =>
                                updatePerson(person.id, {
                                  canDownload: checked,
                                })
                              }
                            />
                          </Field>
                        ))}
                    </FieldSet>
                  </>
                ) : null}

                {settings.accessMode === "link" ? (
                  <>
                    <Separator />
                    <FieldSet>
                      <FieldLegend>{labels.linkSecurityLegend}</FieldLegend>
                      <Alert variant="warning">
                        <TriangleAlert />
                        <AlertDescription>
                          {labels.linkSecurityWarning(
                            linkSecurityOffered && settings.passwordEnabled
                          )}
                        </AlertDescription>
                      </Alert>

                      {linkSecurityOffered ? (
                        <>
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>
                                {labels.passwordProtectTitle}
                              </FieldTitle>
                              <FieldDescription>
                                {labels.passwordProtectDescription}
                              </FieldDescription>
                            </FieldContent>
                            <Switch
                              aria-label={labels.passwordProtectAriaLabel}
                              checked={settings.passwordEnabled}
                              onCheckedChange={(passwordEnabled) =>
                                onSettingsChange(
                                  updateShareSettings(settings, {
                                    passwordEnabled,
                                  })
                                )
                              }
                            />
                          </Field>
                          {settings.passwordEnabled ? (
                            <Field data-invalid={passwordErrorVisible}>
                              <InputGroup>
                                <InputGroupAddon>
                                  <LockKeyhole />
                                </InputGroupAddon>
                                <InputGroupInput
                                  aria-label={labels.passwordInputAriaLabel}
                                  aria-invalid={passwordErrorVisible}
                                  id="share-password"
                                  onChange={(event) =>
                                    onSettingsChange(
                                      updateShareSettings(settings, {
                                        password: event.target.value,
                                      })
                                    )
                                  }
                                  placeholder={
                                    settings.passwordSet
                                      ? (labels.passwordSetPlaceholder ??
                                        ruShareAccessLabels.passwordSetPlaceholder)
                                      : labels.passwordPlaceholder
                                  }
                                  type={showPassword ? "text" : "password"}
                                  value={settings.password}
                                />
                                <InputGroupAddon align="inline-end">
                                  <InputGroupButton
                                    aria-label={
                                      showPassword
                                        ? labels.hidePassword
                                        : labels.showPassword
                                    }
                                    onClick={() =>
                                      setShowPassword((current) => !current)
                                    }
                                    size="icon-xs"
                                  >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                  </InputGroupButton>
                                </InputGroupAddon>
                              </InputGroup>
                              {settings.passwordSet ? (
                                <FieldDescription>
                                  {labels.passwordSetHint ??
                                    ruShareAccessLabels.passwordSetHint}
                                </FieldDescription>
                              ) : null}
                              {passwordErrorVisible ? (
                                <FieldError>{labels.passwordError}</FieldError>
                              ) : null}
                            </Field>
                          ) : null}

                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>{labels.expirationTitle}</FieldTitle>
                              <FieldDescription>
                                {labels.expirationDescription}
                              </FieldDescription>
                            </FieldContent>
                            <Switch
                              aria-label={labels.expirationAriaLabel}
                              checked={settings.expiresEnabled}
                              onCheckedChange={(expiresEnabled) =>
                                onSettingsChange(
                                  updateShareSettings(settings, {
                                    expiresEnabled,
                                  })
                                )
                              }
                            />
                          </Field>
                          {settings.expiresEnabled ? (
                            <Field data-invalid={expirationErrorVisible}>
                              <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
                                <Popover
                                  onOpenChange={setExpirationPickerOpen}
                                  open={expirationPickerOpen}
                                >
                                  <PopoverTrigger
                                    render={
                                      <Button
                                        aria-invalid={expirationErrorVisible}
                                        className="justify-start font-normal"
                                        type="button"
                                        variant="outline"
                                      />
                                    }
                                  >
                                    <CalendarDays data-icon="inline-start" />
                                    {expirationDate
                                      ? expirationDate.toLocaleDateString(
                                          "ru-RU"
                                        )
                                      : labels.chooseDate}
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="start"
                                    className="w-auto p-0"
                                  >
                                    <Calendar
                                      locale={ru}
                                      mode="single"
                                      onSelect={updateExpirationDate}
                                      selected={expirationDate}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <Select
                                  onValueChange={(value) => {
                                    if (value) {
                                      updateExpirationTime(value)
                                    }
                                  }}
                                  value={expirationTime}
                                >
                                  <SelectTrigger
                                    aria-label={labels.timeLabel}
                                    aria-invalid={expirationErrorVisible}
                                    className="w-full"
                                    id="share-expiration-time"
                                  >
                                    <SelectValue>
                                      {expirationTime || labels.timeLabel}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent
                                    align="end"
                                    alignItemWithTrigger={false}
                                    className="max-h-64 min-w-0"
                                  >
                                    <SelectGroup>
                                      {expirationTimeOptions.map((time) => (
                                        <SelectItem key={time} value={time}>
                                          {time}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                              {expirationErrorVisible ? (
                                <FieldError>
                                  {labels.expirationError}
                                </FieldError>
                              ) : null}
                            </Field>
                          ) : null}
                        </>
                      ) : (
                        // Контролов нет — значит на их месте обязана быть
                        // причина. Иначе владелец видит раздел, в котором
                        // необъяснимо не хватает двух тумблеров.
                        <FieldDescription>
                          {labels.linkPasswordAndExpirationUnavailable ??
                            ruShareAccessLabels.linkPasswordAndExpirationUnavailable}
                        </FieldDescription>
                      )}

                      {/* Лимит скачиваний СНАРУЖИ флага: его сервер принимает и
                          для такой ссылки, и гасить его вместе с паролем значило
                          бы отнять рабочую возможность. */}
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>{labels.downloadLimitTitle}</FieldTitle>
                          <FieldDescription>
                            {labels.downloadLimitDescription}
                          </FieldDescription>
                        </FieldContent>
                        <Switch
                          aria-label={labels.downloadLimitAriaLabel}
                          checked={settings.downloadLimitEnabled}
                          onCheckedChange={(downloadLimitEnabled) =>
                            onSettingsChange(
                              updateShareSettings(settings, {
                                downloadLimitEnabled,
                              })
                            )
                          }
                        />
                      </Field>
                      {settings.downloadLimitEnabled ? (
                        <Field data-invalid={downloadLimitErrorVisible}>
                          <Input
                            aria-label={labels.downloadLimitInputAriaLabel}
                            aria-invalid={downloadLimitErrorVisible}
                            id="share-download-limit"
                            inputMode="numeric"
                            onChange={(event) => {
                              const value = event.target.value

                              if (!/^\d+$/.test(value)) {
                                return
                              }

                              const downloadLimit = Number(value)

                              if (!Number.isSafeInteger(downloadLimit)) {
                                return
                              }

                              onSettingsChange(
                                updateShareSettings(settings, {
                                  downloadLimit: Math.max(1, downloadLimit),
                                })
                              )
                            }}
                            pattern="[0-9]*"
                            type="text"
                            value={settings.downloadLimit}
                          />
                          {downloadLimitErrorVisible ? (
                            <FieldError>{labels.downloadLimitError}</FieldError>
                          ) : null}
                        </Field>
                      ) : null}
                    </FieldSet>
                  </>
                ) : null}
              </FieldGroup>
            </ScrollArea>

            <DialogFooter className="m-0 rounded-b-xl px-4 py-4">
              <Button onClick={goToMainView} variant="outline">
                {labels.back}
              </Button>
              <Button onClick={handleDone} type="button">
                {labels.done}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function ShareLinkPasswordDialog({
  labels,
  onOpenChange,
  open,
}: {
  labels: ShareAccessLabels
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
            <LockKeyhole className="size-6" />
          </div>
          <DialogTitle>{labels.passwordDialog.title}</DialogTitle>
          <DialogDescription>
            {labels.passwordDialog.description}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="protected-link-password">
              {labels.passwordDialog.passwordLabel}
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="protected-link-password"
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label={
                    showPassword ? labels.hidePassword : labels.showPassword
                  }
                  onClick={() => setShowPassword((current) => !current)}
                  size="icon-xs"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {labels.passwordDialog.cancel}
          </Button>
          <Button
            disabled={password.length < 8}
            onClick={() => onOpenChange(false)}
          >
            {labels.passwordDialog.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ShareLinkUnavailableDialog({
  labels,
  onOpenChange,
  open,
  reason,
}: {
  labels: ShareAccessLabels
  onOpenChange: (open: boolean) => void
  open: boolean
  reason: "expired" | "limit"
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
            {reason === "expired" ? (
              <Clock3 className="size-6" />
            ) : (
              <Download className="size-6" />
            )}
          </div>
          <DialogTitle>
            {reason === "expired"
              ? labels.unavailableDialog.expiredTitle
              : labels.unavailableDialog.limitTitle}
          </DialogTitle>
          <DialogDescription>
            {reason === "expired"
              ? labels.unavailableDialog.expiredDescription
              : labels.unavailableDialog.limitDescription}
          </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>
            {reason === "expired"
              ? labels.unavailableDialog.expiredErrorTitle
              : labels.unavailableDialog.limitErrorTitle}
          </AlertTitle>
          <AlertDescription>
            {labels.unavailableDialog.errorDescription}
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {labels.unavailableDialog.dismiss}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
