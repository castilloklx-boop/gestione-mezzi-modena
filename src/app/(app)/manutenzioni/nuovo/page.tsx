import { getMezzi } from "@/lib/actions/mezzi"
import { ManutenzioneForm } from "../manutenzione-form"

export default async function NuovaManutenzionePage() {
  const mezzi = await getMezzi()
  return <ManutenzioneForm mezzi={mezzi} />
}
