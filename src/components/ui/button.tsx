import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-black uppercase tracking-[0.1em] ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-white/10 hover:shadow-blue-500/40 hover:scale-[1.02]",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-500/10",
        outline:
          "border border-white/20 bg-white/5 hover:bg-white/10 hover:text-foreground hover:border-white/30 backdrop-blur-sm",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-white/10",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/10",
        info: "bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/10",
        gradient: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-[10px]",
        lg: "h-14 rounded-2xl px-10 text-base",
        xl: "h-16 rounded-[2rem] px-12 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
