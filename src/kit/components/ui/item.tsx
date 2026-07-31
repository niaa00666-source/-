import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        "group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-2", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted",
  {
    variants: {
      variant: {
        default: "border-transparent",
        interactive:
          "border-transparent hover:bg-muted/50 active:bg-muted aria-selected:bg-muted aria-selected:hover:bg-muted [&>[data-slot=item-media]]:translate-y-0 [&>[data-slot=item-media]]:self-start",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof itemVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(itemVariants({ variant, size, className })),
      },
      props
    ),
    render,
    state: {
      slot: "item",
      variant,
      size,
    },
  })
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        // `min-w-0` рядом с `flex-1`: без него автоминимум флекс-элемента равен
        // min-content содержимого, и строка перестаёт сжиматься. Измерено на
        // списке доступа ShareAccessDialog с ФИО из 54 символов: `ItemTitle`
        // (`line-clamp-1 w-fit`) разворачивался на всю ширину имени, `ItemActions`
        // не влезал и ПЕРЕНОСИЛСЯ на вторую строку (`Item` — `flex-wrap`), строка
        // вырастала с 80 до 92px, а имя не трималось вовсе. Место правки здесь, а
        // не в диалоге: `line-clamp`/`truncate` у любого потребителя Item молча
        // не работает по одной и той же причине.
        "flex min-w-0 flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        // `max-w-full` рядом с `w-fit`: без него заголовок строки ВЫХОДИТ ЗА
        // ГРАНИЦУ своего контейнера на НЕРАЗРЫВНОМ значении. `w-fit` — это
        // `fit-content`, то есть min(max-content, max(min-content, доступное)):
        // у текста без точек переноса min-content равен всей строке, и «доступное»
        // в формуле проигрывает. Измерено на списке доступа ShareAccessDialog при
        // попапе 504px: имя-адрес из 96 символов давало блок 684px, уезжавший на
        // 247px за правый край диалога. Случай не искусственный — Диск подставляет
        // в имя человека адрес, когда display_name пуст.
        //
        // МНОГОТОЧИЕ этим не появляется и не может: `flex` перебивает display у
        // `line-clamp-1` (проверено — вычисленный display равен `flex`), поэтому от
        // клампа остаётся только `overflow: hidden`, а `text-overflow` к анонимному
        // флекс-элементу с текстом не применяется. Обрезка — дело ПОТОМКА:
        // `<span className="truncate">` рядом с иконками и индикаторами (так это
        // уже сделано в `file-grid`). Примитив отвечает за то, чтобы строка не
        // разъехалась; чем именно вырождается текст, решает потребитель.
        "line-clamp-1 flex w-fit max-w-full items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
