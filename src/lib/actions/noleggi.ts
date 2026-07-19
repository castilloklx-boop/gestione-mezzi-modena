"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getNoleggi(search?: string, stato?: string, clienteId?: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const where: Record<string, unknown> = {}
  if (stato && stato !== "tutti") where.stato = stato
  if (clienteId) where.clienteId = clienteId
  if (search) {
    where.OR = [
      { cliente: { nome: { contains: search } } },
      { referente: { contains: search } },
    ]
  }

  return prisma.noleggio.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      cliente: true,
      mezzi: { include: { mezzo: { include: { categoria: true } } } },
    },
  })
}

export async function getNoleggio(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  return prisma.noleggio.findUnique({
    where: { id },
    include: {
      cliente: true,
      mezzi: { include: { mezzo: { include: { categoria: true } } } },
      preventivo: true,
    },
  })
}

export async function createNoleggio(data: {
  clienteId: string
  preventivoId?: string
  dataInizio: string
  dataRestituzionePrev: string
  luogoConsegna?: string
  modalitaConsegna?: string
  referente?: string
  importo: number
  deposito?: number
  stato?: string
  statoPagamento?: string
  noteConsegna?: string
  noteRestituzione?: string
  mezzoIds: string[]
}) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const impostazioni = await prisma.impostazioni.findUnique({ where: { id: "default" } })
  const progressivo = (impostazioni?.progressivoNoleggio || 1)

  const noleggio = await prisma.noleggio.create({
    data: {
      numero: progressivo,
      clienteId: data.clienteId,
      preventivoId: data.preventivoId || null,
      dataInizio: new Date(data.dataInizio),
      dataRestituzionePrev: new Date(data.dataRestituzionePrev),
      luogoConsegna: data.luogoConsegna,
      modalitaConsegna: data.modalitaConsegna,
      referente: data.referente,
      importo: data.importo,
      deposito: data.deposito || 0,
      stato: data.stato || "programmato",
      statoPagamento: data.statoPagamento || "da_pagare",
      noteConsegna: data.noteConsegna,
      noteRestituzione: data.noteRestituzione,
      mezzi: {
        create: data.mezzoIds.map((mezzoId) => ({ mezzoId })),
      },
    },
    include: { cliente: true, mezzi: { include: { mezzo: true } } },
  })

  await prisma.impostazioni.update({
    where: { id: "default" },
    data: { progressivoNoleggio: progressivo + 1 },
  })

  if (noleggio.stato === "in_corso") {
    for (const nm of noleggio.mezzi) {
      await prisma.mezzo.update({
        where: { id: nm.mezzoId },
        data: { stato: "noleggiato" },
      })
    }
  }

  revalidatePath("/noleggi")
  revalidatePath("/")
  return noleggio
}

export async function updateNoleggio(id: string, data: {
  clienteId: string
  preventivoId?: string
  dataInizio: string
  dataRestituzionePrev: string
  dataRestituzioneEff?: string
  luogoConsegna?: string
  modalitaConsegna?: string
  referente?: string
  importo: number
  deposito?: number
  stato: string
  statoPagamento: string
  noteConsegna?: string
  noteRestituzione?: string
  mezzoIds: string[]
}) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const old = await prisma.noleggio.findUnique({
    where: { id },
    include: { mezzi: true },
  })

  await prisma.noleggioMezzo.deleteMany({ where: { noleggioId: id } })

  const noleggio = await prisma.noleggio.update({
    where: { id },
    data: {
      clienteId: data.clienteId,
      preventivoId: data.preventivoId || null,
      dataInizio: new Date(data.dataInizio),
      dataRestituzionePrev: new Date(data.dataRestituzionePrev),
      dataRestituzioneEff: data.dataRestituzioneEff ? new Date(data.dataRestituzioneEff) : null,
      luogoConsegna: data.luogoConsegna,
      modalitaConsegna: data.modalitaConsegna,
      referente: data.referente,
      importo: data.importo,
      deposito: data.deposito || 0,
      stato: data.stato,
      statoPagamento: data.statoPagamento,
      noteConsegna: data.noteConsegna,
      noteRestituzione: data.noteRestituzione,
      mezzi: {
        create: data.mezzoIds.map((mezzoId) => ({ mezzoId })),
      },
    },
    include: { cliente: true, mezzi: { include: { mezzo: true } } },
  })

  const oldMezzoIds = old?.mezzi.map(m => m.mezzoId) || []
  const newMezzoIds = data.mezzoIds

  for (const mezzoId of oldMezzoIds) {
    if (!newMezzoIds.includes(mezzoId)) {
      await prisma.mezzo.update({
        where: { id: mezzoId },
        data: { stato: "disponibile" },
      })
    }
  }

  if (noleggio.stato === "in_corso" || noleggio.stato === "programmato") {
    for (const mezzoId of newMezzoIds) {
      if (!oldMezzoIds.includes(mezzoId) || noleggio.stato === "in_corso") {
        await prisma.mezzo.update({
          where: { id: mezzoId },
          data: { stato: "noleggiato" },
        })
      }
    }
  }

  if (noleggio.stato === "completato" || noleggio.stato === "annullato") {
    for (const mezzoId of newMezzoIds) {
      await prisma.mezzo.update({
        where: { id: mezzoId },
        data: { stato: "disponibile" },
      })
    }
  }

  revalidatePath("/noleggi")
  revalidatePath(`/noleggi/${id}`)
  revalidatePath("/")
  return noleggio
}

export async function completaNoleggio(id: string, dataRestituzioneEff: string, noteRestituzione?: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const noleggio = await prisma.noleggio.update({
    where: { id },
    data: {
      dataRestituzioneEff: new Date(dataRestituzioneEff),
      noteRestituzione,
      stato: "completato",
    },
    include: { mezzi: true },
  })

  for (const nm of noleggio.mezzi) {
    await prisma.mezzo.update({
      where: { id: nm.mezzoId },
      data: { stato: "disponibile" },
    })
  }

  revalidatePath("/noleggi")
  revalidatePath(`/noleggi/${id}`)
  return noleggio
}

export async function deleteNoleggio(id: string) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const noleggio = await prisma.noleggio.findUnique({ where: { id }, include: { mezzi: true } })
  if (noleggio) {
    for (const nm of noleggio.mezzi) {
      await prisma.mezzo.update({ where: { id: nm.mezzoId }, data: { stato: "disponibile" } })
    }
    if (noleggio.preventivoId) {
      await prisma.preventivo.update({
        where: { id: noleggio.preventivoId },
        data: { stato: "accettato" },
      })
    }
  }
  await prisma.noleggioMezzo.deleteMany({ where: { noleggioId: id } })
  await prisma.noleggio.delete({ where: { id } })
  revalidatePath("/noleggi")
  revalidatePath("/preventivi")
  revalidatePath("/")
}

export async function getNoleggiPerCalendario(dal: Date, al: Date) {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  return prisma.noleggio.findMany({
    where: {
      OR: [
        { dataInizio: { gte: dal, lte: al } },
        { dataRestituzionePrev: { gte: dal, lte: al } },
      ],
      stato: { not: "annullato" },
    },
    include: {
      cliente: true,
      mezzi: { include: { mezzo: true } },
    },
    orderBy: { dataInizio: "asc" },
  })
}
