"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate, formatDateTime, formatEuro } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, CheckCircle, Printer } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type NoleggioDetailData = {
  id: string
  numero: number
  cliente: { id: string; nome: string; telefono: string | null }
  dataInizio: string
  dataRestituzionePrev: string
  dataRestituzioneEff: string | null
  luogoConsegna: string | null
  modalitaConsegna: string | null
  referente: string | null
  importo: number
  deposito: number
  stato: string
  statoPagamento: string
  noteConsegna: string | null
  noteRestituzione: string | null
  preventivo: { id: string; numero: number } | null
  mezzi: Array<{ mezzo: { id: string; nome: string; codiceInterno: string; tariffaGiornaliera: number } }>
}

export function NoleggioDetail({ noleggio }: { noleggio: NoleggioDetailData }) {
  const router = useRouter()
  const [showCompleta, setShowCompleta] = React.useState(false)
  const [dataEff, setDataEff] = React.useState(new Date().toISOString().split("T")[0])
  const [noteRest, setNoteRest] = React.useState("")
  const [completing, setCompleting] = React.useState(false)

  async function handleCompleta() {
    setCompleting(true)
    try {
      const { completaNoleggio } = await import("@/lib/actions/noleggi")
      await completaNoleggio(noleggio.id, dataEff, noteRest)
      toast.success("Noleggio completato")
      setShowCompleta(false)
      router.refresh()
    } catch {
      toast.error("Errore durante il completamento")
    } finally {
      setCompleting(false)
    }
  }

  const isInCorso = noleggio.stato === "in_corso" || noleggio.stato === "programmato"

  function goBack() {
    router.push("/noleggi")
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="print-area">
      <div className="hidden print:block mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Gestione Mezzi Modena SRL</h2>
            <p className="text-sm text-secondary">Via Emilia Est 123, Modena</p>
            <p className="text-sm text-secondary">P.IVA 01234560321</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">Noleggio #{noleggio.numero}</p>
            <p className="text-sm text-secondary">
              {formatDate(noleggio.dataInizio)} &ndash; {formatDate(noleggio.dataRestituzionePrev)}
            </p>
          </div>
        </div>
        <Separator className="my-4" />
      </div>

      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Noleggio #{noleggio.numero}</h1>
              <StatusBadge stato={noleggio.stato} />
              <StatusBadge stato={noleggio.statoPagamento} />
            </div>
            <p className="text-sm text-secondary">{noleggio.cliente.nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Stampa
          </Button>
          <Link href={`/noleggi/nuovo?modifica=${noleggio.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Button>
          </Link>
          {isInCorso && (
            <Dialog open={showCompleta} onOpenChange={setShowCompleta}>
              <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" disabled={completing}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completa
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Completa noleggio</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data restituzione effettiva</Label>
                    <Input type="date" value={dataEff} onChange={(e) => setDataEff(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Note restituzione</Label>
                    <Textarea value={noteRest} onChange={(e) => setNoteRest(e.target.value)} rows={3} />
                  </div>
                  <Button onClick={handleCompleta} className="w-full" disabled={completing}>
                    {completing ? "Completamento..." : "Conferma completamento"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dettagli noleggio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary mb-1">Cliente</p>
                  <p className="text-sm font-medium">{noleggio.cliente.nome}</p>
                  {noleggio.cliente.telefono && (
                    <p className="text-xs text-secondary">{noleggio.cliente.telefono}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Referente</p>
                  <p className="text-sm">{noleggio.referente || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Inizio</p>
                  <p className="text-sm font-medium">{formatDateTime(noleggio.dataInizio)}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Restituzione prevista</p>
                  <p className="text-sm font-medium">{formatDateTime(noleggio.dataRestituzionePrev)}</p>
                </div>
                {noleggio.dataRestituzioneEff && (
                  <div>
                    <p className="text-xs text-secondary mb-1">Restituzione effettiva</p>
                    <p className="text-sm">{formatDateTime(noleggio.dataRestituzioneEff)}</p>
                  </div>
                )}
                {noleggio.luogoConsegna && (
                  <div>
                    <p className="text-xs text-secondary mb-1">Luogo consegna</p>
                    <p className="text-sm">{noleggio.luogoConsegna}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mezzi noleggiati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {noleggio.mezzi.map((nm) => (
                  <div key={nm.mezzo.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{nm.mezzo.nome}</p>
                      <p className="text-xs text-secondary">{nm.mezzo.codiceInterno}</p>
                    </div>
                    <p className="text-sm tabular-nums">{formatEuro(nm.mezzo.tariffaGiornaliera)}/gg</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {noleggio.preventivo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preventivo associato</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/preventivi/${noleggio.preventivo.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Preventivo #{noleggio.preventivo.numero}
                </Link>
              </CardContent>
            </Card>
          )}

          {(noleggio.noteConsegna || noleggio.noteRestituzione) && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {noleggio.noteConsegna && (
                  <div>
                    <p className="text-xs text-secondary mb-1">Consegna</p>
                    <p className="text-sm">{noleggio.noteConsegna}</p>
                  </div>
                )}
                {noleggio.noteRestituzione && (
                  <div>
                    <p className="text-xs text-secondary mb-1">Restituzione</p>
                    <p className="text-sm">{noleggio.noteRestituzione}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riepilogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Importo</span>
                <span className="font-semibold tabular-nums">{formatEuro(noleggio.importo)}</span>
              </div>
              {noleggio.deposito > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Deposito</span>
                    <span className="font-medium tabular-nums">{formatEuro(noleggio.deposito)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-destructive">Residuo da pagare</span>
                    <span className="tabular-nums">{formatEuro(Math.max(0, noleggio.importo - noleggio.deposito))}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Stato pagamento</span>
                <StatusBadge stato={noleggio.statoPagamento} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Stato noleggio</span>
                <StatusBadge stato={noleggio.stato} />
              </div>
            </CardContent>
          </Card>

          {noleggio.modalitaConsegna && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Modalit\u00e0 consegna</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{noleggio.modalitaConsegna}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
