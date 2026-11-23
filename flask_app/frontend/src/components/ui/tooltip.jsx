import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/lib/use-mobile"

const TooltipProvider = TooltipPrimitive.Provider
const MobileHelpContext = React.createContext(null)

function Tooltip({ children, ...props }) {
  const mobile = useMobile()
  return mobile
    ? <MobileTooltip>{children}</MobileTooltip>
    : <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
}

function MobileTooltip({ children }) {
  const dialogRef = React.useRef(null)
  const [label, setLabel] = React.useState("Field information")
  const [isOpen, setOpen] = React.useState(false)
  return (
    <MobileHelpContext.Provider value={{ dialogRef, label, setLabel, isOpen, setOpen }}>
      {children}
    </MobileHelpContext.Provider>
  )
}

const TooltipTrigger = React.forwardRef(({ asChild, children, onClick, ...props }, ref) => {
  const help = React.useContext(MobileHelpContext)
  if (!help) return <TooltipPrimitive.Trigger {...props} asChild={asChild} onClick={onClick} ref={ref}>{children}</TooltipPrimitive.Trigger>
  const child = asChild ? React.Children.only(children) : null
  const open = (event) => {
    onClick?.(event)
    child?.props.onClick?.(event)
    if (event.defaultPrevented) return
    help.setLabel(event.currentTarget.getAttribute("aria-label") || "Field information")
    help.setOpen(true)
  }
  return child
    ? React.cloneElement(child, { ...props, ...(ref ? { ref } : {}), onClick: open })
    : <button {...props} ref={ref} onClick={open}>{children}</button>
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(({ className, children, sideOffset = 8, ...props }, ref) => {
  const help = React.useContext(MobileHelpContext)
  React.useLayoutEffect(() => {
    const dialog = help?.dialogRef.current
    if (!dialog) return
    if (help.isOpen && !dialog.open) dialog.showModal()
    if (!help.isOpen && dialog.open) dialog.close()
  }, [help?.isOpen, help?.dialogRef])
  if (help) {
    return (
      <dialog ref={help.dialogRef} aria-label={help.label} className="mobile-help-dialog" onClose={() => help.setOpen(false)} onClick={(event) => {
        if (event.target === event.currentTarget) help.setOpen(false)
      }}>
        {help.isOpen && (
          <>
            <div className="mobile-help-toolbar">
              <span className="font-semibold text-primary">Information</span>
              <button type="button" aria-label="Close information" className="mobile-help-close" onClick={() => help.setOpen(false)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className={cn("mobile-help-body text-base leading-relaxed text-foreground", className)}>{children}</div>
          </>
        )}
      </dialog>
    )
  }
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={16}
        className={cn(
          "z-50 rounded-xl border-2 border-primary bg-white px-4 py-3 text-base text-foreground shadow-lg leading-relaxed w-[24rem] max-w-[calc(100vw-2rem)] max-h-[var(--radix-tooltip-content-available-height)] overflow-y-auto animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >{children}</TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
