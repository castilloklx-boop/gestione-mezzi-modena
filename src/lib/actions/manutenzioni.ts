"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getManutenzioni(search?: string, stato?: string, mezzoId?: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const where: Record<string, unknown> = {}
  if (stato && stato !== "tutti") where.stato = stato
  if (mezzoId) where.mezzoId = mezzoId
  if (search) {
    where.OR = [
      { mezzo: { nome: { contains: search } } },
      { tipo: { contains: search } },
      { fornitore: { contains: search } },
    ]
  }

  return prisma.manutenzione.findMany({
    where,
    orderBy: { dataPrevista: "desc" },
    include: { mezzo: { include: { categoria: true } } },
  })
}

export async function getManutenzione(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  return prisma.manutenzione.findUnique({
    where: { id },
    include: { mezzo: { include: { categoria: true } } },
  })
}

export async function createManutenzione(data: {
  mezzoId: string
  tipo: string
  dataPrevista: string
  dataEseguita?: string
  costo?: number
  fornitore?: string
  descrizione?: string
  stato?: string
  note?: string
}) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const manutenzione = await prisma.manutenzione.create({
    data: {
      mezzoId: data.mezzoId,
      tipo: data.tipo,
      dataPrevista: new Date(data.dataPrevista),
      dataEseguita: data.dataEseguita ? new Date(data.dataEseguita) : null,
      costo: data.costo || null,
      fornitore: data.fornitore,
      descrizione: data.descrizione,
      stato: data.stato || "programmata",
      note: data.note,
    },
  })

  if (manutenzione.stato === "in_corso_man") {
    await prisma.mezzo.update({
      where: { id: data.mezzoId },
      data: { stato: "in_manutenzione" },
    })
  }

  if (manutenzione.stato === "completata") {
    await prisma.mezzo.update({
      where: { id: data.mezzoId },
      data: {
        dataUltimaManutenzione: new Date(),
        dataProssimaManutenzione: data.dataPrevista ? new Date(data.dataPrevista) : undefined,
      },
    })
  }

  revalidatePath("/manutenzioni")
  return manutenzione
}

export async function updateManutenzione(id: string, data: {
  mezzoId: string
  tipo: string
  dataPrevista: string
  dataEseguita?: string
  costo?: number
  fornitore?: string
  descrizione?: string
  stato?: string
  note?: string
}) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const manutenzione = await prisma.manutenzione.update({
    where: { id },
    data: {
      mezzoId: data.mezzoId,
      tipo: data.tipo,
      dataPrevista: new Date(data.dataPrevista),
      dataEseguita: data.dataEseguita ? new Date(data.dataEseguita) : null,
      costo: data.costo || null,
      fornitore: data.fornitore,
      descrizione: data.descrizione,
      stato: data.stato || "programmata",
      note: data.note,
    },
  })

  if (data.stato === "in_corso_man") {
    await prisma.mezzo.update({
      where: { id: data.mezzoId },
      data: { stato: "in_manutenzione" },
    })
  }

  if (data.stato === "completata") {
    await prisma.mezzo.update({
      where: { id: data.mezzoId },
      data: {
        dataUltimaManutenzione: new Date(),
        dataProssimaManutenzione: data.dataPrevista ? new Date(data.dataPrevista) : undefined,
        stato: "disponibile",
      },
    })
  }

  revalidatePath("/manutenzioni")
  revalidatePath(`/manutenzioni/${id}`)
  return manutenzione
}

export async function deleteManutenzione(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const man = await prisma.manutenzione.findUnique({ where: { id } })
  if (man && man.stato === "in_corso_man") {
    await prisma.mezzo.update({ where: { id: man.mezzoId }, data: { stato: "disponibile" } })
  }
  await prisma.manutenzione.delete({ where: { id } })
  revalidatePath("/manutenzioni")
  revalidatePath("/")
}

export async function getManutenzioniImminenti() {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const oggi = new Date()
  const tra15Giorni = new Date(oggi.getTime() + 15 * 24 * 60 * 60 * 1000)

  return prisma.manutenzione.findMany({
    where: {
      dataPrevista: { gte: oggi, lte: tra15Giorni },
      stato: { in: ["programmata", "in_corso_man"] },
    },
    include: { mezzo: true },
    orderBy: { dataPrevista: "asc" },
  })
}

export async function getManutenzioniScadute() {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const oggi = new Date()

  return prisma.manutenzione.findMany({
    where: {
      dataPrevista: { lt: oggi },
      stato: { in: ["programmata", "in_corso_man"] },
    },
    include: { mezzo: true },
    orderBy: { dataPrevista: "asc" },
  })
}
