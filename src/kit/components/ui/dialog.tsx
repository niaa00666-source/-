"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useScopeContainer } from "@/components/theme-provider"
import { XIcon } from "../../icons"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ container, ...props }: DialogPrimitive.Portal.Props) {
  const scopeContainer = useScopeContainer()
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      container={container ?? scopeContainer}
      {...props}
    />
  )
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  size,
  scrollable = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  /**
   * Ширина диалога. Шкала вместо инлайнового `max-width` у потребителя: тот ещё и
   * перебивал мобильный кап кита `max-w-[calc(100%-2rem)]`, из-за чего на узком
   * экране диалог упирался в края.
   */
  size?: "sm" | "md" | "lg" | "xl"
  /**
   * По умолчанию тело диалога скроллится, а шапка и футер остаются на месте.
   * Рецепт «ограничить высоту + сетка из трёх рядов + overflow» собирался
   * классами снаружи в каждом продукте; вместе с `DialogBody` он теперь
   * принадлежит киту. Для нестандартной композиции режим можно отключить через
   * `scrollable={false}`.
   */
  scrollable?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-size={size}
        data-close-button={showCloseButton ? "true" : undefined}
        data-scrollable={scrollable ? "true" : undefined}
        className={cn(
          // `grid-cols-[minmax(0,1fr)]` — НЕ оформление, а единственное, что не даёт
          // содержимому распереть диалог. Грид без объявленных колонок имеет одну
          // НЕЯВНУЮ дорожку `auto`, а её базовый размер — min-content содержимого;
          // у текста с `white-space: nowrap` min-content равен ПОЛНОЙ ширине строки.
          // `max-width` при этом ограничивает только БОКС попапа, поэтому дорожка
          // спокойно вылезала за него: измерено на длинном имени файла в
          // ShareAccessDialog — бокс 576px, `grid-template-columns: 1884.25px`,
          // шапка разложена на 1884px и начинается ЛЕВЕЕ бокса, кнопки «Настройки»
          // и «Закрыть» уехали за правый край. `truncate`/`min-w-0` на заголовке
          // этого не лечили: они гасят автоминимум ФЛЕКС-элемента, а не вклад
          // содержимого в min-content дорожки грида. `minmax(0,1fr)` разрешает
          // дорожке быть уже содержимого — и тогда `truncate` внутри начинает
          // работать. Правка общая для ВСЕХ диалогов кита: болезнь структурная.
          "group/dialog-content fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 grid-cols-[minmax(0,1fr)] gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          "data-[size=lg]:sm:max-w-lg data-[size=md]:sm:max-w-md data-[size=xl]:sm:max-w-xl",
          scrollable &&
            "max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      // Резерв под собственную кнопку закрытия: она `size="icon-sm"` (28px) при
      // `right-2` (8px), то есть заходит в текстовый бокс заголовка на 20px при
      // padding 16. 32px резерва дают 12px зазора. Только когда кнопка есть.
      className={cn(
        "flex flex-col gap-2 group-data-[close-button]/dialog-content:pe-8",
        className
      )}
      {...props}
    />
  )
}

/**
 * Скроллящееся тело диалога — работает вместе с `DialogContent scrollable`.
 *
 * Отдельный слот, а не класс на произвольном div: строка сетки, которая обязана
 * уметь сжиматься (`min-h-0`), — часть рецепта, а не оформление содержимого.
 */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "-mx-1 min-h-0 overflow-y-auto overscroll-contain px-1",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t border-border bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  truncate,
  ...props
}: DialogPrimitive.Title.Props & {
  /** Обрезать длинный заголовок в одну строку (в диалогах об объекте это имя файла). */
  truncate?: boolean
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-base leading-none font-medium",
        truncate && "min-w-0 truncate",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  srOnly,
  ...props
}: DialogPrimitive.Description.Props & {
  /**
   * Описание нужно только скринридеру. Диалог обязан иметь описание для a11y, но
   * визуально оно бывает избыточным — раньше это писали классом `sr-only` снаружи.
   */
  srOnly?: boolean
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        srOnly && "sr-only",
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
