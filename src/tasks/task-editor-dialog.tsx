"use client"

import { useId, useMemo, useState, type FormEvent } from "react"
import { CalendarDays, Trash2, UserRound, X } from "@scrambled/ui-kit/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Calendar,
  Checkbox,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@scrambled/ui-kit"

import type {
  TaskAssigneeOption,
  TaskStatus,
  TaskUpdateDraft,
  TaskViewModel,
  TasksScreenFormatters,
  TasksScreenLabels,
} from "./contract"
import { ruTasksScreenLabels } from "./labels"

// pattern-reuse: ShareAccessDialog — он управляет доступом, ролями и группой
// получателей; редактору задачи нужны один исполнитель и срок без access-контракта.

type TaskEditorMode = "create" | "edit"

interface TaskEditorDialogProps {
  assigneeOptions: readonly TaskAssigneeOption[]
  canComplete: boolean
  canDelete: boolean
  currentUserId?: string
  formatters: TasksScreenFormatters
  labels: TasksScreenLabels["create"]
  mode: TaskEditorMode
  onDelete?: () => void
  onOpenChange: (open: boolean) => void
  onStatusChange?: (status: TaskStatus) => void
  onSubmit: (draft: TaskUpdateDraft) => void
  task?: TaskViewModel
}

function initials(name: string, locale: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase(locale)
}

function parseDateValue(value?: string) {
  if (!value) return undefined

  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined

  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toDateValue(date?: Date) {
  if (!date) return undefined

  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function TaskEditorDialog({
  assigneeOptions,
  canComplete,
  canDelete,
  currentUserId,
  formatters,
  labels,
  mode,
  onDelete,
  onOpenChange,
  onStatusChange,
  onSubmit,
  task,
}: TaskEditorDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const assigneeInputId = useId()
  const deadlineInputId = useId()
  const defaultAssigneeId =
    currentUserId ??
    assigneeOptions.find((option) => option.isCurrentUser)?.id ??
    null
  const initialAssigneeId = task
    ? (task.assigneeId ??
      assigneeOptions.find((option) => option.name === task.assignee)?.id ??
      null)
    : defaultAssigneeId
  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [assigneeId, setAssigneeId] = useState<string | null>(initialAssigneeId)
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  // Строка поиска живёт ТОЛЬКО пока список открыт. Закрытый инпут показывает имя
  // выбранного — выводом, а не записью в состояние: раньше обработчик закрытия
  // писал туда `selectedAssignee?.name`, посчитанный по ещё старому id, и поле
  // показывало предыдущего исполнителя, хотя выбран был новый.
  const [assigneeQuery, setAssigneeQuery] = useState("")
  const [deadline, setDeadline] = useState<Date | undefined>(
    parseDateValue(task?.deadlineValue)
  )
  const [deadlineOpen, setDeadlineOpen] = useState(false)
  const [completed, setCompleted] = useState(task?.status === "completed")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)
  const selectedAssignee = useMemo(
    () => assigneeOptions.find((option) => option.id === assigneeId),
    [assigneeId, assigneeOptions]
  )
  const assigneeInputValue = assigneeOpen
    ? assigneeQuery
    : (selectedAssignee?.name ?? "")
  const filteredAssigneeOptions = useMemo(() => {
    const query = assigneeQuery.trim().toLocaleLowerCase(formatters.locale)
    if (!query) return assigneeOptions

    return assigneeOptions.filter((option) =>
      option.name.toLocaleLowerCase(formatters.locale).includes(query)
    )
  }, [assigneeOptions, assigneeQuery, formatters.locale])
  const disabled = title.trim().length === 0
  const referenceLabels = ruTasksScreenLabels.create
  const assigneeLabel =
    labels.assigneeLabel ?? referenceLabels.assigneeLabel ?? labels.titleLabel
  const assigneePlaceholder =
    labels.assigneePlaceholder ??
    referenceLabels.assigneePlaceholder ??
    assigneeLabel
  const assigneeSearchPlaceholder =
    labels.assigneeSearchPlaceholder ??
    referenceLabels.assigneeSearchPlaceholder ??
    assigneePlaceholder
  const assigneeEmpty =
    labels.assigneeEmpty ?? referenceLabels.assigneeEmpty ?? assigneePlaceholder
  const deadlineLabel =
    labels.deadlineLabel ?? referenceLabels.deadlineLabel ?? labels.titleLabel
  const deadlinePlaceholder =
    labels.deadlinePlaceholder ??
    referenceLabels.deadlinePlaceholder ??
    deadlineLabel
  const deadlineClear =
    labels.deadlineClear ?? referenceLabels.deadlineClear ?? labels.cancel
  const dialogTitle =
    mode === "edit"
      ? (labels.editTitle ?? referenceLabels.editTitle ?? labels.title)
      : labels.title
  const dialogDescription =
    mode === "edit"
      ? (labels.editDescription ??
        referenceLabels.editDescription ??
        labels.description)
      : labels.description
  const confirmLabel =
    mode === "edit"
      ? (labels.editConfirm ?? referenceLabels.editConfirm ?? labels.confirm)
      : labels.confirm
  const completeLabel = task
    ? completed
      ? (labels.editReopen?.(task.title) ??
        referenceLabels.editReopen?.(task.title) ??
        task.title)
      : (labels.editComplete?.(task.title) ??
        referenceLabels.editComplete?.(task.title) ??
        task.title)
    : ""
  const deleteLabel = task
    ? (labels.delete?.(task.title) ??
      referenceLabels.delete?.(task.title) ??
      task.title)
    : ""
  const deleteTitle =
    labels.deleteTitle ?? referenceLabels.deleteTitle ?? dialogTitle
  const deleteDescription = task
    ? (labels.deleteDescription?.(task.title) ??
      referenceLabels.deleteDescription?.(task.title) ??
      task.title)
    : ""
  const deleteCancel =
    labels.deleteCancel ?? referenceLabels.deleteCancel ?? labels.cancel
  const deleteConfirm =
    labels.deleteConfirm ?? referenceLabels.deleteConfirm ?? labels.confirm
  const closeLabel = labels.close ?? referenceLabels.close ?? labels.cancel
  const discardTitle =
    labels.discardTitle ?? referenceLabels.discardTitle ?? dialogTitle
  const discardDescription =
    labels.discardDescription ??
    referenceLabels.discardDescription ??
    dialogDescription
  const discardCancel =
    labels.discardCancel ?? referenceLabels.discardCancel ?? labels.cancel
  const discardConfirm =
    labels.discardConfirm ?? referenceLabels.discardConfirm ?? closeLabel

  // Статус меняется отдельным колбэком и уже сохранён, поэтому в «грязность» не
  // входит: иначе галочка «завершено» просила бы подтверждения на выход.
  const dirty =
    title !== (task?.title ?? "") ||
    description !== (task?.description ?? "") ||
    assigneeId !== initialAssigneeId ||
    toDateValue(deadline) !== task?.deadlineValue

  const requestClose = () => {
    if (dirty) {
      setDiscardConfirmOpen(true)
      return
    }

    onOpenChange(false)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (disabled) return

    onSubmit({
      assigneeId: assigneeId ?? undefined,
      deadline: toDateValue(deadline),
      description: description.trim(),
      title: title.trim(),
    })
  }

  const changeAssignee = (nextId: string | null) => {
    setAssigneeId(nextId)
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (open) return
          requestClose()
        }}
      >
        <DialogContent showCloseButton={false} size="xl">
          <form className="contents" onSubmit={submit}>
            <DialogHeader className="flex-row items-center gap-2">
              {mode === "edit" && task && canComplete && onStatusChange ? (
                <Checkbox
                  aria-label={completeLabel}
                  checked={completed}
                  onCheckedChange={(checked) => {
                    const nextCompleted = checked === true
                    setCompleted(nextCompleted)
                    onStatusChange(nextCompleted ? "completed" : "todo")
                  }}
                />
              ) : null}
              <DialogTitle className="mr-auto">{dialogTitle}</DialogTitle>
              {mode === "edit" && task && canDelete && onDelete ? (
                <Button
                  aria-label={deleteLabel}
                  onClick={() => setDeleteConfirmOpen(true)}
                  size="icon-sm"
                  title={deleteLabel}
                  type="button"
                  variant="ghost"
                >
                  <Trash2 />
                </Button>
              ) : null}
              {/* Не DialogClose: тот закрывает диалог сам, минуя проверку на
                  несохранённые правки. */}
              <Button
                aria-label={closeLabel}
                onClick={requestClose}
                size="icon-sm"
                title={closeLabel}
                type="button"
                variant="ghost"
              >
                <X />
              </Button>
              <DialogDescription srOnly>{dialogDescription}</DialogDescription>
            </DialogHeader>

            <DialogBody>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={titleId}>{labels.titleLabel}</FieldLabel>
                  <Input
                    aria-required="true"
                    autoFocus
                    id={titleId}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={labels.titlePlaceholder}
                    required
                    size="lg"
                    value={title}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor={descriptionId}>
                    {labels.descriptionLabel}
                  </FieldLabel>
                  <Textarea
                    id={descriptionId}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={labels.descriptionPlaceholder}
                    value={description}
                  />
                </Field>

                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor={assigneeInputId}>
                      <UserRound className="size-4" />
                      {assigneeLabel}
                    </FieldLabel>
                    <Combobox<string>
                      filter={null}
                      inputValue={assigneeInputValue}
                      itemToStringLabel={(optionId) =>
                        assigneeOptions.find(
                          (candidate) => candidate.id === optionId
                        )?.name ?? optionId
                      }
                      itemToStringValue={(optionId) => optionId}
                      onInputValueChange={(value, details) => {
                        if (
                          details.reason === "input-change" ||
                          details.reason === "clear-press"
                        ) {
                          setAssigneeQuery(value)
                        }
                      }}
                      onOpenChange={(open) => {
                        setAssigneeOpen(open)
                        if (open) setAssigneeQuery("")
                      }}
                      onValueChange={changeAssignee}
                      value={assigneeId}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {selectedAssignee ? (
                          <Avatar size="sm">
                            {selectedAssignee.avatarSrc ? (
                              <AvatarImage
                                alt=""
                                src={selectedAssignee.avatarSrc}
                              />
                            ) : null}
                            <AvatarFallback>
                              {initials(
                                selectedAssignee.name,
                                formatters.locale
                              )}
                            </AvatarFallback>
                          </Avatar>
                        ) : null}
                        <ComboboxInput
                          aria-label={assigneeLabel}
                          autoComplete="off"
                          className="min-w-0 flex-1"
                          id={assigneeInputId}
                          placeholder={
                            assigneeOpen
                              ? assigneeSearchPlaceholder
                              : assigneePlaceholder
                          }
                          showClear
                        />
                      </div>
                      <ComboboxContent>
                        {assigneeQuery.trim() &&
                        filteredAssigneeOptions.length === 0 ? (
                          <ComboboxEmpty>{assigneeEmpty}</ComboboxEmpty>
                        ) : null}
                        <ComboboxList>
                          {filteredAssigneeOptions.map((option) => (
                            <ComboboxItem key={option.id} value={option.id}>
                              <Avatar size="sm">
                                {option.avatarSrc ? (
                                  <AvatarImage alt="" src={option.avatarSrc} />
                                ) : null}
                                <AvatarFallback>
                                  {initials(option.name, formatters.locale)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">{option.name}</span>
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={deadlineInputId}>
                      <CalendarDays className="size-4" />
                      {deadlineLabel}
                    </FieldLabel>
                    <div className="flex items-center gap-2">
                      <Popover
                        onOpenChange={setDeadlineOpen}
                        open={deadlineOpen}
                      >
                        <PopoverTrigger
                          render={
                            <Button
                              className="min-w-0 flex-1 justify-start font-normal"
                              id={deadlineInputId}
                              size="lg"
                              type="button"
                              variant="outline"
                            />
                          }
                        >
                          <CalendarDays data-icon="inline-start" />
                          <span className="truncate">
                            {deadline
                              ? formatters.deadline(deadline)
                              : deadlinePlaceholder}
                          </span>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            defaultMonth={deadline}
                            formatters={{
                              formatCaption: formatters.calendarCaption,
                              formatWeekdayName: formatters.calendarWeekday,
                            }}
                            mode="single"
                            onSelect={(date) => {
                              setDeadline(date)
                              setDeadlineOpen(false)
                            }}
                            selected={deadline}
                            weekStartsOn={formatters.weekStartsOn}
                          />
                        </PopoverContent>
                      </Popover>
                      {deadline ? (
                        <Button
                          aria-label={deadlineClear}
                          onClick={() => setDeadline(undefined)}
                          size="icon-lg"
                          title={deadlineClear}
                          type="button"
                          variant="ghost"
                        >
                          <X />
                        </Button>
                      ) : null}
                    </div>
                  </Field>
                </div>
              </FieldGroup>
            </DialogBody>

            <DialogFooter>
              <Button disabled={disabled} size="lg" type="submit" width="full">
                {confirmLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={setDiscardConfirmOpen}
        open={discardConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{discardTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {discardDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{discardCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardConfirmOpen(false)
                onOpenChange(false)
              }}
              type="button"
            >
              {discardConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setDeleteConfirmOpen} open={deleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{deleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.()
                onOpenChange(false)
              }}
              type="button"
              variant="destructive"
            >
              {deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
