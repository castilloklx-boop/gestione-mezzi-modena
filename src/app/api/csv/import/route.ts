import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })

  try {
    const { tipo, mapping, dati } = await req.json()

    let success = 0
    const errors: string[] = []

    if (tipo === "clienti") {
      for (let i = 0; i < dati.length; i++) {
        const row = dati[i]
        try {
          const data: Record<string, unknown> = {}

          for (const [csvCol, field] of Object.entries(mapping) as [string, string][]) {
            if (field && row[csvCol]) {
              if (field === "attivo") {
                data[field] = row[csvCol].toLowerCase() === "si" || row[csvCol].toLowerCase() === "true"
              } else if (field === "tipo") {
                if (row[csvCol].toLowerCase() === "azienda" || row[csvCol].toLowerCase() === "privato") {
                  data[field] = row[csvCol].toLowerCase()
                } else {
                  data[field] = "privato"
                }
              } else {
                data[field] = row[csvCol]
              }
            }
          }

          if (!data.nome) {
            errors.push(`Riga ${i + 1}: nome obbligatorio`)
            continue
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await prisma.cliente.create({ data: data as any })
          success++
        } catch (err) {
          errors.push(`Riga ${i + 1}: ${err instanceof Error ? err.message : "errore sconosciuto"}`)
        }
      }
    } else if (tipo === "mezzi") {
      for (let i = 0; i < dati.length; i++) {
        const row = dati[i]
        try {
          const data: Record<string, unknown> = {}

          for (const [csvCol, field] of Object.entries(mapping) as [string, string][]) {
            if (field && row[csvCol]) {
              if (field === "tariffaGiornaliera" || field === "tariffaSettimanale" || field === "depositoCauzionale") {
                data[field] = parseFloat(row[csvCol].replace(",", ".")) || 0
              } else if (field === "categoria") {
                let categoria = await prisma.categoria.findFirst({
                  where: { nome: { contains: row[csvCol] } },
                })
                if (!categoria) {
                  categoria = await prisma.categoria.create({ data: { nome: row[csvCol] } })
                }
                data.categoriaId = categoria.id
              } else {
                data[field] = row[csvCol]
              }
            }
          }

          if (!data.nome || !data.codiceInterno) {
            errors.push(`Riga ${i + 1}: nome e codiceInterno obbligatori`)
            continue
          }

          if (!data.categoriaId) {
            const defaultCat = await prisma.categoria.findFirst()
            if (defaultCat) data.categoriaId = defaultCat.id
            else {
              const newCat = await prisma.categoria.create({ data: { nome: "Generica" } })
              data.categoriaId = newCat.id
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await prisma.mezzo.create({ data: data as any })
          success++
        } catch (err) {
          errors.push(`Riga ${i + 1}: ${err instanceof Error ? err.message : "errore sconosciuto"}`)
        }
      }
    }

    return NextResponse.json({ success, errors })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore durante l'importazione" },
      { status: 500 }
    )
  }
}
