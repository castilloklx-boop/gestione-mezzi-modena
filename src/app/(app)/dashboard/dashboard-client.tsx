"use client"

import { KPICard } from "@/components/shared/kpi-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatEuro, formatDate } from "@/lib/utils"
import { Truck, Users, Clock, AlertTriangle, FileText, Euro, Calendar, Wrench } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type DashboardData = {
  mezziNoleggiati: { value: number; total: number }
  mezziDisponibili: number
  noleggiInCorso: number
  noleggiInScadenza: number
  restituzioniInRitardo: number
  preventiviAperti: number
  fatturatoMese: number
  manutenzioniImminenti: Array<{
    id: string
    tipo: string
    dataPrevista: string
    stato: string
    mezzo: { id: string; nome: string; codiceInterno: string }
  }>
  ultimiNoleggi: Array<{
    id: string
    numero: number
    dataInizio: string
    stato: string
    cliente: { id: string; nome: string }
    mezzi: Array<{ mezzo: { id: string; nome: string } }>
  }>
  noleggiPerMese: Array<{ mese: string; conteggio: number }>
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">Buongiorno, Amministratore</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm text-secondary truncate">{today}</p>
            <span className="text-[10px] sm:text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Progetto Dimostrativo</span>
          </div>
        </div>
        <Link href="/noleggi/nuovo" className="shrink-0">
          <Button size="sm" className="sm:h-9">
            <Plus className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nuovo noleggio</span>
            <span className="sm:hidden">Noleggio</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          icon={Truck}
          value={`${data.mezziNoleggiati.value}/${data.mezziNoleggiati.total}`}
          label="Mezzi noleggiati"
          iconBg="bg-blue-50"
        />
        <KPICard
          icon={Users}
          value={data.noleggiInCorso}
          label="In corso"
          trend={data.restituzioniInRitardo > 0 ? { value: `${data.restituzioniInRitardo} ritardi`, positive: false } : undefined}
          iconBg="bg-green-50"
        />
        <KPICard
          icon={Euro}
          value={formatEuro(data.fatturatoMese)}
          label="Fatturato mese"
          iconBg="bg-purple-50"
        />
        <KPICard
          icon={AlertTriangle}
          value={data.noleggiInScadenza}
          label="Scadenza 7gg"
          iconBg="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Noleggi ultimi 6 mesi</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.noleggiPerMese}>
                  <XAxis dataKey="mese" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                    formatter={(value) => [value ?? 0, "Noleggi"]}
                  />
                  <Bar dataKey="conteggio" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Attività recenti</h3>
              <Link href="/noleggi">
                <Button variant="ghost" size="sm" className="text-xs">Vedi tutti</Button>
              </Link>
            </div>
            <div className="space-y-0 -mx-4 sm:-mx-5">
              {data.ultimiNoleggi.slice(0, 5).map((noleggio) => (
                <Link
                  key={noleggio.id}
                  href={`/noleggi/${noleggio.id}`}
                  className="flex items-center gap-3 sm:gap-4 py-3 px-4 sm:px-5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                      #{noleggio.numero} - {noleggio.cliente.nome}
                    </p>
                    <p className="text-[11px] sm:text-xs text-secondary truncate">
                      {noleggio.mezzi.map(m => m.mezzo.nome).join(", ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge stato={noleggio.stato} />
                    <p className="text-[10px] sm:text-xs text-secondary mt-0.5">{formatDate(noleggio.dataInizio)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Scadenze e avvisi</h3>
            <div className="space-y-3">
              {data.restituzioniInRitardo > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-red-800">{data.restituzioniInRitardo} restituzioni in ritardo</p>
                    <p className="text-[11px] sm:text-xs text-red-600">Necessaria verifica</p>
                  </div>
                </div>
              )}
              {data.noleggiInScadenza > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <Clock className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-orange-800">{data.noleggiInScadenza} noleggi in scadenza</p>
                    <p className="text-[11px] sm:text-xs text-orange-600">Nei prossimi 7 giorni</p>
                  </div>
                </div>
              )}
              {data.preventiviAperti > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-800">{data.preventiviAperti} preventivi aperti</p>
                    <p className="text-[11px] sm:text-xs text-blue-600">Da gestire</p>
                  </div>
                </div>
              )}
              {data.manutenzioniImminenti.length > 0 &&
                data.manutenzioniImminenti.map((man) => (
                  <div key={man.id} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                    <Wrench className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-yellow-800 truncate">{man.mezzo.nome}</p>
                      <p className="text-[11px] sm:text-xs text-yellow-600 truncate">{man.tipo} - {formatDate(man.dataPrevista)}</p>
                    </div>
                  </div>
                ))}
              {data.restituzioniInRitardo === 0 && data.noleggiInScadenza === 0 && data.preventiviAperti === 0 && data.manutenzioniImminenti.length === 0 && (
                <p className="text-xs sm:text-sm text-secondary text-center py-4">Nessuna scadenza imminente</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Riepilogo rapido</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-secondary">Mezzi disponibili</span>
                <span className="text-xs sm:text-sm font-semibold">{data.mezziDisponibili}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-secondary">Noleggi in corso</span>
                <span className="text-xs sm:text-sm font-semibold">{data.noleggiInCorso}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-secondary">Preventivi aperti</span>
                <span className="text-xs sm:text-sm font-semibold">{data.preventiviAperti}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-secondary">In ritardo</span>
                <span className="text-xs sm:text-sm font-semibold text-destructive">{data.restituzioniInRitardo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
