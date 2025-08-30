"use client"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle, Search, Wallet, Settings, Menu, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Crear vault", href: "/new", icon: PlusCircle },
  { name: "Explorar vaults", href: "/vaults", icon: Search },
  { name: "Mis vaults", href: "/me", icon: Wallet },
  { name: "Liquidaciones", href: "/liquidations", icon: Zap },
  { name: "Ajustes", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          return (
            <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-left hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
        <div className="flex-1 flex flex-col min-h-0 bg-card border-r">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="pt-6">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Bottom Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t md:hidden">
          <div className="flex items-center justify-around py-2">
            {navigation.slice(0, 5).map((item) => {
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col gap-1 h-auto py-2 px-3 hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-xs">{item.name.split(" ")[0]}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
