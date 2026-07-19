"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Calendar,
  Wrench,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clienti", label: "Clienti", icon: Users },
  { href: "/mezzi", label: "Mezzi e Attrezzature", icon: Truck },
  { href: "/preventivi", label: "Preventivi", icon: FileText },
  { href: "/noleggi", label: "Noleggi", icon: FileSpreadsheet },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/manutenzioni", label: "Manutenzioni", icon: Wrench },
  { href: "/importazione", label: "Importazione CSV", icon: FileSpreadsheet },
  { href: "/impostazioni", label: "Impostazioni", icon: Settings },
  { href: "/tutorial", label: "Tutorial", icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-border transition-all duration-200",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}
    >
      <div className={cn("flex items-center h-16 border-b border-border px-4", collapsed && "justify-center")}>
        {!collapsed && (
          <Link href="/" className="text-lg font-semibold text-primary flex items-center gap-2">
            <Truck className="h-5 w-5" />
              <span>GMM</span>
              <span className="text-[10px] text-secondary ml-auto">Demo</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="text-primary">
            <Truck className="h-5 w-5" />
          </Link>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className={cn("flex flex-col gap-0.5 px-2", collapsed && "items-center")}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-secondary hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className={cn("border-t border-border p-2", collapsed && "flex justify-center")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start text-secondary hover:text-foreground", collapsed && "justify-center px-2")}
          onClick={() => signOut()}
          title="Esci"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Esci</span>}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-14 h-6 w-6 rounded-full border border-border bg-white shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
  )
}
