import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ImpostazioniForm } from "./impostazioni-form"

export default async function ImpostazioniPage() {
  const session = await auth()
  if (!session) redirect("/login")

  let impostazioni = await prisma.impostazioni.findUnique({ where: { id: "default" } })
  if (!impostazioni) {
    impostazioni = await prisma.impostazioni.create({ data: { id: "default" } })
  }

  return <ImpostazioniForm impostazioni={impostazioni} />
}
