"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import { toast } from "sonner"

interface ImpostazioniData {
  id: string
  ragioneSociale: string
  logo: string | null
  partitaIva: string | null
  indirizzo: string | null
  telefono: string | null
  email: string | null
  aliquotaIva: number
  condizioniNoleggio: string | null
  prefissoDocumenti: string
}

export function ImpostazioniForm({ impostazioni }: { impostazioni: ImpostazioniData }) {
  const router = useRouter()
  const [form, setForm] = useState(impostazioni)
  const [saving, setSaving] = useState(false)

  function update(field: string, value: string | number) {
    setForm({ ...form, [field]: value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch("/api/impostazioni", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error("Errore")
      toast.success("Impostazioni salvate")
      router.refresh()
    } catch {
      toast.error("Errore durante il salvataggio")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Impostazioni aziendali</h1>
          <p className="text-sm text-secondary">Configura i dati della tua azienda</p>
        </div>
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvataggio..." : "Salva"}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dati azienda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ragioneSociale">Ragione sociale</Label>
                <Input id="ragioneSociale" value={form.ragioneSociale} onChange={(e) => update("ragioneSociale", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partitaIva">Partita IVA</Label>
                <Input id="partitaIva" value={form.partitaIva || ""} onChange={(e) => update("partitaIva", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email || ""} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" value={form.telefono || ""} onChange={(e) => update("telefono", e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="indirizzo">Indirizzo</Label>
                <Input id="indirizzo" value={form.indirizzo || ""} onChange={(e) => update("indirizzo", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documenti e numerazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prefissoDocumenti">Prefisso documenti</Label>
                <Input id="prefissoDocumenti" value={form.prefissoDocumenti} onChange={(e) => update("prefissoDocumenti", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aliquotaIva">Aliquota IVA predefinita (%)</Label>
                <Input id="aliquotaIva" type="number" min={0} max={100} value={form.aliquotaIva} onChange={(e) => update("aliquotaIva", Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Condizioni di noleggio</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.condizioniNoleggio || ""}
              onChange={(e) => update("condizioniNoleggio", e.target.value)}
              rows={6}
              placeholder="Inserisci le condizioni generali di noleggio..."
            />
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
