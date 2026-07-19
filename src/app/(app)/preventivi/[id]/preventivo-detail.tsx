"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate, formatEuro } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Copy, ArrowRight, Printer } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

type PreventivoDetailData = {
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
    mezzo: { id: string; nome: string; codiceInterno: string } | null
    descrizione: string | null
    quantita: number
    prezzo: number
    dal: string | null
    al: string | null
  }>
}

export function PreventivoDetail({ preventivo }: { preventivo: PreventivoDetailData }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState("")

  const totaleImponibile = preventivo.righe.reduce((sum, r) => sum + r.prezzo * r.quantita, 0)
  const totaleSconto = (totaleImponibile * (preventivo.sconto || 0)) / 100
  const imponibileScontato = totaleImponibile - totaleSconto
  const ivaVal = (preventivo.iva || 0)
  const totaleIvato = imponibileScontato * (1 + ivaVal / 100)
  const importoIva = totaleIvato - imponibileScontato

  async function handleDuplica() {
    setLoading("duplica")
    try {
      const { duplicatePreventivo } = await import("@/lib/actions/preventivi")
      const nuovo = await duplicatePreventivo(preventivo.id)
      toast.success("Preventivo duplicato")
      router.push(`/preventivi/${nuovo.id}`)
    } catch {
      toast.error("Errore durante la duplicazione")
    } finally {
      setLoading("")
    }
  }

  async function handleConverti() {
    setLoading("converti")
    try {
      const { convertiInNoleggio } = await import("@/lib/actions/preventivi")
      const noleggio = await convertiInNoleggio(preventivo.id)
      toast.success("Preventivo convertito in noleggio")
      router.push(`/noleggi/${noleggio.id}`)
    } catch {
      toast.error("Errore durante la conversione")
    } finally {
      setLoading("")
    }
  }

  function goBack() {
    router.push("/preventivi")
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
            <p className="text-lg font-bold">Preventivo #{preventivo.numero}</p>
            <p className="text-sm text-secondary">{formatDate(preventivo.dataCreazione)}</p>
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
              <h1 className="text-xl font-semibold">Preventivo #{preventivo.numero}</h1>
              <StatusBadge stato={preventivo.stato} />
            </div>
            <p className="text-sm text-secondary">{preventivo.cliente.nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Stampa
          </Button>
          <Link href={`/preventivi/nuovo?modifica=${preventivo.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDuplica} disabled={loading === "duplica"}>
            <Copy className="h-4 w-4 mr-2" />
            Duplica
          </Button>
          {preventivo.stato !== "convertito" && (
            <Button size="sm" onClick={handleConverti} disabled={loading === "converti"}>
              <ArrowRight className="h-4 w-4 mr-2" />
              {loading === "converti" ? "Conversione..." : "Converti in noleggio"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dettagli preventivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary mb-1">Cliente</p>
                  <p className="text-sm font-medium">{preventivo.cliente.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Data</p>
                  <p className="text-sm">{formatDate(preventivo.dataCreazione)}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Validità</p>
                  <p className="text-sm">{preventivo.validita} giorni</p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">Scadenza</p>
                  <p className="text-sm">
                    {formatDate(new Date(new Date(preventivo.dataCreazione).getTime() + preventivo.validita * 24 * 60 * 60 * 1000))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mezzi e servizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {preventivo.righe.map((riga, i) => (
                  <div key={riga.id || i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {riga.mezzo?.nome || riga.descrizione || "Servizio"}
                      </p>
                      <p className="text-xs text-secondary">
                        {riga.mezzo?.codiceInterno && <span>{riga.mezzo.codiceInterno} · </span>}
                        Qtà: {riga.quantita} × {formatEuro(riga.prezzo)}
                        {riga.dal && ` · ${formatDate(riga.dal)}`}
                        {riga.al && ` → ${formatDate(riga.al)}`}
                      </p>
                    </div>
                    <p className="text-sm font-medium tabular-nums">{formatEuro(riga.prezzo * riga.quantita)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {preventivo.note && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary">{preventivo.note}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riepilogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Imponibile</span>
                <span className="font-medium tabular-nums">{formatEuro(totaleImponibile)}</span>
              </div>
              {preventivo.sconto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Sconto ({preventivo.sconto}%)</span>
                  <span className="font-medium tabular-nums text-destructive">-{formatEuro(totaleSconto)}</span>
                </div>
              )}
              {ivaVal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">IVA ({ivaVal}%)</span>
                  <span className="font-medium tabular-nums">{formatEuro(importoIva)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Totale</span>
                <span className="tabular-nums">{formatEuro(totaleIvato)}</span>
              </div>
              {preventivo.deposito > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Deposito</span>
                    <span className="font-medium tabular-nums">{formatEuro(preventivo.deposito)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-destructive">Residuo da pagare</span>
                    <span className="tabular-nums">{formatEuro(Math.max(0, totaleIvato - preventivo.deposito))}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
