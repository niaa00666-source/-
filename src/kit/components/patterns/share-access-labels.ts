import type {
  ShareAccessMode,
  ShareRole,
  ShareVisibility,
} from "@/components/patterns/share-access-model"

/**
 * Контракт всех пользовательских подписей паттерна доступа: диалога
 * `ShareAccessDialog` и вспомогательных `ShareStatusIndicators`,
 * `ShareLinkPasswordDialog`, `ShareLinkUnavailableDialog`.
 *
 * Язык принадлежит МЕСТУ: у компонента нет подписей-дефолтов, весь текст
 * приходит снаружи через обязательный проп `labels`. RU-набор для макетов —
 * `ruShareAccessLabels`; он несёт строки места, а не дефолт компонента.
 *
 * Строки, зависящие от значения enum, — это map'ы (`roleNames`, `modeNames`,
 * `visibilityNames`, `accessModeDescriptions`); строки со вставками (имя
 * объекта, имя пользователя, счётчики, флаги) — функции.
 *
 * Демо-данные (имена подсказок в комбобоксе, личность владельца) — это
 * ДАННЫЕ, а не подписи chrome, и здесь не живут: они, как
 * `createDefaultShareAccessSettings`, остаются сидом.
 */
export interface ShareAccessLabels {
  // --- Названия ролей / режимов / видимости (по значению enum) ---
  roleNames: Record<ShareRole, string>
  modeNames: Record<ShareAccessMode, string>
  visibilityNames: Record<ShareVisibility, string>
  accessModeDescriptions: Record<ShareAccessMode, string>

  // --- Chrome основного диалога ---
  dialogTitle: (itemName: string) => string
  dialogDescription: string
  settingsTooltip: string
  settingsButtonAriaLabel: string
  closeButtonAriaLabel: string
  closeTooltip: string
  backButtonAriaLabel: string

  // --- Поле добавления пользователей (combobox) ---
  addPeopleInputAriaLabel: string
  addPeopleInputPlaceholder: string
  addPeopleFieldDescription: string
  addByEmailHint: string
  searchLoading: string
  searchNoResults: string

  // --- Роли в селектах ---
  roleSelectAriaLabel: string
  organizationRoleAriaLabel: string

  // --- Запросы доступа ---
  accessRequestCount: (count: number) => string
  requestsRoleRequested: (roleName: string) => string
  viewRequestsButton: string
  requestsTitle: (itemName: string) => string
  roleForPersonAriaLabel: (name: string) => string
  reject: string
  accept: string

  // --- Список «У кого есть доступ» ---
  peopleWithAccessLegend: string
  ownerRoleLabel: string
  removePersonAriaLabel: (name: string) => string
  removePersonTooltip: string

  // --- Секция «Общий доступ» ---
  generalAccessLegend: string
  accessModeAriaLabel: string

  // --- Футер ---
  copyLink: string
  linkCopied: string
  done: string
  back: string

  // --- Экран «Добавить пользователей» ---
  addPeopleTitle: string
  newPeopleRoleLegend: string
  notifyTitle: string
  notifyAriaLabel: string
  messageAriaLabel: string
  messagePlaceholder: string
  send: string
  share: string

  // --- Экран «Настройки доступа» ---
  settingsTitle: string
  generalPermissionsLegend: string
  editorsCanManageTitle: string
  editorsCanManageDescription: string
  editorsCanManageAriaLabel: string
  viewersCanDownloadTitle: string
  viewersCanDownloadDescription: string
  viewersCanDownloadAriaLabel: string
  userPermissionsLegend: string
  perPersonDownloadDescription: string
  perPersonDownloadAriaLabel: (name: string) => string
  linkSecurityLegend: string
  linkSecurityWarning: (withPassword: boolean) => string
  /**
   * Почему в «Безопасности ссылки» нет пароля и срока действия: место сказало,
   * что на этом объекте их принудить нечем
   * (`capabilities.linkPasswordAndExpiration: false`). Без этой строки
   * владельцу оставалось бы гадать, куда делись два тумблера — а раньше он
   * получал их, включал и упирался в 422 без объяснения.
   *
   * Лимит скачиваний под этот запрет не попадает и остаётся на экране, поэтому
   * подпись говорит именно про пароль и срок, а не про раздел целиком.
   *
   * ОПЦИОНАЛЬНА по той же причине, что `passwordSetHint`: fe-disc собирает
   * бандл подписей из своего каталога i18n, и обязательное поле красило бы ему
   * typecheck за строку, которой у него пока нет. Отсутствует → диалог берёт
   * формулировку референсного набора `ruShareAccessLabels`.
   */
  linkPasswordAndExpirationUnavailable?: string
  passwordProtectTitle: string
  passwordProtectDescription: string
  passwordProtectAriaLabel: string
  passwordInputAriaLabel: string
  passwordPlaceholder: string
  showPassword: string
  hidePassword: string
  passwordError: string
  /**
   * Подпись под полем пароля, когда пароль на ссылке УЖЕ установлен
   * (`settings.passwordSet`). Объясняет, почему поле пустое: сервер пароль не
   * возвращает, и пустое поле означает «оставить прежний». Без этой строки
   * владельцу оставалось догадываться.
   *
   * Формулировка обязана держаться, пока поле пустое, пока в нём что-то введено и
   * пока защиту выключают: подпись стоит под полем ВСЁ время, пока пароль
   * установлен, поэтому «поле пустое» в изъявительном наклонении она сказать не
   * может — через секунду это уже неправда. Референсная строка перечисляет все
   * три исхода.
   *
   * Подсказка в самом пустом поле — `passwordSetPlaceholder`; она, наоборот,
   * видна только пока поле пустое, поэтому говорит именно про этот случай.
   *
   * ОПЦИОНАЛЬНЫ обе так, чтобы бандл подписей существующего потребителя
   * продолжал компилироваться: fe-disc собирает этот объект из своего каталога
   * i18n, и обязательное поле красило бы ему typecheck за строку, которой у него
   * пока нет. Отсутствует → диалог берёт формулировку референсного набора
   * `ruShareAccessLabels`, а не молчит.
   */
  passwordSetHint?: string
  passwordSetPlaceholder?: string
  expirationTitle: string
  expirationDescription: string
  expirationAriaLabel: string
  chooseDate: string
  timeLabel: string
  expirationError: string
  downloadLimitTitle: string
  downloadLimitDescription: string
  downloadLimitAriaLabel: string
  downloadLimitInputAriaLabel: string
  downloadLimitError: string

  // --- Индикаторы состояния (ShareStatusIndicators) ---
  statusIndicators: {
    groupAriaLabel: string
    openAccessAriaLabel: (itemName?: string) => string
    openAccessTooltip: string
    sharedTooltip: string
    passwordProtectedTooltip: string
    downloadDisabledTooltip: string
  }

  // --- Диалог пароля ссылки (ShareLinkPasswordDialog) ---
  passwordDialog: {
    title: string
    description: string
    passwordLabel: string
    cancel: string
    submit: string
  }

  // --- Диалог недоступной ссылки (ShareLinkUnavailableDialog) ---
  unavailableDialog: {
    expiredTitle: string
    limitTitle: string
    expiredDescription: string
    limitDescription: string
    expiredErrorTitle: string
    limitErrorTitle: string
    errorDescription: string
    dismiss: string
  }
}

/**
 * RU-фикстура подписей паттерна доступа — набор МЕСТА для макетов, а не дефолт
 * компонента. Несёт текущие строки диалога дословно.
 */
export const ruShareAccessLabels: ShareAccessLabels = {
  roleNames: {
    commenter: "Комментатор",
    editor: "Редактор",
    viewer: "Читатель",
  },
  modeNames: {
    link: "Все, у кого есть ссылка",
    organization: "МТС Линк",
    restricted: "Доступ ограничен",
  },
  visibilityNames: {
    available: "Появится в разделе «Доступно мне»",
    "link-only": "Доступ только по ссылке",
  },
  accessModeDescriptions: {
    restricted:
      "Открывать объект по ссылке могут только пользователи с доступом.",
    organization: "Открыть объект смогут все сотрудники организации МТС Линк.",
    link: "Открыть объект сможет любой пользователь, у которого есть ссылка.",
  },

  dialogTitle: (itemName) => `Доступ – ${itemName}`,
  dialogDescription: "Управление пользователями и общей ссылкой",
  settingsTooltip: "Настройки доступа",
  settingsButtonAriaLabel: "Открыть настройки доступа",
  closeButtonAriaLabel: "Закрыть окно доступа",
  closeTooltip: "Закрыть",
  backButtonAriaLabel: "Вернуться к управлению доступом",

  addPeopleInputAriaLabel: "Добавить пользователей и группы",
  addPeopleInputPlaceholder:
    "Добавьте пользователей, группы или рабочие пространства",
  addPeopleFieldDescription:
    "Выберите пользователей из списка или добавьте по email.",
  addByEmailHint: "Добавить по email",
  searchLoading: "Ищем участников…",
  searchNoResults: "Никого не нашли",

  roleSelectAriaLabel: "Роль пользователя",
  organizationRoleAriaLabel: "Роль организации",

  accessRequestCount: (count) => {
    const remainder10 = count % 10
    const remainder100 = count % 100
    const noun =
      remainder10 === 1 && remainder100 !== 11
        ? "запрос"
        : remainder10 >= 2 &&
            remainder10 <= 4 &&
            (remainder100 < 12 || remainder100 > 14)
          ? "запроса"
          : "запросов"

    return `${count} ${noun} на доступ`
  },
  requestsRoleRequested: (roleName) => `Запрашивает роль «${roleName}».`,
  viewRequestsButton: "Посмотреть",
  requestsTitle: (itemName) => `Запросы доступа – ${itemName}`,
  roleForPersonAriaLabel: (name) => `Роль для ${name}`,
  reject: "Отклонить",
  accept: "Принять",

  peopleWithAccessLegend: "У кого есть доступ",
  ownerRoleLabel: "Владелец",
  removePersonAriaLabel: (name) => `Удалить доступ у ${name}`,
  removePersonTooltip: "Удалить пользователя",

  generalAccessLegend: "Общий доступ",
  accessModeAriaLabel: "Тип общего доступа",

  copyLink: "Копировать ссылку",
  linkCopied: "Ссылка скопирована",
  done: "Готово",
  back: "Назад",

  addPeopleTitle: "Добавить пользователей",
  newPeopleRoleLegend: "Роль новых пользователей",
  notifyTitle: "Отправить уведомление на почту",
  notifyAriaLabel: "Отправить уведомление на почту",
  messageAriaLabel: "Сообщение (необязательно)",
  messagePlaceholder: "Добавьте сообщение",
  send: "Отправить",
  share: "Поделиться",

  settingsTitle: "Настройки доступа",
  generalPermissionsLegend: "Общие разрешения",
  editorsCanManageTitle: "Редакторы могут менять разрешения",
  editorsCanManageDescription: "Разрешает редакторам приглашать пользователей.",
  editorsCanManageAriaLabel: "Редакторы могут менять разрешения",
  viewersCanDownloadTitle: "Читатели могут скачивать, печатать и копировать",
  viewersCanDownloadDescription: "Применяется к читателям и комментаторам.",
  viewersCanDownloadAriaLabel:
    "Читатели могут скачивать, печатать и копировать",
  userPermissionsLegend: "Разрешения пользователей",
  perPersonDownloadDescription: "Разрешить скачивание, печать и копирование.",
  perPersonDownloadAriaLabel: (name) => `Разрешить скачивание для ${name}`,
  linkSecurityLegend: "Безопасность ссылки",
  linkSecurityWarning: (withPassword) =>
    `Объект будет доступен всем, у кого есть ссылка${
      withPassword ? " и пароль" : ""
    }.`,
  linkPasswordAndExpirationUnavailable:
    "Пароль и срок действия для этой ссылки недоступны: доступ по ней проверяется на стороне документа, где ни пароля, ни срока не спрашивают, — такое ограничение просто не сработало бы. Лимит скачиваний действует как обычно.",
  passwordProtectTitle: "Защитить паролем",
  passwordProtectDescription: "Пароль должен содержать не менее 8 символов.",
  passwordProtectAriaLabel: "Защитить ссылку паролем",
  passwordInputAriaLabel: "Пароль",
  passwordPlaceholder: "Не менее 8 символов",
  showPassword: "Показать пароль",
  hidePassword: "Скрыть пароль",
  passwordError: "Пароль слишком простой. Введите не менее 8 символов.",
  passwordSetHint:
    "Пароль уже задан. Пустое поле сохранит прежний пароль, введённый — заменит его, а выключенная защита снимет пароль совсем.",
  passwordSetPlaceholder: "Оставьте пустым, чтобы не менять пароль",
  expirationTitle: "Срок действия",
  expirationDescription: "После этой даты ссылка станет неактивной.",
  expirationAriaLabel: "Ограничить срок действия ссылки",
  chooseDate: "Выберите дату",
  timeLabel: "Время",
  expirationError: "Выберите дату и время в будущем.",
  downloadLimitTitle: "Лимит скачиваний",
  downloadLimitDescription:
    "После исчерпания лимита скачивание станет недоступно.",
  downloadLimitAriaLabel: "Ограничить количество скачиваний",
  downloadLimitInputAriaLabel: "Количество скачиваний",
  downloadLimitError: "Укажите лимит больше нуля.",

  statusIndicators: {
    groupAriaLabel: "Состояние доступа",
    openAccessAriaLabel: (itemName) =>
      itemName
        ? `Открыть настройки доступа для ${itemName}`
        : "Открыть настройки доступа",
    openAccessTooltip: "Открыть настройки доступа",
    sharedTooltip: "Доступ предоставлен другим пользователям",
    passwordProtectedTooltip: "Ссылка защищена паролем",
    downloadDisabledTooltip: "Скачивание, печать и копирование запрещены",
  },

  passwordDialog: {
    title: "Ссылка защищена",
    description:
      "Введите пароль, чтобы открыть файл. Содержимое загрузится только после успешной проверки.",
    passwordLabel: "Пароль",
    cancel: "Отмена",
    submit: "Открыть файл",
  },

  unavailableDialog: {
    expiredTitle: "Срок действия ссылки истёк",
    limitTitle: "Лимит скачиваний исчерпан",
    expiredDescription:
      "Владелец ограничил срок доступа. Запросите новую ссылку.",
    limitDescription:
      "Файл больше нельзя скачать по этой ссылке. Просмотр остаётся доступен.",
    expiredErrorTitle: "Ошибка 403",
    limitErrorTitle: "Limit Exceeded",
    errorDescription: "Прямой запрос к файлу будет отклонён.",
    dismiss: "Понятно",
  },
}
