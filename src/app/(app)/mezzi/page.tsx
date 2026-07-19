import { Suspense } from "react"
import { getMezzi, getCategorie } from "@/lib/actions/mezzi"
import { MezziList } from "./mezzi-list"
import { Skeleton } from "@/components/ui/skeleton"

export default async function MezziPage() {
  const [mezzi, categorie] = await Promise.all([getMezzi(), getCategorie()])
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <MezziList mezzi={mezzi} categorie={categorie} />
    </Suspense>
  )
}
