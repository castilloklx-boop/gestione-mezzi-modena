"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Search, Trash2 } from "lucide-react"
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

type PreventivoData = {
  id: string
  numero: number
  cliente: { id: string; nome: string }
  dataCreazione: string
  validita: number
  sconto: number
  iva: number
  deposito: number
  note: string | null
  stato: string
  righe: Array<{
    id: string
    mezzo: { id: string; nome: string } | null
    descrizione: string | null
    quantita: number
    prezzo: number
  }>
}

export function PreventiviList({ preventivi }: { preventivi: PreventivoData[] }) {
  const router = useRouter()
  const [list, setList] = useState(preventivi)
  const [search, setSearch] = useState("")
  const [statoFilter, setStatoFilter] = useState("tutti")
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = list.filter((p) => {
    const matchesSearch =
      !search ||
      p.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      String(p.numero).includes(search)
    const matchesStato = statoFilter === "tutti" || p.stato === statoFilter
    return matchesSearch && matchesStato
  })

  async function handleDelete(id: string, numero: number) {
    if (!confirm(`Eliminare il preventivo #${numero}?`)) return
    setDeleting(id)
    try {
      const { deletePreventivo } = await import("@/lib/actions/preventivi")
      await deletePreventivo(id)
      setList(prev => prev.filter(p => p.id !== id))
      toast.success("Preventivo eliminato")
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
            <span className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </span>
            Preventivi
          </h2>
          <p className="text-sm text-secondary mt-1">Gestisci preventivi con calcolo automatico di IVA e sconto</p>
        </div>
        <Link href="/preventivi/nuovo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo preventivo
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <Input
            placeholder="Cerca preventivi..."
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
            <SelectItem value="bozza">Bozza</SelectItem>
            <SelectItem value="inviato">Inviato</SelectItem>
            <SelectItem value="accettato">Accettato</SelectItem>
            <SelectItem value="rifiutato">Rifiutato</SelectItem>
            <SelectItem value="scaduto">Scaduto</SelectItem>
            <SelectItem value="convertito">Convertito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nessun preventivo"
          description="Crea il tuo primo preventivo per generare un documento con calcolo automatico di IVA e sconti."
          action={{ label: "Nuovo preventivo", href: "/preventivi/nuovo" }}
        />
      ) : (
        <DataTable
          columns={[
            {
              key: "numero",
              label: "N.",
              render: (p: PreventivoData) => (
                <span className="font-semibold text-blue-700 tabular-nums">#{p.numero}</span>
              ),
              sortable: true,
            },
            {
              key: "cliente",
              label: "Cliente",
              render: (p: PreventivoData) => p.cliente.nome,
              sortable: true,
            },
            {
              key: "dataCreazione",
              label: "Data",
              render: (p: PreventivoData) => formatDate(p.dataCreazione),
              sortable: true,
            },
            {
              key: "stato",
              label: "Stato",
              render: (p: PreventivoData) => <StatusBadge stato={p.stato} />,
            },
            {
              key: "righe",
              label: "Righe",
              hideOnMobile: true,
              render: (p: PreventivoData) => (
                <span className="text-sm">{p.righe.length}</span>
              ),
            },
            {
              key: "totale",
              label: "Totale",
              render: (p: PreventivoData) => {
                const totale = p.righe.reduce((sum, r) => sum + r.prezzo * r.quantita, 0)
                const scontato = totale - (totale * (p.sconto || 0)) / 100
                const totIvato = scontato * (1 + (p.iva || 0) / 100)
                return (
                  <span className="font-semibold tabular-nums">{formatEuro(totIvato)}</span>
                )
              },
            },
            {
              key: "azioni",
              label: "",
              className: "w-12",
              render: (p: PreventivoData) => (
                <DropdownMenu>
                  <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/preventivi/${p.id}`)}>
                      Dettaglio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/preventivi/nuovo?duplica=${p.id}`)}>
                      Duplica
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(p.id, p.numero)}
                      disabled={deleting === p.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting === p.id ? "Eliminazione..." : "Elimina"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          data={filtered}
          searchPlaceholder="Cerca..."
          onRowClick={(p) => router.push(`/preventivi/${(p as unknown as PreventivoData).id}`)}
        />
      )}
    </div>
  )
}
