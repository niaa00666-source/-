import type {
  TasksScreenFormatters,
  TasksScreenLabels,
  TasksSidebarLabels,
} from "./contract"

const RU_LOCALE = "ru-RU"

// Intl в русской локали дописывает « г.» и к «30 июля 2026», и к «июль 2026», а
// дизайн этот хвост не печатает. Снимаем его строкой, а не собираем дату из
// кусков: у месяца разные падежи (в дате «июля», в заголовке «июль»), и ручная
// склейка их ломает.
const dropEraSuffix = (value: string) => value.replace(/\s*г\.$/u, "")

const ruDeadlineFormat = new Intl.DateTimeFormat(RU_LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const ruCaptionFormat = new Intl.DateTimeFormat(RU_LOCALE, {
  month: "long",
  year: "numeric",
})

const ruWeekdayFormat = new Intl.DateTimeFormat(RU_LOCALE, { weekday: "short" })

export const ruTasksScreenFormatters: TasksScreenFormatters = {
  locale: RU_LOCALE,
  deadline: (date) => dropEraSuffix(ruDeadlineFormat.format(date)),
  calendarCaption: (date) => dropEraSuffix(ruCaptionFormat.format(date)),
  calendarWeekday: (date) => ruWeekdayFormat.format(date).replace(".", ""),
  weekStartsOn: 1,
}

export const ruTasksSidebarLabels: TasksSidebarLabels = {
  ariaLabel: "Разделы задач",
  createTask: "Создать задачу",
  title: "Задачи",
  sections: {
    my: "Мои задачи",
    assigned: "Назначенные другим",
    noDeadline: "Без срока",
    completed: "Завершённые",
  },
}

export const ruTasksScreenLabels: TasksScreenLabels = {
  titleBySection: {
    my: "Мои задачи",
    assigned: "Назначенные другим",
    noDeadline: "Без срока",
    completed: "Завершённые",
  },
  filters: {
    author: "Автор",
    assignee: "Исполнитель",
    deadline: "Срок",
  },
  sortAscending: "Сначала ближайшие",
  sortDescending: "Сначала поздние",
  filtersAriaLabel: "Фильтры задач",
  empty: {
    title: "Здесь будут ваши заметки и задачи",
    description: "Начните путь к вашим достижениям сейчас",
    filteredTitle: "Ничего не найдено",
    filteredDescription: "Под выбранные фильтры не подходит ни одна задача",
    reset: "Сбросить фильтры",
  },
  listGroups: {
    overdue: "Просроченные",
    upcoming: "Предстоящие",
  },
  authorPrefix: "Автор",
  noDeadline: "Без срока",
  assigneeProfile: {
    ariaLabel: (name) => `Профиль исполнителя ${name}`,
  },
  taskListAriaLabel: "Список задач",
  completeTask: (title) => `Завершить задачу «${title}»`,
  reopenTask: (title) => `Вернуть задачу «${title}» в работу`,
  create: {
    open: "Создать задачу",
    title: "Новая задача",
    description: "Добавьте название и, если нужно, короткое описание.",
    titleLabel: "Название задачи *",
    titlePlaceholder: "Например, подготовить план встречи",
    descriptionLabel: "Описание (необязательно)",
    descriptionPlaceholder: "Контекст, результат или следующий шаг",
    cancel: "Отмена",
    close: "Закрыть",
    confirm: "Создать",
    editOpen: (title) => `Редактировать задачу «${title}»`,
    editTitle: "Редактирование задачи",
    editDescription: "Измените данные задачи и сохраните результат.",
    editConfirm: "Сохранить",
    assigneeLabel: "Исполнитель",
    assigneePlaceholder: "Не указан",
    assigneeSearchPlaceholder: "Найти исполнителя",
    assigneeEmpty: "Исполнители не найдены",
    deadlineLabel: "Срок исполнения",
    deadlinePlaceholder: "Выберите дату",
    deadlineClear: "Очистить срок",
    editComplete: (title) => `Завершить задачу «${title}»`,
    editReopen: (title) => `Вернуть задачу «${title}» в работу`,
    delete: (title) => `Удалить задачу «${title}»`,
    deleteTitle: "Удалить задачу?",
    deleteDescription: (title) =>
      `Задача «${title}» будет удалена без возможности восстановления.`,
    deleteCancel: "Отмена",
    deleteConfirm: "Удалить",
    discardTitle: "Закрыть без сохранения?",
    discardDescription: "Внесённые изменения не сохранятся.",
    discardCancel: "Вернуться к правке",
    discardConfirm: "Закрыть",
  },
}
