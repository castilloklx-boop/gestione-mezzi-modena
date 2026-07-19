"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate, formatEuro } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Wrench } from "lucide-react"
import Link from "next/link"
import { MezzoForm } from "../mezzo-form"

type MezzoDetailData = {
  id: string
  nome: string
  codiceInterno: string
  categoriaId: string
  categoria: { id: string; nome: string }
  marca: string | null
  modello: string | null
  matricola: string | null
  descrizione: string | null
  tariffaGiornaliera: number
  tariffaSettimanale: number | null
  depositoCauzionale: number
  ubicazione: string | null
  stato: string
  dataUltimaManutenzione: string | null
  dataProssimaManutenzione: string | null
  note: string | null
  createdAt: string
  manutenzioni: Array<{
    id: string
    tipo: string
    dataPrevista: string
    dataEseguita: string | null
    stato: string
    costo: number | null
  }>
  noleggioMezzi: Array<{
    noleggio: {
      id: string
      numero: number
      dataInizio: string
      dataRestituzionePrev: string
      stato: string
      cliente: { id: string; nome: string }
    }
  }>
}

export function MezzoDetail({ mezzo, categorie }: { mezzo: MezzoDetailData; categorie: Array<{ id: string; nome: string }> }) {
  const router = useRouter()
  const [editing, setEditing] = React.useState(false)

  if (editing) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna al dettaglio
        </Button>
        <MezzoForm categorie={categorie} mezzo={mezzo} onSuccess={() => { setEditing(false); router.refresh() }} />
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
              <h1 className="text-xl font-semibold">{mezzo.nome}</h1>
              <StatusBadge stato={mezzo.stato} />
            </div>
            <p className="text-sm text-secondary">{mezzo.codiceInterno}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
          <Link href={`/manutenzioni/nuovo?mezzoId=${mezzo.id}`}>
            <Button size="sm">
              <Wrench className="h-4 w-4 mr-2" />
              Manutenzione
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informazioni</TabsTrigger>
          <TabsTrigger value="storico">Storico noleggi</TabsTrigger>
          <TabsTrigger value="manutenzioni">Manutenzioni</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dettagli</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-secondary mb-1">Categoria</p>
                      <p className="text-sm font-medium">{mezzo.categoria.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary mb-1">Marca</p>
                      <p className="text-sm">{mezzo.marca || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary mb-1">Modello</p>
                      <p className="text-sm">{mezzo.modello || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary mb-1">Matricola / Targa</p>
                      <p className="text-sm">{mezzo.matricola || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary mb-1">Ubicazione</p>
                      <p className="text-sm">{mezzo.ubicazione || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary mb-1">Deposito cauzionale</p>
                      <p className="text-sm">{formatEuro(mezzo.depositoCauzionale)}</p>
                    </div>
                  </div>
                  {mezzo.descrizione && (
                    <div className="mt-4">
                      <p className="text-xs text-secondary mb-1">Descrizione</p>
                      <p className="text-sm">{mezzo.descrizione}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tariffe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-secondary mb-1">Giornaliera</p>
                    <p className="text-lg font-semibold tabular-nums">{formatEuro(mezzo.tariffaGiornaliera)}</p>
                  </div>
                  {mezzo.tariffaSettimanale && (
                    <div>
                      <p className="text-xs text-secondary mb-1">Settimanale</p>
                      <p className="text-lg font-semibold tabular-nums">{formatEuro(mezzo.tariffaSettimanale)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Manutenzione</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-secondary mb-1">Ultima</p>
                    <p className="text-sm">{formatDate(mezzo.dataUltimaManutenzione)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Prossima</p>
                    <p className="text-sm">{formatDate(mezzo.dataProssimaManutenzione)}</p>
                  </div>
                </CardContent>
              </Card>

              {mezzo.note && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Note</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-secondary">{mezzo.note}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="storico" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storico noleggi</CardTitle>
            </CardHeader>
            <CardContent>
              {mezzo.noleggioMezzi.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">Nessun noleggio registrato</p>
              ) : (
                <div className="space-y-0">
                  {mezzo.noleggioMezzi.map((nm) => (
                    <Link
                      key={nm.noleggio.id}
                      href={`/noleggi/${nm.noleggio.id}`}
                      className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-muted/30 -mx-6 px-6 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">Noleggio #{nm.noleggio.numero}</p>
                        <p className="text-xs text-secondary">{nm.noleggio.cliente.nome}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge stato={nm.noleggio.stato} />
                        <p className="text-xs text-secondary mt-0.5">
                          {formatDate(nm.noleggio.dataInizio)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manutenzioni" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manutenzioni</CardTitle>
            </CardHeader>
            <CardContent>
              {mezzo.manutenzioni.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">Nessuna manutenzione registrata</p>
              ) : (
                <div className="space-y-0">
                  {mezzo.manutenzioni.map((man) => (
                    <div key={man.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{man.tipo}</p>
                        <p className="text-xs text-secondary">
                          Prevista: {formatDate(man.dataPrevista)}
                          {man.dataEseguita && ` · Eseguita: ${formatDate(man.dataEseguita)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge stato={man.stato} />
                        {man.costo && <p className="text-xs text-secondary mt-0.5">{formatEuro(man.costo)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
