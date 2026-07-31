import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Paperclip,
  Quote,
  ShieldAlert,
  Signature,
  Strikethrough,
  Table2,
  Trash2,
  X,
} from "../../icons"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FileTypeIcon } from "@/components/ui/file-type-icon"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type MailEditorDisplayMode = "floating" | "fullscreen" | "minimized"

export type MailEditorAccount = {
  id: string
  label: string
  optionLabel?: string
}

export type MailEditorSignature = {
  body: string
  id: string
  name: string
}

export type MailEditorValue = {
  attachmentName?: string
  attachmentNames?: string[]
  bcc?: string
  body: string
  cc: string
  from?: string
  important?: boolean
  signatureId?: string
  subject: string
  to: string
}

export type MailEditorLabels = {
  attachFiles: string
  attachmentLocal: string
  attachmentRemove: (name: string) => string
  attachmentTest: string
  bcc: string
  body: string
  bodyPlaceholder: string
  cc: string
  close: string
  discardDraft: string
  expand: string
  floating: string
  formatting: {
    bold: string
    code: string
    codeBlock: string
    heading: string
    horizontalRule: string
    italic: string
    link: string
    orderedList: string
    quote: string
    strike: string
    table: string
    unorderedList: string
  }
  from: string
  fromPrefix: string
  fullscreen: string
  importantOff: string
  importantOn: string
  minimize: string
  noSignature: string
  optionalPlaceholder: string
  recipientError: string
  recipientPlaceholder: string
  restore: string
  saveDraft: string
  saved: string
  saving: string
  send: string
  signature: string
  subject: string
  subjectPlaceholder: string
  to: string
}

export const ruMailEditorLabels: MailEditorLabels = {
  attachFiles: "Прикрепить файлы",
  attachmentLocal: "Локальное вложение",
  attachmentRemove: (name) => `Удалить ${name}`,
  attachmentTest: "Тестовое вложение · 248 КБ",
  bcc: "Скрытая",
  body: "Сообщение",
  bodyPlaceholder: "Введите текст письма",
  cc: "Копия",
  close: "Закрыть редактор",
  discardDraft: "Удалить черновик",
  expand: "Развернуть",
  floating: "Плавающее окно",
  formatting: {
    bold: "Полужирный",
    code: "Моноширинный",
    codeBlock: "Блок кода",
    heading: "Заголовок",
    horizontalRule: "Горизонтальная линия",
    italic: "Курсив",
    link: "Ссылка",
    orderedList: "Нумерованный список",
    quote: "Цитата",
    strike: "Зачёркнутый",
    table: "Таблица",
    unorderedList: "Маркированный список",
  },
  from: "От кого",
  fromPrefix: "от",
  fullscreen: "На весь экран",
  importantOff: "Снять отметку «Важное»",
  importantOn: "Отметить как важное",
  minimize: "Свернуть",
  noSignature: "Без подписи",
  optionalPlaceholder: "Необязательно",
  recipientError: "Добавьте хотя бы одного получателя.",
  recipientPlaceholder: "name@example.com",
  restore: "Восстановить размер",
  saveDraft: "Сохранить черновик",
  saved: "Черновик сохранён",
  saving: "Сохранение черновика…",
  send: "Отправить",
  signature: "Подпись",
  subject: "Тема",
  subjectPlaceholder: "Тема письма",
  to: "Кому",
}

function IconAction({
  children,
  label,
  onClick,
  onPointerDown,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  onPointerDown?: React.PointerEventHandler<HTMLElement>
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            onClick={onClick}
            onPointerDown={onPointerDown}
            size="icon-sm"
            type="button"
            variant="ghost"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

const richTextMarkupPattern =
  /<(?:a|blockquote|br|code|div|h[1-6]|hr|li|ol|p|pre|s|strong|table|tbody|td|th|thead|tr|ul)\b/i

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function toEditorHtml(value: string) {
  if (!value) {
    return ""
  }

  if (richTextMarkupPattern.test(value) || /&(?:#\d+|[a-z]+);/i.test(value)) {
    return value
  }

  return escapeHtml(value).replaceAll("\n", "<br>")
}

function isEditorHtmlEmpty(value: string) {
  if (/<(?:hr|table)\b/i.test(value)) {
    return false
  }

  return !value
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

export type MailEditorProps<TValue extends MailEditorValue = MailEditorValue> =
  {
    accounts: readonly MailEditorAccount[]
    displayMode: MailEditorDisplayMode
    labels: MailEditorLabels
    onClose: () => void
    onDiscard: () => void
    onDisplayModeChange: (mode: MailEditorDisplayMode) => void
    onSaveDraft: (value: TValue) => void
    onSend: (value: TValue) => void
    onValueChange: (value: TValue) => void
    signatures?: readonly MailEditorSignature[]
    title: string
    value: TValue
  }

export function MailEditor<TValue extends MailEditorValue>({
  accounts,
  displayMode,
  labels,
  onClose,
  onDiscard,
  onDisplayModeChange,
  onSaveDraft,
  onSend,
  onValueChange,
  signatures = [],
  title,
  value,
}: MailEditorProps<TValue>) {
  const [submitted, setSubmitted] = useState(false)
  const [showCc, setShowCc] = useState(Boolean(value.cc))
  const [showBcc, setShowBcc] = useState(Boolean(value.bcc))
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )
  const bodyRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLElement>(null)
  const lastEditorBodyRef = useRef("")
  const fileRef = useRef<HTMLInputElement>(null)
  const resizeSessionRef = useRef<
    | {
        height: number
        pointerId: number
        width: number
        x: number
        y: number
      }
    | undefined
  >(undefined)
  const [floatingSize, setFloatingSize] = useState({
    height: 600,
    width: 620,
  })
  const minimized = displayMode === "minimized"
  const selectedAccount =
    accounts.find((account) => account.id === value.from) ?? accounts[0]
  const setValue = (next: TValue | ((current: TValue) => TValue)) => {
    onValueChange(typeof next === "function" ? next(value) : next)
  }

  useEffect(() => {
    const savingTimer = window.setTimeout(() => setSaveStatus("saving"), 0)
    const savedTimer = window.setTimeout(() => {
      onSaveDraft(value)
      setSaveStatus("saved")
    }, 700)

    return () => {
      window.clearTimeout(savingTimer)
      window.clearTimeout(savedTimer)
    }
  }, [onSaveDraft, value])

  useEffect(() => {
    const editor = bodyRef.current

    if (!editor || value.body === lastEditorBodyRef.current) {
      return
    }

    const nextHtml = toEditorHtml(value.body)
    editor.innerHTML = nextHtml
    editor.dataset.empty = String(isEditorHtmlEmpty(nextHtml))
    lastEditorBodyRef.current = value.body
  }, [value.body])

  const syncBodyFromEditor = () => {
    const editor = bodyRef.current

    if (!editor) {
      return
    }

    const nextBody = isEditorHtmlEmpty(editor.innerHTML) ? "" : editor.innerHTML

    editor.dataset.empty = String(!nextBody)
    lastEditorBodyRef.current = nextBody
    setValue((current) => ({ ...current, body: nextBody }))
  }

  const focusBodyEditor = () => {
    const editor = bodyRef.current

    if (!editor) {
      return
    }

    const selection = window.getSelection()
    const selectionInsideEditor =
      selection?.rangeCount && editor.contains(selection.anchorNode)

    editor.focus()

    if (!selectionInsideEditor) {
      const range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

  const runEditorCommand = (command: string, commandValue?: string) => {
    focusBodyEditor()
    document.execCommand(command, false, commandValue)
    syncBodyFromEditor()
  }

  const insertEditorHtml = (html: string) => {
    runEditorCommand("insertHTML", html)
  }

  const insertInlineElement = (
    tagName: "a" | "code",
    fallback: string,
    attributes = ""
  ) => {
    focusBodyEditor()

    const selection = window.getSelection()
    const content = escapeHtml(selection?.toString() || fallback)

    insertEditorHtml(`<${tagName}${attributes}>${content}</${tagName}>&nbsp;`)
  }

  const applySignature = (signature?: MailEditorSignature) => {
    let nextBody = value.body.replace(
      /<div data-mail-signature="[^"]*">[\s\S]*?<\/div>\s*$/,
      ""
    )

    if (signature) {
      const signatureBody = escapeHtml(signature.body).replaceAll("\n", "<br>")
      nextBody = `${nextBody}<div data-mail-signature="${escapeHtml(signature.id)}"><br>${signatureBody}</div>`
    }

    setValue((current) => ({
      ...current,
      body: nextBody,
      signatureId: signature?.id,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    if (value.to.trim()) {
      onSend(value)
    }
  }

  const applyFormatting = (action: string) => {
    switch (action) {
      case "bold":
        runEditorCommand("bold")
        break
      case "italic":
        runEditorCommand("italic")
        break
      case "strike":
        runEditorCommand("strikeThrough")
        break
      case "code":
        insertInlineElement("code", "код")
        break
      case "heading":
        runEditorCommand("formatBlock", "h2")
        break
      case "unordered-list":
        runEditorCommand("insertUnorderedList")
        break
      case "ordered-list":
        runEditorCommand("insertOrderedList")
        break
      case "quote":
        runEditorCommand("formatBlock", "blockquote")
        break
      case "code-block":
        runEditorCommand("formatBlock", "pre")
        break
      case "link":
        insertInlineElement(
          "a",
          "текст ссылки",
          ' href="https://" target="_blank" rel="noreferrer"'
        )
        break
      case "table":
        insertEditorHtml(
          "<table><thead><tr><th>Заголовок</th><th>Значение</th></tr></thead><tbody><tr><td>Текст</td><td>Текст</td></tr></tbody></table><p><br></p>"
        )
        break
      case "horizontal-rule":
        insertEditorHtml("<hr><p><br></p>")
        break
    }
  }

  const formattingActions = [
    {
      action: "bold",
      icon: Bold,
      label: labels.formatting.bold,
    },
    {
      action: "italic",
      icon: Italic,
      label: labels.formatting.italic,
    },
    {
      action: "strike",
      icon: Strikethrough,
      label: labels.formatting.strike,
    },
    {
      action: "code",
      icon: Code,
      label: labels.formatting.code,
    },
    {
      action: "heading",
      icon: Heading2,
      label: labels.formatting.heading,
    },
    {
      action: "unordered-list",
      icon: List,
      label: labels.formatting.unorderedList,
    },
    {
      action: "ordered-list",
      icon: ListOrdered,
      label: labels.formatting.orderedList,
    },
    {
      action: "quote",
      icon: Quote,
      label: labels.formatting.quote,
    },
    {
      action: "code-block",
      icon: Code,
      label: labels.formatting.codeBlock,
    },
    {
      action: "link",
      icon: Link2,
      label: labels.formatting.link,
    },
    {
      action: "table",
      icon: Table2,
      label: labels.formatting.table,
    },
    {
      action: "horizontal-rule",
      icon: Minus,
      label: labels.formatting.horizontalRule,
    },
  ]

  const handleResizePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const editor = editorRef.current

    if (!editor) {
      return
    }

    const bounds = editor.getBoundingClientRect()

    resizeSessionRef.current = {
      height: bounds.height,
      pointerId: event.pointerId,
      width: bounds.width,
      x: event.clientX,
      y: event.clientY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const handleResizePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const session = resizeSessionRef.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    const maxWidth = Math.max(320, window.innerWidth - 32)
    const maxHeight = Math.max(320, window.innerHeight - 32)
    const minWidth = Math.min(460, maxWidth)
    const minHeight = Math.min(360, maxHeight)

    setFloatingSize({
      height: Math.min(
        maxHeight,
        Math.max(minHeight, session.height + session.y - event.clientY)
      ),
      width: Math.min(
        maxWidth,
        Math.max(minWidth, session.width + session.x - event.clientX)
      ),
    })
  }

  const handleResizePointerEnd = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (resizeSessionRef.current?.pointerId !== event.pointerId) {
      return
    }

    resizeSessionRef.current = undefined

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <>
      {displayMode === "fullscreen" ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 animate-in bg-black/10 duration-100 fade-in-0 supports-backdrop-filter:backdrop-blur-xs"
          data-pattern="MailEditorBackdrop"
        />
      ) : null}
      <section
        aria-label={title}
        className={cn(
          "group/mail-editor flex min-h-0 flex-col bg-background",
          displayMode === "floating" &&
            "fixed right-4 bottom-4 z-40 overflow-hidden rounded-xl border border-border shadow-[0_24px_80px_-18px_rgb(0_0_0/0.42),0_10px_28px_-14px_rgb(0_0_0/0.28)] dark:shadow-[0_28px_90px_-18px_rgb(0_0_0/0.8),0_12px_32px_-14px_rgb(0_0_0/0.6)]",
          displayMode === "fullscreen" &&
            "fixed top-1/2 left-1/2 z-40 h-[min(760px,calc(100svh-3rem))] w-[min(760px,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border shadow-[0_24px_80px_-18px_rgb(0_0_0/0.42),0_10px_28px_-14px_rgb(0_0_0/0.28)] dark:shadow-[0_28px_90px_-18px_rgb(0_0_0/0.8),0_12px_32px_-14px_rgb(0_0_0/0.6)]",
          minimized &&
            "fixed right-4 bottom-4 z-40 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border shadow-[0_24px_80px_-18px_rgb(0_0_0/0.42),0_10px_28px_-14px_rgb(0_0_0/0.28)] dark:shadow-[0_28px_90px_-18px_rgb(0_0_0/0.8),0_12px_32px_-14px_rgb(0_0_0/0.6)]"
        )}
        data-pattern="MailEditor"
        data-state={displayMode}
        ref={editorRef}
        style={
          displayMode === "floating"
            ? {
                height: floatingSize.height,
                maxHeight: "calc(100svh - 2rem)",
                maxWidth: "calc(100vw - 2rem)",
                minHeight: "min(360px, calc(100svh - 2rem))",
                minWidth: "min(460px, calc(100vw - 2rem))",
                width: floatingSize.width,
              }
            : undefined
        }
      >
        {displayMode === "floating" ? (
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 z-10 size-5 cursor-nwse-resize touch-none"
            data-resize-handle
            onLostPointerCapture={() => {
              resizeSessionRef.current = undefined
            }}
            onPointerCancel={handleResizePointerEnd}
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerEnd}
          />
        ) : null}
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-3">
            <h2 className="min-w-0 truncate text-base font-semibold">
              {title}
            </h2>
            <div className="flex shrink-0 items-center gap-1">
              {displayMode === "floating" || displayMode === "fullscreen" ? (
                <IconAction
                  label={labels.minimize}
                  onClick={() => onDisplayModeChange("minimized")}
                >
                  <Minus />
                </IconAction>
              ) : null}
              {displayMode === "floating" ? (
                <IconAction
                  label={labels.fullscreen}
                  onClick={() => onDisplayModeChange("fullscreen")}
                >
                  <Maximize2 />
                </IconAction>
              ) : null}
              {displayMode === "fullscreen" ? (
                <IconAction
                  label={labels.restore}
                  onClick={() => onDisplayModeChange("floating")}
                >
                  <Minimize2 />
                </IconAction>
              ) : null}
              {minimized ? (
                <IconAction
                  label={labels.expand}
                  onClick={() => onDisplayModeChange("floating")}
                >
                  <Maximize2 />
                </IconAction>
              ) : null}
              <IconAction
                label={labels.close}
                onClick={() => {
                  onSaveDraft(value)
                  onClose()
                }}
              >
                <X />
              </IconAction>
            </div>
          </header>

          {!minimized ? (
            <>
              <div className="min-h-0 flex-1">
                <FieldGroup className="h-full min-h-0 gap-0">
                  <div className="shrink-0 space-y-1.5 border-b border-border p-3">
                    <Field className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
                      <FieldLabel htmlFor="mail-editor-from">
                        {labels.from}
                      </FieldLabel>
                      <Select
                        items={Object.fromEntries(
                          accounts.map((account) => [account.id, account.label])
                        )}
                        onValueChange={(from) => {
                          if (from) {
                            setValue((current) => ({ ...current, from }))
                          }
                        }}
                        value={selectedAccount?.id}
                      >
                        <SelectTrigger className="w-full" id="mail-editor-from">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.optionLabel ?? account.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field
                      className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2"
                      data-invalid={submitted && !value.to.trim()}
                    >
                      <FieldLabel htmlFor="mail-editor-to">
                        {labels.to}
                      </FieldLabel>
                      <div className="flex min-w-0 items-center gap-2">
                        <Input
                          aria-invalid={submitted && !value.to.trim()}
                          autoComplete="off"
                          className="min-w-0 flex-1"
                          id="mail-editor-to"
                          onChange={(event) =>
                            setValue((current) => ({
                              ...current,
                              to: event.target.value,
                            }))
                          }
                          placeholder={labels.recipientPlaceholder}
                          value={value.to}
                        />
                        <div className="flex shrink-0 gap-2 text-xs">
                          {!showCc ? (
                            <button
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => setShowCc(true)}
                              type="button"
                            >
                              {labels.cc}
                            </button>
                          ) : null}
                          {!showBcc ? (
                            <button
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => setShowBcc(true)}
                              type="button"
                            >
                              {labels.bcc}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {submitted && !value.to.trim() ? (
                        <FieldError className="col-start-2">
                          {labels.recipientError}
                        </FieldError>
                      ) : null}
                    </Field>

                    {showCc ? (
                      <Field className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
                        <FieldLabel htmlFor="mail-editor-cc">
                          {labels.cc}
                        </FieldLabel>
                        <Input
                          autoComplete="off"
                          id="mail-editor-cc"
                          onChange={(event) =>
                            setValue((current) => ({
                              ...current,
                              cc: event.target.value,
                            }))
                          }
                          placeholder={labels.optionalPlaceholder}
                          value={value.cc}
                        />
                      </Field>
                    ) : null}

                    {showBcc ? (
                      <Field className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
                        <FieldLabel htmlFor="mail-editor-bcc">
                          {labels.bcc}
                        </FieldLabel>
                        <Input
                          autoComplete="off"
                          id="mail-editor-bcc"
                          onChange={(event) =>
                            setValue((current) => ({
                              ...current,
                              bcc: event.target.value,
                            }))
                          }
                          placeholder={labels.optionalPlaceholder}
                          value={value.bcc ?? ""}
                        />
                      </Field>
                    ) : null}

                    <Field className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
                      <FieldLabel htmlFor="mail-editor-subject">
                        {labels.subject}
                      </FieldLabel>
                      <Input
                        id="mail-editor-subject"
                        onChange={(event) =>
                          setValue((current) => ({
                            ...current,
                            subject: event.target.value,
                          }))
                        }
                        placeholder={labels.subjectPlaceholder}
                        value={value.subject}
                      />
                    </Field>
                  </div>

                  <Field className="min-h-0 flex-1 gap-0 p-3">
                    <FieldLabel className="sr-only" htmlFor="mail-editor-body">
                      {labels.body}
                    </FieldLabel>
                    <div
                      aria-label={labels.body}
                      className="flex flex-wrap items-center gap-1 px-1 pb-1"
                      role="toolbar"
                    >
                      {formattingActions.map((action) => (
                        <IconAction
                          key={action.label}
                          label={action.label}
                          onClick={() => applyFormatting(action.action)}
                          onPointerDown={(event) => event.preventDefault()}
                        >
                          <action.icon />
                        </IconAction>
                      ))}
                    </div>
                    <div
                      aria-label={labels.body}
                      aria-multiline="true"
                      className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2 text-sm outline-none before:pointer-events-none data-[empty=true]:before:text-muted-foreground data-[empty=true]:before:content-[attr(data-placeholder)] [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_h2]:text-lg [&_h2]:font-semibold [&_hr]:my-3 [&_hr]:border-border [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:font-mono [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5"
                      contentEditable
                      data-empty={isEditorHtmlEmpty(value.body)}
                      data-placeholder={labels.bodyPlaceholder}
                      id="mail-editor-body"
                      onInput={syncBodyFromEditor}
                      onPaste={(event) => {
                        event.preventDefault()
                        runEditorCommand(
                          "insertText",
                          event.clipboardData.getData("text/plain")
                        )
                      }}
                      ref={bodyRef}
                      role="textbox"
                      suppressContentEditableWarning
                    />
                  </Field>

                  {value.attachmentName ? (
                    <Attachment className="mx-3 mb-2" state="done">
                      <AttachmentMedia>
                        <FileTypeIcon kind="doc" />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>
                          {value.attachmentName}
                        </AttachmentTitle>
                        <AttachmentDescription>
                          {labels.attachmentTest}
                        </AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          aria-label={labels.attachmentRemove(
                            value.attachmentName
                          )}
                          onClick={() =>
                            setValue((current) => ({
                              ...current,
                              attachmentName: undefined,
                            }))
                          }
                          type="button"
                        >
                          <X />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ) : null}
                  {value.attachmentNames?.map((attachmentName) => (
                    <Attachment
                      className="mx-3 mb-2"
                      key={attachmentName}
                      state="done"
                    >
                      <AttachmentMedia>
                        <FileTypeIcon kind="doc" />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{attachmentName}</AttachmentTitle>
                        <AttachmentDescription>
                          {labels.attachmentLocal}
                        </AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          aria-label={labels.attachmentRemove(attachmentName)}
                          onClick={() =>
                            setValue((current) => ({
                              ...current,
                              attachmentNames: current.attachmentNames?.filter(
                                (name) => name !== attachmentName
                              ),
                            }))
                          }
                          type="button"
                        >
                          <X />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ))}
                </FieldGroup>
              </div>

              <footer className="shrink-0 border-t border-border bg-muted/50 p-3">
                <div className="flex min-w-0 items-center gap-1">
                  <Button className="min-w-28 px-5" size="lg" type="submit">
                    {labels.send}
                  </Button>
                  <input
                    hidden
                    multiple
                    onChange={(event) => {
                      const names = Array.from(event.target.files ?? []).map(
                        (file) => file.name
                      )
                      setValue((current) => ({
                        ...current,
                        attachmentNames: [
                          ...(current.attachmentNames ?? []),
                          ...names,
                        ],
                      }))
                      event.target.value = ""
                    }}
                    ref={fileRef}
                    type="file"
                  />
                  <IconAction
                    label={labels.attachFiles}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip />
                  </IconAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          aria-label={labels.signature}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        />
                      }
                    >
                      <Signature />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top">
                      <DropdownMenuGroup>
                        {signatures.map((signature) => (
                          <DropdownMenuItem
                            key={signature.id}
                            onClick={() => applySignature(signature)}
                          >
                            {signature.name}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem onClick={() => applySignature()}>
                          {labels.noSignature}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <IconAction
                    label={
                      value.important ? labels.importantOff : labels.importantOn
                    }
                    onClick={() =>
                      setValue((current) => ({
                        ...current,
                        important: !current.important,
                      }))
                    }
                  >
                    <ShieldAlert />
                  </IconAction>
                  <span className="ml-auto min-w-0 truncate text-xs text-muted-foreground">
                    {saveStatus === "saving"
                      ? labels.saving
                      : saveStatus === "saved"
                        ? labels.saved
                        : `${labels.fromPrefix} ${selectedAccount?.id ?? ""}`}
                  </span>
                  <IconAction label={labels.discardDraft} onClick={onDiscard}>
                    <Trash2 />
                  </IconAction>
                </div>
              </footer>
            </>
          ) : null}
        </form>
      </section>
    </>
  )
}
