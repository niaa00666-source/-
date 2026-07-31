"use client"

import { useState } from "react"
import {
  ArrowDownUp,
  ChevronDown,
  CircleUserRound,
  MessageCircle,
  Pencil,
  PenLine,
  Phone,
  Plus,
} from "@scrambled/ui-kit/icons"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@scrambled/ui-kit"

import type {
  TaskAssigneeOption,
  TaskFilterOption,
  TaskFilters,
  TaskViewModel,
  TasksScreenLabels,
  TasksScreenProps,
} from "./contract"
import { ruTasksScreenFormatters, ruTasksScreenLabels } from "./labels"
import { TaskEditorDialog } from "./task-editor-dialog"

function selectedLabel(
  options: readonly TaskFilterOption[],
  value: string
): string {
  return options.find((option) => option.value === value)?.label ?? value
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

function FilterMenu({
  label,
  options,
  value,
  onValueChange,
}: {
  label: string
  options: readonly TaskFilterOption[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button size="default" variant="secondary" />}
      >
        <span>
          {label}: {selectedLabel(options, value)}
        </span>
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            onValueChange={(nextValue) => onValueChange(String(nextValue))}
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
  )
}

function AssigneeAvatar({
  assignee,
  labels,
  locale,
  task,
}: {
  assignee?: TaskAssigneeOption
  labels: TasksScreenLabels
  locale: string
  task: TaskViewModel
}) {
  const name = assignee?.name ?? task.assignee
  const avatarSrc = assignee?.avatarSrc ?? task.assigneeAvatarSrc
  const profileLabel =
    labels.assigneeProfile?.ariaLabel(name) ??
    ruTasksScreenLabels.assigneeProfile?.ariaLabel(name) ??
    name

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <button
            aria-label={profileLabel}
            className="pointer-events-auto rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={(event) => event.stopPropagation()}
            type="button"
          />
        }
      >
        <Avatar size="sm">
          {avatarSrc ? <AvatarImage alt="" src={avatarSrc} /> : null}
          <AvatarFallback>{initials(name, locale)}</AvatarFallback>
        </Avatar>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-72" side="left">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="truncate font-semibold">{name}</p>
            {assignee?.username ? (
              <p className="truncate text-sm">{assignee.username}</p>
            ) : null}
            {assignee?.role ? (
              <Badge variant="secondary">{assignee.role}</Badge>
            ) : null}
          </div>
          <Avatar size="lg">
            {avatarSrc ? <AvatarImage alt="" src={avatarSrc} /> : null}
            <AvatarFallback>{initials(name, locale)}</AvatarFallback>
          </Avatar>
        </div>
        {assignee?.jobTitle ? (
          <p className="text-sm text-muted-foreground">{assignee.jobTitle}</p>
        ) : null}
        <div aria-hidden="true" className="flex justify-end gap-2 pt-1">
          {[CircleUserRound, Phone, MessageCircle].map((Icon, index) => (
            <span
              className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
              key={index}
            >
              <Icon className="size-4" />
            </span>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

type TaskEditorState =
  { mode: "create" } | { mode: "edit"; task: TaskViewModel }

export function TasksScreen({
  activeSection,
  assigneeOptions = [],
  capabilities,
  createDialogOpen,
  currentUserId,
  defaultFilters,
  filterOptions,
  filters,
  formatters = ruTasksScreenFormatters,
  labels = ruTasksScreenLabels,
  onCreateDialogOpenChange,
  onCreateTask,
  onDeleteTask,
  onFiltersChange,
  onFiltersReset,
  onSortDirectionChange,
  onTaskStatusChange,
  onUpdateTask,
  sortDirection,
  tasks,
}: TasksScreenProps) {
  // Создание — контролируемое, когда продукт передал `createDialogOpen` (у него
  // своя точка входа в сайдбаре); иначе состоянием владеет экран. Редактирование
  // всегда внутреннее и перекрывает создание, поэтому editorState ВЫВОДИТСЯ, а не
  // синхронизируется эффектом: синхронизация давала каскадный рендер.
  const [editTask, setEditTask] = useState<TaskViewModel | null>(null)
  const [ownCreateOpen, setOwnCreateOpen] = useState(false)
  const createOpen = createDialogOpen ?? ownCreateOpen
  const editorState: TaskEditorState | null = editTask
    ? { mode: "edit", task: editTask }
    : createOpen
      ? { mode: "create" }
      : null
  const nextSortDirection =
    sortDirection === "ascending" ? "descending" : "ascending"
  const nextSortLabel =
    nextSortDirection === "ascending"
      ? labels.sortAscending
      : labels.sortDescending
  const authorPrefix =
    labels.authorPrefix ??
    ruTasksScreenLabels.authorPrefix ??
    labels.filters.author
  const noDeadline =
    labels.noDeadline ??
    ruTasksScreenLabels.noDeadline ??
    labels.filters.deadline
  const overdueLabel =
    labels.listGroups?.overdue ??
    ruTasksScreenLabels.listGroups?.overdue ??
    labels.titleBySection[activeSection]
  const upcomingLabel =
    labels.listGroups?.upcoming ??
    ruTasksScreenLabels.listGroups?.upcoming ??
    labels.titleBySection[activeSection]
  const filtersAriaLabel =
    labels.filtersAriaLabel ??
    ruTasksScreenLabels.filtersAriaLabel ??
    labels.titleBySection[activeSection]
  // «Задач ещё нет» и «всё отфильтровано» — разные экраны. Отличить их можно
  // только сравнением с нейтральным значением, которое знает продукт.
  const filtered = defaultFilters
    ? filters.author !== defaultFilters.author ||
      filters.assignee !== defaultFilters.assignee ||
      filters.deadline !== defaultFilters.deadline
    : false
  const emptyTitle = filtered
    ? (labels.empty.filteredTitle ??
      ruTasksScreenLabels.empty.filteredTitle ??
      labels.empty.title)
    : labels.empty.title
  const emptyDescription = filtered
    ? (labels.empty.filteredDescription ??
      ruTasksScreenLabels.empty.filteredDescription ??
      labels.empty.description)
    : labels.empty.description
  const resetLabel = labels.empty.reset ?? ruTasksScreenLabels.empty.reset ?? ""

  const updateFilter = (key: keyof TaskFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const closeCreateEditor = () => {
    setOwnCreateOpen(false)
    onCreateDialogOpenChange?.(false)
  }

  const openCreateEditor = () => {
    setOwnCreateOpen(true)
    onCreateDialogOpenChange?.(true)
  }

  const openEditEditor = (task: TaskViewModel) => {
    closeCreateEditor()
    setEditTask(task)
  }

  const closeEditor = () => {
    if (editTask) {
      setEditTask(null)
      return
    }

    closeCreateEditor()
  }

  const renderTask = (task: TaskViewModel) => {
    const completed = task.status === "completed"
    const canEdit = Boolean(capabilities.canEdit && onUpdateTask)
    const checkboxLabel = completed
      ? labels.reopenTask(task.title)
      : labels.completeTask(task.title)
    const editLabel =
      labels.create.editOpen?.(task.title) ??
      ruTasksScreenLabels.create.editOpen?.(task.title) ??
      `${labels.create.title}: ${task.title}`
    const assignee = assigneeOptions.find(
      (option) => option.id === task.assigneeId
    )
    const overdue = Boolean(task.isOverdue && !completed)

    return (
      <Item
        className={
          canEdit
            ? "group/task relative flex-nowrap bg-card hover:bg-muted/50"
            : "relative flex-nowrap bg-card"
        }
        key={task.id}
        role="listitem"
        variant="outline"
      >
        {canEdit ? (
          <button
            aria-label={editLabel}
            className="absolute inset-0 z-0 cursor-pointer rounded-[inherit] border-0 bg-transparent p-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            data-task-editor-trigger="true"
            onClick={() => openEditEditor(task)}
            title={editLabel}
            type="button"
          />
        ) : null}
        <ItemMedia className="pointer-events-none relative z-10">
          <Checkbox
            aria-label={checkboxLabel}
            checked={completed}
            className={
              overdue
                ? "pointer-events-auto border-destructive text-destructive"
                : "pointer-events-auto"
            }
            disabled={!capabilities.canComplete}
            onCheckedChange={() =>
              onTaskStatusChange(task.id, completed ? "todo" : "completed")
            }
            onClick={(event) => event.stopPropagation()}
          />
        </ItemMedia>
        <ItemContent className="pointer-events-none relative z-10 min-w-0">
          <ItemTitle
            className={completed ? "text-muted-foreground line-through" : ""}
          >
            {task.title}
          </ItemTitle>
          {task.description ? (
            <ItemDescription>{task.description}</ItemDescription>
          ) : null}
          <div
            className={
              overdue
                ? "flex flex-wrap items-center gap-1.5 text-xs text-destructive"
                : "flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
            }
          >
            <span>
              {authorPrefix}: {task.author}
            </span>
            <span aria-hidden="true">·</span>
            <span>{task.deadline ?? noDeadline}</span>
          </div>
        </ItemContent>
        <ItemActions className="pointer-events-none relative z-10 shrink-0">
          <AssigneeAvatar
            assignee={assignee}
            labels={labels}
            locale={formatters.locale}
            task={task}
          />
          {canEdit ? (
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-md opacity-0 transition-opacity group-focus-within/task:opacity-100 group-hover/task:opacity-100"
            >
              <Pencil className="size-4" />
            </span>
          ) : null}
        </ItemActions>
      </Item>
    )
  }

  const firstUpcomingIndex =
    activeSection === "assigned"
      ? tasks.findIndex((task) => !task.isOverdue)
      : -1
  const overdueTasks =
    activeSection === "assigned"
      ? firstUpcomingIndex === -1
        ? tasks
        : tasks.slice(0, firstUpcomingIndex)
      : []
  const upcomingTasks =
    activeSection === "assigned"
      ? firstUpcomingIndex === -1
        ? []
        : tasks.slice(firstUpcomingIndex)
      : []

  return (
    <section className="relative flex min-h-full flex-col bg-background">
      <div className="flex flex-col gap-6 px-6 pt-6 pb-4 lg:px-8">
        {/* h1 занят названием продукта в сайдбаре — как в Почте и Диске. */}
        <h2 className="text-lg font-semibold tracking-tight">
          {labels.titleBySection[activeSection]}
        </h2>

        <div
          aria-label={filtersAriaLabel}
          className="flex flex-wrap items-center justify-center gap-2"
          role="toolbar"
        >
          <FilterMenu
            label={labels.filters.author}
            onValueChange={(value) => updateFilter("author", value)}
            options={filterOptions.authors}
            value={filters.author}
          />
          <FilterMenu
            label={labels.filters.assignee}
            onValueChange={(value) => updateFilter("assignee", value)}
            options={filterOptions.assignees}
            value={filters.assignee}
          />
          <FilterMenu
            label={labels.filters.deadline}
            onValueChange={(value) => updateFilter("deadline", value)}
            options={filterOptions.deadlines}
            value={filters.deadline}
          />
          <Button
            aria-label={nextSortLabel}
            onClick={() => onSortDirectionChange(nextSortDirection)}
            size="icon"
            title={nextSortLabel}
            type="button"
            variant="secondary"
          >
            <ArrowDownUp />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 px-6 pb-4 lg:px-8">
        {tasks.length === 0 ? (
          <Empty className="min-h-full flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PenLine className="size-5" />
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
            {filtered && onFiltersReset && resetLabel ? (
              <EmptyContent>
                <Button
                  onClick={onFiltersReset}
                  type="button"
                  variant="outline"
                >
                  {resetLabel}
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : activeSection === "assigned" ? (
          <div className="flex w-full max-w-4xl flex-col gap-6">
            {overdueTasks.length > 0 ? (
              <section aria-labelledby="tasks-overdue-heading">
                <h3
                  className="mb-2 text-sm font-medium"
                  id="tasks-overdue-heading"
                >
                  {overdueLabel}
                </h3>
                <ItemGroup aria-label={overdueLabel} className="gap-2">
                  {overdueTasks.map(renderTask)}
                </ItemGroup>
              </section>
            ) : null}
            {upcomingTasks.length > 0 ? (
              <section aria-labelledby="tasks-upcoming-heading">
                <h3
                  className="mb-2 text-sm font-medium"
                  id="tasks-upcoming-heading"
                >
                  {upcomingLabel}
                </h3>
                <ItemGroup aria-label={upcomingLabel} className="gap-2">
                  {upcomingTasks.map(renderTask)}
                </ItemGroup>
              </section>
            ) : null}
          </div>
        ) : (
          <ItemGroup
            aria-label={labels.taskListAriaLabel}
            className="max-w-4xl gap-2"
          >
            {tasks.map(renderTask)}
          </ItemGroup>
        )}
      </div>

      {capabilities.canCreate ? (
        // `absolute` привязывал кнопку к низу СЕКЦИИ, а секция растёт вместе со
        // списком: на 500 задачах кнопка оказывалась на отметке 23 000 px и была
        // видна только домотавшему до конца. `sticky` держит её у нижнего края
        // окна; обёртка занимает обычную высоту, без `h-0` и отрицательного
        // сдвига.
        //
        // По ГОРИЗОНТАЛИ кнопка привязана к правому краю рабочей области, а он
        // ниже 1120 px уходит за окно: оболочка держит минимальную геометрию и
        // обрезается вьюпортом без горизонтальной прокрутки (DESIGN.md). В узком
        // окне кнопка недостижима — и это верно для всей правой части экрана,
        // а не только для неё. Чинится в оболочке, не здесь.
        <div className="pointer-events-none sticky bottom-0 z-20 flex justify-end px-6 pb-6 lg:px-8 lg:pb-8">
          <Button
            aria-label={labels.create.open}
            className="pointer-events-auto size-12 rounded-full"
            onClick={openCreateEditor}
            size="icon-lg"
            type="button"
          >
            <Plus className="size-6" />
          </Button>
        </div>
      ) : null}

      {editorState ? (
        <TaskEditorDialog
          assigneeOptions={assigneeOptions}
          canComplete={capabilities.canComplete}
          canDelete={Boolean(capabilities.canDelete && onDeleteTask)}
          currentUserId={currentUserId}
          formatters={formatters}
          key={
            editorState.mode === "edit"
              ? `edit-${editorState.task.id}`
              : "create"
          }
          labels={labels.create}
          mode={editorState.mode}
          onDelete={
            editorState.mode === "edit"
              ? () => onDeleteTask?.(editorState.task.id)
              : undefined
          }
          onOpenChange={(open) => {
            if (!open) closeEditor()
          }}
          onStatusChange={
            editorState.mode === "edit"
              ? (status) => onTaskStatusChange(editorState.task.id, status)
              : undefined
          }
          onSubmit={(draft) => {
            if (editorState.mode === "edit") {
              onUpdateTask?.(editorState.task.id, draft)
              setEditTask(null)
              return
            }

            onCreateTask(draft)
            closeCreateEditor()
          }}
          task={editorState.mode === "edit" ? editorState.task : undefined}
        />
      ) : null}
    </section>
  )
}
