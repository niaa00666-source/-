import type { SVGProps } from "react"

import { customIconAssetById } from "@/lib/custom-icon-assets"

const mailUnreadAsset = customIconAssetById["mail-unread"]

export function MailUnreadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <use href={`${mailUnreadAsset.src}#mail-unread-icon`} />
    </svg>
  )
}
