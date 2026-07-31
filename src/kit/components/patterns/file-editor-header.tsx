import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  ChevronDown,
  CloudCheck,
  CloudOff,
  Copy,
  Download,
  Link2,
  LockKeyhole,
  MoreHorizontal,
  PanelRightOpen,
  Settings,
  Share2,
  UserRound,
} from "../../icons"

import {
  FileTypeIcon,
  type FileTypeIconKind,
} from "@/components/ui/file-type-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type FileEditorSyncStatus = "synced" | "unsynced"

function SyncStatusIcon({ status }: { status: FileEditorSyncStatus }) {
  const synced = status === "synced"
  const Icon = synced ? CloudCheck : CloudOff
  const label = synced ? "Синхронизировано" : "Не синхронизировано"

  return (
    <span
      aria-label={label}
      className="inline-flex size-5 shrink-0 items-center justify-center text-muted-foreground"
      role="img"
      title={label}
    >
      <Icon className="size-4" />
    </span>
  )
}

function EditableFileTitle({
  objectLabel,
  onTitleChange,
  title,
}: {
  objectLabel: string
  onTitleChange: (value: string) => void
  title: string
}) {
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)
  const displayTitle = title.trim() || "Без названия"
  const measuredTitle = draftTitle || displayTitle

  useEffect(() => {
    if (!editing) {
      return
    }

    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editing])

  const commitTitle = () => {
    const nextTitle = draftTitle.trim() || "Без названия"
    onTitleChange(nextTitle)
    setDraftTitle(nextTitle)
    setEditing(false)
  }

  const cancelEdit = () => {
    setDraftTitle(title)
    setEditing(false)
  }

  if (editing) {
    return (
      <span className="grid max-w-[40vw] min-w-[8ch]">
        <span
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 h-8 px-2 text-sm font-medium whitespace-pre"
        >
          {measuredTitle}
        </span>
        <Input
          ref={inputRef}
          aria-label={`Название ${objectLabel}`}
          className="col-start-1 row-start-1 h-8 w-full min-w-0 border-input bg-background px-2 font-medium shadow-none"
          onBlur={commitTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitTitle()
            }

            if (event.key === "Escape") {
              cancelEdit()
            }
          }}
          value={draftTitle}
        />
      </span>
    )
  }

  return (
    <button
      aria-label={`Редактировать название ${objectLabel}`}
      className="h-8 w-fit max-w-[40vw] truncate rounded-md px-2 text-left text-sm font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => {
        setDraftTitle(title)
        setEditing(true)
      }}
      type="button"
    >
      {displayTitle}
    </button>
  )
}

export function FileEditorHeader({
  fileKind,
  objectLabel,
  accessRequestCount = 0,
  onBack,
  onCopyLink,
  onOpenAccess,
  onOpenPanel,
  onTitleChange,
  settingsLabel,
  syncStatus,
  title,
}: {
  fileKind: FileTypeIconKind
  objectLabel: string
  accessRequestCount?: number
  onBack: () => void
  onCopyLink?: () => void
  onOpenAccess: () => void
  onOpenPanel: () => void
  onTitleChange: (value: string) => void
  settingsLabel: string
  syncStatus: FileEditorSyncStatus
  title: string
}) {
  return (
    <div
      className="flex h-full min-w-0 flex-1 items-center gap-2"
      data-editor-region="EditorHeader"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label="Назад"
              onClick={onBack}
              size="icon"
              variant="ghost"
            />
          }
        >
          <ArrowLeft />
        </TooltipTrigger>
        <TooltipContent>Назад</TooltipContent>
      </Tooltip>

      <div className="flex min-w-0 flex-1 items-center gap-1">
        <FileTypeIcon kind={fileKind} />
        <EditableFileTitle
          objectLabel={objectLabel}
          onTitleChange={onTitleChange}
          title={title}
        />
        <SyncStatusIcon status={syncStatus} />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ButtonGroup>
          <Button onClick={onOpenAccess} size="default" variant="outline">
            <Share2 />
            Настройки доступа
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label="Меню настроек доступа"
                  indicator={accessRequestCount > 0 ? "dot" : undefined}
                  indicatorLabel={
                    accessRequestCount > 0
                      ? `Новых запросов на доступ: ${accessRequestCount}`
                      : undefined
                  }
                  size="icon"
                  variant="outline"
                />
              }
            >
              <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-64">
              <DropdownMenuItem onClick={onOpenAccess}>
                <UserRound />
                <span className="flex-1">Запросы на доступ</span>
                {accessRequestCount > 0 ? (
                  <Badge
                    className="ml-4 text-primary-foreground!"
                    size="counter"
                  >
                    {accessRequestCount}
                  </Badge>
                ) : null}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyLink}>
                <Link2 />
                Копировать ссылку
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <LockKeyhole />
                Доступно только вам
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={`Действия с ${objectLabel}`}
                size="icon"
                variant="ghost"
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuItem>
              <Copy />
              Создать копию
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download />
              Скачать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenPanel}>
              <PanelRightOpen />
              Открыть панель
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              {settingsLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
