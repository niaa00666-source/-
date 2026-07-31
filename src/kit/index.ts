// Единственная правка в перенесённых исходниках кита: в монорепозитории стили
// лежат уровнем выше (`packages/ui-kit/styles`), здесь — рядом с исходниками.
import "./styles-tokens/index.css"

export { cn } from "@/lib/utils"
export {
  supportColorRoles,
  supportColorBackgroundClasses,
  supportColorBorderClasses,
  supportColorTintClasses,
  supportColorTintBackgroundClasses,
  supportColorEventBackgroundClasses,
  supportColorEventMutedBackgroundClasses,
  supportColorEventTitleClasses,
  supportColorEventTimeClasses,
  supportColorCheckedClasses,
  type SupportColorRole,
} from "@/lib/support-colors"
export {
  customIconAssets,
  customIconAssetById,
  type CustomIconAsset,
  type CustomIconAssetId,
} from "@/lib/custom-icon-assets"

export {
  ThemeProvider,
  useTheme,
  useScopeContainer,
} from "@/components/theme-provider"

export { AppShell, SHELL_SIZES } from "@/components/shell/app-shell"
export { ContextPanel } from "@/components/shell/context-panel"
export {
  GlobalProductRail,
  type ProductRailItem,
  type ProductRailUser,
  type PrototypeScenarioItem,
} from "@/components/shell/global-product-rail"
export { PrimaryWorkspace } from "@/components/shell/primary-workspace"
export {
  SidebarNavigation,
  SidebarNavigationSection,
  SidebarCheckboxSection,
  SidebarActionSection,
  SidebarSectionRenderer,
  type SidebarNavigationItem,
  type SidebarCheckboxItem,
  type SidebarActionItem,
  type SidebarSection,
  type SidebarNavigationProps,
  type SidebarNavigationSectionProps,
  type SidebarCheckboxSectionProps,
  type SidebarActionSectionProps,
  type SidebarSectionRendererProps,
} from "@/components/shell/sidebar-navigation"
export {
  UploadQueue,
  type UploadQueueItem,
  type UploadQueueItemAction,
  type UploadQueueStatusAction,
} from "@/components/shell/upload-queue"
export { UploadDropZone } from "@/components/shell/upload-drop-zone"

export {
  DataTable,
  ControlledDataTable,
  DataTableSortHead,
  DataTableNameCell,
  DataTableName,
  DataTableCellTrigger,
  DataTableRowActionButton,
  dataTableRowClassName,
  type DataTableColumn,
  type ControlledDataTableLabels,
  type ControlledDataTableProps,
  type DataTableSort,
  type DataTableSortDir,
  type DataTableRowAction,
  type DataTableRowProps,
  type DataTableProps,
  type DataTableSortHeadProps,
  type DataTableNameCellProps,
  type DataTableCellTriggerProps,
} from "@/components/patterns/data-table"
export {
  FilterChip,
  ListSearchInput,
  PersonFilterChip,
  PersonPicker,
  type FilterChipOption,
  type FilterChipProps,
  type ListSearchInputProps,
  type PersonFilterChipProps,
  type PersonPickerOption,
  type PersonPickerProps,
} from "@/components/patterns/list-controls"
export {
  FileGrid,
  FileTile,
  type FileGridProps,
  type FileTileProps,
} from "@/components/patterns/file-grid"
export {
  IconActionButton,
  SelectionToolbar,
  type IconActionButtonProps,
  type SelectionToolbarProps,
} from "@/components/patterns/selection-toolbar"
export {
  MoveDestinationDialog,
  type MoveDestinationDialogProps,
  type MoveDestinationFolder,
} from "@/components/patterns/move-destination-dialog"
export {
  SearchField,
  type SearchFieldItem,
  type SearchFieldLabels,
  type SearchFieldProps,
  type SearchFieldStatus,
} from "@/components/patterns/search-field"
export {
  ShareAccessDialog,
  ShareStatusIndicators,
  ShareLinkPasswordDialog,
  ShareLinkUnavailableDialog,
} from "@/components/patterns/share-access-dialog"
export {
  ruShareAccessLabels,
  type ShareAccessLabels,
} from "@/components/patterns/share-access-labels"
export {
  clampShareRole,
  createDefaultShareAccessSettings,
  resolveShareRoleOptions,
  validateShareAccessSettings,
  type ShareAccessCapabilities,
  type ShareAccessMode,
  type ShareRoleOption,
  type ShareMemberProfile,
  type ShareRole,
  type ShareVisibility,
  type SharePerson,
  type ShareAccessRequest,
  type ShareAccessSettings,
  type ShareAccessValidation,
} from "@/components/patterns/share-access-model"
export {
  FileEditorHeader,
  type FileEditorSyncStatus,
} from "@/components/patterns/file-editor-header"
export {
  FolderColorPicker,
  type FolderColorPickerProps,
  type FolderColorPickerSurface,
} from "@/components/patterns/folder-color-picker"
export {
  ruFolderColorPickerLabels,
  type FolderColorPickerLabels,
} from "@/components/patterns/folder-color-picker-labels"
export {
  DragPreview,
  type DragPreviewProps,
} from "@/components/patterns/drag-preview"
export {
  CalendarEvent,
  AllDayEvent,
  TimedEvent,
  CalendarDateGroup,
  EventIndicator,
  type CalendarEventData,
  type CalendarEventTone,
  type CalendarEventAvailability,
  type CalendarEventResponseStatus,
} from "@/components/patterns/calendar-events"
export { CalendarSourceItem } from "@/components/patterns/calendar-source-item"
export { FilePreviewDialog } from "@/components/patterns/file-preview-dialog"
export {
  MailEditor,
  ruMailEditorLabels,
  type MailEditorAccount,
  type MailEditorDisplayMode,
  type MailEditorLabels,
  type MailEditorProps,
  type MailEditorSignature,
  type MailEditorValue,
} from "@/components/patterns/mail-editor"
export {
  MailListItem,
  ruMailListItemLabels,
  type MailListItemCategory,
  type MailListItemLabels,
  type MailListItemProps,
} from "@/components/patterns/mail-list-item"
export {
  Item as PatternItem,
  ItemActions as PatternItemActions,
  ItemContent as PatternItemContent,
  ItemTitle as PatternItemTitle,
} from "@/components/patterns/item"

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert"
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
export { AspectRatio } from "@/components/ui/aspect-ratio"
export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
} from "@/components/ui/attachment"
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
  avatarFallbackTones,
  getAvatarFallbackTone,
  type AvatarFallbackTone,
} from "@/components/ui/avatar"
export { Badge, BadgeDismiss, badgeVariants } from "@/components/ui/badge"
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"
export {
  BubbleGroup,
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/bubble"
export {
  Button,
  buttonVariants,
  type ButtonProps,
} from "@/components/ui/button"
export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
} from "@/components/ui/button-group"
export { Calendar, CalendarDayButton } from "@/components/ui/calendar"
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
} from "@/components/ui/carousel"
export {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from "@/components/ui/chart"
export { Checkbox } from "@/components/ui/checkbox"
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
export {
  Combobox,
  ComboboxValue,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxStatus,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChipsInput,
  useComboboxAnchor,
} from "@/components/ui/combobox"
export {
  ContextMenu,
  ContextMenuPortal,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu"
export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
export { DirectionProvider, useDirection } from "@/components/ui/direction"
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerSwipeHandle,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty"
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from "@/components/ui/field"
export {
  FileTypeIcon,
  type FileTypeIconKind,
  type FileTypeIconSize,
} from "@/components/ui/file-type-icon"
export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
export { Input } from "@/components/ui/input"
export {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
} from "@/components/ui/item"
export { Kbd, KbdGroup } from "@/components/ui/kbd"
export { Label } from "@/components/ui/label"
export {
  Marker,
  MarkerIcon,
  MarkerContent,
  markerVariants,
} from "@/components/ui/marker"
export {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller"
export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "@/components/ui/menubar"
export {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
} from "@/components/ui/navigation-menu"
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "@/components/ui/popover"
export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
export { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
export { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
export { Separator } from "@/components/ui/separator"
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
export { Skeleton } from "@/components/ui/skeleton"
export { Slider } from "@/components/ui/slider"
export { Spinner } from "@/components/ui/spinner"
export { Switch } from "@/components/ui/switch"
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
} from "@/components/ui/tabs"
export { Textarea } from "@/components/ui/textarea"
export { Toggle, toggleVariants } from "@/components/ui/toggle"
export { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
export {
  createToastManager,
  toast,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  Toaster,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from "@/components/ui/toast"
