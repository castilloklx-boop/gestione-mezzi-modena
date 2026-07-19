import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Truck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-secondary mb-2">Pagina non trovata</p>
        <p className="text-sm text-secondary mb-6">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link href="/">
          <Button>Torna alla dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
