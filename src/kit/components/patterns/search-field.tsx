"use client"

import { useRef, useState, type ReactNode } from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search, X } from "../../icons"

/**
 * Минимум, который паттерн умеет отрисовать сам. Текстовые поля — `string`, а
 * не `ReactNode`: каждое из них читает скринридер, а подсветки совпадений нет
 * ни в одном из источников, значит разметка внутри строки не нужна. Место
 * вправе расширить этот тип своими полями (например самим объектом) — generic
 * `TItem` вернёт его обратно в `onSelect` целиком.
 */
export interface SearchFieldItem {
  /** Стабильный ключ строки. Не имя: имена не уникальны. */
  id: string
  /** Первая строка — имя объекта. Обрезается по ширине. */
  name: string
  /**
   * Иконка слева, 16px. Слот, потому что маппинг типа объекта в вид — знание
   * места, и именно здесь копии расходились (амбер-папка макета против
   * `FileTypeIcon kind="folder"` Диска).
   */
  icon?: ReactNode
  /** Правая колонка: дата, размер — короткая приписка, не сжимается. */
  meta?: string
  /** Вторая строка под именем: владелец, местоположение, тип. Обрезается. */
  subtitle?: string
}

/**
 * Состояние выдачи. `ready` — данные соответствуют запросу; `loading` —
 * ответа ещё нет; `error` — запрос не удался.
 *
 * ВНИМАНИЕ: `loading` и `error` в макете отсутствуют И НЕ МОГУТ там появиться —
 * макет фильтрует локальный массив синхронно (`getGlobalDiskSearchResults`),
 * так что состояний «ждём сеть» и «сеть отказала» в нём нет по построению.
 * Поэтому паттерн НЕ вводит для них никакого нового вида: оба рендерятся
 * ровно в тот же слот и тем же оформлением, что и «ничего не найдено» —
 * меняется только подпись, а подписи инъектируются по контракту в любом
 * случае. Вопрос «как ДОЛЖНЫ выглядеть загрузка и ошибка» (спиннер? скелетон
 * строк? ошибка с кнопкой «повторить»?) — дизайнерский, и он заведён
 * предложением, а не решён здесь.
 */
export type SearchFieldStatus = "error" | "loading" | "ready"

/**
 * Подписи. ОБЯЗАТЕЛЬНЫ и БЕЗ ДЕФОЛТОВ.
 *
 * Граница проходит именно здесь, потому что язык принадлежит месту: Диск
 * двуязычен (`ru | en` из `/me`, переключение в рантайме), и русский дефолт в
 * ките был бы тихой регрессией — забытая подпись показывала бы русский текст
 * англоязычному пользователю вместо того, чтобы упасть на сборке. Так уже
 * сделано неправильно в `MoveDestinationDialog` (русские дефолты) и совсем
 * неправильно в `ShareAccessDialog` (русский вшит без пропа вовсе) — здесь этот
 * анти-пример не повторяется.
 *
 * Один обязательный объект, а не восемь обязательных пропов: забыть одну строку
 * невозможно, а место вызова остаётся читаемым.
 */
export interface SearchFieldLabels {
  /** Доступное имя кнопки очистки. */
  clear: string
  /** Выдача пуста при УДАЧНОМ запросе. */
  empty: string
  /**
   * Запрос не удался. Отдельная подпись от `empty` — потому что сегодня в Диске
   * ошибка неотличима от пустоты (`isError` не читается вовсе), и без своей
   * строки этот дефект зафиксировался бы в ките навсегда.
   */
  error: string
  /** Доступное имя поля — у него нет видимой подписи, это единственное имя. */
  input: string
  /** Ответа ещё нет. */
  loading: string
  /**
   * Placeholder. Отдельным пропом от `input`: e2e Диска ищет поле по
   * placeholder с многоточием, а доступное имя не обязано совпадать с ним
   * посимвольно.
   */
  placeholder: string
  /** Доступное имя списка результатов. */
  results: string
  /** Подпись перехода на полную выдачу. */
  showAll: string
}

export interface SearchFieldProps<
  TItem extends SearchFieldItem = SearchFieldItem,
> {
  /**
   * Готовая выдача — уже отфильтрованная, отсортированная и обрезанная
   * стороной места (оба источника: 5 первых по релевантности). Паттерн ничего
   * не фильтрует (`filter={null}`) и не режет: релевантность бэкенда и
   * `localeCompare("ru")` макета — не вид.
   */
  items: readonly TItem[]
  labels: SearchFieldLabels
  onQueryChange: (query: string) => void
  /**
   * Наружу уходит ЭЛЕМЕНТ МЕСТА целиком (generic), а не его `id`: в макете
   * выбор открывает превью или меняет папку, в Диске — `navigate` либо
   * `open_url`, и искать узел обратно по идентификатору незачем.
   */
  onSelect: (item: TItem) => void
  query: string
  /**
   * Сколько символов нужно набрать, прежде чем откроется выдача. Параметр
   * МЕСТА, а не вид: он зависит от того, чем поиск считается на сервере (у
   * Диска триграммный индекс на однобуквенном запросе почти бесполезен, и
   * такой запрос там не отправляется вовсе), а у макета сервера нет. Вид
   * ниже порога задаёт макет, и он один: выдача просто не открыта. Дефолт
   * `1` — ровно поведение макета (`normalizedQuery.length > 0`).
   */
  minQueryLength?: number
  onShowAllResults?: () => void
  status?: SearchFieldStatus
  /**
   * Подавить выдачу, не трогая запрос: место уже показывает полную страницу
   * результатов по этому же запросу (в макете — `showingAllResults`).
   */
  suppressed?: boolean
}

/**
 * SearchField — поле поиска в шапке страницы с выдачей быстрых результатов.
 *
 * ПАТТЕРН, а не экран: это композиция примитивов внутри топбара, а не контент
 * роута (таксономия — packages/screens/AGENTS.md, раздел «Что НЕ является
 * экраном»). Поле и выдача — ОДИН паттерн, а не два: дропдаун привязан к полю
 * анкором (`w-(--anchor-width)`), и весь фокус-танец между ними внутренний.
 *
 * Извлечён из двух разошедшихся копий — макета
 * (apps/lab/src/screens/disk-screen.tsx :: DiskSearchHeader) и Диска
 * (fe-disc/src/components/DiskSearchHeader.tsx). Где копии противоречили друг
 * другу, выбран макет; где макет молчал — сохранён ответ Диска. Полный разбор
 * с причинами — в CHANGELOG.
 *
 * Основа — китовый `Combobox` (base-ui), а не `Popover + Command`. Поле лежит
 * ВНУТРИ комбобокса, поэтому `role="combobox"`, `role="listbox"` у выдачи,
 * `aria-activedescendant`, стрелки `↑/↓`, `Home`/`End` и виртуальный фокус
 * приезжают из примитива; самодельные фокус-механики (`mouseDownRef`,
 * `onBlurCapture` + рефы, ручной `open` по клику) удалены — их работу делают
 * `openOnInputClick` и закрытие по `focusOut`, а вместе с ними из кита ушли
 * `window`/`document`/`setTimeout`.
 *
 * Переход СТРОГО behavior-preserving. В частности Enter сохраняет поведение
 * обеих копий: при открытой выдаче без подсветки — первый результат; со
 * стрелкой/ховером — подсвеченную строку (её выбирает примитив); при закрытой —
 * полная выдача. Смена на «Enter → всегда полная выдача» не делается: два
 * независимых источника совпали на «первый результат», это сильный сигнал
 * «так задумано», и такая смена — отдельный МР с продуктовым решением.
 */
export function SearchField<TItem extends SearchFieldItem = SearchFieldItem>({
  items,
  labels,
  minQueryLength = 1,
  onQueryChange,
  onSelect,
  onShowAllResults,
  query,
  status = "ready",
  suppressed = false,
}: SearchFieldProps<TItem>) {
  // Внутренний `open` — тонкий гейт поверх примитива: выдача открыта только при
  // достаточно длинном запросе и не подавлена. Каждый `onOpenChange` от
  // Combobox пропускается через него; выкинуть целиком нельзя (Escape нечего
  // было бы гасить, а `loading` с нулём строк не удержать открытым).
  const [open, setOpen] = useState(false)
  const anchor = useComboboxAnchor()
  // Подсвеченный (стрелкой/ховером) элемент. Нужен ровно Enter-развилке: если
  // что-то подсвечено, Enter выбирает ЕГО силами примитива; если нет — наш
  // onKeyDown берёт первый результат (совпавшее поведение обеих копий).
  const highlightedRef = useRef<TItem | null>(null)

  const normalizedQuery = query.trim()
  const queryIsLongEnough = normalizedQuery.length >= minQueryLength
  const dropdownOpen = open && queryIsLongEnough && !suppressed

  const selectItem = (item: TItem) => {
    setOpen(false)
    onSelect(item)
  }

  const showAllResults = () => {
    setOpen(false)
    onShowAllResults?.()
  }

  const statusText =
    status === "loading"
      ? labels.loading
      : status === "error"
        ? labels.error
        : labels.empty

  return (
    <Combobox<TItem, false>
      autoHighlight={false}
      filter={null}
      inputValue={query}
      onInputValueChange={(value, details) => {
        // Combobox сам переписывает поле по многим причинам: выбор строки →
        // подставить её значение (`item-press`), Escape → откатить, и т.д.
        // Для поиска наружу нужен ТОЛЬКО реальный текст — набор и крестик.
        // Иначе выбор строки залил бы поле сериализованным доменным объектом
        // («[object Object]»), а Escape очистил бы запрос (чего быть не должно —
        // Escape закрывает выдачу, но не стирает). Отключить `fillInputOnItemPress`
        // в примитиве нельзя (кит его не пробрасывает), поэтому фильтруем здесь.
        if (
          details.reason === "input-change" ||
          details.reason === "clear-press"
        ) {
          onQueryChange(value)
        }
      }}
      onItemHighlighted={(item) => {
        highlightedRef.current = (item as TItem | undefined) ?? null
      }}
      // Гейт (порог длины / suppressed) применяется в `dropdownOpen` при
      // рендере, где `query` уже свежий. Здесь — только отражаем намерение
      // примитива: гейтить тут значило бы читать `query` устаревшим на кадр
      // (примитив шлёт onOpenChange раньше, чем контролируемый `query`
      // прилетит обратно пропом) и терять открытие на первом символе.
      onOpenChange={(nextOpen) => setOpen(nextOpen)}
      onValueChange={(value) => {
        if (value) {
          selectItem(value as TItem)
        }
      }}
      open={dropdownOpen}
      value={null}
    >
      <InputGroup
        className="w-full max-w-[500px] min-w-0 bg-background"
        ref={anchor}
      >
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <ComboboxPrimitive.Input
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return
            }

            // Есть подсветка — Enter отдаётся примитиву (он вызовет
            // onValueChange по подсвеченной строке). Без подсветки —
            // наш разбор: первый результат при открытой выдаче (и не в
            // загрузке), иначе полная выдача.
            if (dropdownOpen && highlightedRef.current) {
              return
            }

            event.preventDefault()
            if (dropdownOpen && items[0] && status !== "loading") {
              selectItem(items[0])
            } else {
              showAllResults()
            }
          }}
          render={
            <InputGroupInput
              aria-label={labels.input}
              placeholder={labels.placeholder}
            />
          }
        />
        {normalizedQuery ? (
          <InputGroupAddon align="inline-end">
            {/* Обычная кнопка, а НЕ ComboboxClear: примитивный Clear чистит
                ВЫБРАННОЕ значение, а у поиска выбранного нет (value=null), и он
                схлопывается в скрытый элемент. Крестику поиска нужно чистить
                ТЕКСТ поля — это onQueryChange(""). */}
            <InputGroupButton
              aria-label={labels.clear}
              onClick={() => {
                onQueryChange("")
                setOpen(false)
              }}
              onMouseDown={(event) => event.preventDefault()}
              size="icon-xs"
              variant="ghost"
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {dropdownOpen ? (
        <ComboboxContent anchor={anchor} className="p-1">
          {/* Живая область: остаётся смонтированной всегда (требование base-ui),
              видима и занимает место только когда строк нет — тогда показывает
              статус. При непустой выдаче скрыта визуально, но остаётся в
              a11y-дереве. */}
          <ComboboxStatus
            className={items.length > 0 ? "sr-only p-0" : undefined}
          >
            {items.length === 0 ? statusText : ""}
          </ComboboxStatus>
          {/* Быстрая выдача уже ограничивается потребителем пятью строками,
              поэтому ей не нужен внутренний скролл общего ComboboxList:
              список целиком растёт внутри попапа. */}
          <ComboboxList
            aria-label={labels.results}
            className="max-h-none! overflow-y-visible! overscroll-auto p-0"
          >
            {items.map((item) => (
              <ComboboxItem
                className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 py-2 pr-1.5"
                key={item.id}
                value={item}
              >
                {item.icon}
                <div className="min-w-0">
                  <div className="truncate font-medium">{item.name}</div>
                  {item.subtitle ? (
                    <div className="truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </div>
                  ) : null}
                </div>
                {item.meta ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.meta}
                  </span>
                ) : null}
              </ComboboxItem>
            ))}
          </ComboboxList>
          {items.length > 0 && onShowAllResults ? (
            <div className="border-t border-border pt-1">
              <Button
                onClick={(event) => {
                  event.stopPropagation()
                  showAllResults()
                }}
                onMouseDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                size="sm"
                variant="ghost"
                width="full"
              >
                {labels.showAll}
              </Button>
            </div>
          ) : null}
        </ComboboxContent>
      ) : null}
    </Combobox>
  )
}
