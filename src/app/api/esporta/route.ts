import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })

  const tipo = req.nextUrl.searchParams.get("tipo")

  if (!tipo) {
    return NextResponse.json({ error: "Parametro tipo richiesto (clienti, mezzi, preventivi, noleggi, manutenzioni)" }, { status: 400 })
  }

  let data: Record<string, unknown>[] = []

  if (tipo === "clienti") {
    data = await prisma.cliente.findMany({ orderBy: { nome: "asc" } })
  } else if (tipo === "mezzi") {
    data = await prisma.mezzo.findMany({
      orderBy: { nome: "asc" },
      include: { categoria: true },
    })
  } else if (tipo === "preventivi") {
    data = await prisma.preventivo.findMany({
      orderBy: { createdAt: "desc" },
      include: { cliente: true, righe: { include: { mezzo: true } } },
    })
  } else if (tipo === "noleggi") {
    data = await prisma.noleggio.findMany({
      orderBy: { createdAt: "desc" },
      include: { cliente: true, mezzi: { include: { mezzo: true } } },
    })
  } else if (tipo === "manutenzioni") {
    data = await prisma.manutenzione.findMany({
      orderBy: { dataPrevista: "desc" },
      include: { mezzo: true },
    })
  } else {
    return NextResponse.json({ error: "Tipo non valido" }, { status: 400 })
  }

  const csv = convertToCsv(data)
  const filename = `${tipo}_${new Date().toISOString().split("T")[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}

function convertToCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ""

  const flatten = (obj: Record<string, unknown>, prefix = ""): Record<string, string> => {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        result[prefix + key] = ""
      } else if (typeof value === "object" && !Array.isArray(value)) {
        Object.assign(result, flatten(value as Record<string, unknown>, prefix + key + "_"))
      } else if (Array.isArray(value)) {
        result[prefix + key] = `"${JSON.stringify(value).replace(/"/g, '""')}"`
      } else {
        result[prefix + key] = String(value)
      }
    }
    return result
  }

  const flattened = data.map(item => flatten(item))
  const headers = [...new Set(flattened.flatMap(Object.keys))]
  const rows = flattened.map(item => headers.map(h => {
    const val = item[h] || ""
    return val.includes(",") || val.includes('"') || val.includes("\n")
      ? `"${val.replace(/"/g, '""')}"`
      : val
  }).join(","))

  return [headers.join(","), ...rows].join("\n")
}
