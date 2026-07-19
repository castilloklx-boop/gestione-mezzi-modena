"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getDashboardData() {
  const session = await auth()
  if (!session) throw new Error("Non autorizzato")

  const oggi = new Date()
  const tra7Giorni = new Date(oggi.getTime() + 7 * 24 * 60 * 60 * 1000)
  const inizioMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1)
  const fineMese = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0)

  const [
    mezziNoleggiati,
    mezziDisponibili,
    noleggiInCorso,
    noleggiInScadenza,
    restituzioniInRitardo,
    preventiviAperti,
    fatturatoMese,
    manutenzioniImminenti,
    ultimiNoleggi,
    noleggiPerMese,
  ] = await Promise.all([
    prisma.mezzo.count({ where: { stato: "noleggiato" } }),
    prisma.mezzo.count({ where: { stato: "disponibile" } }),
    prisma.noleggio.count({ where: { stato: "in_corso" } }),
    prisma.noleggio.count({
      where: {
        dataRestituzionePrev: { gte: oggi, lte: tra7Giorni },
        stato: { in: ["programmato", "in_corso"] },
      },
    }),
    prisma.noleggio.count({
      where: {
        dataRestituzionePrev: { lt: oggi },
        stato: { in: ["in_corso", "programmato"] },
      },
    }),
    prisma.preventivo.count({
      where: { stato: { in: ["bozza", "inviato", "accettato"] } },
    }),
    prisma.noleggio.aggregate({
      where: {
        dataInizio: { gte: inizioMese, lte: fineMese },
        stato: { not: "annullato" },
      },
      _sum: { importo: true },
    }),
    prisma.manutenzione.findMany({
      where: {
        dataPrevista: { gte: oggi, lte: tra7Giorni },
        stato: { in: ["programmata", "in_corso_man"] },
      },
      include: { mezzo: true },
      orderBy: { dataPrevista: "asc" },
      take: 5,
    }),
    prisma.noleggio.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        cliente: true,
        mezzi: { include: { mezzo: true } },
      },
    }),
    getNoleggiPerMese(),
  ])

  const totaleMezzi = await prisma.mezzo.count()

  return {
    mezziNoleggiati: { value: mezziNoleggiati, total: totaleMezzi },
    mezziDisponibili,
    noleggiInCorso,
    noleggiInScadenza,
    restituzioniInRitardo,
    preventiviAperti,
    fatturatoMese: fatturatoMese._sum?.importo || 0,
    manutenzioniImminenti,
    ultimiNoleggi,
    noleggiPerMese,
  }
}

async function getNoleggiPerMese() {
  const now = new Date()
  const result: { mese: string; conteggio: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const mese = now.getMonth() - i
    const anno = now.getFullYear() + (mese < 0 ? -1 : 0)
    const meseNormalizzato = ((mese % 12) + 12) % 12
    const inizio = new Date(anno, meseNormalizzato, 1)
    const fine = new Date(anno, meseNormalizzato + 1, 0)

    const count = await prisma.noleggio.count({
      where: {
        dataInizio: { gte: inizio, lte: fine },
        stato: { not: "annullato" },
      },
    })

    const nomeMese = inizio.toLocaleDateString("it-IT", { month: "short" })
    result.push({ mese: nomeMese, conteggio: count })
  }

  return result
}
