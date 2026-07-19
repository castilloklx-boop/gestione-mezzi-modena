"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate, formatEuro } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, AlertTriangle } from "lucide-react"
import { ManutenzioneForm } from "../manutenzione-form"

type ManutenzioneDetailData = {
  id: string
  mezzoId: string
  tipo: string
  dataPrevista: string
  dataEseguita: string | null
  costo: number | null
  fornitore: string | null
  descrizione: string | null
  stato: string
  note: string | null
  mezzo: { id: string; nome: string; codiceInterno: string; categoria: { nome: string } }
}

export function ManutenzioneDetail({ manutenzione }: { manutenzione: ManutenzioneDetailData }) {
  const router = useRouter()
  const [editing, setEditing] = React.useState(false)

  if (editing) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna al dettaglio
        </Button>
        <ManutenzioneForm
          mezzi={[{ id: manutenzione.mezzo.id, nome: manutenzione.mezzo.nome, codiceInterno: manutenzione.mezzo.codiceInterno }]}
          manutenzione={manutenzione}
          onSuccess={() => { setEditing(false); router.refresh() }}
        />
      </div>
    )
  }

  const dataPrevista = new Date(manutenzione.dataPrevista)
  const oggi = new Date()
  const isScaduta = dataPrevista < oggi && (manutenzione.stato === "programmata" || manutenzione.stato === "in_corso_man")

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{manutenzione.tipo}</h1>
              <StatusBadge stato={manutenzione.stato} />
              {isScaduta && <AlertTriangle className="h-5 w-5 text-destructive" />}
            </div>
            <p className="text-sm text-secondary">{manutenzione.mezzo.nome}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Modifica
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dettagli intervento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary mb-1">Mezzo</p>
                  <p className="text-sm font-medium">{manutenzione.mezzo.nome}</p>
                  <p className="text-xs text-secondary">{manutenzione.mezzo.codiceInterno} · {manutenzione.mezzo.categoria.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Tipo</p>
                  <p className="text-sm">{manutenzione.tipo}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Data prevista</p>
                  <p className={`text-sm font-medium ${isScaduta ? "text-destructive" : ""}`}>
                    {formatDate(manutenzione.dataPrevista)}
                    {isScaduta && " (scaduta)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Data eseguita</p>
                  <p className="text-sm">{formatDate(manutenzione.dataEseguita)}</p>
                </div>
              </div>
              {manutenzione.descrizione && (
                <div className="mt-4">
                  <p className="text-xs text-secondary mb-1">Descrizione</p>
                  <p className="text-sm">{manutenzione.descrizione}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {manutenzione.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary">{manutenzione.note}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fornitore e costo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-secondary mb-1">Fornitore</p>
                <p className="text-sm font-medium">{manutenzione.fornitore || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">Costo</p>
                <p className="text-lg font-semibold tabular-nums">
                  {manutenzione.costo ? formatEuro(manutenzione.costo) : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
