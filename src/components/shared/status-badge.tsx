import { cn, getStatoBadgeClass, getStatoLabel } from "@/lib/utils"

interface StatusBadgeProps {
  stato: string
  className?: string
}

export function StatusBadge({ stato, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        getStatoBadgeClass(stato),
        className
      )}
    >
      {getStatoLabel(stato)}
    </span>
  )
}
