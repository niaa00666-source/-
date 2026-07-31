"use client"

import { Fragment, type ReactNode } from "react"
import { ChevronRight, Folder, FolderPlus, HardDrive } from "../../icons"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface MoveDestinationFolder {
  id: string
  name: string
  parentId?: string | null
}

export interface MoveDestinationDialogProps<
  TFolder extends MoveDestinationFolder = MoveDestinationFolder,
> {
  currentFolderId: string | null
  folders: readonly TFolder[]
  onConfirm: (folderId: string | null) => void
  onCreateFolder: (folderId: string | null) => void
  onNavigate: (folderId: string | null) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  selectionLabel: ReactNode
  confirmDisabled?: boolean
  confirmDisabledReason?: string
  confirmLabel?: string
  createFolderLabel?: string
  description?: string
  emptyLabel?: string
  renderFolderIcon?: (folder: TFolder) => ReactNode
  rootLabel?: string
  selectionIcon?: ReactNode
  sourceParentIds?: readonly (string | null)[]
  title?: string
}

export function MoveDestinationDialog<
  TFolder extends MoveDestinationFolder = MoveDestinationFolder,
>({
  confirmDisabled = false,
  confirmDisabledReason = "Объект уже находится в выбранной папке",
  confirmLabel = "Переместить",
  createFolderLabel = "Создать папку",
  currentFolderId,
  description = "Выберите новое местоположение для перемещения объекта.",
  emptyLabel = "В этой папке нет вложенных папок",
  folders,
  onConfirm,
  onCreateFolder,
  onNavigate,
  onOpenChange,
  open,
  renderFolderIcon,
  rootLabel = "Мой диск",
  selectionIcon,
  selectionLabel,
  sourceParentIds = [],
  title = "Переместить",
}: MoveDestinationDialogProps<TFolder>) {
  const currentFolders = folders.filter(
    (folder) => (folder.parentId ?? null) === currentFolderId
  )
  const folderTrail = (() => {
    const trail: TFolder[] = []
    let folderId = currentFolderId

    while (folderId) {
      const folder = folders.find((candidate) => candidate.id === folderId)

      if (!folder) {
        break
      }

      trail.unshift(folder)
      folderId = folder.parentId ?? null
    }

    return trail
  })()
  const collapseFolderTrail = folderTrail.length > 2
  const hiddenFolderTrail = collapseFolderTrail ? folderTrail.slice(0, -2) : []
  const visibleFolderTrail = collapseFolderTrail
    ? folderTrail.slice(-2)
    : folderTrail
  const sameFolderDisabled =
    sourceParentIds.length > 0 &&
    sourceParentIds.every((parentId) => parentId === currentFolderId)
  const moveDisabled = confirmDisabled || sameFolderDisabled
  const folderIcon = (folder: TFolder) =>
    renderFolderIcon?.(folder) ?? <Folder className="size-5" />

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onNavigate(null)
        }
        onOpenChange(nextOpen)
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogBody className="grid gap-4">
          <div className="flex min-w-0 items-center gap-3 rounded-lg bg-muted/50 p-3">
            {selectionIcon ?? <Folder className="size-5 shrink-0" />}
            <span className="truncate font-medium">{selectionLabel}</span>
          </div>

          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="h-7 flex-nowrap overflow-hidden">
              {collapseFolderTrail ? (
                <BreadcrumbItem className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          aria-label="Показать предыдущие папки"
                          size="icon-sm"
                          variant="ghost"
                        />
                      }
                    >
                      <BreadcrumbEllipsis />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-48">
                      <DropdownMenuItem onClick={() => onNavigate(null)}>
                        <HardDrive />
                        <span>{rootLabel}</span>
                      </DropdownMenuItem>
                      {hiddenFolderTrail.map((folder) => (
                        <DropdownMenuItem
                          key={folder.id}
                          onClick={() => onNavigate(folder.id)}
                        >
                          {folderIcon(folder)}
                          <span>{folder.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem className="shrink-0">
                  {folderTrail.length === 0 ? (
                    <BreadcrumbPage className="font-medium">
                      {rootLabel}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={
                        <button
                          onClick={() => onNavigate(null)}
                          type="button"
                        />
                      }
                    >
                      {rootLabel}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              )}
              {visibleFolderTrail.map((folder, index) => {
                const current = index === visibleFolderTrail.length - 1

                return (
                  <Fragment key={folder.id}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="min-w-0 shrink">
                      {current ? (
                        <BreadcrumbPage className="truncate font-medium">
                          {folder.name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          className="truncate"
                          render={
                            <button
                              onClick={() => onNavigate(folder.id)}
                              type="button"
                            />
                          }
                        >
                          {folder.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>

          <ScrollArea className="h-72 min-h-0 rounded-lg border">
            <div
              aria-label="Папки для перемещения"
              className="h-full p-1"
              role="list"
            >
              {currentFolders.length > 0 ? (
                currentFolders.map((folder) => (
                  <Button
                    align="start"
                    className="h-12 gap-3 rounded-md px-3 font-normal"
                    key={folder.id}
                    onClick={() => onNavigate(folder.id)}
                    role="listitem"
                    variant="ghost"
                    width="full"
                  >
                    {folderIcon(folder)}
                    <span className="min-w-0 flex-1 truncate text-left">
                      {folder.name}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Button>
                ))
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-muted-foreground">
                  {emptyLabel}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <Button
            onClick={() => onCreateFolder(currentFolderId)}
            variant="outline"
          >
            <FolderPlus />
            {createFolderLabel}
          </Button>
          <Button
            disabled={moveDisabled}
            onClick={() => {
              onConfirm(currentFolderId)
              onNavigate(null)
            }}
            title={moveDisabled ? confirmDisabledReason : undefined}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
