
"use client"

import * as React from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"


interface SidebarContextProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const Sidebar = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { isOpen, setIsOpen, isCollapsed } = useSidebar()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
          "hidden lg:flex lg:flex-col fixed inset-y-0 z-50 border-r bg-background transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          className
        )}>
        {children}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className={cn("w-64 p-0", className)}>
          {children}
        </SheetContent>
      </Sheet>
    </>
  )
}

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return (
        <div
            ref={ref}
            className={cn("p-4 border-b flex items-center", isCollapsed ? 'justify-center' : 'justify-between', className)}
            {...props}
        >
            {!isCollapsed && children}
            <SidebarCollapseButton />
        </div>
    )
})
SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col flex-1 overflow-y-auto", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

export const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return (
        <nav
            ref={ref}
            className={cn("flex-1 px-2 py-4 space-y-1", isCollapsed && "px-1", className)}
            {...props}
        />
    )
})
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


export const SidebarMenuButton = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean, asChild?: boolean }
>(({ className, isActive, asChild = false, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    const Comp = asChild ? Slot : "a"
    
    return (
        <Comp
        ref={ref}
        className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isCollapsed && "justify-center",
            isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
            className
        )}
        {...props}
        />
    )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return (
        <div
            ref={ref}
            className={cn("p-4 border-t", isCollapsed && "p-2", className)}
            {...props}
        >
            {isCollapsed ? 
              <div className="flex justify-center items-center">
                 {React.Children.map(children, child => 
                  React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { isCollapsed: true }) : child
                 )}
              </div>
            : children}
        </div>
    )
})
SidebarFooter.displayName = "SidebarFooter"

export const SidebarTrigger = () => {
    const { setIsOpen } = useSidebar()
    return (
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
        </Button>
    )
}

export const SidebarCollapseButton = () => {
    const { isCollapsed, setIsCollapsed } = useSidebar();

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:inline-flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
            <span className="sr-only">Toggle sidebar</span>
        </Button>
    )
}

// This helper component is not used in the final version of the code
// It's kept here just in case, but it's not part of the active implementation.
export const SidebarUser = ({ user, handleLogout, isCollapsed, getAvatarFallback}: any) => {
  if (isCollapsed) {
    return (
       <Avatar>
          <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="User avatar" />
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
    )
  }

  return (
     <div className="flex items-center gap-3">
        <Avatar>
            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="User avatar" />
            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm truncate">{user.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
        </Button>
    </div>
  )
}
