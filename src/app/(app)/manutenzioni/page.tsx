import { Suspense } from "react"
import { getManutenzioni } from "@/lib/actions/manutenzioni"
import { ManutenzioniList } from "./manutenzioni-list"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ManutenzioniPage() {
  const raw = await getManutenzioni()
  const manutenzioni = raw.map((m) => ({
    ...m,
    dataPrevista: m.dataPrevista.toISOString(),
    dataEseguita: m.dataEseguita?.toISOString() ?? null,
  }))
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ManutenzioniList manutenzioni={manutenzioni} />
    </Suspense>
  )
}
