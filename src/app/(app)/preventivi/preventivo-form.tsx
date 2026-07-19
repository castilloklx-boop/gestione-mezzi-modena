"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Save, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { formatEuro } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Riga {
  key: string
  mezzoId: string
  descrizione: string
  quantita: number
  prezzo: number
  dal: string
  al: string
}

interface PreventivoFormProps {
  clienti: Array<{ id: string; nome: string }>
  mezzi: Array<{ id: string; nome: string; codiceInterno: string; tariffaGiornaliera: number }>
  preventivo?: {
    id: string
    clienteId: string
    validita: number
    sconto: number
    iva: number
    deposito: number
    note: string | null
    stato: string
    righe: Array<{
      mezzoId: string | null
      descrizione: string | null
      quantita: number
      prezzo: number
      dal: string | null
      al: string | null
    }>
  }
  isDuplicating?: boolean
  clienteIdPreset?: string
  onSuccess?: () => void
}

export function PreventivoForm({ clienti: initialClienti, mezzi, preventivo, isDuplicating = false, clienteIdPreset, onSuccess }: PreventivoFormProps) {
  const router = useRouter()
  const [clienti, setClienti] = useState(initialClienti)
  const isEditing = !!preventivo && !isDuplicating
  const [clienteId, setClienteId] = useState(preventivo?.clienteId || clienteIdPreset || "")
  const [validita, setValidita] = useState(preventivo?.validita || 30)
  const [sconto, setSconto] = useState(preventivo?.sconto || 0)
  const [iva, setIva] = useState(preventivo?.iva || 22)
  const [deposito, setDeposito] = useState(preventivo?.deposito || 0)
  const [note, setNote] = useState(preventivo?.note || "")
  const [stato, setStato] = useState(isDuplicating ? "bozza" : (preventivo?.stato || "bozza"))
  const [righe, setRighe] = useState<Riga[]>(
    preventivo?.righe.map((r, i) => ({
      key: String(i),
      mezzoId: r.mezzoId || "",
      descrizione: r.descrizione || "",
      quantita: r.quantita,
      prezzo: r.prezzo,
      dal: r.dal ? new Date(r.dal).toISOString().split("T")[0] : "",
      al: r.al ? new Date(r.al).toISOString().split("T")[0] : "",
    })) || []
  )
  const [saving, setSaving] = useState(false)

  const [showNuovoCliente, setShowNuovoCliente] = useState(false)
  const [nuovoClienteNome, setNuovoClienteNome] = useState("")
  const [nuovoClienteTelefono, setNuovoClienteTelefono] = useState("")
  const [nuovoClienteEmail, setNuovoClienteEmail] = useState("")
  const [nuovoClienteTipo, setNuovoClienteTipo] = useState("privato")
  const [savingCliente, setSavingCliente] = useState(false)

  function goBack() {
    if (onSuccess) { onSuccess(); return }
    router.push("/preventivi")
  }

  function addRiga() {
    setRighe([...righe, { key: String(Date.now()), mezzoId: "", descrizione: "", quantita: 1, prezzo: 0, dal: "", al: "" }])
  }

  function removeRiga(key: string) {
    setRighe(righe.filter(r => r.key !== key))
  }

  function updateRiga(key: string, field: keyof Riga, value: string | number) {
    setRighe(righe.map(r => r.key === key ? { ...r, [field]: value } : r))
  }

  function selectMezzo(key: string, mezzoId: string) {
    const mezzo = mezzi.find(m => m.id === mezzoId)
    if (mezzo) {
      setRighe(righe.map(r =>
        r.key === key
          ? { ...r, mezzoId, descrizione: `${mezzo.nome} (${mezzo.codiceInterno})`, prezzo: mezzo.tariffaGiornaliera }
          : r
      ))
    }
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

  const totaleImponibile = righe.reduce((sum, r) => sum + r.prezzo * r.quantita, 0)
  const totaleSconto = (totaleImponibile * sconto) / 100
  const totaleIvato = (totaleImponibile - totaleSconto) * (1 + iva / 100)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clienteId) { toast.error("Seleziona un cliente"); return }
    if (righe.length === 0) { toast.error("Aggiungi almeno una riga"); return }

    setSaving(true)
    try {
      const data = {
        clienteId,
        validita,
        sconto,
        iva,
        deposito,
        note,
        stato,
        righe: righe.map(r => ({
          mezzoId: r.mezzoId || undefined,
          descrizione: r.descrizione || undefined,
          quantita: r.quantita,
          prezzo: r.prezzo,
          dal: r.dal || undefined,
          al: r.al || undefined,
        })),
      }

      const { createPreventivo, updatePreventivo } = await import("@/lib/actions/preventivi")

      if (isEditing && preventivo?.id) {
        await updatePreventivo(preventivo.id, data)
        toast.success("Preventivo aggiornato")
      } else {
        await createPreventivo(data)
        toast.success("Preventivo creato")
      }
      if (onSuccess) onSuccess()
      else router.push("/preventivi")
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
          <h1 className="text-xl font-semibold">
            {isDuplicating ? "Duplica preventivo" : isEditing ? "Modifica preventivo" : "Nuovo preventivo"}
          </h1>
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
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                Cliente e validità
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
                  <Label htmlFor="validita">Validità (giorni)</Label>
                  <Input id="validita" type="number" value={validita} onChange={(e) => setValidita(Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
                    Mezzi e servizi
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={addRiga}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi riga
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {righe.length === 0 && (
                <p className="text-sm text-secondary text-center py-4">
                  Aggiungi almeno un mezzo o servizio al preventivo
                </p>
              )}
              {righe.map((riga, index) => (
                <div key={riga.key} className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-secondary uppercase">Riga {index + 1}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeRiga(riga.key)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Mezzo</Label>
                      <Select value={riga.mezzoId} onValueChange={(v) => v !== null && selectMezzo(riga.key, v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mezzi.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.nome} ({m.codiceInterno}) - {formatEuro(m.tariffaGiornaliera)}/gg
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Descrizione</Label>
                      <Input value={riga.descrizione} onChange={(e) => updateRiga(riga.key, "descrizione", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantità</Label>
                      <Input type="number" min={1} value={riga.quantita} onChange={(e) => updateRiga(riga.key, "quantita", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Prezzo unitario (€)</Label>
                      <Input type="number" step="0.01" value={riga.prezzo} onChange={(e) => updateRiga(riga.key, "prezzo", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Dal</Label>
                      <Input type="date" value={riga.dal} onChange={(e) => updateRiga(riga.key, "dal", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Al</Label>
                      <Input type="date" value={riga.al} onChange={(e) => updateRiga(riga.key, "al", e.target.value)} />
                    </div>
                  </div>
                  <p className="text-xs text-secondary text-right">
                    Importo riga: <span className="font-medium tabular-nums">{formatEuro(riga.prezzo * riga.quantita)}</span>
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
                Stato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={stato} onValueChange={(v) => v !== null && setStato(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bozza">Bozza</SelectItem>
                  <SelectItem value="inviato">Inviato</SelectItem>
                  <SelectItem value="accettato">Accettato</SelectItem>
                  <SelectItem value="rifiutato">Rifiutato</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riepilogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Imponibile</span>
                <span className="font-medium tabular-nums">{formatEuro(totaleImponibile)}</span>
              </div>
              {sconto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Sconto ({sconto}%)</span>
                  <span className="font-medium tabular-nums text-destructive">-{formatEuro(totaleSconto)}</span>
                </div>
              )}
              {iva > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">IVA ({iva}%)</span>
                  <span className="font-medium tabular-nums">{formatEuro(totaleIvato - (totaleImponibile - totaleSconto))}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Totale</span>
                <span className="tabular-nums">{formatEuro(totaleIvato)}</span>
              </div>
              {deposito > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Deposito</span>
                    <span className="font-medium tabular-nums">{formatEuro(deposito)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-destructive">Residuo da pagare</span>
                    <span className="tabular-nums">{formatEuro(Math.max(0, totaleIvato - deposito))}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Importi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sconto">Sconto (%)</Label>
                <Input id="sconto" type="number" min={0} max={100} value={sconto} onChange={(e) => setSconto(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iva">IVA (%)</Label>
                <Input id="iva" type="number" min={0} value={iva} onChange={(e) => setIva(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposito">Deposito (€)</Label>
                <Input id="deposito" type="number" step="0.01" value={deposito} onChange={(e) => setDeposito(Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Note..." />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
