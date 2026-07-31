import type { ElementType } from "react"
import {
  CheckCircle2,
  CircleUserRound,
  Inbox,
  ListChecks,
  Plus,
} from "@scrambled/ui-kit/icons"
import {
  Button,
  Sidebar,
  SidebarHeader,
  SidebarNavigation,
  type SidebarSection,
} from "@scrambled/ui-kit"

import type { TaskSectionId, TasksSidebarProps } from "./contract"
import { ruTasksSidebarLabels } from "./labels"

const sectionIcons: Record<
  TaskSectionId,
  ElementType<{ className?: string }>
> = {
  my: ListChecks,
  assigned: CircleUserRound,
  noDeadline: Inbox,
  completed: CheckCircle2,
}

const sectionOrder: readonly TaskSectionId[] = [
  "my",
  "assigned",
  "noDeadline",
  "completed",
]

export function TasksSidebar({
  activeSection,
  canCreate = false,
  counts,
  labels = ruTasksSidebarLabels,
  onCreateTask,
  onSectionChange,
}: TasksSidebarProps) {
  const sections: readonly SidebarSection[] = [
    {
      id: "tasks",
      kind: "navigation",
      items: sectionOrder.map((id) => ({
        count: counts?.[id],
        icon: sectionIcons[id],
        id,
        label: labels.sections[id],
      })),
    },
  ]

  return (
    <Sidebar
      className="h-full w-full"
      collapsible="none"
      data-shell-region="Sidebar"
    >
      <SidebarHeader data-shell-region="SidebarHeader">
        <div className="px-2 py-3">
          <h1 className="truncate text-lg font-semibold">{labels.title}</h1>
        </div>
      </SidebarHeader>

      <SidebarNavigation
        action={
          canCreate && onCreateTask ? (
            <Button
              onClick={onCreateTask}
              type="button"
              variant="secondary"
              width="full"
            >
              <Plus />
              {labels.createTask ??
                ruTasksSidebarLabels.createTask ??
                labels.title}
            </Button>
          ) : undefined
        }
        activeItemId={activeSection}
        ariaLabel={labels.ariaLabel}
        onItemSelect={(id) => onSectionChange(id as TaskSectionId)}
        sections={sections}
      />
    </Sidebar>
  )
}
