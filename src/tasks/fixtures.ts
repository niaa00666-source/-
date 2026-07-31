import type {
  TaskAssigneeOption,
  TaskFilterOptions,
  TaskFilters,
  TaskSectionId,
  TaskSortDirection,
  TaskViewModel,
  TasksCapabilities,
} from "./contract"
import { ruTasksScreenFormatters } from "./labels"

// Порядок один и тот же в обоих списках («все», «я», остальные по алфавиту), и
// перечислены ВСЕ, кого можно назначить: раньше в фильтрах было двое из пяти, и
// по Борису, Наталье и Андрею отфильтровать было нечем.
export const taskFilterOptions: TaskFilterOptions = {
  authors: [
    { label: "все", value: "all" },
    { label: "я", value: "me" },
    { label: "Анна Волкова", value: "anna-volkova" },
    { label: "Андрей Б ✈️", value: "andrey-b" },
    { label: "Борис Айзенштейн", value: "boris-eisenstein" },
    { label: "Наталья Борисова", value: "natalia-borisova" },
  ],
  assignees: [
    { label: "все", value: "all" },
    { label: "я", value: "me" },
    { label: "Анна Волкова", value: "anna-volkova" },
    { label: "Андрей Б ✈️", value: "andrey-b" },
    { label: "Борис Айзенштейн", value: "boris-eisenstein" },
    { label: "Наталья Борисова", value: "natalia-borisova" },
  ],
  deadlines: [
    { label: "любой", value: "any" },
    { label: "сегодня", value: "today" },
    { label: "на этой неделе", value: "week" },
    { label: "без срока", value: "none" },
  ],
}

export const defaultTaskFilters: TaskFilters = {
  author: "all",
  assignee: "me",
  deadline: "any",
}

export const defaultTasksCapabilities: TasksCapabilities = {
  canComplete: true,
  canCreate: true,
  canDelete: true,
  canEdit: true,
}

export const taskAssigneeOptions: readonly TaskAssigneeOption[] = [
  {
    avatarSrc: "/user-avatar.png",
    id: "me",
    isCurrentUser: true,
    jobTitle: "Продуктовый дизайнер",
    name: "Иван Глухих",
    role: "Участник",
    username: "i.glukhikh",
  },
  {
    avatarSrc: "/mail-avatars/maria-ivanova.png",
    id: "anna-volkova",
    jobTitle: "Эксперт по клиентскому опыту",
    name: "Анна Волкова",
    role: "Гость",
    username: "a.volkova",
  },
  {
    avatarSrc: "/mail-avatars/alexey-sorokin.png",
    id: "boris-eisenstein",
    jobTitle: "Руководитель продукта",
    name: "Борис Айзенштейн",
    role: "Участник",
    username: "b.eisenstein",
  },
  {
    avatarSrc: "/mail-avatars/artem-sorokin.png",
    id: "natalia-borisova",
    jobTitle: "Исследователь",
    name: "Наталья Борисова",
    role: "Участник",
    username: "n.borisova",
  },
  {
    id: "andrey-b",
    jobTitle: "Инженер",
    name: "Андрей Б ✈️",
    role: "Участник",
    username: "a.b",
  },
]

export const populatedTasks: readonly TaskViewModel[] = [
  {
    id: "prepare-review",
    title: "Подготовить материалы к дизайн-ревью",
    description: "Собрать макеты, сценарии и список открытых вопросов.",
    author: "Иван Глухих",
    assignee: "Иван Глухих",
    assigneeId: "me",
    assigneeAvatarSrc: "/user-avatar.png",
    deadline: "30 июля 2026",
    deadlineValue: "2026-07-30",
    status: "todo",
  },
  {
    id: "sync-team",
    title: "Синхронизироваться с командой продукта",
    author: "Иван Глухих",
    assignee: "Анна Волкова",
    assigneeAvatarSrc: "/mail-avatars/maria-ivanova.png",
    assigneeId: "anna-volkova",
    deadline: "15 июля 2026",
    deadlineValue: "2026-07-15",
    isOverdue: true,
    status: "todo",
  },
  {
    id: "unicode-edge",
    title:
      "Проверить длинное название задачи — 東京 🧭 и переносы без потери смысла",
    description:
      "Крайний случай для локализации, эмодзи и длинного пользовательского текста.",
    author: "Иван Глухих",
    assignee: "Анна Волкова",
    assigneeAvatarSrc: "/mail-avatars/maria-ivanova.png",
    assigneeId: "anna-volkova",
    status: "todo",
  },
  {
    id: "assigned-upcoming",
    title: "Подготовить демо задач",
    author: "Иван Глухих",
    assignee: "Борис Айзенштейн",
    assigneeAvatarSrc: "/mail-avatars/alexey-sorokin.png",
    assigneeId: "boris-eisenstein",
    deadline: "15 августа 2026",
    deadlineValue: "2026-08-15",
    status: "todo",
  },
]

export const completedTasks: readonly TaskViewModel[] = [
  {
    id: "publish-notes",
    title: "Опубликовать заметки встречи",
    author: "Иван Глухих",
    assignee: "Иван Глухих",
    assigneeAvatarSrc: "/user-avatar.png",
    assigneeId: "me",
    deadline: "29 июля 2026",
    deadlineValue: "2026-07-29",
    status: "completed",
  },
]

// Срок задаётся ДВУМЯ согласованными полями: `deadlineValue` — машинное, по нему
// работают разделы, фильтры и сортировка; `deadline` — то, что видит человек.
// Раньше здесь было только второе, со значением «День N», из-за чего раздел «Без
// срока» показывал все 431 незавершённую задачу — с напечатанным сроком в строке.
const MANY_TASKS_ANCHOR = new Date(2026, 6, 31)

function manyTasksDeadline(index: number) {
  if (index % 5 === 0) return { deadline: undefined, deadlineValue: undefined }

  // От −40 до +60 дней вокруг опорной даты: набор покрывает и просроченные, и
  // предстоящие, и текущую неделю.
  const date = new Date(MANY_TASKS_ANCHOR)
  date.setDate(date.getDate() + ((index * 7) % 101) - 40)

  return {
    deadline: ruTasksScreenFormatters.deadline(date),
    deadlineValue: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
  }
}

export const manyTasks: readonly TaskViewModel[] = Array.from(
  { length: 503 },
  (_, index) => ({
    id: `task-${index + 1}`,
    title: `Задача ${index + 1}`,
    description:
      index === 502
        ? "Последняя строка проверяет прокрутку большого набора."
        : undefined,
    author: index % 3 === 0 ? "Анна Волкова" : "Иван Глухих",
    assignee: index % 4 === 0 ? "Анна Волкова" : "Иван Глухих",
    assigneeId: index % 4 === 0 ? "anna-volkova" : "me",
    ...manyTasksDeadline(index),
    status: index % 7 === 0 ? ("completed" as const) : ("todo" as const),
  })
)

export interface TasksScenario {
  activeSection: TaskSectionId
  filters: TaskFilters
  sortDirection: TaskSortDirection
  tasks: readonly TaskViewModel[]
}

export const tasksScenarios: Record<string, TasksScenario> = {
  empty: {
    activeSection: "my",
    filters: defaultTaskFilters,
    sortDirection: "ascending",
    tasks: [],
  },
  populated: {
    activeSection: "my",
    filters: defaultTaskFilters,
    sortDirection: "ascending",
    tasks: populatedTasks,
  },
  completed: {
    activeSection: "completed",
    filters: defaultTaskFilters,
    sortDirection: "descending",
    tasks: completedTasks,
  },
  many: {
    activeSection: "assigned",
    // Не `defaultTaskFilters`: там исполнитель — «я», а раздел «Назначенные
    // другим» оставляет ровно обратное. Сценарий открывался пустым.
    filters: { ...defaultTaskFilters, assignee: "all" },
    sortDirection: "ascending",
    tasks: manyTasks,
  },
}
