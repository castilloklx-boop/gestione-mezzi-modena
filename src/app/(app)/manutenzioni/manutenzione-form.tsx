"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ManutenzioneFormProps {
  mezzi: Array<{ id: string; nome: string; codiceInterno: string }>
  manutenzione?: {
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
  }
  onSuccess?: () => void
}

export function ManutenzioneForm({ mezzi, manutenzione, onSuccess }: ManutenzioneFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditing = !!manutenzione

  const [mezzoId, setMezzoId] = useState(manutenzione?.mezzoId || searchParams.get("mezzoId") || "")
  const [tipo, setTipo] = useState(manutenzione?.tipo || "")
  const [dataPrevista, setDataPrevista] = useState(
    manutenzione?.dataPrevista ? new Date(manutenzione.dataPrevista).toISOString().split("T")[0] : ""
  )
  const [dataEseguita, setDataEseguita] = useState(
    manutenzione?.dataEseguita ? new Date(manutenzione.dataEseguita).toISOString().split("T")[0] : ""
  )
  const [costo, setCosto] = useState(manutenzione?.costo || 0)
  const [fornitore, setFornitore] = useState(manutenzione?.fornitore || "")
  const [descrizione, setDescrizione] = useState(manutenzione?.descrizione || "")
  const [stato, setStato] = useState(manutenzione?.stato || "programmata")
  const [note, setNote] = useState(manutenzione?.note || "")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mezzoId) { toast.error("Seleziona un mezzo"); return }
    if (!tipo) { toast.error("Il tipo di intervento è obbligatorio"); return }
    if (!dataPrevista) { toast.error("La data prevista è obbligatoria"); return }

    setSaving(true)
    try {
      const data = {
        mezzoId,
        tipo,
        dataPrevista,
        dataEseguita: dataEseguita || undefined,
        costo: costo || undefined,
        fornitore,
        descrizione,
        stato,
        note,
      }

      if (isEditing && manutenzione) {
        const { updateManutenzione } = await import("@/lib/actions/manutenzioni")
        await updateManutenzione(manutenzione.id, data)
        toast.success("Manutenzione aggiornata")
      } else {
        const { createManutenzione } = await import("@/lib/actions/manutenzioni")
        await createManutenzione(data)
        toast.success("Manutenzione creata")
      }
      if (onSuccess) onSuccess()
      else router.push("/manutenzioni")
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
          <Button variant="ghost" size="icon" onClick={() => router.back()} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            {isEditing ? "Modifica manutenzione" : "Nuova manutenzione"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Intervento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mezzo *</Label>
                  <Select value={mezzoId} onValueChange={(v) => v !== null && setMezzoId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona mezzo" />
                    </SelectTrigger>
                    <SelectContent>
                      {mezzi.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome} ({m.codiceInterno})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo intervento *</Label>
                  <Select value={tipo} onValueChange={(v) => v !== null && setTipo(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manutenzione_ordinaria">Manutenzione ordinaria</SelectItem>
                      <SelectItem value="manutenzione_straordinaria">Manutenzione straordinaria</SelectItem>
                      <SelectItem value="revisione">Revisione</SelectItem>
                      <SelectItem value="tagliando">Tagliando</SelectItem>
                      <SelectItem value="riparazione">Riparazione</SelectItem>
                      <SelectItem value="controllo_periodico">Controllo periodico</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataPrevista">Data prevista *</Label>
                  <Input id="dataPrevista" type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataEseguita">Data eseguita</Label>
                  <Input id="dataEseguita" type="date" value={dataEseguita} onChange={(e) => setDataEseguita(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descrizione">Descrizione</Label>
                <Textarea id="descrizione" value={descrizione} onChange={(e) => setDescrizione(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stato</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={stato} onValueChange={(v) => v !== null && setStato(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programmata">Programmata</SelectItem>
                  <SelectItem value="in_corso_man">In corso</SelectItem>
                  <SelectItem value="completata">Completata</SelectItem>
                  <SelectItem value="annullata">Annullata</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fornitore e costi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fornitore">Fornitore</Label>
                <Input id="fornitore" value={fornitore} onChange={(e) => setFornitore(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costo">Costo (€)</Label>
                <Input id="costo" type="number" step="0.01" value={costo} onChange={(e) => setCosto(Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
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
