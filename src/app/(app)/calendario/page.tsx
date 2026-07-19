"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

type Evento = {
  id: string
  titolo: string
  dataInizio: string
  dataFine: string
  tipo: "noleggio" | "manutenzione"
  stato: string
  cliente?: string
  mezzo?: string
}

const weekDaysFull = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventi, setEventi] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"month" | "week">("month")

  const fetchEvents = useCallback(async (date: Date) => {
    let dal: Date
    let al: Date

    if (view === "month") {
      dal = new Date(date.getFullYear(), date.getMonth(), 1)
      al = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    } else {
      const dayOfWeek = date.getDay()
      dal = new Date(date)
      dal.setDate(date.getDate() - dayOfWeek)
      dal.setHours(0, 0, 0, 0)
      al = new Date(dal)
      al.setDate(dal.getDate() + 6)
      al.setHours(23, 59, 59)
    }

    try {
      const [noleggiRes, manRes] = await Promise.all([
        fetch(`/api/noleggi/calendario?dal=${dal.toISOString()}&al=${al.toISOString()}`),
        fetch(`/api/manutenzioni/calendario?dal=${dal.toISOString()}&al=${al.toISOString()}`),
      ])
      const noleggi = await noleggiRes.json()
      const manutenzioni = await manRes.json()

      const events: Evento[] = [
        ...(Array.isArray(noleggi) ? noleggi.map((n: { id: string; dataInizio: string; dataRestituzionePrev: string; stato: string; numero: number; cliente: { nome: string }; mezzi: Array<{ mezzo: { nome: string } }> }) => ({
          id: n.id,
          titolo: `#${n.numero} ${n.cliente.nome}`,
          dataInizio: n.dataInizio,
          dataFine: n.dataRestituzionePrev,
          tipo: "noleggio" as const,
          stato: n.stato,
          cliente: n.cliente.nome,
          mezzo: n.mezzi?.map(m => m.mezzo.nome).join(", "),
        })) : []),
        ...(Array.isArray(manutenzioni) ? manutenzioni.map((m: { id: string; dataPrevista: string; dataEseguita: string | null; tipo: string; stato: string; mezzo: { nome: string } }) => ({
          id: m.id,
          titolo: m.tipo,
          dataInizio: m.dataPrevista,
          dataFine: m.dataEseguita || m.dataPrevista,
          tipo: "manutenzione" as const,
          stato: m.stato,
          mezzo: m.mezzo.nome,
        })) : []),
      ]
      setEventi(events)
    } catch {
      setEventi([])
    } finally {
      setLoading(false)
    }
  }, [view])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents(currentDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function getEventiForDay(day: Date) {
    return eventi.filter(e => {
      const start = new Date(e.dataInizio)
      start.setHours(0, 0, 0, 0)
      const end = new Date(e.dataFine)
      end.setHours(23, 59, 59)
      return day >= start && day <= end
    })
  }

  function changeDate(dir: -1 | 1) {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + dir)
    } else {
      newDate.setDate(newDate.getDate() + (dir * 7))
    }
    setCurrentDate(newDate)
    setLoading(true)
    fetchEvents(newDate)
  }

  function changeView(newView: "month" | "week") {
    setView(newView)
    setLoading(true)
    fetchEvents(currentDate)
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthName = currentDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 flex-wrap">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-purple-600" />
            </span>
            Calendario
          </h2>
          <p className="text-xs sm:text-sm text-secondary mt-1 hidden sm:block">Vista mensile o settimanale di noleggi e manutenzioni</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setCurrentDate(new Date()); setLoading(true); fetchEvents(new Date()) }}>
            Oggi
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 ml-1 sm:ml-2">
            <Button variant={view === "month" ? "default" : "outline"} size="sm" className="h-8 text-xs px-2.5" onClick={() => changeView("month")}>
              Mese
            </Button>
            <Button variant={view === "week" ? "default" : "outline"} size="sm" className="h-8 text-xs px-2.5" onClick={() => changeView("week")}>
              Sett.
            </Button>
          </div>
        </div>
      </div>

      <div className="text-sm font-medium text-center mb-3 sm:hidden capitalize">{monthName}</div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading && (
          <div className="p-8 text-center text-sm text-secondary">Caricamento...</div>
        )}
        {!loading && view === "month" && (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 border-b border-border">
                {weekDaysFull.map((day) => (
                  <div key={day} className="py-2 text-center text-[10px] sm:text-xs font-medium text-secondary uppercase">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[90px] border-r border-b border-border p-1 bg-muted/20" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  date.setHours(0, 0, 0, 0)
                  const dayEventi = getEventiForDay(date)
                  const isToday = date.getTime() === today.getTime()

                  return (
                    <div
                      key={day}
                      className={`min-h-[60px] sm:min-h-[90px] border-r border-b border-border p-1 sm:p-1.5 ${isToday ? "bg-blue-50/30" : ""}`}
                    >
                      <p className={`text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 ${isToday ? "text-blue-600 bg-blue-100 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center" : "text-secondary"}`}>
                        {day}
                      </p>
                      <div className="space-y-0.5">
                        {dayEventi.slice(0, 2).map((evento) => (
                          <div
                            key={`${evento.tipo}-${evento.id}`}
                            className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate ${
                              evento.tipo === "noleggio" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                            }`}
                            title={`${evento.titolo} (${evento.stato})`}
                          >
                            {evento.titolo}
                          </div>
                        ))}
                        {dayEventi.length > 2 && (
                          <p className="text-[9px] sm:text-[10px] text-secondary">+{dayEventi.length - 2}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        {!loading && view === "week" && (
          <div className="space-y-2 p-3 sm:p-4">
            {Array.from({ length: 7 }, (_, i) => {
              const dayOfWeek = currentDate.getDay()
              const startOfWeek = new Date(currentDate)
              startOfWeek.setDate(currentDate.getDate() - dayOfWeek)
              startOfWeek.setHours(0, 0, 0, 0)
              const d = new Date(startOfWeek)
              d.setDate(startOfWeek.getDate() + i)
              const dayEventi = getEventiForDay(d)
              const isToday = d.getTime() === today.getTime()
              const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }

              return (
                <div key={d.toISOString()} className={`rounded-lg border p-2.5 sm:p-3 ${isToday ? "border-blue-300 bg-blue-50/40" : "border-border"}`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                    <span className="text-[10px] sm:text-xs font-bold text-secondary w-8 sm:w-10">{weekDaysFull[d.getDay()]}</span>
                    <span className={`text-xs sm:text-sm font-semibold ${isToday ? "text-blue-600" : ""}`}>
                      {d.toLocaleDateString("it-IT", opts)}
                    </span>
                    {isToday && <span className="text-[9px] sm:text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Oggi</span>}
                  </div>
                  {dayEventi.length === 0 ? (
                    <p className="text-[11px] sm:text-xs text-secondary ml-10 sm:ml-13">Nessun evento</p>
                  ) : (
                    <div className="space-y-1 ml-10 sm:ml-13">
                      {dayEventi.map((evento) => (
                        <div
                          key={`${evento.tipo}-${evento.id}`}
                          className={`text-[10px] sm:text-xs px-2 py-1 rounded flex items-center gap-2 ${
                            evento.tipo === "noleggio" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          <span className="font-medium truncate">{evento.titolo}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3 sm:mt-4 text-[11px] sm:text-sm text-secondary">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-blue-400" />
          <span>Noleggi</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-orange-400" />
          <span>Manutenzioni</span>
        </div>
      </div>
    </div>
  )
}
