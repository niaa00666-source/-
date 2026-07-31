import { useEffect, useMemo, useState } from "react"

import { AppShell } from "@scrambled/ui-kit"

import {
  defaultTaskFilters,
  defaultTasksCapabilities,
  populatedTasks,
  taskAssigneeOptions,
  taskFilterOptions,
  TasksScreen as TasksWorkspace,
  TasksSidebar,
  type TaskCreateDraft,
  type TaskFilters,
  type TaskSectionId,
  type TaskSortDirection,
  type TaskStatus,
  type TaskUpdateDraft,
  type TaskViewModel,
} from "./tasks"

const CURRENT_USER_ID = "me"
const CURRENT_USER_NAME = "Иван Глухих"
const STORAGE_KEY = "tasks-app.tasks.v1"

/* ── хранилище ─────────────────────────────────────────────────────────────
 * Экран задач чист по контракту: ни сети, ни `window`, ни storage внутри него
 * нет. Сохранение живёт здесь, в адаптере, — ровно там же, где в витрине жило
 * состояние в памяти.
 */

function loadTasks(): readonly TaskViewModel[] | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as TaskViewModel[]) : null
  } catch {
    // Повреждённая запись не должна ронять приложение — начинаем с фикстур.
    return null
  }
}

function saveTasks(tasks: readonly TaskViewModel[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Приватный режим или переполненная квота: демо продолжает работать.
  }
}

/* ── проекция черновика в строку списка ────────────────────────────────── */

function personFromFilter(value: string) {
  if (value === "all") return null
  return taskAssigneeOptions.find((option) => option.id === value)?.name ?? null
}

function toLocalIso(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Понедельник—воскресенье вокруг сегодняшнего дня. */
function currentWeekBounds() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))

  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  return { start: toLocalIso(start), end: toLocalIso(end) }
}

function formatDeadline(value?: string) {
  if (!value) return undefined

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(/\s*г\.$/u, "")
}

function isOverdue(deadline?: string, status: TaskStatus = "todo") {
  if (!deadline || status === "completed") return false

  const [year, month, day] = deadline.split("-").map(Number)
  const dueDate = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return dueDate.getTime() < today.getTime()
}

// Просроченность считается от даты при каждом чтении: сохранённый флаг протух
// бы уже на следующий день.
function withDerivedOverdue(tasks: readonly TaskViewModel[]) {
  return tasks.map((task) => ({
    ...task,
    isOverdue: isOverdue(task.deadlineValue, task.status),
  }))
}

function taskFieldsFromDraft(
  draft: TaskUpdateDraft,
  status: TaskStatus = "todo"
) {
  const assignee = taskAssigneeOptions.find(
    (option) => option.id === draft.assigneeId
  )

  return {
    assignee: assignee?.name ?? "Не указан",
    assigneeAvatarSrc: assignee?.avatarSrc,
    assigneeId: assignee?.id,
    deadline: formatDeadline(draft.deadline),
    deadlineValue: draft.deadline,
    description: draft.description || undefined,
    isOverdue: isOverdue(draft.deadline, status),
    title: draft.title,
  }
}

export function TasksApp() {
  const [activeSection, setActiveSection] = useState<TaskSectionId>("my")
  const [filters, setFilters] = useState<TaskFilters>(defaultTaskFilters)
  const [sortDirection, setSortDirection] =
    useState<TaskSortDirection>("ascending")
  const [tasks, setTasks] = useState<readonly TaskViewModel[]>(() =>
    withDerivedOverdue(loadTasks() ?? populatedTasks)
  )
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const selectSection = (section: TaskSectionId) => {
    setActiveSection(section)
    setFilters((currentFilters) => ({
      ...currentFilters,
      assignee: section === "my" ? CURRENT_USER_ID : "all",
    }))
  }

  // «Не фильтровать» звучит по-разному в разных разделах: в «Моих задачах»
  // исполнитель — я, в остальных — все.
  const sectionNeutralFilters = useMemo<TaskFilters>(
    () => ({
      ...defaultTaskFilters,
      assignee: activeSection === "my" ? CURRENT_USER_ID : "all",
    }),
    [activeSection]
  )

  const visibleTasks = useMemo(() => {
    const author = personFromFilter(filters.author)
    const assignee = personFromFilter(filters.assignee)

    const filtered = tasks.filter((task) => {
      if (activeSection === "completed" && task.status !== "completed") {
        return false
      }
      if (activeSection !== "completed" && task.status === "completed") {
        return false
      }
      if (activeSection === "my" && task.assigneeId !== CURRENT_USER_ID) {
        return false
      }
      if (
        activeSection === "assigned" &&
        (task.author !== CURRENT_USER_NAME ||
          task.assigneeId === CURRENT_USER_ID)
      ) {
        return false
      }
      if (activeSection === "noDeadline" && task.deadlineValue) {
        return false
      }
      if (author && task.author !== author) return false
      if (assignee && task.assignee !== assignee) return false
      if (filters.deadline === "none" && task.deadlineValue) return false
      // Локальная дата, а не UTC: `toISOString()` ночью отдаёт вчерашний день.
      if (
        filters.deadline === "today" &&
        task.deadlineValue !== toLocalIso(new Date())
      ) {
        return false
      }
      if (filters.deadline === "week") {
        const { start, end } = currentWeekBounds()
        if (
          !task.deadlineValue ||
          task.deadlineValue < start ||
          task.deadlineValue > end
        ) {
          return false
        }
      }
      return true
    })

    return [...filtered].sort((firstTask, secondTask) => {
      if (
        activeSection === "assigned" &&
        Boolean(firstTask.isOverdue) !== Boolean(secondTask.isOverdue)
      ) {
        return firstTask.isOverdue ? -1 : 1
      }

      // Задача без срока не «бесконечно далёкая», а «без срока»: держим такие
      // в хвосте при любом направлении.
      if (!firstTask.deadlineValue || !secondTask.deadlineValue) {
        if (firstTask.deadlineValue) return -1
        if (secondTask.deadlineValue) return 1
        return 0
      }

      const comparison = firstTask.deadlineValue.localeCompare(
        secondTask.deadlineValue
      )
      return sortDirection === "ascending" ? comparison : -comparison
    })
  }, [activeSection, filters, sortDirection, tasks])

  const createTask = (draft: TaskCreateDraft) => {
    const nextTask: TaskViewModel = {
      id: `task-${Date.now()}`,
      author: CURRENT_USER_NAME,
      status: "todo",
      ...taskFieldsFromDraft(draft),
    }
    setTasks((currentTasks) => [nextTask, ...currentTasks])
    setActiveSection(draft.assigneeId === CURRENT_USER_ID ? "my" : "assigned")
    if (draft.assigneeId !== CURRENT_USER_ID) {
      setFilters((currentFilters) => ({ ...currentFilters, assignee: "all" }))
    }
  }

  const updateTask = (taskId: string, draft: TaskUpdateDraft) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...taskFieldsFromDraft(draft, task.status) }
          : task
      )
    )
  }

  const changeTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, isOverdue: isOverdue(task.deadlineValue, status), status }
          : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    )
  }

  // Счётчики считаются по РАЗДЕЛУ, без учёта фильтров: иначе цифра в навигации
  // менялась бы от выбора в другом разделе.
  const sectionCounts = useMemo(() => {
    const active = tasks.filter((task) => task.status !== "completed")

    return {
      my: active.filter((task) => task.assigneeId === CURRENT_USER_ID).length,
      assigned: active.filter(
        (task) =>
          task.author === CURRENT_USER_NAME &&
          task.assigneeId !== CURRENT_USER_ID
      ).length,
      noDeadline: active.filter((task) => !task.deadlineValue).length,
      completed: tasks.filter((task) => task.status === "completed").length,
    }
  }, [tasks])

  return (
    <AppShell
      showProductRail={false}
      sidebar={
        <TasksSidebar
          activeSection={activeSection}
          canCreate={defaultTasksCapabilities.canCreate}
          counts={sectionCounts}
          onCreateTask={() => setCreateDialogOpen(true)}
          onSectionChange={selectSection}
        />
      }
    >
      <TasksWorkspace
        activeSection={activeSection}
        assigneeOptions={taskAssigneeOptions}
        capabilities={defaultTasksCapabilities}
        createDialogOpen={createDialogOpen}
        currentUserId={CURRENT_USER_ID}
        defaultFilters={sectionNeutralFilters}
        filterOptions={taskFilterOptions}
        filters={filters}
        onCreateDialogOpenChange={setCreateDialogOpen}
        onCreateTask={createTask}
        onDeleteTask={deleteTask}
        onFiltersChange={setFilters}
        onFiltersReset={() => setFilters(sectionNeutralFilters)}
        onSortDirectionChange={setSortDirection}
        onTaskStatusChange={changeTaskStatus}
        onUpdateTask={updateTask}
        sortDirection={sortDirection}
        tasks={visibleTasks}
      />
    </AppShell>
  )
}
