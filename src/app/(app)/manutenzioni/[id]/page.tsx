import { getManutenzione } from "@/lib/actions/manutenzioni"
import { notFound } from "next/navigation"
import { ManutenzioneDetail } from "./manutenzione-detail"

export default async function ManutenzioneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await getManutenzione(id)
  if (!raw) notFound()

  const manutenzione = {
    ...raw,
    dataPrevista: raw.dataPrevista.toISOString(),
    dataEseguita: raw.dataEseguita?.toISOString() ?? null,
    mezzo: {
      ...raw.mezzo,
      dataUltimaManutenzione: raw.mezzo.dataUltimaManutenzione?.toISOString() ?? null,
      dataProssimaManutenzione: raw.mezzo.dataProssimaManutenzione?.toISOString() ?? null,
      categoria: raw.mezzo.categoria,
    },
  }

  return <ManutenzioneDetail manutenzione={manutenzione} />
}
