// folder-color-picker.tsx — палитра «Цвет папки» для меню строки файла.
//
// Живёт в ките, а не в экране, по двум причинам, и обе проверяемы.
//
// 1. Слой. Палитра ничего не знает ни про таблицу файлов, ни про её контракт:
//    это радиогруппа из ролей `supportColorRoles` — того самого набора, из
//    которого списаны и токены папки, и палитра продукта (12 ролей). Всё,
//    из чего она собрана, — китовые примитивы.
// 2. Адресат. Меню строки собирает ПРОДУКТ, а не экран: и витрина, и Диск
//    строят его сами из `DropdownMenu` / `ContextMenu`. Продукту нужна одна
//    вставка в оба меню, иначе он соберёт палитру руками — и это будет второй
//    источник правды о том, какие цвета вообще существуют.
//
// Поэтому паттерн сам рисует и группу, и её заголовок для обоих меню (проп
// `surface`): раньше это делало место вызова, и место вызова, естественно,
// удвоилось — витрина держала две почти одинаковые сборки, dropdown и context.

import { useId } from "react"

import {
  ContextMenuGroup,
  ContextMenuLabel,
} from "@/components/ui/context-menu"
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FolderColorPickerLabels } from "@/components/patterns/folder-color-picker-labels"
import {
  supportColorBackgroundClasses,
  supportColorBorderClasses,
  supportColorCheckedClasses,
  supportColorRoles,
  type SupportColorRole,
} from "@/lib/support-colors"
import { cn } from "@/lib/utils"

/**
 * Куда встроена палитра.
 *
 * `"dropdown"` / `"context"` — внутрь `DropdownMenuContent` /
 * `ContextMenuContent`: паттерн сам оборачивается в группу этого меню и рисует
 * её заголовок, потому что группа и заголовок у двух меню РАЗНЫЕ примитивы
 * (`MenuPrimitive.Group` против `ContextMenuPrimitive.Group`), и подставить не
 * тот — значит потерять связь заголовка с группой для скринридера.
 *
 * `"bare"` — палитра сама по себе (стенд кита, панель свойств): ни группы, ни
 * заголовка меню, ни его отбивок — только сетка кружков, которую место кладёт
 * куда хочет. Имя у радиогруппы всё равно есть: `groupLabel` уходит в
 * `aria-label`, потому что видимого заголовка рядом здесь никто не обещал.
 */
export type FolderColorPickerSurface = "dropdown" | "context" | "bare"

export type FolderColorPickerProps = {
  /**
   * Выбранная роль. Для папки без сохранённого цвета (`null`) паттерн показывает
   * согласованный цвет по умолчанию — янтарный. Открытие палитры ничего не
   * записывает: `onColorChange` вызывается только после выбора человеком.
   */
  color: SupportColorRole | null
  className?: string
  /**
   * Подписи места — проп ОБЯЗАТЕЛЬНЫЙ, как у всех паттернов кита: язык
   * принадлежит месту, у компонента подписей-дефолтов нет. RU-набор для макетов
   * лежит рядом — `ruFolderColorPickerLabels`, и его надо передать явно.
   */
  labels: FolderColorPickerLabels
  onColorChange: (color: SupportColorRole) => void
  /** Обязателен: см. `FolderColorPickerSurface` — молчаливого «правильного»
   *  значения тут нет, в меню без своей группы заголовок теряет связь с
   *  радиогруппой. */
  surface: FolderColorPickerSurface
}

/**
 * палитра «Цвет папки»: радиогруппа из 12 ролей `supportColorRoles`, готовая к
 * вставке И в `DropdownMenu`, И в `ContextMenu` — одним пропом `surface`.
 *
 * Отдаёт наружу выбранную РОЛЬ (`support-amber`), а не цвет: на роли ключуется и
 * тонировка иконки папки (её делает таблица файлов из `@scrambled/screens`,
 * проп `folderColor`), и то, что уходит на бекенд, поэтому HEX-у здесь взяться
 * неоткуда. Набор ролей — канонический, из `@/lib/support-colors`: он один и тот
 * же у токенов темы, у палитры бекенда и у этого паттерна.
 *
 * Янтарный — первый цвет и визуальный выбор по умолчанию для `color={null}`.
 * Палитра не снимает цвет: пользователь только переключается между ролями.
 */
export function FolderColorPicker({
  className,
  color,
  labels,
  onColorChange,
  surface,
}: FolderColorPickerProps) {
  const labelId = useId()
  const defaultColor: SupportColorRole = "support-amber"
  const orderedColors = [
    defaultColor,
    ...supportColorRoles.filter((role) => role !== defaultColor),
  ]

  // Имя радиогруппы. В меню оно берётся С ВИДИМОГО заголовка группы
  // (`aria-labelledby`), а не пишется второй раз строкой: тот же заголовок уже
  // называет группу меню, и две копии одного имени в DOM разошлись бы. Без
  // группы (`bare`) видимого заголовка нет — там только `aria-label`.
  const groupNameProps =
    surface === "bare"
      ? { "aria-label": labels.groupLabel }
      : { "aria-labelledby": labelId }

  const swatches = (
    <RadioGroup
      {...groupNameProps}
      className={cn(
        "grid w-fit grid-cols-6 gap-2",
        // Отбивки меню — свойство МЕНЮ, а не сетки: у `bare` их нет, иначе
        // палитра тащила бы чужие отступы в панель свойств или диалог.
        surface !== "bare" && "px-3 pb-2",
        className
      )}
      data-slot="folder-color-picker"
      onValueChange={(value) => onColorChange(value as SupportColorRole)}
      value={color ?? defaultColor}
    >
      {orderedColors.map((option) => (
        <RadioGroupItem
          aria-label={labels.names[option]}
          className={cn(
            "size-6 border-2",
            supportColorBackgroundClasses[option],
            supportColorBorderClasses[option],
            supportColorCheckedClasses[option]
          )}
          key={option}
          title={labels.names[option]}
          value={option}
        />
      ))}
    </RadioGroup>
  )

  if (surface === "dropdown") {
    return (
      <DropdownMenuGroup>
        <DropdownMenuLabel id={labelId}>{labels.groupLabel}</DropdownMenuLabel>
        {swatches}
      </DropdownMenuGroup>
    )
  }

  if (surface === "context") {
    return (
      <ContextMenuGroup>
        <ContextMenuLabel id={labelId}>{labels.groupLabel}</ContextMenuLabel>
        {swatches}
      </ContextMenuGroup>
    )
  }

  return swatches
}
