"use client"

import {
  BookOpen,
  Compass,
  Bookmark,
  XCircle,
  Edit,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { clearUserData } from "@/actions/user-actions"

const items = [
  {
    title: "Take Test",
    url: "/",
    icon: Edit,
  },
  {
    title: "My Mistakes",
    url: "/mistakes",
    icon: XCircle,
  },
  {
    title: "Bookmarks",
    url: "/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Progress",
    url: "/progress",
    icon: BookOpen,
  },
  {
    title: "Explore",
    url: "/explore",
    icon: Compass,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0 border-r-border bg-[#f9f9f9] dark:bg-[#171717]">
      <SidebarHeader className="p-3">
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5 mb-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">
           <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs">
              U
           </div>
           <span className="font-semibold text-sm">UPSC PYQ Revision</span>
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full justify-start gap-2 h-10 px-3 bg-white dark:bg-[#212121] border-border shadow-sm" })}>
          <Edit className="h-4 w-4" />
          <span className="font-semibold text-[15px]">New Test</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<Link href={item.url} />} isActive={isActive} className={`h-10 px-3 ${isActive ? 'bg-black/5 dark:bg-white/10 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground'}`}>
                      <item.icon className="h-4 w-4 mr-2" />
                      <span className="text-[15px]">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
         <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}

function UserMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const requiredText = "Yes, Nitin Sangwan wants to erase all their progress."
  const isMatch = confirmText === requiredText

  const handleDelete = async () => {
    if (!isMatch) return
    setIsDeleting(true)
    try {
      await clearUserData()
      setIsDialogOpen(false)
      setConfirmText("")
      router.push("/")
      // Optionally refresh to clear any cached data
      window.location.reload()
    } catch (e) {
      console.error(e)
      alert("Failed to clear data.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <SidebarMenuButton className="h-10 px-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                 <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white font-semibold text-xs shrink-0">
                    N
                 </div>
                 <span className="font-medium text-sm">Nitin Sangwan</span>
              </SidebarMenuButton>
            } />
            <DropdownMenuContent align="start" className="w-56 mb-2 ml-2">
              <DropdownMenuItem 
                className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/30 cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
              >
                Reset All Data & Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Erase All Data?</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                This action is <strong>irreversible</strong>. It will permanently delete all your test history, bookmarks, analytics, and mistakes ledger.
              </p>
              <p>
                To confirm, please type exactly:<br/>
                <span className="font-mono text-foreground font-semibold bg-muted px-1.5 py-0.5 rounded select-all mt-1 inline-block">
                  {requiredText}
                </span>
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type confirmation here..."
              className="font-mono text-sm"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); setConfirmText("") }}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={!isMatch || isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting..." : "Delete Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
