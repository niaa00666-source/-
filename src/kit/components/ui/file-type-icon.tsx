import { useId } from "react"

import { cn } from "@/lib/utils"

// Canonical file/folder type tiles. Ported from the design lab's
// `public/assets/file-types/*.svg` (rendered there via `<img src>`), inlined
// here as JSX so they survive npm packaging (the kit ships only `dist/`, not
// host `/public`). The brand gradients/fills are intentionally hardcoded and
// NOT theme-dependent — do not remap them to semantic tokens. Intrinsic
// dimensions are preserved via each source `viewBox` (Slide is 28×28, the rest
// 20×20); every tile displays at `size-5` by default, matching the lab — see the
// `size` prop for the other steps the products need.
//
// Gradient/clipPath ids are namespaced per instance with `useId()` so multiple
// tiles on one page never collide on a shared `url(#…)` reference.

export type FileTypeIconKind =
  "picture" | "doc" | "folder" | "pdf" | "slide" | "table"

/**
 * Tile box. Every step is a size already in use, so adopting the prop changes
 * nothing visually — it only stops consumers reaching for `className="size-4"`,
 * which is restyling the kit from the outside:
 *
 *   `sm` 16px — dense table rows, menu items, search results (Disc, the lab)
 *   `default` 20px — the lab's baseline, what the tiles shipped with
 *   `lg` 28px — grid tiles (Disc)
 *   `xl` 56px — a standalone preview tile (the lab)
 */
export type FileTypeIconSize = "sm" | "default" | "lg" | "xl"

const SIZE_CLASS: Record<FileTypeIconSize, string> = {
  sm: "size-4",
  default: "size-5",
  lg: "size-7",
  xl: "size-14",
}

type FileTypeIconProps = {
  className?: string
  kind: FileTypeIconKind
  size?: FileTypeIconSize
}

export function FileTypeIcon({
  className,
  kind,
  size = "default",
}: FileTypeIconProps) {
  const rawId = useId()
  const uid = rawId.replace(/:/g, "")
  // A plain lookup rather than a `data-size` variant: all six tiles below share
  // this one class string, so there is nothing to select on per-branch.
  const svgClassName = cn(SIZE_CLASS[size], "shrink-0", className)

  switch (kind) {
    case "folder": {
      const grad = `${uid}-folder-grad`
      return (
        <svg
          aria-hidden="true"
          className={svgClassName}
          fill="none"
          focusable={false}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 3.33333C0 1.49238 1.49238 0 3.33333 0H6.3107C7.05371 0 7.74756 0.371336 8.1597 0.989555L9.3403 2.76044C9.75244 3.37866 10.4463 3.75 11.1893 3.75H16.6667C18.5076 3.75 20 5.24238 20 7.08333V16.6667C20 18.5076 18.5076 20 16.6667 20H3.33333C1.49238 20 0 18.5076 0 16.6667V3.33333Z"
            fill={`url(#${grad})`}
          />
          <defs>
            <linearGradient
              id={grad}
              x1="10"
              y1="-4.77955e-07"
              x2="-6.03751"
              y2="27.7778"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFA56D" />
              <stop offset="1" stopColor="#F53500" />
            </linearGradient>
          </defs>
        </svg>
      )
    }
    case "doc": {
      const clip = `${uid}-doc-clip`
      return (
        <svg
          aria-hidden="true"
          className={svgClassName}
          fill="none"
          focusable={false}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath={`url(#${clip})`}>
            <path
              d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"
              fill="#356EFF"
            />
            <path
              d="M3 4.5C3 3.67157 3.67157 3 4.5 3H15.5C16.3284 3 17 3.67157 17 4.5C17 5.32843 16.3284 6 15.5 6H4.5C3.67157 6 3 5.32843 3 4.5Z"
              fill="white"
            />
            <path
              d="M3 9.5C3 8.67157 3.67157 8 4.5 8H15.5C16.3284 8 17 8.67157 17 9.5C17 10.3284 16.3284 11 15.5 11H4.5C3.67157 11 3 10.3284 3 9.5Z"
              fill="white"
            />
            <path
              d="M3 14.5C3 13.6716 3.67157 13 4.5 13H7.5C8.32843 13 9 13.6716 9 14.5C9 15.3284 8.32843 16 7.5 16H4.5C3.67157 16 3 15.3284 3 14.5Z"
              fill="white"
              fillOpacity="0.8"
            />
          </g>
          <defs>
            <clipPath id={clip}>
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )
    }
    case "table": {
      const clip = `${uid}-table-clip`
      return (
        <svg
          aria-hidden="true"
          className={svgClassName}
          fill="none"
          focusable={false}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath={`url(#${clip})`}>
            <path
              d="M1.88351e-05 4C1.88351e-05 1.79086 1.79088 1.60941e-08 4.00002 1.60941e-08H16C18.2092 1.60941e-08 20 1.79086 20 4V16C20 18.2091 18.2092 20 16 20H4.00002C1.79088 20 1.88351e-05 18.2091 1.88351e-05 16V4Z"
              fill="#57B859"
            />
            <path
              d="M6.50002 20C5.67159 20 6 20 5.00002 20L5.00002 12.5C5.00002 11.6716 5.67159 11 6.50002 11C7.32845 11 8.00002 11.6716 8.00002 12.5V20C7 20 7.32845 20 6.50002 20Z"
              fill="white"
              fillOpacity="0.8"
            />
            <path
              d="M6.50002 4C5.67159 4 5.00002 3.32843 5.00002 2.5L5.00002 1.60941e-08C5.74782 2.57492e-05 5.67159 5.23058e-08 6.50002 1.60941e-08C7.32845 -2.01176e-08 7.22945 1.60941e-08 8.00002 1.60941e-08V2.5C8.00002 3.32843 7.32845 4 6.50002 4Z"
              fill="white"
            />
            <path
              d="M0 7.5C0 6.67157 6.79824e-06 7 0 6H20C20 6.5 20 6.67157 20 7.5C20 8.32843 20 8.5 20 9H0C0 8.8 0 8.32843 0 7.5Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id={clip}>
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )
    }
    case "pdf": {
      const clip = `${uid}-pdf-clip`
      return (
        <svg
          aria-hidden="true"
          className={svgClassName}
          fill="none"
          focusable={false}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath={`url(#${clip})`}>
            <path
              d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"
              fill="#F9332B"
            />
            <path
              d="M4.83301 8.33368C4.83301 8.15687 4.76272 7.98702 4.6377 7.862C4.51276 7.73715 4.34361 7.66677 4.16699 7.66669H3.5V8.99969H4.16699C4.34369 8.99961 4.51275 8.92933 4.6377 8.80438C4.76264 8.67943 4.83292 8.51037 4.83301 8.33368ZM10.667 8.33368C10.667 8.15694 10.5966 7.98701 10.4717 7.862C10.3467 7.73697 10.1768 7.66669 10 7.66669H9.33301V12.3337H10C10.1768 12.3337 10.3467 12.2634 10.4717 12.1384C10.5967 12.0133 10.667 11.8435 10.667 11.6667V8.33368ZM13.167 13.3337V6.66669C13.167 6.1144 13.6147 5.66669 14.167 5.66669H17.5C18.0523 5.66669 18.5 6.1144 18.5 6.66669C18.5 7.21897 18.0523 7.66669 17.5 7.66669H15.167V8.99969H16.667C17.219 8.99987 17.6668 9.44767 17.667 9.99969C17.667 10.5519 17.2191 10.9995 16.667 10.9997H15.167V13.3337C15.1668 13.8857 14.719 14.3335 14.167 14.3337C13.6148 14.3337 13.1672 13.8858 13.167 13.3337ZM6.83301 8.33368C6.83292 9.04081 6.55275 9.7194 6.05273 10.2194C5.55271 10.7194 4.87412 10.9996 4.16699 10.9997H3.5V13.3337C3.49982 13.8858 3.05218 14.3337 2.5 14.3337C1.94782 14.3337 1.50018 13.8858 1.5 13.3337V6.66669C1.5 6.1144 1.94772 5.66669 2.5 5.66669H4.16699C4.87412 5.66677 5.55271 5.94792 6.05273 6.44794C6.55263 6.948 6.83301 7.62659 6.83301 8.33368ZM12.667 11.6667C12.667 12.3739 12.3858 13.0523 11.8857 13.5524C11.3856 14.0525 10.7072 14.3337 10 14.3337H8.33301C7.78098 14.3335 7.33318 13.8857 7.33301 13.3337V6.66669C7.33301 6.11451 7.78087 5.66686 8.33301 5.66669H10C10.7072 5.66669 11.3856 5.94784 11.8857 6.44794C12.3857 6.94802 12.667 7.62651 12.667 8.33368V11.6667Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id={clip}>
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )
    }
    case "picture": {
      const clip = `${uid}-picture-clip`
      const grad = `${uid}-picture-grad`
      return (
        <svg
          aria-hidden="true"
          className={svgClassName}
          fill="none"
          focusable={false}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath={`url(#${clip})`}>
            <path
              d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"
              fill="#F9332B"
            />
            <path
              d="M16.9568 15.2778C16.9559 15.2756 16.9558 15.2732 16.9564 15.2709C16.957 15.2686 16.9568 15.2662 16.9558 15.264L12.2228 4.48089C12.2221 4.47926 12.221 4.47781 12.2197 4.47666C12.2183 4.47541 12.2173 4.47387 12.2167 4.47217C12.1116 4.19345 11.895 4 11.6424 4C11.5186 4.00019 11.3975 4.04743 11.2937 4.13602C11.1899 4.22461 11.1077 4.35079 11.0571 4.49936L9.53592 10.4157C9.32265 11.2451 8.23952 11.451 7.73683 10.7576L7.26358 10.1055C7.17621 9.98509 7.12141 9.83592 7.00689 9.741C6.95313 9.69645 6.89092 9.67272 6.82738 9.67253C6.69 9.67253 6.57215 9.78087 6.519 9.93533L4.27022 15.0591C4.26925 15.0613 4.26705 15.0628 4.26462 15.0628C4.26124 15.0628 4.2585 15.0655 4.2585 15.0689V15.0817C4.2585 15.0843 4.25796 15.0869 4.2569 15.0893L4.04061 15.582C4.01437 15.6267 4.00009 15.6815 4 15.7379C4 15.8812 4.08821 15.9972 4.19694 15.9972C4.21509 15.9972 4.23235 15.9932 4.24895 15.9869C4.25349 15.9851 4.2585 15.9884 4.2585 15.9933C4.2585 15.997 4.26151 16 4.26523 16H16.6512C16.6539 16 16.6561 15.9978 16.6561 15.9951C16.6561 15.9926 16.6581 15.9904 16.6606 15.9901C16.7523 15.9794 16.8379 15.9243 16.9006 15.8354C16.9644 15.745 16.9998 15.6264 17 15.5031C16.9997 15.4245 16.9848 15.3472 16.9568 15.2778Z"
              fill={`url(#${grad})`}
            />
          </g>
          <defs>
            <linearGradient
              id={grad}
              x1="16.5"
              y1="10.5"
              x2="2.5"
              y2="22"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0.46" />
            </linearGradient>
            <clipPath id={clip}>
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )
    }
    case "slide": {
      const clip = `${uid}-slide-clip`
      return (
        <svg
          aria-hidden="true"
          className={svgClassName}
          fill="none"
          focusable={false}
          viewBox="0 0 28 28"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath={`url(#${clip})`}>
            <path
              d="M0 14C0 8.38215 0 5.57323 1.34824 3.55544C1.93191 2.68192 2.68192 1.93191 3.55544 1.34824C5.57323 0 8.38215 0 14 0C19.6178 0 22.4268 0 24.4446 1.34824C25.3181 1.93191 26.0681 2.68192 26.6518 3.55544C28 5.57323 28 8.38215 28 14C28 19.6178 28 22.4268 26.6518 24.4446C26.0681 25.3181 25.3181 26.0681 24.4446 26.6518C22.4268 28 19.6178 28 14 28C8.38215 28 5.57323 28 3.55544 26.6518C2.68192 26.0681 1.93191 25.3181 1.34824 24.4446C0 22.4268 0 19.6178 0 14Z"
              fill="#E04F16"
            />
            <path
              d="M18 18V20H10V18H18ZM20 16V12C20 10.8954 19.1046 10 18 10H10C8.89543 10 8 10.8954 8 12V16C8 17.1046 8.89543 18 10 18V20C7.85996 20 6.11211 18.3194 6.00488 16.2061L6 16V12C6 9.79086 7.79086 8 10 8H18L18.2061 8.00488C20.3194 8.11211 22 9.85996 22 12V16C22 18.2091 20.2091 20 18 20V18C19.1046 18 20 17.1046 20 16Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id={clip}>
              <rect width="28" height="28" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )
    }
    default:
      return null
  }
}
