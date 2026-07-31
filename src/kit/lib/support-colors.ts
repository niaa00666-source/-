export const supportColorRoles = [
  "support-rose",
  "support-tomato",
  "support-amber",
  "support-lime",
  "support-green",
  "support-teal",
  "support-azure",
  "support-indigo",
  "support-purple",
  "support-brown",
  "support-gray",
  "support-slate",
] as const

export type SupportColorRole = (typeof supportColorRoles)[number]

export const supportColorBackgroundClasses: Record<SupportColorRole, string> = {
  "support-rose": "bg-support-rose",
  "support-tomato": "bg-support-tomato",
  "support-amber": "bg-support-amber",
  "support-lime": "bg-support-lime",
  "support-green": "bg-support-green",
  "support-teal": "bg-support-teal",
  "support-azure": "bg-support-azure",
  "support-indigo": "bg-support-indigo",
  "support-purple": "bg-support-purple",
  "support-brown": "bg-support-brown",
  "support-gray": "bg-support-gray",
  "support-slate": "bg-support-slate",
}

export const supportColorBorderClasses: Record<SupportColorRole, string> = {
  "support-rose": "border-support-rose",
  "support-tomato": "border-support-tomato",
  "support-amber": "border-support-amber",
  "support-lime": "border-support-lime",
  "support-green": "border-support-green",
  "support-teal": "border-support-teal",
  "support-azure": "border-support-azure",
  "support-indigo": "border-support-indigo",
  "support-purple": "border-support-purple",
  "support-brown": "border-support-brown",
  "support-gray": "border-support-gray",
  "support-slate": "border-support-slate",
}

export const supportColorTintClasses: Record<SupportColorRole, string> = {
  "support-rose": "border-support-rose bg-support-rose/15",
  "support-tomato": "border-support-tomato bg-support-tomato/15",
  "support-amber": "border-support-amber bg-support-amber/15",
  "support-lime": "border-support-lime bg-support-lime/15",
  "support-green": "border-support-green bg-support-green/15",
  "support-teal": "border-support-teal bg-support-teal/15",
  "support-azure": "border-support-azure bg-support-azure/15",
  "support-indigo": "border-support-indigo bg-support-indigo/15",
  "support-purple": "border-support-purple bg-support-purple/15",
  "support-brown": "border-support-brown bg-support-brown/15",
  "support-gray": "border-support-gray bg-support-gray/15",
  "support-slate": "border-support-slate bg-support-slate/15",
}

export const supportColorTintBackgroundClasses: Record<
  SupportColorRole,
  string
> = {
  "support-rose": "bg-support-rose/15",
  "support-tomato": "bg-support-tomato/15",
  "support-amber": "bg-support-amber/15",
  "support-lime": "bg-support-lime/15",
  "support-green": "bg-support-green/15",
  "support-teal": "bg-support-teal/15",
  "support-azure": "bg-support-azure/15",
  "support-indigo": "bg-support-indigo/15",
  "support-purple": "bg-support-purple/15",
  "support-brown": "bg-support-brown/15",
  "support-gray": "bg-support-gray/15",
  "support-slate": "bg-support-slate/15",
}

export const supportColorEventBackgroundClasses: Record<
  SupportColorRole,
  string
> = {
  "support-rose":
    "bg-[color-mix(in_srgb,var(--support-rose)_18%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-rose)_34%,var(--card))]",
  "support-tomato":
    "bg-[color-mix(in_srgb,var(--support-tomato)_18%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-tomato)_34%,var(--card))]",
  "support-amber":
    "bg-[color-mix(in_srgb,var(--support-amber)_16%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-amber)_30%,var(--card))]",
  "support-lime":
    "bg-[color-mix(in_srgb,var(--support-lime)_16%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-lime)_30%,var(--card))]",
  "support-green":
    "bg-[color-mix(in_srgb,var(--support-green)_18%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-green)_34%,var(--card))]",
  "support-teal":
    "bg-[color-mix(in_srgb,var(--support-teal)_18%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-teal)_34%,var(--card))]",
  "support-azure":
    "bg-[color-mix(in_srgb,var(--support-azure)_18%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-azure)_34%,var(--card))]",
  "support-indigo":
    "bg-[color-mix(in_srgb,var(--support-indigo)_20%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-indigo)_36%,var(--card))]",
  "support-purple":
    "bg-[color-mix(in_srgb,var(--support-purple)_20%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-purple)_36%,var(--card))]",
  "support-brown":
    "bg-[color-mix(in_srgb,var(--support-brown)_22%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-brown)_38%,var(--card))]",
  "support-gray":
    "bg-[color-mix(in_srgb,var(--support-gray)_18%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-gray)_34%,var(--card))]",
  "support-slate":
    "bg-[color-mix(in_srgb,var(--support-slate)_18%,var(--card))] dark:bg-[color-mix(in_srgb,var(--support-slate)_34%,var(--card))]",
}

export const supportColorEventMutedBackgroundClasses: Record<
  SupportColorRole,
  string
> = {
  "support-rose":
    "bg-[color-mix(in_srgb,var(--support-rose)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-rose)_10%,var(--muted))]",
  "support-tomato":
    "bg-[color-mix(in_srgb,var(--support-tomato)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-tomato)_10%,var(--muted))]",
  "support-amber":
    "bg-[color-mix(in_srgb,var(--support-amber)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-amber)_8%,var(--muted))]",
  "support-lime":
    "bg-[color-mix(in_srgb,var(--support-lime)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-lime)_8%,var(--muted))]",
  "support-green":
    "bg-[color-mix(in_srgb,var(--support-green)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-green)_10%,var(--muted))]",
  "support-teal":
    "bg-[color-mix(in_srgb,var(--support-teal)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-teal)_10%,var(--muted))]",
  "support-azure":
    "bg-[color-mix(in_srgb,var(--support-azure)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-azure)_10%,var(--muted))]",
  "support-indigo":
    "bg-[color-mix(in_srgb,var(--support-indigo)_6%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-indigo)_12%,var(--muted))]",
  "support-purple":
    "bg-[color-mix(in_srgb,var(--support-purple)_6%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-purple)_12%,var(--muted))]",
  "support-brown":
    "bg-[color-mix(in_srgb,var(--support-brown)_6%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-brown)_12%,var(--muted))]",
  "support-gray":
    "bg-[color-mix(in_srgb,var(--support-gray)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-gray)_10%,var(--muted))]",
  "support-slate":
    "bg-[color-mix(in_srgb,var(--support-slate)_4%,var(--muted))] dark:bg-[color-mix(in_srgb,var(--support-slate)_10%,var(--muted))]",
}

export const supportColorEventTitleClasses: Record<SupportColorRole, string> = {
  "support-rose": "text-support-rose",
  "support-tomato": "text-support-tomato",
  "support-amber": "text-support-amber",
  "support-lime": "text-support-lime",
  "support-green": "text-support-green",
  "support-teal": "text-support-teal",
  "support-azure": "text-support-azure",
  "support-indigo": "text-support-indigo",
  "support-purple": "text-support-purple",
  "support-brown": "text-support-brown",
  "support-gray": "text-support-gray",
  "support-slate": "text-support-slate",
}

export const supportColorEventTimeClasses: Record<SupportColorRole, string> = {
  "support-rose":
    "text-[color-mix(in_srgb,var(--support-rose)_74%,var(--muted-foreground))]",
  "support-tomato":
    "text-[color-mix(in_srgb,var(--support-tomato)_74%,var(--muted-foreground))]",
  "support-amber":
    "text-[color-mix(in_srgb,var(--support-amber)_64%,var(--muted-foreground))]",
  "support-lime":
    "text-[color-mix(in_srgb,var(--support-lime)_64%,var(--muted-foreground))]",
  "support-green":
    "text-[color-mix(in_srgb,var(--support-green)_74%,var(--muted-foreground))]",
  "support-teal":
    "text-[color-mix(in_srgb,var(--support-teal)_74%,var(--muted-foreground))]",
  "support-azure":
    "text-[color-mix(in_srgb,var(--support-azure)_74%,var(--muted-foreground))]",
  "support-indigo":
    "text-[color-mix(in_srgb,var(--support-indigo)_74%,var(--muted-foreground))]",
  "support-purple":
    "text-[color-mix(in_srgb,var(--support-purple)_74%,var(--muted-foreground))]",
  "support-brown":
    "text-[color-mix(in_srgb,var(--support-brown)_74%,var(--muted-foreground))]",
  "support-gray":
    "text-[color-mix(in_srgb,var(--support-gray)_74%,var(--muted-foreground))]",
  "support-slate":
    "text-[color-mix(in_srgb,var(--support-slate)_74%,var(--muted-foreground))]",
}

export const supportColorCheckedClasses: Record<SupportColorRole, string> = {
  "support-rose":
    "data-checked:!border-support-rose data-checked:!bg-support-rose data-checked:!text-primary-foreground dark:data-checked:!border-support-rose dark:data-checked:!bg-support-rose",
  "support-tomato":
    "data-checked:!border-support-tomato data-checked:!bg-support-tomato data-checked:!text-primary-foreground dark:data-checked:!border-support-tomato dark:data-checked:!bg-support-tomato",
  "support-amber":
    "data-checked:!border-support-amber data-checked:!bg-support-amber data-checked:!text-primary-foreground dark:data-checked:!border-support-amber dark:data-checked:!bg-support-amber",
  "support-lime":
    "data-checked:!border-support-lime data-checked:!bg-support-lime data-checked:!text-foreground dark:data-checked:!border-support-lime dark:data-checked:!bg-support-lime dark:data-checked:!text-background",
  "support-green":
    "data-checked:!border-support-green data-checked:!bg-support-green data-checked:!text-primary-foreground dark:data-checked:!border-support-green dark:data-checked:!bg-support-green",
  "support-teal":
    "data-checked:!border-support-teal data-checked:!bg-support-teal data-checked:!text-primary-foreground dark:data-checked:!border-support-teal dark:data-checked:!bg-support-teal",
  "support-azure":
    "data-checked:!border-support-azure data-checked:!bg-support-azure data-checked:!text-primary-foreground dark:data-checked:!border-support-azure dark:data-checked:!bg-support-azure",
  "support-indigo":
    "data-checked:!border-support-indigo data-checked:!bg-support-indigo data-checked:!text-primary-foreground dark:data-checked:!border-support-indigo dark:data-checked:!bg-support-indigo",
  "support-purple":
    "data-checked:!border-support-purple data-checked:!bg-support-purple data-checked:!text-primary-foreground dark:data-checked:!border-support-purple dark:data-checked:!bg-support-purple",
  "support-brown":
    "data-checked:!border-support-brown data-checked:!bg-support-brown data-checked:!text-primary-foreground dark:data-checked:!border-support-brown dark:data-checked:!bg-support-brown",
  "support-gray":
    "data-checked:!border-support-gray data-checked:!bg-support-gray data-checked:!text-primary-foreground dark:data-checked:!border-support-gray dark:data-checked:!bg-support-gray",
  "support-slate":
    "data-checked:!border-support-slate data-checked:!bg-support-slate data-checked:!text-primary-foreground dark:data-checked:!border-support-slate dark:data-checked:!bg-support-slate",
}
