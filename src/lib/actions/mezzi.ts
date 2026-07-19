"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { mezzoSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"

export async function getMezzi(search?: string, categoria?: string, stato?: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const where: Record<string, unknown> = {}
  if (categoria && categoria !== "tutte") where.categoriaId = categoria
  if (stato && stato !== "tutti") where.stato = stato
  if (search) {
    where.OR = [
      { nome: { contains: search } },
      { codiceInterno: { contains: search } },
      { marca: { contains: search } },
      { matricola: { contains: search } },
    ]
  }

  return prisma.mezzo.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { categoria: true, _count: { select: { noleggioMezzi: true, manutenzioni: true } } },
  })
}

export async function getMezzo(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  return prisma.mezzo.findUnique({
    where: { id },
    include: {
      categoria: true,
      manutenzioni: { orderBy: { dataPrevista: "desc" } },
      noleggioMezzi: {
        orderBy: { noleggio: { dataInizio: "desc" } },
        take: 10,
        include: { noleggio: { include: { cliente: true } } },
      },
    },
  })
}

export async function createMezzo(data: unknown) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const parsed = mezzoSchema.parse(data)
  const mezzo = await prisma.mezzo.create({ data: parsed })
  revalidatePath("/mezzi")
  return mezzo
}

export async function updateMezzo(id: string, data: unknown) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const parsed = mezzoSchema.parse(data)
  const mezzo = await prisma.mezzo.update({ where: { id }, data: parsed })
  revalidatePath("/mezzi")
  revalidatePath(`/mezzi/${id}`)
  return mezzo
}

export async function deleteMezzo(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  await prisma.preventivoRiga.updateMany({ where: { mezzoId: id }, data: { mezzoId: null } })
  await prisma.manutenzione.deleteMany({ where: { mezzoId: id } })
  await prisma.noleggioMezzo.deleteMany({ where: { mezzoId: id } })
  await prisma.mezzo.delete({ where: { id } })
  revalidatePath("/mezzi")
  revalidatePath("/")
}

export async function getCategorie() {
  return prisma.categoria.findMany({ orderBy: { nome: "asc" } })
}

export async function checkDisponibilità(mezzoId: string, dal: Date, al: Date, excludeNoleggioId?: string) {
  const where: Record<string, unknown> = {
    mezzoId,
    noleggio: {
      stato: { in: ["programmato", "in_corso", "in_ritardo"] },
    },
  }
  if (excludeNoleggioId) {
    where.noleggio = {
      ...(where.noleggio as Record<string, unknown>),
      id: { not: excludeNoleggioId },
    }
  }

  const conflitti = await prisma.noleggioMezzo.findMany({
    where,
    include: { noleggio: true },
  })

  return conflitti.filter((nm) => {
    const n = nm.noleggio
    return n.dataInizio < al && n.dataRestituzionePrev > dal
  })
}
