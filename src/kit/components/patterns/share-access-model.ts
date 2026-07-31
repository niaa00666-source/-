export type ShareAccessMode = "link" | "organization" | "restricted"
export type ShareRole = "commenter" | "editor" | "viewer"
export type ShareVisibility = "available" | "link-only"

export type ShareMemberProfile = {
  avatarUrl?: string
  email: string
  name: string
  userId: string
}

export type SharePerson = {
  /**
   * Готовая ссылка на аватар. Имя поля то же, что у `ShareMemberProfile`, —
   * одному факту в контракте положено одно написание, иначе место начинает
   * гадать, какое из двух заполнять.
   *
   * Необязательно: без него строка рисует инициал, как рисовала до возврата
   * аватаров, поэтому место, которое фото не знает, ничего не замечает.
   */
  avatarUrl?: string
  canDownload: boolean
  email: string
  id: string
  name: string
  role: ShareRole
}

export type ShareAccessRequest = {
  /** См. `SharePerson.avatarUrl`: то же поле, тот же фолбэк на инициал. */
  avatarUrl?: string
  email: string
  id: string
  name: string
  requestedRole: ShareRole
}

/**
 * Роли в порядке возрастания прав. Порядок — часть контракта: он задаёт и
 * порядок вариантов в селектах, и то, до какой роли понижается запрещённая
 * (первая разрешённая, то есть самая слабая).
 */
const shareRoleOrder: ShareRole[] = ["viewer", "commenter", "editor"]

/**
 * Что место РАЗРЕШАЕТ предлагать на этом объекте — капабилити-флаги, а не
 * состояние настроек: «такая возможность у продукта есть», а диалог сам не
 * предлагает то, чего нет (конвенция `packages/screens/ARCHITECTURE.md` §2).
 *
 * И объект, и каждое его поле НЕОБЯЗАТЕЛЬНЫ; отсутствие означает ровно нынешнее
 * поведение — все три роли и полная безопасность ссылки. Потребитель, собранный
 * против кита без этого пропа, ничего не замечает.
 */
export type ShareAccessCapabilities = {
  /**
   * Может ли ссылка нести пароль и срок действия. `false` → диалог не
   * предлагает ни того, ни другого и не проверяет их.
   *
   * Один флаг на два поля, потому что отказывает в них один и тот же запрет:
   * у документа, доступ к которому проверяется по токену ссылки, нет ни шага
   * пароля, ни проверки срока, поэтому принять их значило бы сохранить
   * НЕПРИНУДИМЫЙ контроль — и сервер отказывает одним правилом сразу в обоих
   * (`expires_at != null || password_enabled == true` → 422).
   *
   * Лимит скачиваний под запрет НЕ попадает: его сервер принимает, и диалог
   * продолжает его предлагать. Гасить заодно и лимит значило бы отнять рабочую
   * возможность.
   */
  linkPasswordAndExpiration?: boolean
  /**
   * Роли, которые на этом объекте вообще можно выдать. Отсутствует → все три.
   * Нужен потому, что комментатор и редактор осмысленны лишь для живого
   * документа: на обычном файле сервер молча понижает любую роль до читателя и
   * прямо рассчитывает на гейт во фронте, а диалог до этого предлагал
   * «Редактора» на PDF.
   *
   * Пустой массив трактуется как «ограничения нет»: селект без единого
   * варианта не позволил бы даже понизить роль легаси-гранта.
   */
  roles?: ShareRole[]
  /**
   * Может ли ТЕКУЩИЙ вызывающий менять переключатель «Редакторы могут менять
   * разрешения». `false` → строки в «Общих разрешениях» нет.
   *
   * Единственная капабилити здесь, которая говорит о вызывающем, а не об объекте, —
   * и по-другому не выходит. Само делегирование устроено так, что право раздавать
   * право принадлежит только владельцу: будь этот переключатель одним из
   * делегируемых полномочий, редактор уполномочивал бы следующих редакторов, и в
   * цепочке не осталось бы владельца. Значит диалог, который место открывает и
   * невладельцу, обязан уметь эту строку не показывать.
   *
   * Диалогу неоткуда узнать это самому: место передаёт ему объект и настройки, но
   * никогда — личность того, кто смотрит. Поэтому ответ приходит от места (а туда —
   * с сервера), и поэтому это капабилити, а не «is_owner»: место рисует то, что
   * РАЗРЕШЕНО, как и всё остальное в этом типе.
   *
   * Отсутствует → строка показывается, то есть ровно нынешнее поведение: потребитель,
   * собранный против кита без этого флага, ничего не замечает.
   */
  manageEditorResharing?: boolean
}

/**
 * Вариант роли для селекта. `disabled` — это «роль видна, но выбрать её
 * нельзя»: у строки с легаси-грантом роль вне разрешённого набора всё равно
 * обязана быть на экране, потому что человек должен видеть правду о выданном
 * доступе, а не отредактированную версию.
 */
export type ShareRoleOption = {
  disabled: boolean
  role: ShareRole
}

function resolveAllowedShareRoles(
  capabilities?: ShareAccessCapabilities
): ShareRole[] {
  const requested = capabilities?.roles ?? []
  const allowed = shareRoleOrder.filter((role) => requested.includes(role))

  return allowed.length > 0 ? allowed : shareRoleOrder
}

/**
 * Что показать в селекте роли: разрешённые варианты плюс — если текущая роль в
 * набор не входит — сама текущая роль, недоступной для выбора.
 *
 * Так легаси-грант («Редактор», выданный до того, как продукт ограничил набор)
 * остаётся видимым, но односторонним: понизить его можно, вернуть — нет. Молча
 * переписать такую роль было бы хуже вдвойне: изменение доступа, которого
 * владелец не просил, да ещё и невидимое ему.
 */
export function resolveShareRoleOptions(
  currentRole: ShareRole,
  capabilities?: ShareAccessCapabilities
): ShareRoleOption[] {
  const allowed = resolveAllowedShareRoles(capabilities)

  return shareRoleOrder
    .filter((role) => allowed.includes(role) || role === currentRole)
    .map((role) => ({ disabled: !allowed.includes(role), role }))
}

/**
 * Привести роль к разрешённому набору. Применяется там, где грант СОЗДАЁТСЯ
 * прямо сейчас — приглашение и принятие запроса доступа: выдать роль, которую
 * продукт не может исполнить, значит показать владельцу одно, а сохранить другое
 * (сервер всё равно понизит её молча).
 *
 * Это clamp в буквальном смысле — «уложить в диапазон», а не только «понизить»,
 * и разница видна в одном случае, о котором лучше знать заранее. Роль выше
 * набора понижается до самой слабой разрешённой, и тогда она заведомо не выше
 * запрошенной. Но если набор НЕ СОДЕРЖИТ ни одной роли слабее запрошенной
 * (`roles: ["commenter", "editor"]` при запросе «Читателя»), результат
 * ПОДНИМАЕТСЯ до нижней границы набора: место сказало, что более слабого доступа
 * на этом объекте не существует, и нижняя граница — это минимум, который продукт
 * умеет выдать. Выдать «Читателя» значило бы создать грант вне набора, то есть
 * ровно то, от чего эта функция и защищает.
 *
 * Набор, начинающийся с «Читателя» (в том числе `["viewer"]` Диска), поднять
 * роль не может в принципе — там нижняя граница слабее любой запрошенной.
 */
export function clampShareRole(
  role: ShareRole,
  capabilities?: ShareAccessCapabilities
): ShareRole {
  const allowed = resolveAllowedShareRoles(capabilities)

  return allowed.includes(role) ? role : allowed[0]
}

export type ShareAccessSettings = {
  accessRequests: ShareAccessRequest[]
  accessMode: ShareAccessMode
  downloadLimit: number
  downloadLimitEnabled: boolean
  downloadsUsed: number
  editorsCanManage: boolean
  expiresAt: string
  expiresEnabled: boolean
  linkRole: ShareRole
  visibility: ShareVisibility
  /**
   * The item's owner, rendered as the first row of «У кого есть доступ».
   * Optional so existing settings objects stay valid; when it is absent the
   * owner row is omitted rather than filled with a placeholder identity — a
   * place that knows its owner passes one, a place that does not shows nothing.
   */
  owner?: ShareMemberProfile
  /**
   * НОВЫЙ пароль, который владелец вводит сейчас — черновик, только на запись.
   * Сервер пароль не возвращает никогда (хранит хешем), поэтому здесь не бывает
   * «текущего» значения: пустая строка означает «нового пароля не вводили».
   */
  password: string
  passwordEnabled: boolean
  /**
   * На сервере пароль УЖЕ установлен — состояние, только на чтение.
   *
   * Отдельный от `password` факт, потому что это разные вещи: «пароль стоит» и
   * «владелец ввёл новый». Место, у которого пароль на ссылке уже есть, обязано
   * отдавать `passwordEnabled: true` при пустом `password` — и без этого флага
   * диалог считал такую пару невалидной и молча отказывался сохранять что
   * угодно: ни роль сменить, ни доступ отозвать, ни пароль снять.
   *
   * Опционален и по умолчанию `false`: у места, которое его не передаёт,
   * проверка остаётся прежней — при включённом пароле поле обязано быть
   * заполнено.
   */
  passwordSet?: boolean
  people: SharePerson[]
  viewersCanDownload: boolean
}

/**
 * Что именно мешает сохранить настройки. Разложено по полям, потому что диалог
 * подсвечивает ошибку рядом с виновным полем, а не одним общим сообщением.
 */
export type ShareAccessValidation = {
  downloadLimitInvalid: boolean
  expirationInvalid: boolean
  passwordInvalid: boolean
  /** Ничто не мешает: «Готово» вызовет `onSave`. */
  valid: boolean
}

/** Минимальная длина пароля ссылки; тот же порог держит и бекенд. */
const minShareLinkPasswordLength = 8

/**
 * Единственный гейт кнопки «Готово». Вынесен из диалога в модель ЧИСТОЙ
 * функцией: диалог не умеет сохранять настройки в обход неё, поэтому вопрос
 * «сохранится ли эта пара настроек» проверяется без монтирования диалога — а
 * смонтировать его в node-ярусе тестов нечем (base-ui вешает содержимое через
 * портал, SSR даёт пустую строку).
 *
 * `now` — момент, ОТНОСИТЕЛЬНО которого судится срок действия. Он параметр, а
 * не `Date.now()` внутри, потому что диалог судит срок дважды и по-разному: при
 * отрисовке — по времени последней неудачной попытки (чтобы сообщение не мигало
 * от каждого тика), при нажатии «Готово» — по времени нажатия.
 *
 * `capabilities` — тот же набор, что получает диалог: проверять поле, которого
 * из-за капабилити на экране НЕТ, значит снова получить молчащую кнопку —
 * ошибку негде показать и нечем исправить.
 */
export function validateShareAccessSettings(
  settings: ShareAccessSettings,
  now: number,
  capabilities?: ShareAccessCapabilities
): ShareAccessValidation {
  const linkSecurityOffered = capabilities?.linkPasswordAndExpiration !== false
  const passwordDraft = settings.password.trim()
  const passwordInvalid =
    linkSecurityOffered &&
    settings.passwordEnabled &&
    (passwordDraft.length > 0
      ? // Ввели новый — он обязан быть не короче минимума.
        passwordDraft.length < minShareLinkPasswordLength
      : // Не ввели ничего: при уже установленном пароле это «оставить как
        // есть», а при включении с нуля — незаполненное обязательное поле.
        settings.passwordSet !== true)
  const expirationInvalid =
    linkSecurityOffered &&
    settings.expiresEnabled &&
    (!settings.expiresAt || new Date(settings.expiresAt).getTime() <= now)
  const downloadLimitInvalid =
    settings.downloadLimitEnabled && settings.downloadLimit < 1

  return {
    downloadLimitInvalid,
    expirationInvalid,
    passwordInvalid,
    valid: !passwordInvalid && !expirationInvalid && !downloadLimitInvalid,
  }
}

function createTomorrowAtCurrentTime() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setSeconds(0, 0)

  const pad = (value: number) => String(value).padStart(2, "0")

  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
    tomorrow.getDate()
  )}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`
}

export function createDefaultShareAccessSettings(): ShareAccessSettings {
  return {
    accessRequests: [
      {
        email: "aleksandr@link.example",
        id: "aleksandr-afanasiev",
        name: "Александр Афанасьев",
        requestedRole: "editor",
      },
      {
        email: "maria@link.example",
        id: "maria-petrova",
        name: "Мария Петрова",
        requestedRole: "commenter",
      },
      {
        email: "denis@link.example",
        id: "denis-sokolov",
        name: "Денис Соколов",
        requestedRole: "viewer",
      },
    ],
    accessMode: "restricted",
    downloadLimit: 1,
    downloadLimitEnabled: false,
    downloadsUsed: 0,
    editorsCanManage: false,
    expiresAt: createTomorrowAtCurrentTime(),
    expiresEnabled: false,
    linkRole: "viewer",
    visibility: "available",
    // Seed identity for mockups and Storybook. This factory is a FIXTURE, so
    // demo data belongs here — not inside the component, where it used to be
    // hardcoded and reached production consumers.
    owner: {
      avatarUrl: "/user-avatar.png",
      email: "ivan@link.example",
      name: "Иван Глухих",
      userId: "ivan-glukhikh",
    },
    password: "",
    passwordEnabled: false,
    passwordSet: false,
    people: [
      {
        canDownload: true,
        email: "anna@link.example",
        id: "anna",
        name: "Анна Смирнова",
        role: "viewer",
      },
    ],
    viewersCanDownload: true,
  }
}
