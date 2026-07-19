"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Plus, Wrench, Search, AlertTriangle, Trash2 } from "lucide-react"
import { formatDate, formatEuro } from "@/lib/utils"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

type ManutenzioneData = {
  id: string
  tipo: string
  dataPrevista: string
  dataEseguita: string | null
  costo: number | null
  fornitore: string | null
  stato: string
  mezzo: { id: string; nome: string; codiceInterno: string }
}

export function ManutenzioniList({ manutenzioni }: { manutenzioni: ManutenzioneData[] }) {
  const router = useRouter()
  const [list, setList] = useState(manutenzioni)
  const [search, setSearch] = useState("")
  const [statoFilter, setStatoFilter] = useState("tutti")
  const [deleting, setDeleting] = useState<string | null>(null)

  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const tra15Giorni = new Date(oggi.getTime() + 15 * 24 * 60 * 60 * 1000)

  const filtered = list.filter((m) => {
    const matchesSearch =
      !search ||
      m.mezzo.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.tipo.toLowerCase().includes(search.toLowerCase()) ||
      (m.fornitore && m.fornitore.toLowerCase().includes(search.toLowerCase()))
    const matchesStato = statoFilter === "tutti" || m.stato === statoFilter
    return matchesSearch && matchesStato
  })

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa manutenzione?")) return
    setDeleting(id)
    try {
      const { deleteManutenzione } = await import("@/lib/actions/manutenzioni")
      await deleteManutenzione(id)
      setList(prev => prev.filter(m => m.id !== id))
      toast.success("Manutenzione eliminata")
      router.refresh()
    } catch {
      toast.error("Errore durante l'eliminazione")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-orange-600" />
            </span>
            Manutenzioni
          </h2>
          <p className="text-sm text-secondary mt-1">Pianifica e monitora gli interventi di manutenzione</p>
        </div>
        <Link href="/manutenzioni/nuovo">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuova manutenzione
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <Input
            placeholder="Cerca manutenzioni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statoFilter} onValueChange={(v) => v !== null && setStatoFilter(v)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutti">Tutti</SelectItem>
            <SelectItem value="programmata">Programmata</SelectItem>
            <SelectItem value="in_corso_man">In corso</SelectItem>
            <SelectItem value="completata">Completata</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Nessuna manutenzione"
          description="Non ci sono interventi di manutenzione programmati."
          action={{ label: "Nuova manutenzione", href: "/manutenzioni/nuovo" }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((man) => {
            const dataPrevista = new Date(man.dataPrevista)
            const isUrgente = dataPrevista <= tra15Giorni && dataPrevista >= oggi
            const isScaduta = dataPrevista < oggi

            return (
              <div
                key={man.id}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer group relative"
                onClick={() => router.push(`/manutenzioni/${man.id}`)}
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background p-1.5 text-sm hover:bg-accent h-7 w-7">
                      <MoreHorizontal className="h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/manutenzioni/${man.id}`) }}>
                        Dettaglio
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(man.id) }}
                        disabled={deleting === man.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {(isUrgente || isScaduta) && (
                      <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${isScaduta ? "text-destructive" : "text-amber-500"}`} />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{man.mezzo.nome}</p>
                        <StatusBadge stato={man.stato} />
                      </div>
                      <p className="text-xs text-secondary">{man.mezzo.codiceInterno}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{man.tipo}</p>
                    <p className={`text-xs ${isScaduta ? "text-destructive font-medium" : "text-secondary"}`}>
                      {formatDate(man.dataPrevista)}
                      {isScaduta && " (scaduta)"}
                    </p>
                    {man.costo != null && <p className="text-xs text-secondary mt-0.5">{formatEuro(man.costo)}</p>}
                  </div>
                </div>
                {man.fornitore && (
                  <p className="text-xs text-secondary mt-2 ml-8">Fornitore: {man.fornitore}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
