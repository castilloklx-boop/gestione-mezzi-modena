"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { clienteSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"

export async function getClienti(search?: string, tipo?: string, soloAttivi?: boolean) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const where: Record<string, unknown> = {}
  if (tipo && tipo !== "tutti") where.tipo = tipo
  if (soloAttivi) where.attivo = true
  if (search) {
    where.OR = [
      { nome: { contains: search } },
      { email: { contains: search } },
      { telefono: { contains: search } },
      { referente: { contains: search } },
    ]
  }

  return prisma.cliente.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { _count: { select: { noleggi: true, preventivi: true } } },
  })
}

export async function getCliente(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  return prisma.cliente.findUnique({
    where: { id },
    include: {
      _count: { select: { noleggi: true, preventivi: true } },
      noleggi: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { mezzi: { include: { mezzo: true } } },
      },
    },
  })
}

export async function createCliente(data: unknown) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const parsed = clienteSchema.parse(data)
  const cliente = await prisma.cliente.create({ data: parsed })
  revalidatePath("/clienti")
  revalidatePath("/preventivi")
  revalidatePath("/noleggi")
  return cliente
}

export async function updateCliente(id: string, data: unknown) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const parsed = clienteSchema.parse(data)
  const cliente = await prisma.cliente.update({ where: { id }, data: parsed })
  revalidatePath("/clienti")
  revalidatePath(`/clienti/${id}`)
  revalidatePath("/preventivi")
  revalidatePath("/noleggi")
  return cliente
}

export async function deleteCliente(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const noleggi = await prisma.noleggio.findMany({ where: { clienteId: id }, include: { mezzi: true } })
  for (const n of noleggi) {
    for (const nm of n.mezzi) {
      await prisma.mezzo.update({ where: { id: nm.mezzoId }, data: { stato: "disponibile" } })
    }
    await prisma.noleggioMezzo.deleteMany({ where: { noleggioId: n.id } })
  }
  await prisma.noleggio.deleteMany({ where: { clienteId: id } })
  await prisma.preventivoRiga.deleteMany({ where: { preventivo: { clienteId: id } } })
  await prisma.preventivo.deleteMany({ where: { clienteId: id } })
  await prisma.cliente.delete({ where: { id } })
  revalidatePath("/clienti")
  revalidatePath("/preventivi")
  revalidatePath("/noleggi")
  revalidatePath("/")
}
