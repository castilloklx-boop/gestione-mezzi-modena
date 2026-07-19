import { getCliente } from "@/lib/actions/clienti"
import { notFound } from "next/navigation"
import { ClienteDetail } from "./cliente-detail"

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cliente = await getCliente(id)
  if (!cliente) notFound()

  const serialized = {
    ...cliente,
    createdAt: cliente.createdAt.toISOString(),
    noleggi: cliente.noleggi.map((n) => ({
      ...n,
      dataInizio: n.dataInizio.toISOString(),
      dataRestituzionePrev: n.dataRestituzionePrev.toISOString(),
    })),
  }

  return <ClienteDetail cliente={serialized} />
}
