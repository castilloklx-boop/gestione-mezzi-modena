import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })

  try {
    const data = await req.json()
    const impostazioni = await prisma.impostazioni.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    })
    return NextResponse.json(impostazioni)
  } catch {
    return NextResponse.json({ error: "Errore durante il salvataggio" }, { status: 500 })
  }
}
