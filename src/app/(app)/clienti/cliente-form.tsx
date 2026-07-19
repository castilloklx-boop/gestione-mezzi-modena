"use client"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { clienteSchema, ClienteFormData } from "@/lib/validations"
import { createCliente, updateCliente } from "@/lib/actions/clienti"
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

interface ClienteFormProps {
  cliente?: {
    id: string
    nome: string
    tipo: string
    partitaIva?: string | null
    codiceFiscale?: string | null
    referente?: string | null
    email?: string | null
    telefono?: string | null
    indirizzo?: string | null
    citta?: string | null
    cap?: string | null
    provincia?: string | null
    note?: string | null
    attivo: boolean
  }
  onSuccess?: () => void
}

export function ClienteForm({ cliente, onSuccess }: ClienteFormProps) {
  const router = useRouter()
  const isEditing = !!cliente

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema) as Resolver<ClienteFormData>,
    defaultValues: {
      nome: cliente?.nome || "",
      tipo: cliente?.tipo || "privato",
      partitaIva: cliente?.partitaIva || "",
      codiceFiscale: cliente?.codiceFiscale || "",
      referente: cliente?.referente || "",
      email: cliente?.email || "",
      telefono: cliente?.telefono || "",
      indirizzo: cliente?.indirizzo || "",
      citta: cliente?.citta || "",
      cap: cliente?.cap || "",
      provincia: cliente?.provincia || "",
      note: cliente?.note || "",
      attivo: cliente?.attivo ?? true,
    },
  })

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = form
  const tipo = useWatch({ control, name: "tipo" })

  async function onSubmit(data: ClienteFormData) {
    try {
      if (isEditing && cliente) {
        await updateCliente(cliente.id, data)
        toast.success("Cliente aggiornato")
      } else {
        await createCliente(data)
        toast.success("Cliente creato")
      }
      if (onSuccess) onSuccess()
      else router.push("/clienti")
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
          <h1 className="text-xl font-semibold">{isEditing ? "Modifica cliente" : "Nuovo cliente"}</h1>
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
                  <Label htmlFor="nome">Nome / Ragione Sociale *</Label>
                  <Input id="nome" {...register("nome")} />
                  {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipologia</Label>
                  <Select value={tipo} onValueChange={(v) => v && setValue("tipo", v)}>
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
                  <Label htmlFor="partitaIva">Partita IVA</Label>
                  <Input id="partitaIva" {...register("partitaIva")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
                  <Input id="codiceFiscale" {...register("codiceFiscale")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referente">Referente</Label>
                  <Input id="referente" {...register("referente")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contatti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input id="telefono" {...register("telefono")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Indirizzo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="indirizzo">Indirizzo</Label>
                  <Input id="indirizzo" {...register("indirizzo")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="citta">Città</Label>
                  <Input id="citta" {...register("citta")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cap">CAP</Label>
                  <Input id="cap" {...register("cap")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input id="provincia" {...register("provincia")} />
                </div>
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
              <div className="flex items-center gap-2">
                <input type="checkbox" id="attivo" {...register("attivo")} className="rounded" />
                <Label htmlFor="attivo">Cliente attivo</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea {...register("note")} rows={4} placeholder="Note opzionali..." />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
