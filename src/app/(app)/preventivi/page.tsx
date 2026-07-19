import { Suspense } from "react"
import { getPreventivi } from "@/lib/actions/preventivi"
import { PreventiviList } from "./preventivi-list"
import { Skeleton } from "@/components/ui/skeleton"

export default async function PreventiviPage() {
  const raw = await getPreventivi()
  const preventivi = raw.map((p) => ({
    ...p,
    dataCreazione: p.dataCreazione.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    cliente: { ...p.cliente, createdAt: p.cliente.createdAt.toISOString(), updatedAt: p.cliente.updatedAt.toISOString() },
    righe: p.righe.map((r) => ({
      ...r,
      mezzo: r.mezzo ? {
        ...r.mezzo,
        createdAt: r.mezzo.createdAt.toISOString(),
        updatedAt: r.mezzo.updatedAt.toISOString(),
        dataUltimaManutenzione: r.mezzo.dataUltimaManutenzione?.toISOString() ?? null,
        dataProssimaManutenzione: r.mezzo.dataProssimaManutenzione?.toISOString() ?? null,
      } : null,
    })),
  }))
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <PreventiviList preventivi={preventivi} />
    </Suspense>
  )
}
