import { getPreventivo } from "@/lib/actions/preventivi"
import { notFound } from "next/navigation"
import { PreventivoDetail } from "./preventivo-detail"

export default async function PreventivoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await getPreventivo(id)
  if (!raw) notFound()

  const preventivo = {
    ...raw,
    dataCreazione: raw.dataCreazione.toISOString(),
    righe: raw.righe.map((r) => ({
      ...r,
      dal: r.dal?.toISOString() ?? null,
      al: r.al?.toISOString() ?? null,
    })),
  }

  return <PreventivoDetail preventivo={preventivo} />
}
