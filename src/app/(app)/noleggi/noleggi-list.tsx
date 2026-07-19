"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Plus, CalendarClock, Search, Trash2 } from "lucide-react"
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

type NoleggioData = {
  id: string
  numero: number
  cliente: { id: string; nome: string }
  dataInizio: string
  dataRestituzionePrev: string
  dataRestituzioneEff: string | null
  stato: string
  statoPagamento: string
  importo: number
  mezzi: Array<{ mezzo: { id: string; nome: string } }>
}

export function NoleggiList({ noleggi }: { noleggi: NoleggioData[] }) {
  const router = useRouter()
  const [list, setList] = useState(noleggi)
  const [search, setSearch] = useState("")
  const [statoFilter, setStatoFilter] = useState("tutti")
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = list.filter((n) => {
    const matchesSearch =
      !search ||
      n.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      String(n.numero).includes(search)
    const matchesStato = statoFilter === "tutti" || n.stato === statoFilter
    return matchesSearch && matchesStato
  })

  async function handleDelete(id: string, numero: number) {
    if (!confirm(`Eliminare il noleggio #${numero}? I mezzi torneranno disponibili.`)) return
    setDeleting(id)
    try {
      const { deleteNoleggio } = await import("@/lib/actions/noleggi")
      await deleteNoleggio(id)
      setList(prev => prev.filter(n => n.id !== id))
      toast.success("Noleggio eliminato")
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
            <span className="h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center">
              <CalendarClock className="h-4 w-4 text-green-600" />
            </span>
            Noleggi
          </h2>
          <p className="text-sm text-secondary mt-1">Gestisci noleggi attivi, date e stato pagamento</p>
        </div>
        <Link href="/noleggi/nuovo">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo noleggio
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <Input
            placeholder="Cerca noleggi..."
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
            <SelectItem value="programmato">Programmato</SelectItem>
            <SelectItem value="in_corso">In corso</SelectItem>
            <SelectItem value="completato">Completato</SelectItem>
            <SelectItem value="in_ritardo">In ritardo</SelectItem>
            <SelectItem value="annullato">Annullato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nessun noleggio"
          description="Crea il tuo primo noleggio per gestire date, mezzi e pagamenti."
          action={{ label: "Nuovo noleggio", href: "/noleggi/nuovo" }}
        />
      ) : (
        <DataTable
          columns={[
            {
              key: "numero",
              label: "N.",
              render: (n: NoleggioData) => (
                <span className="font-semibold text-green-700 tabular-nums">#{n.numero}</span>
              ),
              sortable: true,
            },
            {
              key: "cliente",
              label: "Cliente",
              render: (n: NoleggioData) => n.cliente.nome,
              sortable: true,
            },
            {
              key: "dataInizio",
              label: "Inizio",
              render: (n: NoleggioData) => formatDate(n.dataInizio),
              sortable: true,
            },
            {
              key: "dataRestituzionePrev",
              label: "Fine prev.",
              render: (n: NoleggioData) => formatDate(n.dataRestituzionePrev),
              sortable: true,
            },
            {
              key: "mezzi",
              label: "Mezzi",
              hideOnMobile: true,
              render: (n: NoleggioData) => (
                <span className="text-sm">{n.mezzi.length}</span>
              ),
            },
            {
              key: "stato",
              label: "Stato",
              render: (n: NoleggioData) => <StatusBadge stato={n.stato} />,
            },
            {
              key: "statoPagamento",
              label: "Pagamento",
              hideOnMobile: true,
              render: (n: NoleggioData) => <StatusBadge stato={n.statoPagamento} />,
            },
            {
              key: "importo",
              label: "Importo",
              render: (n: NoleggioData) => (
                <span className="font-semibold tabular-nums">{formatEuro(n.importo)}</span>
              ),
              sortable: true,
            },
            {
              key: "azioni",
              label: "",
              className: "w-12",
              render: (n: NoleggioData) => (
                <DropdownMenu>
                  <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/noleggi/${n.id}`)}>
                      Dettaglio
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(n.id, n.numero)}
                      disabled={deleting === n.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting === n.id ? "Eliminazione..." : "Elimina"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          data={filtered}
          searchPlaceholder="Cerca..."
          onRowClick={(n) => router.push(`/noleggi/${(n as unknown as NoleggioData).id}`)}
        />
      )}
    </div>
  )
}
