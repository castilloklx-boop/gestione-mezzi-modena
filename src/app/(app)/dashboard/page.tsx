import { getDashboardData } from "@/lib/actions/dashboard"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const raw = await getDashboardData()
  const data = {
    ...raw,
    manutenzioniImminenti: raw.manutenzioniImminenti.map((m) => ({
      ...m,
      dataPrevista: m.dataPrevista.toISOString(),
    })),
    ultimiNoleggi: raw.ultimiNoleggi.map((n) => ({
      ...n,
      dataInizio: n.dataInizio.toISOString(),
    })),
  }
  return <DashboardClient data={data} />
}
