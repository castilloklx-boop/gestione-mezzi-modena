"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getPreventivi(search?: string, stato?: string, clienteId?: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const where: Record<string, unknown> = {}
  if (stato && stato !== "tutti") where.stato = stato
  if (clienteId) where.clienteId = clienteId
  if (search) {
    where.OR = [
      { cliente: { nome: { contains: search } } },
      { numero: isNaN(Number(search)) ? undefined : Number(search) },
    ].filter(Boolean)
  }

  return prisma.preventivo.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      cliente: true,
      righe: { include: { mezzo: true } },
    },
  })
}

export async function getPreventivo(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  return prisma.preventivo.findUnique({
    where: { id },
    include: {
      cliente: true,
      righe: { include: { mezzo: true } },
    },
  })
}

export async function createPreventivo(data: {
  clienteId: string
  validita: number
  sconto?: number
  iva?: number
  deposito?: number
  note?: string
  stato?: string
  righe: Array<{
    mezzoId?: string
    descrizione?: string
    quantita: number
    prezzo: number
    dal?: string
    al?: string
  }>
}) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const impostazioni = await prisma.impostazioni.findUnique({ where: { id: "default" } })
  const progressivo = (impostazioni?.progressivoPreventivo || 1)

  const preventivo = await prisma.preventivo.create({
    data: {
      numero: progressivo,
      clienteId: data.clienteId,
      validita: data.validita,
      sconto: data.sconto || 0,
      iva: data.iva || 22,
      deposito: data.deposito || 0,
      note: data.note,
      stato: data.stato || "bozza",
      righe: {
        create: data.righe.map((r) => ({
          mezzoId: r.mezzoId || null,
          descrizione: r.descrizione,
          quantita: r.quantita,
          prezzo: r.prezzo,
          dal: r.dal ? new Date(r.dal) : null,
          al: r.al ? new Date(r.al) : null,
        })),
      },
    },
    include: { cliente: true, righe: true },
  })

  await prisma.impostazioni.update({
    where: { id: "default" },
    data: { progressivoPreventivo: progressivo + 1 },
  })

  revalidatePath("/preventivi")
  revalidatePath("/")
  return preventivo
}

export async function updatePreventivo(id: string, data: {
  clienteId: string
  validita: number
  sconto?: number
  iva?: number
  deposito?: number
  note?: string
  stato?: string
  righe: Array<{
    mezzoId?: string
    descrizione?: string
    quantita: number
    prezzo: number
    dal?: string
    al?: string
  }>
}) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  await prisma.preventivoRiga.deleteMany({ where: { preventivoId: id } })

  const preventivo = await prisma.preventivo.update({
    where: { id },
    data: {
      clienteId: data.clienteId,
      validita: data.validita,
      sconto: data.sconto || 0,
      iva: data.iva || 22,
      deposito: data.deposito || 0,
      note: data.note,
      stato: data.stato || "bozza",
      righe: {
        create: data.righe.map((r) => ({
          mezzoId: r.mezzoId || null,
          descrizione: r.descrizione,
          quantita: r.quantita,
          prezzo: r.prezzo,
          dal: r.dal ? new Date(r.dal) : null,
          al: r.al ? new Date(r.al) : null,
        })),
      },
    },
    include: { cliente: true, righe: true },
  })

  revalidatePath("/preventivi")
  revalidatePath(`/preventivi/${id}`)
  revalidatePath("/")
  return preventivo
}

export async function deletePreventivo(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  await prisma.preventivoRiga.deleteMany({ where: { preventivoId: id } })
  await prisma.noleggio.updateMany({ where: { preventivoId: id }, data: { preventivoId: null } })
  await prisma.preventivo.delete({ where: { id } })
  revalidatePath("/preventivi")
  revalidatePath("/")
}

export async function duplicatePreventivo(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const original = await prisma.preventivo.findUnique({
    where: { id },
    include: { righe: true },
  })
  if (!original) throw new Error("Preventivo non trovato")

  const impostazioni = await prisma.impostazioni.findUnique({ where: { id: "default" } })
  const progressivo = (impostazioni?.progressivoPreventivo || 1)

  const preventivo = await prisma.preventivo.create({
    data: {
      numero: progressivo,
      clienteId: original.clienteId,
      validita: original.validita,
      sconto: original.sconto,
      iva: original.iva,
      deposito: original.deposito,
      note: original.note,
      stato: "bozza",
      righe: {
        create: original.righe.map((r) => ({
          mezzoId: r.mezzoId,
          descrizione: r.descrizione,
          quantita: r.quantita,
          prezzo: r.prezzo,
          dal: r.dal,
          al: r.al,
        })),
      },
    },
  })

  await prisma.impostazioni.update({
    where: { id: "default" },
    data: { progressivoPreventivo: progressivo + 1 },
  })

  revalidatePath("/preventivi")
  return preventivo
}

export async function convertiInNoleggio(preventivoId: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const preventivo = await prisma.preventivo.findUnique({
    where: { id: preventivoId },
    include: { righe: true, cliente: true },
  })
  if (!preventivo) throw new Error("Preventivo non trovato")

  const impostazioni = await prisma.impostazioni.findUnique({ where: { id: "default" } })
  const progressivo = (impostazioni?.progressivoNoleggio || 1)

  const totale = preventivo.righe.reduce((sum, r) => sum + r.prezzo * r.quantita, 0)
  const sconto = preventivo.sconto || 0
  const importo = totale - (totale * sconto) / 100

  const primaRiga = preventivo.righe[0]

  const noleggio = await prisma.noleggio.create({
    data: {
      numero: progressivo,
      preventivoId: preventivo.id,
      clienteId: preventivo.clienteId,
      dataInizio: primaRiga?.dal || new Date(),
      dataRestituzionePrev: primaRiga?.al || new Date(),
      importo,
      deposito: preventivo.deposito || 0,
      stato: "programmato",
      statoPagamento: "da_pagare",
      mezzi: {
        create: preventivo.righe.filter(r => r.mezzoId).map(r => ({
          mezzoId: r.mezzoId!,
        })),
      },
    },
  })

  await prisma.impostazioni.update({
    where: { id: "default" },
    data: { progressivoNoleggio: progressivo + 1 },
  })

  await prisma.preventivo.update({
    where: { id: preventivoId },
    data: { stato: "convertito" },
  })

  revalidatePath("/preventivi")
  revalidatePath("/noleggi")
  return noleggio
}
