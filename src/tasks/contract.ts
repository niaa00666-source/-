export type TaskSectionId = "my" | "assigned" | "noDeadline" | "completed"

export type TaskStatus = "todo" | "completed"

export type TaskSortDirection = "ascending" | "descending"

export interface TaskViewModel {
  id: string
  title: string
  description?: string
  author: string
  assignee: string
  assigneeId?: string
  assigneeAvatarSrc?: string
  deadline?: string
  deadlineValue?: string
  isOverdue?: boolean
  status: TaskStatus
}

export interface TaskFilterOption {
  label: string
  value: string
}

export interface TaskAssigneeOption {
  avatarSrc?: string
  id: string
  isCurrentUser?: boolean
  jobTitle?: string
  name: string
  role?: string
  username?: string
}

export interface TaskFilters {
  author: string
  assignee: string
  deadline: string
}

export interface TaskFilterOptions {
  authors: readonly TaskFilterOption[]
  assignees: readonly TaskFilterOption[]
  deadlines: readonly TaskFilterOption[]
}

export interface TaskCreateDraft {
  assigneeId?: string
  deadline?: string
  description: string
  title: string
}

export type TaskUpdateDraft = TaskCreateDraft

export interface TasksCapabilities {
  canComplete: boolean
  canCreate: boolean
  canDelete?: boolean
  canEdit?: boolean
}

export interface TasksSidebarLabels {
  ariaLabel: string
  createTask?: string
  title: string
  sections: Record<TaskSectionId, string>
}

export interface TasksScreenLabels {
  titleBySection: Record<TaskSectionId, string>
  filters: {
    author: string
    assignee: string
    deadline: string
  }
  sortAscending: string
  sortDescending: string
  /** Подпись панели фильтров для скринридера. */
  filtersAriaLabel?: string
  empty: {
    title: string
    description: string
    /** Выдача пуста ИЗ-ЗА фильтров — приглашение начать тут врёт. */
    filteredTitle?: string
    filteredDescription?: string
    /** Кнопка сброса; показывается только вместе с `onFiltersReset`. */
    reset?: string
  }
  listGroups?: {
    overdue: string
    upcoming: string
  }
  authorPrefix?: string
  noDeadline?: string
  assigneeProfile?: {
    ariaLabel: (name: string) => string
  }
  taskListAriaLabel: string
  completeTask: (title: string) => string
  reopenTask: (title: string) => string
  create: {
    open: string
    title: string
    description: string
    titleLabel: string
    titlePlaceholder: string
    descriptionLabel: string
    descriptionPlaceholder: string
    cancel: string
    close?: string
    confirm: string
    editOpen?: (title: string) => string
    editTitle?: string
    editDescription?: string
    editConfirm?: string
    assigneeLabel?: string
    assigneePlaceholder?: string
    assigneeSearchPlaceholder?: string
    assigneeEmpty?: string
    deadlineLabel?: string
    deadlinePlaceholder?: string
    deadlineClear?: string
    editComplete?: (title: string) => string
    editReopen?: (title: string) => string
    delete?: (title: string) => string
    deleteTitle?: string
    deleteDescription?: (title: string) => string
    deleteCancel?: string
    deleteConfirm?: string
    /** Закрытие редактора с несохранёнными правками. */
    discardTitle?: string
    discardDescription?: string
    discardCancel?: string
    discardConfirm?: string
  }
}

/**
 * Всё, что в экране зависит от языка, но не является подписью: раскладка даты,
 * подписи календаря, первый день недели и тег локали, по которому сворачивается
 * регистр. Держится отдельно от `labels` по той же причине, что и у файловой
 * таблицы: подписи переводит редактор, а это — данные локали.
 */
export interface TasksScreenFormatters {
  /** BCP-47: регистр инициалов и сворачивание регистра в поиске исполнителя. */
  locale: string
  /** Срок на кнопке выбора даты и в подписях. */
  deadline: (date: Date) => string
  /** Заголовок месяца в календаре. */
  calendarCaption: (date: Date) => string
  /** Подпись дня недели в шапке календаря. */
  calendarWeekday: (date: Date) => string
  /** Первый день недели: 0 — воскресенье, 1 — понедельник. */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export interface TasksSidebarProps {
  activeSection: TaskSectionId
  canCreate?: boolean
  counts?: Partial<Record<TaskSectionId, number>>
  labels?: TasksSidebarLabels
  onCreateTask?: () => void
  onSectionChange: (section: TaskSectionId) => void
}

export interface TasksScreenProps {
  activeSection: TaskSectionId
  assigneeOptions?: readonly TaskAssigneeOption[]
  capabilities: TasksCapabilities
  createDialogOpen?: boolean
  currentUserId?: string
  /**
   * Нейтральное значение фильтров. Экран сравнивает с ним текущие, чтобы отличить
   * «задач ещё нет» от «всё отфильтровано»: сам он не знает, какое значение
   * каждого фильтра означает «не фильтровать».
   */
  defaultFilters?: TaskFilters
  filterOptions: TaskFilterOptions
  filters: TaskFilters
  /** Раскладка даты и локаль. Не передан — русский референсный набор. */
  formatters?: TasksScreenFormatters
  labels?: TasksScreenLabels
  onCreateTask: (draft: TaskCreateDraft) => void
  onCreateDialogOpenChange?: (open: boolean) => void
  onDeleteTask?: (taskId: string) => void
  onUpdateTask?: (taskId: string, draft: TaskUpdateDraft) => void
  onFiltersChange: (filters: TaskFilters) => void
  /** Не передан — кнопки сброса в пустой выдаче не будет. */
  onFiltersReset?: () => void
  onSortDirectionChange: (direction: TaskSortDirection) => void
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void
  sortDirection: TaskSortDirection
  tasks: readonly TaskViewModel[]
}
