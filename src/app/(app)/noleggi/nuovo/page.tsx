import { getClienti } from "@/lib/actions/clienti"
import { getMezzi } from "@/lib/actions/mezzi"
import { getNoleggio } from "@/lib/actions/noleggi"
import { NoleggioForm } from "../noleggio-form"

export default async function NuovoNoleggioPage({
  searchParams,
}: {
  searchParams: Promise<{ modifica?: string; clienteId?: string }>
}) {
  const { modifica, clienteId } = await searchParams
  const [clienti, mezzi] = await Promise.all([getClienti(), getMezzi()])

  if (modifica) {
    const raw = await getNoleggio(modifica)
    if (raw) {
      const noleggio = {
        id: raw.id,
        clienteId: raw.clienteId,
        preventivoId: raw.preventivoId,
        dataInizio: raw.dataInizio.toISOString(),
        dataRestituzionePrev: raw.dataRestituzionePrev.toISOString(),
        dataRestituzioneEff: raw.dataRestituzioneEff?.toISOString() ?? null,
        luogoConsegna: raw.luogoConsegna,
        modalitaConsegna: raw.modalitaConsegna,
        referente: raw.referente,
        importo: raw.importo,
        deposito: raw.deposito,
        stato: raw.stato,
        statoPagamento: raw.statoPagamento,
        noteConsegna: raw.noteConsegna,
        noteRestituzione: raw.noteRestituzione,
        mezzi: raw.mezzi.map((nm) => ({ mezzoId: nm.mezzoId })),
      }
      return (
        <NoleggioForm
          clienti={clienti}
          mezzi={mezzi}
          noleggio={noleggio}
        />
      )
    }
  }

  return (
    <NoleggioForm
      clienti={clienti}
      mezzi={mezzi}
      clienteIdPreset={clienteId || undefined}
    />
  )
}
