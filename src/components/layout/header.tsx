"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/clienti": "Clienti",
  "/mezzi": "Mezzi",
  "/preventivi": "Preventivi",
  "/noleggi": "Noleggi",
  "/calendario": "Calendario",
  "/manutenzioni": "Manutenzioni",
  "/importazione": "Importazione CSV",
  "/impostazioni": "Impostazioni",
  "/tutorial": "Tutorial",
}

export function Header() {
  const pathname = usePathname()
  const pathParts = pathname.split("/").filter(Boolean)
  const basePath = "/" + (pathParts[0] || "")
  const title = pageTitles[basePath] || pageTitles["/"] || "Gestione Mezzi Modena"

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-3 sm:gap-4 border-b border-border bg-white/80 backdrop-blur-sm px-3 sm:px-6 shrink-0">
      <Sheet>
        <SheetTrigger className="lg:hidden inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background p-2 text-sm font-medium text-foreground hover:bg-accent">
          <Menu className="h-4 w-4" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[var(--sidebar-width)]">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-secondary">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs sm:text-sm">
            A
          </div>
          <span className="hidden sm:inline font-medium text-foreground">Amministratore</span>
        </div>
      </div>
    </header>
  )
}
