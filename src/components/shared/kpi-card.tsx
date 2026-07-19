import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
  icon: LucideIcon
  value: string | number
  label: string
  description?: string
  trend?: { value: string; positive: boolean }
  iconBg?: string
}

export function KPICard({ icon: Icon, value, label, description, trend, iconBg }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-3 sm:p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <p className="text-lg sm:text-2xl font-semibold tabular-nums text-foreground truncate">{value}</p>
          <p className="text-[11px] sm:text-sm font-medium text-secondary truncate">{label}</p>
          {description && (
            <p className="text-[10px] sm:text-xs text-secondary/70 hidden sm:block">{description}</p>
          )}
        </div>
        <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0", iconBg || "bg-primary/10")}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 sm:mt-3 flex items-center gap-1 text-[10px] sm:text-xs">
          <span className={trend.positive ? "text-success" : "text-destructive"}>
            {trend.value}
          </span>
          <span className="text-secondary/70 hidden sm:inline">rispetto al mese scorso</span>
        </div>
      )}
    </div>
  )
}
