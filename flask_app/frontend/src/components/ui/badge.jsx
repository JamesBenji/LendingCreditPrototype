import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
      {
        "border-transparent bg-primary text-primary-foreground": variant === "default",
        "border-transparent bg-green-100 text-green-800": variant === "success",
        "border-transparent bg-yellow-100 text-yellow-800": variant === "warning",
        "border-transparent bg-red-100 text-red-800": variant === "destructive",
        "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
      },
      className
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge }
