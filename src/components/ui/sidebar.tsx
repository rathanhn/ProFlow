
"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { auth, clientAuth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { usePathname } from "next/navigation"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import { useHapticFeedback } from "@/lib/haptic-feedback"


interface SidebarContextProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  loading: boolean;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [swipeProgress, setSwipeProgress] = React.useState(0);
  const haptic = useHapticFeedback();

  React.useEffect(() => {
    // Determine which auth instance to use based on the route
    const currentAuth = pathname.startsWith('/admin') ? auth : clientAuth;
    const unsubscribe = onAuthStateChanged(currentAuth, (currentUser) => {
      console.log('[Sidebar] Auth state changed:', currentUser?.displayName, currentUser?.photoURL);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [pathname]);

  // Edge swipe detection for opening sidebar
  const edgeSwipeGestures = useTouchGestures({
    onPanStart: (state) => {
      // Only trigger if starting from the left edge (within 20px)
      if (state.startPoint && state.startPoint.x <= 20 && !isOpen) {
        setSwipeProgress(0);
      }
    },
    onPan: (state) => {
      // Only handle if starting from left edge and swiping right
      if (state.startPoint && state.startPoint.x <= 20 && state.deltaX > 0 && !isOpen) {
        const progress = Math.min(state.deltaX / 200, 1); // 200px to fully open
        setSwipeProgress(progress);

        // Provide haptic feedback at certain thresholds
        if (progress > 0.3 && progress < 0.35) {
          haptic.selection();
        }
      }
    },
    onPanEnd: (state) => {
      if (state.startPoint && state.startPoint.x <= 20 && state.deltaX > 0 && !isOpen) {
        const progress = state.deltaX / 200;

        if (progress > 0.3 || (state.velocity > 0.5 && state.deltaX > 50)) {
          setIsOpen(true);
          haptic.light();
        }

        setSwipeProgress(0);
      }
    },
    onSwipeRight: (state) => {
      // Open sidebar on right swipe from left edge
      if (state.startPoint && state.startPoint.x <= 20 && !isOpen) {
        setIsOpen(true);
        haptic.light();
      }
      // Close sidebar on right swipe when open
      else if (isOpen && state.deltaX > 100) {
        setIsOpen(false);
        haptic.light();
      }
    },
    onSwipeLeft: (state) => {
      // Close sidebar on left swipe when open
      if (isOpen && state.deltaX < -100) {
        setIsOpen(false);
        haptic.light();
      }
    }
  }, {
    swipeThreshold: 30,
    velocityThreshold: 0.3,
  });

  // Bind gestures to document body for edge detection
  /*
  // React.useEffect(() => {
  //   // Only bind edge gestures on mobile devices
  //   if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
    
  //   const cleanup = edgeSwipeGestures.bindGestures(document.body);
  //   return cleanup;
  // }, [edgeSwipeGestures, isOpen]);
  */

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsed, setIsCollapsed, user, loading }}>
      {/* Edge swipe indicator */}
      {swipeProgress > 0 && (
        <div
          className="fixed inset-y-0 left-0 z-[60] bg-primary/20 transition-all duration-100 ease-out lg:hidden"
          style={{ width: `${swipeProgress * 256}px` }}
        />
      )}
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const Sidebar = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { isOpen, setIsOpen, isCollapsed } = useSidebar()
  const haptic = useHapticFeedback();

  // Gestures for the mobile sidebar content
  const sidebarGestures = useTouchGestures({
    onSwipeLeft: (state) => {
      if (state.deltaX < -100 && state.velocity > 0.3) {
        setIsOpen(false);
        haptic.light();
      }
    },
    onPan: (state) => {
      // Add visual feedback for swipe-to-close
      if (state.deltaX < -50 && state.direction === 'left') {
        haptic.selection();
      }
    }
  }, {
    swipeThreshold: 50,
    velocityThreshold: 0.3,
  });

  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const cleanup = sidebarGestures.bindGestures(sidebarRef.current);
      return cleanup;
    }
  }, [isOpen, sidebarGestures]);

  // Edge swipe detection removed - using mobile tabs instead

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-50 border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}>
        {children}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          ref={sidebarRef}
          side="left"
          className={cn("w-64 p-0 flex flex-col touch-pan-y", className)}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar Menu</SheetTitle>
          </SheetHeader>
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
      className={cn("p-4 border-b flex items-center h-16 shrink-0", isCollapsed ? 'justify-center' : 'justify-between', className)}
      {...props}
    >
      <div className={cn("flex items-center gap-2", isCollapsed && "hidden")}>
        {children}
      </div>
      <div className={cn(isCollapsed && 'hidden')}>
        <SidebarCollapseButton />
      </div>
      <div className={cn(!isCollapsed && 'hidden')}>
        <SidebarCollapseButton />
      </div>

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
    className={cn("flex-1 overflow-y-auto", className)}
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
>(({ className, isActive, asChild = false, children, ...props }, ref) => {
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
    >
      {children}
    </Comp>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn("p-4 border-t mt-auto shrink-0", isCollapsed && "p-2", className)}
      {...props}
    />
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
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}
