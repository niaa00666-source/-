import { useState } from "react"
import {
  Download,
  ExternalLink,
  FileImage,
  MoreHorizontal,
  ZoomIn,
  ZoomOut,
  X,
} from "../../icons"

import {
  FileTypeIcon,
  type FileTypeIconKind,
} from "@/components/ui/file-type-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type PreviewFile = {
  kind: FileTypeIconKind
  name: string
  size: string
}

function PreviewDocument({ file }: { file: PreviewFile }) {
  if (file.kind === "picture") {
    return (
      <div className="flex aspect-video w-full max-w-5xl items-center justify-center rounded-lg bg-muted text-muted-foreground shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <FileImage className="size-16" />
          <div className="text-center">
            <div className="text-base font-medium text-foreground">
              {file.name}
            </div>
            <div className="text-sm">{file.size}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-[72rem] w-full max-w-3xl bg-background px-16 py-14 text-foreground shadow-2xl">
      <div className="mb-12 flex items-center justify-between gap-6">
        <FileTypeIcon kind={file.kind} />
        <span className="text-xs text-muted-foreground">
          Внутренний документ · {file.size}
        </span>
      </div>
      <h2 className="mb-3 text-3xl font-semibold">Регламент хранения файлов</h2>
      <p className="mb-10 text-sm text-muted-foreground">
        Версия 2.4 · обновлено 15 июля 2026 года
      </p>
      <div className="flex flex-col gap-8 text-base leading-7">
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">1. Назначение</h3>
          <p>
            Документ описывает правила хранения, совместного использования и
            удаления рабочих материалов в пространстве Link.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">2. Сроки хранения</h3>
          <p>
            Проектные материалы хранятся в течение всего срока работы команды.
            Объекты в корзине автоматически удаляются через 30 дней.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">3. Общий доступ</h3>
          <p>
            Внешний доступ предоставляется владельцем объекта. Для
            конфиденциальных материалов рекомендуется ограничивать срок действия
            ссылки и скачивание.
          </p>
        </section>
      </div>
    </article>
  )
}

export function FilePreviewDialog({
  file,
  onDownload,
  onOpenChange,
  onOpenInNewWindow,
  open,
}: {
  file: PreviewFile | null
  onDownload: () => void
  onOpenChange: (open: boolean) => void
  onOpenInNewWindow: () => void
  open: boolean
}) {
  const [zoom, setZoom] = useState(100)

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-lg bg-product-rail/95 p-0 text-product-rail-foreground ring-product-rail-foreground/20 sm:max-w-[calc(100%-1rem)]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          Предпросмотр {file?.name ?? "файла"}
        </DialogTitle>
        <DialogDescription srOnly>
          Предпросмотр файла с масштабированием и действиями.
        </DialogDescription>

        <header className="flex h-14 min-w-0 items-center gap-3 border-b border-product-rail-foreground/20 px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {file ? <FileTypeIcon kind={file.kind} /> : null}
            <span className="truncate text-sm font-medium">
              {file?.name ?? "Файл"}
            </span>
            <span className="hidden text-xs opacity-70 sm:inline">
              {file?.size}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label="Уменьшить масштаб"
                    disabled={zoom <= 50}
                    onClick={() => setZoom((value) => Math.max(50, value - 25))}
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <ZoomOut />
              </TooltipTrigger>
              <TooltipContent>Уменьшить масштаб</TooltipContent>
            </Tooltip>
            <Button
              aria-label="Сбросить масштаб"
              className="tabular-nums"
              onClick={() => setZoom(100)}
              size="sm"
              variant="ghost"
            >
              {zoom}%
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label="Увеличить масштаб"
                    disabled={zoom >= 200}
                    onClick={() =>
                      setZoom((value) => Math.min(200, value + 25))
                    }
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <ZoomIn />
              </TooltipTrigger>
              <TooltipContent>Увеличить масштаб</TooltipContent>
            </Tooltip>
            <Separator
              className="mx-1 h-5 bg-product-rail-foreground/20"
              orientation="vertical"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    aria-label="Действия с файлом"
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={onOpenInNewWindow}>
                    <ExternalLink />
                    Открыть в новом окне
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDownload}>
                    <Download />
                    Скачать
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label="Закрыть предпросмотр"
                    onClick={() => onOpenChange(false)}
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <X />
              </TooltipTrigger>
              <TooltipContent>Закрыть</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <ScrollArea className="min-h-0">
          <div className="flex min-h-full items-start justify-center p-6 sm:p-10">
            <div
              className="flex w-full origin-top justify-center transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {file ? <PreviewDocument file={file} /> : null}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
