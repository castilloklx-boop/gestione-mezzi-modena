"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Plus, Users, Search, Trash2 } from "lucide-react"
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

type Cliente = {
  id: string
  nome: string
  tipo: string
  email: string | null
  telefono: string | null
  citta: string | null
  attivo: boolean
  referente: string | null
  createdAt: string
  _count: { noleggi: number; preventivi: number }
}

export function ClientiList({ clienti: initialData }: { clienti: Cliente[] }) {
  const router = useRouter()
  const [clienti, setClienti] = useState(initialData)
  const [search, setSearch] = useState("")
  const [tipoFilter, setTipoFilter] = useState("tutti")
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = clienti.filter((c) => {
    const matchesSearch =
      !search ||
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.telefono && c.telefono.includes(search))
    const matchesTipo = tipoFilter === "tutti" || c.tipo === tipoFilter
    return matchesSearch && matchesTipo
  })

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Eliminare "${nome}" e tutti i suoi preventivi e noleggi?`)) return
    setDeleting(id)
    try {
      const { deleteCliente } = await import("@/lib/actions/clienti")
      await deleteCliente(id)
      setClienti(prev => prev.filter(c => c.id !== id))
      toast.success("Cliente eliminato")
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
            <span className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-600" />
            </span>
            Clienti
          </h2>
          <p className="text-sm text-secondary mt-1">Gestisci l&apos;anagrafica dei tuoi clienti</p>
        </div>
        <Link href="/clienti/nuovo">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuovo cliente
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <Input
            placeholder="Cerca clienti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={tipoFilter} onValueChange={(v) => v !== null && setTipoFilter(v)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutti">Tutti</SelectItem>
            <SelectItem value="privato">Privato</SelectItem>
            <SelectItem value="azienda">Azienda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nessun cliente"
          description="Inizia aggiungendo il primo cliente."
          action={{ label: "Aggiungi cliente", href: "/clienti/nuovo" }}
        />
      ) : (
        <DataTable
          columns={[
            { key: "nome", label: "Nome / Ragione Sociale", sortable: true },
            {
              key: "tipo",
              label: "Tipo",
              render: (c: Cliente) => <StatusBadge stato={c.tipo} />,
            },
            { key: "referente", label: "Referente", sortable: true },
            { key: "email", label: "Email", sortable: true, hideOnMobile: true },
            { key: "telefono", label: "Telefono", hideOnMobile: true },
            { key: "citta", label: "Citt\u00e0", sortable: true, hideOnMobile: true },
            {
              key: "attivo",
              label: "Stato",
              render: (c: Cliente) => (
                <StatusBadge stato={c.attivo ? "attivo" : "non_attivo"} />
              ),
            },
            {
              key: "_count",
              label: "Attivit\u00e0",
              hideOnMobile: true,
              render: (c: Cliente) => (
                <span className="text-xs text-secondary">
                  {c._count.noleggi} noleggi, {c._count.preventivi} prev.
                </span>
              ),
            },
            {
              key: "azioni",
              label: "",
              className: "w-12",
              render: (c: Cliente) => (
                <DropdownMenu>
                  <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/clienti/${c.id}`)}>
                      Dettaglio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/preventivi/nuovo?clienteId=${c.id}`)}>
                      Nuovo preventivo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/noleggi/nuovo?clienteId=${c.id}`)}>
                      Nuovo noleggio
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(c.id, c.nome)}
                      disabled={deleting === c.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting === c.id ? "Eliminazione..." : "Elimina"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          data={filtered}
          searchPlaceholder="Cerca..."
          searchKeys={["nome", "email", "telefono", "referente"]}
          onRowClick={(c) => router.push(`/clienti/${(c as unknown as Cliente).id}`)}
        />
      )}
    </div>
  )
}
