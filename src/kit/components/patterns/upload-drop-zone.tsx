import { Upload } from "../../icons"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export function UploadDropZone({
  active,
  className,
  description = "Отпустите, чтобы добавить объекты в текущий раздел.",
  title = "Перетащите файлы или папку сюда",
}: {
  active: boolean
  className?: string
  description?: string
  title?: string
}) {
  if (!active) {
    return null
  }

  return (
    <section
      aria-label="Область загрузки"
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute inset-4 flex min-h-72 items-center justify-center rounded-lg border-2 border-dashed border-primary bg-background/95 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <Empty className="min-h-72">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Upload />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  )
}
