"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Save, Search, UserPlus, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { formatEuro } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface NoleggioFormProps {
  clienti: Array<{ id: string; nome: string }>
  mezzi: Array<{ id: string; nome: string; codiceInterno: string; tariffaGiornaliera: number; stato: string }>
  noleggio?: {
    id: string
    clienteId: string
    preventivoId: string | null
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
    mezzi: Array<{ mezzoId: string }>
  }
  clienteIdPreset?: string
  onSuccess?: () => void
}

export function NoleggioForm({ clienti: initialClienti, mezzi, noleggio, clienteIdPreset, onSuccess }: NoleggioFormProps) {
  const router = useRouter()
  const [clienti, setClienti] = useState(initialClienti)
  const isEditing = !!noleggio

  const [clienteId, setClienteId] = useState(noleggio?.clienteId || clienteIdPreset || "")
  const [dataInizio, setDataInizio] = useState(
    noleggio?.dataInizio ? new Date(noleggio.dataInizio).toISOString().split("T")[0] : ""
  )
  const [dataRestituzionePrev, setDataRestituzionePrev] = useState(
    noleggio?.dataRestituzionePrev ? new Date(noleggio.dataRestituzionePrev).toISOString().split("T")[0] : ""
  )
  const [dataRestituzioneEff, setDataRestituzioneEff] = useState(
    noleggio?.dataRestituzioneEff ? new Date(noleggio.dataRestituzioneEff).toISOString().split("T")[0] : ""
  )
  const [luogoConsegna, setLuogoConsegna] = useState(noleggio?.luogoConsegna || "")
  const [modalitaConsegna, setModalitaConsegna] = useState(noleggio?.modalitaConsegna || "")
  const [referente, setReferente] = useState(noleggio?.referente || "")
  const [importo, setImporto] = useState(noleggio?.importo || 0)
  const [deposito, setDeposito] = useState(noleggio?.deposito || 0)
  const [stato, setStato] = useState(noleggio?.stato || "programmato")
  const [statoPagamento, setStatoPagamento] = useState(noleggio?.statoPagamento || "da_pagare")
  const [noteConsegna, setNoteConsegna] = useState(noleggio?.noteConsegna || "")
  const [noteRestituzione, setNoteRestituzione] = useState(noleggio?.noteRestituzione || "")
  const [selectedMezzi, setSelectedMezzi] = useState<string[]>(
    noleggio?.mezzi.map(m => m.mezzoId) || []
  )
  const [searchMezzo, setSearchMezzo] = useState("")
  const [saving, setSaving] = useState(false)

  const [showNuovoCliente, setShowNuovoCliente] = useState(false)
  const [nuovoClienteNome, setNuovoClienteNome] = useState("")
  const [nuovoClienteTelefono, setNuovoClienteTelefono] = useState("")
  const [nuovoClienteEmail, setNuovoClienteEmail] = useState("")
  const [nuovoClienteTipo, setNuovoClienteTipo] = useState("privato")
  const [savingCliente, setSavingCliente] = useState(false)

  const mezziDisponibili = mezzi.filter(m =>
    m.stato === "disponibile" || m.stato === "prenotato" || (isEditing && noleggio?.mezzi.some(nm => nm.mezzoId === m.id))
  )

  const filteredMezzi = mezziDisponibili.filter(m =>
    !searchMezzo ||
    m.nome.toLowerCase().includes(searchMezzo.toLowerCase()) ||
    m.codiceInterno.toLowerCase().includes(searchMezzo.toLowerCase())
  )

  function goBack() {
    if (onSuccess) { onSuccess(); return }
    router.push("/noleggi")
  }

  function toggleMezzo(mezzoId: string) {
    setSelectedMezzi(prev =>
      prev.includes(mezzoId) ? prev.filter(id => id !== mezzoId) : [...prev, mezzoId]
    )
  }

  function getGiorni(): number {
    if (!dataInizio || !dataRestituzionePrev) return 1
    const start = new Date(dataInizio)
    const end = new Date(dataRestituzionePrev)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, diff)
  }

  const giorni = getGiorni()
  const calcoloImporto = selectedMezzi.reduce((sum, id) => {
    const m = mezzi.find(m => m.id === id)
    return sum + (m?.tariffaGiornaliera || 0) * giorni
  }, 0)

  function ricalcolaImporto() {
    setImporto(calcoloImporto)
  }

  async function handleAddCliente(e: React.FormEvent) {
    e.preventDefault()
    if (!nuovoClienteNome.trim()) { toast.error("Inserisci il nome del cliente"); return }
    setSavingCliente(true)
    try {
      const { createCliente } = await import("@/lib/actions/clienti")
      const c = await createCliente({
        nome: nuovoClienteNome.trim(),
        tipo: nuovoClienteTipo,
        telefono: nuovoClienteTelefono.trim() || undefined,
        email: nuovoClienteEmail.trim() || undefined,
      })
      toast.success("Cliente creato")
      setClienti(prev => [...prev, { id: c.id, nome: c.nome }])
      setClienteId(c.id)
      setShowNuovoCliente(false)
      setNuovoClienteNome("")
      setNuovoClienteTelefono("")
      setNuovoClienteEmail("")
      setNuovoClienteTipo("privato")
    } catch {
      toast.error("Errore creazione cliente")
    } finally {
      setSavingCliente(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clienteId) { toast.error("Seleziona un cliente"); return }
    if (selectedMezzi.length === 0) { toast.error("Seleziona almeno un mezzo"); return }
    if (!dataInizio) { toast.error("La data di inizio è obbligatoria"); return }
    if (!dataRestituzionePrev) { toast.error("La data di restituzione è obbligatoria"); return }

    setSaving(true)
    try {
      const data = {
        clienteId,
        dataInizio,
        dataRestituzionePrev,
        dataRestituzioneEff: dataRestituzioneEff || undefined,
        luogoConsegna,
        modalitaConsegna,
        referente,
        importo,
        deposito,
        stato,
        statoPagamento,
        noteConsegna,
        noteRestituzione,
        mezzoIds: selectedMezzi,
      }

      if (isEditing && noleggio) {
        const { updateNoleggio } = await import("@/lib/actions/noleggi")
        await updateNoleggio(noleggio.id, data)
        toast.success("Noleggio aggiornato")
      } else {
        const { createNoleggio } = await import("@/lib/actions/noleggi")
        await createNoleggio(data)
        toast.success("Noleggio creato")
      }
      if (onSuccess) onSuccess()
      else router.push("/noleggi")
    } catch {
      toast.error("Errore durante il salvataggio")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{isEditing ? "Modifica noleggio" : "Nuovo noleggio"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={goBack}>
            Annulla
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvataggio..." : "Salva"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">1</span>
                Cliente e date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={clienteId} onValueChange={(v) => v !== null && setClienteId(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clienti.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Dialog open={showNuovoCliente} onOpenChange={setShowNuovoCliente}>
                      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9">
                        <UserPlus className="h-4 w-4" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nuovo cliente</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCliente} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nc-nome">Nome / Ragione Sociale *</Label>
                            <Input id="nc-nome" value={nuovoClienteNome} onChange={(e) => setNuovoClienteNome(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={nuovoClienteTipo} onValueChange={(v) => v !== null && setNuovoClienteTipo(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="privato">Privato</SelectItem>
                                <SelectItem value="azienda">Azienda</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nc-telefono">Telefono</Label>
                            <Input id="nc-telefono" value={nuovoClienteTelefono} onChange={(e) => setNuovoClienteTelefono(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nc-email">Email</Label>
                            <Input id="nc-email" type="email" value={nuovoClienteEmail} onChange={(e) => setNuovoClienteEmail(e.target.value)} />
                          </div>
                          <Button type="submit" className="w-full" disabled={savingCliente}>
                            {savingCliente ? "Salvataggio..." : "Crea cliente"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referente">Referente</Label>
                  <Input id="referente" value={referente} onChange={(e) => setReferente(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataInizio">Data inizio *</Label>
                  <Input id="dataInizio" type="date" value={dataInizio} onChange={(e) => setDataInizio(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataRestituzionePrev">Restituzione prevista *</Label>
                  <Input id="dataRestituzionePrev" type="date" value={dataRestituzionePrev} onChange={(e) => setDataRestituzionePrev(e.target.value)} />
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="dataRestituzioneEff">Restituzione effettiva</Label>
                    <Input id="dataRestituzioneEff" type="date" value={dataRestituzioneEff} onChange={(e) => setDataRestituzioneEff(e.target.value)} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">2</span>
                Seleziona mezzi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                <Input
                  placeholder="Cerca mezzo..."
                  value={searchMezzo}
                  onChange={(e) => setSearchMezzo(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex items-center justify-between mb-3 text-sm text-secondary">
                <span>{selectedMezzi.length} selezionati</span>
                <span>{giorni} giorni ({dataInizio} &rarr; {dataRestituzionePrev})</span>
              </div>
              {filteredMezzi.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">Nessun mezzo disponibile</p>
              ) : (
                <div className="space-y-2">
                  {filteredMezzi.map((mezzo) => {
                    const selezionato = selectedMezzi.includes(mezzo.id)
                    return (
                      <label
                        key={mezzo.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selezionato
                            ? "border-green-300 bg-green-50/50"
                            : "border-border hover:bg-muted/30"
                        }`}
                      >
                        <Checkbox
                          checked={selezionato}
                          onCheckedChange={() => toggleMezzo(mezzo.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{mezzo.nome}</p>
                          <p className="text-xs text-secondary">{mezzo.codiceInterno}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium tabular-nums">{formatEuro(mezzo.tariffaGiornaliera)}/gg</p>
                          {selezionato && (
                            <p className="text-xs text-green-600 tabular-nums">{formatEuro(mezzo.tariffaGiornaliera * giorni)} tot.</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">3</span>
                Consegna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="luogoConsegna">Luogo di consegna</Label>
                  <Input id="luogoConsegna" value={luogoConsegna} onChange={(e) => setLuogoConsegna(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modalitaConsegna">Modalità</Label>
                  <Select value={modalitaConsegna} onValueChange={(v) => v !== null && setModalitaConsegna(v)}>
                    <SelectTrigger id="modalitaConsegna">
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ritiro_sede">Ritiro in sede</SelectItem>
                      <SelectItem value="consegna_cantiere">Consegna in cantiere</SelectItem>
                      <SelectItem value="consegna_indirizzo">Consegna a indirizzo</SelectItem>
                      <SelectItem value="corriere">Spedizione corriere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noteConsegna">Note alla consegna</Label>
                <Textarea id="noteConsegna" value={noteConsegna} onChange={(e) => setNoteConsegna(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noteRestituzione">Note alla restituzione</Label>
                <Textarea id="noteRestituzione" value={noteRestituzione} onChange={(e) => setNoteRestituzione(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">4</span>
                Stato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Noleggio</Label>
                <Select value={stato} onValueChange={(v) => v !== null && setStato(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programmato">Programmato</SelectItem>
                    <SelectItem value="in_corso">In corso</SelectItem>
                    <SelectItem value="completato">Completato</SelectItem>
                    <SelectItem value="annullato">Annullato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pagamento</Label>
                <Select value={statoPagamento} onValueChange={(v) => v !== null && setStatoPagamento(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="da_pagare">Da pagare</SelectItem>
                    <SelectItem value="parzialmente_pagato">Parzialmente pagato</SelectItem>
                    <SelectItem value="pagato">Pagato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riepilogo importi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importo">Importo noleggio (€)</Label>
                <div className="flex gap-2">
                  <Input id="importo" type="number" step="0.01" value={importo} onChange={(e) => setImporto(Number(e.target.value))} className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={ricalcolaImporto} title="Ricalcola in base a mezzi e giorni">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-secondary">Calcolato: {formatEuro(calcoloImporto)} ({selectedMezzi.length} mezzi x {giorni}gg)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposito">Deposito (€)</Label>
                <Input id="deposito" type="number" step="0.01" value={deposito} onChange={(e) => setDeposito(Number(e.target.value))} />
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Totale noleggio</span>
                <span className="font-semibold tabular-nums">{formatEuro(importo)}</span>
              </div>
              {deposito > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">di cui deposito</span>
                  <span className="font-medium tabular-nums">{formatEuro(deposito)}</span>
                </div>
              )}
              {deposito > 0 && (
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-destructive">Residuo da pagare</span>
                  <span className="tabular-nums">{formatEuro(Math.max(0, importo - deposito))}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
