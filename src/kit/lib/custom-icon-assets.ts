/**
 * Registry of custom product icons that are not available in the approved
 * Lucide set. The icon components in `src/icons` (e.g. `MailUnreadIcon`) read
 * their runtime `src` from here, and consumers can surface the same metadata in
 * an asset gallery. The referenced SVG files are served by the consuming app
 * from its public assets directory at the listed `src` path.
 */
export const customIconAssets = [
  {
    consumer: "MailUnreadIcon",
    description: "Фильтр непрочитанных писем в Почте.",
    dimensions: "24 x 24",
    format: "SVG",
    id: "mail-unread",
    label: "Непрочитанная почта",
    name: "MailUnread",
    sourcePath: "public/assets/icons/mail-unread.svg",
    src: "/assets/icons/mail-unread.svg",
  },
] as const

export type CustomIconAsset = (typeof customIconAssets)[number]
export type CustomIconAssetId = CustomIconAsset["id"]

export const customIconAssetById = customIconAssets.reduce(
  (registry, asset) => {
    registry[asset.id] = asset
    return registry
  },
  {} as Record<CustomIconAssetId, CustomIconAsset>
)
