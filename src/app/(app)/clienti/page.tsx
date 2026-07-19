import { Suspense } from "react"
import { getClienti } from "@/lib/actions/clienti"
import { ClientiList } from "./clienti-list"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ClientiPage() {
  const raw = await getClienti()
  const clienti = raw.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ClientiList clienti={clienti} />
    </Suspense>
  )
}
