import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })

  const dal = req.nextUrl.searchParams.get("dal")
  const al = req.nextUrl.searchParams.get("al")

  if (!dal || !al) {
    return NextResponse.json({ error: "Parametri dal e al richiesti" }, { status: 400 })
  }

  const manutenzioni = await prisma.manutenzione.findMany({
    where: {
      dataPrevista: { gte: new Date(dal), lte: new Date(al) },
    },
    include: { mezzo: true },
    orderBy: { dataPrevista: "asc" },
  })

  return NextResponse.json(manutenzioni)
}
