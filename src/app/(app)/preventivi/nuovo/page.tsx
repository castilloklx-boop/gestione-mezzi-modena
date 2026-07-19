import { getClienti } from "@/lib/actions/clienti"
import { getMezzi } from "@/lib/actions/mezzi"
import { getPreventivo } from "@/lib/actions/preventivi"
import { PreventivoForm } from "../preventivo-form"

export default async function NuovoPreventivoPage({
  searchParams,
}: {
  searchParams: Promise<{ modifica?: string; duplica?: string; clienteId?: string }>
}) {
  const { modifica, duplica, clienteId } = await searchParams
  const [clienti, mezzi] = await Promise.all([getClienti(), getMezzi()])

  if (modifica || duplica) {
    const targetId = modifica || duplica || ""
    const raw = await getPreventivo(targetId)
    if (raw) {
      const preventivo = {
        id: duplica ? "" : raw.id,
        numero: duplica ? 0 : raw.numero,
        clienteId: raw.clienteId,
        validita: raw.validita,
        sconto: raw.sconto,
        iva: raw.iva,
        deposito: raw.deposito,
        note: raw.note,
        stato: duplica ? "bozza" : raw.stato,
        righe: raw.righe.map((r) => ({
          mezzoId: r.mezzoId,
          descrizione: r.descrizione,
          quantita: r.quantita,
          prezzo: r.prezzo,
          dal: r.dal?.toISOString() ?? null,
          al: r.al?.toISOString() ?? null,
        })),
      }
    return (
      <PreventivoForm
        clienti={clienti}
        mezzi={mezzi}
        preventivo={preventivo}
        isDuplicating={!!duplica}
        clienteIdPreset={clienteId}
      />
    )
    }
  }

  return <PreventivoForm clienti={clienti} mezzi={mezzi} clienteIdPreset={clienteId} />
}
