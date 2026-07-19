"use client"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { mezzoSchema, MezzoFormData } from "@/lib/validations"
import { createMezzo, updateMezzo } from "@/lib/actions/mezzi"
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

interface MezzoFormProps {
  categorie: Array<{ id: string; nome: string }>
  mezzo?: {
    id: string
    nome: string
    codiceInterno: string
    categoriaId: string
    marca?: string | null
    modello?: string | null
    matricola?: string | null
    descrizione?: string | null
    tariffaGiornaliera: number
    tariffaSettimanale?: number | null
    depositoCauzionale: number
    ubicazione?: string | null
    stato: string
    dataUltimaManutenzione?: string | null
    dataProssimaManutenzione?: string | null
    note?: string | null
  }
  onSuccess?: () => void
}

export function MezzoForm({ categorie, mezzo, onSuccess }: MezzoFormProps) {
  const router = useRouter()
  const isEditing = !!mezzo

  const form = useForm<MezzoFormData>({
    resolver: zodResolver(mezzoSchema) as Resolver<MezzoFormData>,
    defaultValues: {
      nome: mezzo?.nome || "",
      codiceInterno: mezzo?.codiceInterno || "",
      categoriaId: mezzo?.categoriaId || "",
      marca: mezzo?.marca || "",
      modello: mezzo?.modello || "",
      matricola: mezzo?.matricola || "",
      descrizione: mezzo?.descrizione || "",
      tariffaGiornaliera: mezzo?.tariffaGiornaliera || 0,
      tariffaSettimanale: mezzo?.tariffaSettimanale || undefined,
      depositoCauzionale: mezzo?.depositoCauzionale || 0,
      ubicazione: mezzo?.ubicazione || "",
      stato: mezzo?.stato || "disponibile",
      dataUltimaManutenzione: mezzo?.dataUltimaManutenzione ? new Date(mezzo.dataUltimaManutenzione).toISOString().split("T")[0] : "",
      dataProssimaManutenzione: mezzo?.dataProssimaManutenzione ? new Date(mezzo.dataProssimaManutenzione).toISOString().split("T")[0] : "",
      note: mezzo?.note || "",
    },
  })

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = form
  const stato = useWatch({ control, name: "stato" })
  const categoriaId = useWatch({ control, name: "categoriaId" })

  async function onSubmit(data: MezzoFormData) {
    try {
      if (isEditing && mezzo) {
        await updateMezzo(mezzo.id, data)
        toast.success("Mezzo aggiornato")
      } else {
        await createMezzo(data)
        toast.success("Mezzo creato")
      }
      if (onSuccess) onSuccess()
      else router.push("/mezzi")
    } catch {
      toast.error("Errore durante il salvataggio")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{isEditing ? "Modifica mezzo" : "Nuovo mezzo"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Salvataggio..." : "Salva"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dati principali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" {...register("nome")} />
                  {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codiceInterno">Codice interno *</Label>
                  <Input id="codiceInterno" {...register("codiceInterno")} />
                  {errors.codiceInterno && <p className="text-xs text-destructive">{errors.codiceInterno.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoriaId">Categoria *</Label>
                  <Select value={categoriaId} onValueChange={(v) => v && setValue("categoriaId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorie.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoriaId && <p className="text-xs text-destructive">{errors.categoriaId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stato">Stato</Label>
                  <Select value={stato} onValueChange={(v) => v && setValue("stato", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponibile">Disponibile</SelectItem>
                      <SelectItem value="prenotato">Prenotato</SelectItem>
                      <SelectItem value="noleggiato">Noleggiato</SelectItem>
                      <SelectItem value="in_manutenzione">In manutenzione</SelectItem>
                      <SelectItem value="non_disponibile">Non disponibile</SelectItem>
                      <SelectItem value="dismesso">Dismesso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" {...register("marca")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modello">Modello</Label>
                  <Input id="modello" {...register("modello")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricola">Matricola / Targa</Label>
                  <Input id="matricola" {...register("matricola")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descrizione</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea {...register("descrizione")} rows={3} placeholder="Descrizione del mezzo..." />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tariffe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tariffaGiornaliera">Tariffa giornaliera (€) *</Label>
                <Input id="tariffaGiornaliera" type="number" step="0.01" {...register("tariffaGiornaliera")} />
                {errors.tariffaGiornaliera && <p className="text-xs text-destructive">{errors.tariffaGiornaliera.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tariffaSettimanale">Tariffa settimanale (€)</Label>
                <Input id="tariffaSettimanale" type="number" step="0.01" {...register("tariffaSettimanale")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositoCauzionale">Deposito cauzionale (€)</Label>
                <Input id="depositoCauzionale" type="number" step="0.01" {...register("depositoCauzionale")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ubicazione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="ubicazione">Ubicazione</Label>
                <Input id="ubicazione" {...register("ubicazione")} placeholder="Magazzino, sede, cantiere..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manutenzione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataUltimaManutenzione">Ultima manutenzione</Label>
                <Input id="dataUltimaManutenzione" type="date" {...register("dataUltimaManutenzione")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataProssimaManutenzione">Prossima manutenzione</Label>
                <Input id="dataProssimaManutenzione" type="date" {...register("dataProssimaManutenzione")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea {...register("note")} rows={3} placeholder="Note opzionali..." />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
