import { getMezzo, getCategorie } from "@/lib/actions/mezzi"
import { notFound } from "next/navigation"
import { MezzoDetail } from "./mezzo-detail"

export default async function MezzoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [raw, categorie] = await Promise.all([getMezzo(id), getCategorie()])
  if (!raw) notFound()

  const mezzo = {
    ...raw,
    createdAt: raw.createdAt.toISOString(),
    dataUltimaManutenzione: raw.dataUltimaManutenzione?.toISOString() ?? null,
    dataProssimaManutenzione: raw.dataProssimaManutenzione?.toISOString() ?? null,
    manutenzioni: raw.manutenzioni.map((m) => ({
      ...m,
      dataPrevista: m.dataPrevista.toISOString(),
      dataEseguita: m.dataEseguita?.toISOString() ?? null,
    })),
    noleggioMezzi: raw.noleggioMezzi.map((nm) => ({
      ...nm,
      noleggio: {
        ...nm.noleggio,
        dataInizio: nm.noleggio.dataInizio.toISOString(),
        dataRestituzionePrev: nm.noleggio.dataRestituzionePrev.toISOString(),
        dataRestituzioneEff: nm.noleggio.dataRestituzioneEff?.toISOString() ?? null,
      },
    })),
  }

  return <MezzoDetail mezzo={mezzo} categorie={categorie} />
}
