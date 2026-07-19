"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Plus, Truck, Search, Trash2 } from "lucide-react"
import { formatEuro } from "@/lib/utils"
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

type MezzoData = {
  id: string
  codiceInterno: string
  nome: string
  categoria: { id: string; nome: string }
  marca: string | null
  modello: string | null
  matricola: string | null
  tariffaGiornaliera: number
  stato: string
  ubicazione: string | null
  _count: { noleggioMezzi: number; manutenzioni: number }
}

export function MezziList({ mezzi, categorie }: { mezzi: MezzoData[]; categorie: { id: string; nome: string }[] }) {
  const router = useRouter()
  const [list, setList] = useState(mezzi)
  const [search, setSearch] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("tutte")
  const [statoFilter, setStatoFilter] = useState("tutti")
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = list.filter((m) => {
    const matchesSearch =
      !search ||
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.codiceInterno.toLowerCase().includes(search.toLowerCase()) ||
      (m.marca && m.marca.toLowerCase().includes(search.toLowerCase()))
    const matchesCat = categoriaFilter === "tutte" || m.categoria.id === categoriaFilter
    const matchesStato = statoFilter === "tutti" || m.stato === statoFilter
    return matchesSearch && matchesCat && matchesStato
  })

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Eliminare "${nome}"? Verr\u00e0 rimosso anche dai preventivi.`)) return
    setDeleting(id)
    try {
      const { deleteMezzo } = await import("@/lib/actions/mezzi")
      await deleteMezzo(id)
      setList(prev => prev.filter(m => m.id !== id))
      toast.success("Mezzo eliminato")
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
            <span className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-amber-600" />
            </span>
            Mezzi e Attrezzature
          </h2>
          <p className="text-sm text-secondary mt-1">Catalogo mezzi con stato, tariffe e ubicazione</p>
        </div>
        <Link href="/mezzi/nuovo">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo mezzo
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <Input
            placeholder="Cerca mezzi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={(v) => v !== null && setCategoriaFilter(v)}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutte">Tutte</SelectItem>
            {categorie.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statoFilter} onValueChange={(v) => v !== null && setStatoFilter(v)}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutti">Tutti</SelectItem>
            <SelectItem value="disponibile">Disponibile</SelectItem>
            <SelectItem value="prenotato">Prenotato</SelectItem>
            <SelectItem value="noleggiato">Noleggiato</SelectItem>
            <SelectItem value="in_manutenzione">In manutenzione</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Nessun mezzo"
          description="Inizia aggiungendo il primo mezzo o attrezzatura."
          action={{ label: "Aggiungi mezzo", href: "/mezzi/nuovo" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((mezzo) => (
            <div
              key={mezzo.id}
              className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer group relative"
              onClick={() => router.push(`/mezzi/${mezzo.id}`)}
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background p-1.5 text-sm hover:bg-accent h-7 w-7">
                    <MoreHorizontal className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/mezzi/${mezzo.id}`) }}>
                      Dettaglio
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(mezzo.id, mezzo.nome) }}
                      disabled={deleting === mezzo.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{mezzo.nome}</p>
                  <p className="text-xs text-secondary">{mezzo.codiceInterno}</p>
                </div>
                <StatusBadge stato={mezzo.stato} />
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary text-xs">Categoria</span>
                  <span className="font-medium text-xs">{mezzo.categoria.nome}</span>
                </div>
                {mezzo.marca && (
                  <div className="flex justify-between">
                    <span className="text-secondary text-xs">Marca</span>
                    <span className="text-xs">{mezzo.marca} {mezzo.modello || ""}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-secondary text-xs">Tariffa gg</span>
                  <span className="font-semibold tabular-nums text-sm">{formatEuro(mezzo.tariffaGiornaliera)}</span>
                </div>
                {mezzo.ubicazione && (
                  <div className="flex justify-between">
                    <span className="text-secondary text-xs">Ubicazione</span>
                    <span className="text-xs">{mezzo.ubicazione}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
