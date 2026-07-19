"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate, formatEuro } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Plus, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { ClienteForm } from "../cliente-form"

type ClienteDetailData = {
  id: string
  nome: string
  tipo: string
  partitaIva: string | null
  codiceFiscale: string | null
  referente: string | null
  email: string | null
  telefono: string | null
  indirizzo: string | null
  citta: string | null
  cap: string | null
  provincia: string | null
  note: string | null
  attivo: boolean
  createdAt: string
  _count: { noleggi: number; preventivi: number }
  noleggi: Array<{
    id: string
    numero: number
    dataInizio: string
    dataRestituzionePrev: string
    stato: string
    importo: number
    mezzi: Array<{ mezzo: { id: string; nome: string } }>
  }>
}

export function ClienteDetail({ cliente }: { cliente: ClienteDetailData }) {
  const router = useRouter()
  const [editing, setEditing] = React.useState(false)

  if (editing) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna al dettaglio
        </Button>
        <ClienteForm cliente={cliente} onSuccess={() => { setEditing(false); router.refresh() }} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{cliente.nome}</h1>
              <StatusBadge stato={cliente.attivo ? "attivo" : "non_attivo"} />
            </div>
            <p className="text-sm text-secondary">
              Cliente dal {formatDate(cliente.createdAt)} &middot; {cliente._count.noleggi} noleggi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
          <Link href={`/noleggi/nuovo?clienteId=${cliente.id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo noleggio
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informazioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary mb-1">Tipo</p>
                  <StatusBadge stato={cliente.tipo} />
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Referente</p>
                  <p className="text-sm font-medium">{cliente.referente || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Partita IVA</p>
                  <p className="text-sm">{cliente.partitaIva || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Codice Fiscale</p>
                  <p className="text-sm">{cliente.codiceFiscale || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contatti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cliente.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-secondary" />
                    <span className="text-sm">{cliente.email}</span>
                  </div>
                )}
                {cliente.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-secondary" />
                    <span className="text-sm">{cliente.telefono}</span>
                  </div>
                )}
                {cliente.indirizzo && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span className="text-sm">
                      {[cliente.indirizzo, cliente.citta, cliente.cap, cliente.provincia].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
                {!cliente.email && !cliente.telefono && !cliente.indirizzo && (
                  <p className="text-sm text-secondary">Nessun contatto registrato</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storico noleggi</CardTitle>
            </CardHeader>
            <CardContent>
              {cliente.noleggi.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">Nessun noleggio registrato</p>
              ) : (
                <div className="space-y-0">
                  {cliente.noleggi.map((n) => (
                    <Link
                      key={n.id}
                      href={`/noleggi/${n.id}`}
                      className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-muted/30 -mx-6 px-6 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">Noleggio #{n.numero}</p>
                        <p className="text-xs text-secondary">
                          {formatDate(n.dataInizio)} - {formatDate(n.dataRestituzionePrev)}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge stato={n.stato} />
                        <p className="text-xs text-secondary mt-0.5">{formatEuro(n.importo)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Riepilogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-secondary mb-1">Totale noleggi</p>
                <p className="text-lg font-semibold">{cliente._count.noleggi}</p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">Preventivi</p>
                <p className="text-lg font-semibold">{cliente._count.preventivi}</p>
              </div>
              {cliente.note && (
                <div>
                  <p className="text-xs text-secondary mb-1">Note</p>
                  <p className="text-sm text-secondary">{cliente.note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
