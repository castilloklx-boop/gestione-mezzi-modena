import { Suspense } from "react"
import { getNoleggi } from "@/lib/actions/noleggi"
import { NoleggiList } from "./noleggi-list"
import { Skeleton } from "@/components/ui/skeleton"

export default async function NoleggiPage() {
  const raw = await getNoleggi()
  const noleggi = raw.map((n) => ({
    ...n,
    dataInizio: n.dataInizio.toISOString(),
    dataRestituzionePrev: n.dataRestituzionePrev.toISOString(),
    dataRestituzioneEff: n.dataRestituzioneEff?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
    mezzi: n.mezzi.map((nm) => ({
      ...nm,
      mezzo: {
        ...nm.mezzo,
        createdAt: nm.mezzo.createdAt.toISOString(),
        updatedAt: nm.mezzo.updatedAt.toISOString(),
        dataUltimaManutenzione: nm.mezzo.dataUltimaManutenzione?.toISOString() ?? null,
        dataProssimaManutenzione: nm.mezzo.dataProssimaManutenzione?.toISOString() ?? null,
      },
    })),
  }))
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <NoleggiList noleggi={noleggi} />
    </Suspense>
  )
}
