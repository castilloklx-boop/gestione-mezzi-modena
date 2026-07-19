import { getCategorie } from "@/lib/actions/mezzi"
import { MezzoForm } from "../mezzo-form"

export default async function NuovoMezzoPage() {
  const categorie = await getCategorie()
  return <MezzoForm categorie={categorie} />
}
