import { getNoleggio } from "@/lib/actions/noleggi"
import { notFound } from "next/navigation"
import { NoleggioDetail } from "./noleggio-detail"

export default async function NoleggioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await getNoleggio(id)
  if (!raw) notFound()

  const noleggio = {
    ...raw,
    dataInizio: raw.dataInizio.toISOString(),
    dataRestituzionePrev: raw.dataRestituzionePrev.toISOString(),
    dataRestituzioneEff: raw.dataRestituzioneEff?.toISOString() ?? null,
    preventivo: raw.preventivo ? {
      ...raw.preventivo,
      dataCreazione: raw.preventivo.dataCreazione.toISOString(),
    } : null,
    mezzi: raw.mezzi.map((nm) => ({
      ...nm,
      mezzo: {
        ...nm.mezzo,
        createdAt: nm.mezzo.createdAt.toISOString(),
        updatedAt: nm.mezzo.updatedAt.toISOString(),
        dataUltimaManutenzione: nm.mezzo.dataUltimaManutenzione?.toISOString() ?? null,
        dataProssimaManutenzione: nm.mezzo.dataProssimaManutenzione?.toISOString() ?? null,
      },
    })),
  }

  return <NoleggioDetail noleggio={noleggio} />
}
