import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../src/generated/prisma/client"
import { hash } from "bcryptjs"

async function createAdapter() {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db"

  if (dbUrl.startsWith("postgres")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg")
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg")
    const pool = new Pool({ connectionString: dbUrl })
    return new PrismaPg(pool)
  }

  return new PrismaBetterSqlite3({ url: dbUrl })
}

async function main() {
  const adapter = await createAdapter()
  const prisma = new PrismaClient({ adapter })
  console.log("\ud83c\udf31 Seeding database...")

  await prisma.manutenzione.deleteMany()
  await prisma.noleggioMezzo.deleteMany()
  await prisma.noleggio.deleteMany()
  await prisma.preventivoRiga.deleteMany()
  await prisma.preventivo.deleteMany()
  await prisma.mezzo.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.user.deleteMany()
  await prisma.impostazioni.deleteMany()

  await prisma.impostazioni.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      ragioneSociale: "Gestione Mezzi Modena SRL",
      partitaIva: "01234560321",
      indirizzo: "Via Emilia Est 123, Modena",
      telefono: "+39 059 1234567",
      email: "info@gestione-mezzi-modena.it",
      aliquotaIva: 22,
      prefissoDocumenti: "GMM",
      condizioniNoleggio: "1. Il noleggio si intende per il periodo concordato.\n2. Il deposito cauzionale verr\u00e0 restituito alla riconsegna del mezzo.\n3. Il cliente \u00e8 responsabile dei danni causati durante il noleggio.\n4. La riconsegna oltre i termini concordati comporta un addebito aggiuntivo.",
    },
  })

  const hashedPassword = await hash("gestionaleauto@2026", 10)
  await prisma.user.upsert({
    where: { email: "admin@gestione-mezzi.it" },
    update: { password: hashedPassword },
    create: {
      email: "admin@gestione-mezzi.it",
      name: "Amministratore",
      password: hashedPassword,
    },
  })

  const categorie = await Promise.all([
    prisma.categoria.upsert({ where: { nome: "Mini escavatori" }, update: {}, create: { nome: "Mini escavatori" } }),
    prisma.categoria.upsert({ where: { nome: "Pale gommate" }, update: {}, create: { nome: "Pale gommate" } }),
    prisma.categoria.upsert({ where: { nome: "Dumper" }, update: {}, create: { nome: "Dumper" } }),
    prisma.categoria.upsert({ where: { nome: "Piattaforme aeree" }, update: {}, create: { nome: "Piattaforme aeree" } }),
    prisma.categoria.upsert({ where: { nome: "Compattatori" }, update: {}, create: { nome: "Compattatori" } }),
    prisma.categoria.upsert({ where: { nome: "Gruppi elettrogeni" }, update: {}, create: { nome: "Gruppi elettrogeni" } }),
    prisma.categoria.upsert({ where: { nome: "Carrelli elevatori" }, update: {}, create: { nome: "Carrelli elevatori" } }),
    prisma.categoria.upsert({ where: { nome: "Attrezzature edili" }, update: {}, create: { nome: "Attrezzature edili" } }),
  ])

  const clienti = await Promise.all([
    prisma.cliente.create({ data: { nome: "Edilcostruzioni SRL", tipo: "azienda", partitaIva: "02345670123", referente: "Marco Rossi", email: "marco@edilcostruzioni.it", telefono: "+39 335 1234567", indirizzo: "Via Riva di Reno 45", citta: "Bologna", cap: "40122", provincia: "BO" } }),
    prisma.cliente.create({ data: { nome: "Bianchi Giovanni", tipo: "privato", codiceFiscale: "BNCGNN75M15F257K", referente: "Giovanni Bianchi", email: "g.bianchi@gmail.com", telefono: "+39 348 2345678", indirizzo: "Via Giardini 12", citta: "Modena", cap: "41121", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Cantiere Nord SRL", tipo: "azienda", partitaIva: "03456780456", referente: "Paolo Verdi", email: "paolo@cantierenord.it", telefono: "+39 059 3456789", indirizzo: "Via Morane 89", citta: "Modena", cap: "41124", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Ferrari & Ferrari SNC", tipo: "azienda", partitaIva: "04567890567", referente: "Luca Ferrari", email: "luca@ferrarisnc.it", telefono: "+39 0522 456789", indirizzo: "Via Emilia Ovest 200", citta: "Reggio Emilia", cap: "42121", provincia: "RE" } }),
    prisma.cliente.create({ data: { nome: "Verdi Antonio", tipo: "privato", codiceFiscale: "VRDNTN80A01F257P", telefono: "+39 338 5678901", indirizzo: "Via Tassoni 5", citta: "Modena", cap: "41123", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Global Costruzioni SPA", tipo: "azienda", partitaIva: "05678901230", referente: "Andrea Neri", email: "a.neri@global.it", telefono: "+39 059 5678901", indirizzo: "Via Canaletto 100", citta: "Modena", cap: "41126", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Russo Giuseppe", tipo: "privato", codiceFiscale: "RSSGPP82B12F257Q", telefono: "+39 347 6789012", citta: "Carpi", cap: "41012", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "TecnoPavimenti SRL", tipo: "azienda", partitaIva: "06789012341", referente: "Stefano Gialli", email: "stefano@tecnopav.it", telefono: "+39 059 6789012", indirizzo: "Via per Ubersetto 34", citta: "Modena", cap: "41125", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Sabbia e Ghiaia SRL", tipo: "azienda", partitaIva: "07890123452", referente: "Mario Blu", email: "mario@sabbiaghiaia.it", telefono: "+39 0536 789012", indirizzo: "Via Nazionale 56", citta: "Sassuolo", cap: "41049", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Ristrutturazioni 2000 SRL", tipo: "azienda", partitaIva: "08901234563", referente: "Chiara Rosa", email: "chiara@ristr2000.it", telefono: "+39 059 8901234" } }),
    prisma.cliente.create({ data: { nome: "Morelli Francesco", tipo: "privato", codiceFiscale: "MRLFNC85C13F257V", telefono: "+39 349 9012345", citta: "Modena", cap: "41121", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Impianti Termici SRL", tipo: "azienda", partitaIva: "09012345674", referente: "Luigi Grigi", email: "luigi@impiantitermici.it", telefono: "+39 059 0123456", indirizzo: "Via Einstein 7", citta: "Modena", cap: "41126", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Noleggi e Servizi SRL", tipo: "azienda", partitaIva: "00123450123", email: "info@noleggieservizi.it", telefono: "+39 059 1234500", attivo: false } }),
    prisma.cliente.create({ data: { nome: "Colombo Davide", tipo: "privato", codiceFiscale: "CLMDVD89D01F257L", telefono: "+39 333 4567890", citta: "Formigine", cap: "41043", provincia: "MO" } }),
    prisma.cliente.create({ data: { nome: "Edil Alta quota SRL", tipo: "azienda", partitaIva: "01234501234", referente: "Franco Alpi", email: "franco@edilaltaquota.it", telefono: "+39 059 2345678", indirizzo: "Via Pedemontana 12", citta: "Pavullo", cap: "41026", provincia: "MO" } }),
  ])

  const mezziData = [
    { codiceInterno: "MIN-001", nome: "Bobcat E35", categoriaId: categorie[0].id, marca: "Bobcat", modello: "E35", matricola: "AB123CD", tariffaGiornaliera: 120, tariffaSettimanale: 540, depositoCauzionale: 500, ubicazione: "Magazzino Centrale", stato: "noleggiato" },
    { codiceInterno: "MIN-002", nome: "JCB 18Z-1", categoriaId: categorie[0].id, marca: "JCB", modello: "18Z-1", matricola: "EF456GH", tariffaGiornaliera: 95, tariffaSettimanale: 430, depositoCauzionale: 400, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "MIN-003", nome: "Takeuchi TB216", categoriaId: categorie[0].id, marca: "Takeuchi", modello: "TB216", matricola: "IL789MN", tariffaGiornaliera: 110, tariffaSettimanale: 495, depositoCauzionale: 500, ubicazione: "Sede operativa", stato: "in_manutenzione" },
    { codiceInterno: "PAL-001", nome: "Bobcat S530", categoriaId: categorie[1].id, marca: "Bobcat", modello: "S530", matricola: "OP012QR", tariffaGiornaliera: 150, tariffaSettimanale: 675, depositoCauzionale: 600, ubicazione: "Magazzino Centrale", stato: "noleggiato" },
    { codiceInterno: "PAL-002", nome: "JCB 407", categoriaId: categorie[1].id, marca: "JCB", modello: "407", matricola: "ST345UV", tariffaGiornaliera: 180, tariffaSettimanale: 810, depositoCauzionale: 700, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "DUM-001", nome: "Mecalac A16", categoriaId: categorie[2].id, marca: "Mecalac", modello: "A16", matricola: "WX678YZ", tariffaGiornaliera: 200, tariffaSettimanale: 900, depositoCauzionale: 800, ubicazione: "Cantiere Est", stato: "noleggiato" },
    { codiceInterno: "DUM-002", nome: "Thwaites 1.5T", categoriaId: categorie[2].id, marca: "Thwaites", modello: "1.5T", matricola: "AB901CD", tariffaGiornaliera: 140, tariffaSettimanale: 630, depositoCauzionale: 500, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "PIA-001", nome: "Genie Z34/22", categoriaId: categorie[3].id, marca: "Genie", modello: "Z34/22", matricola: "EF234GH", tariffaGiornaliera: 160, tariffaSettimanale: 720, depositoCauzionale: 600, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "PIA-002", nome: "Haulotte HA16 RTJ", categoriaId: categorie[3].id, marca: "Haulotte", modello: "HA16 RTJ", matricola: "IL567MN", tariffaGiornaliera: 190, tariffaSettimanale: 855, depositoCauzionale: 700, ubicazione: "Sede operativa", stato: "prenotato" },
    { codiceInterno: "PIA-003", nome: "JLG 1930ES", categoriaId: categorie[3].id, marca: "JLG", modello: "1930ES", matricola: "OP890QR", tariffaGiornaliera: 85, tariffaSettimanale: 380, depositoCauzionale: 300, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "COM-001", nome: "Bomag BW120", categoriaId: categorie[4].id, marca: "Bomag", modello: "BW120", matricola: "ST123UV", tariffaGiornaliera: 75, tariffaSettimanale: 340, depositoCauzionale: 300, ubicazione: "Magazzino Centrale", stato: "noleggiato" },
    { codiceInterno: "COM-002", nome: "Wacker DPU130", categoriaId: categorie[4].id, marca: "Wacker", modello: "DPU130", matricola: "WX456YZ", tariffaGiornaliera: 55, tariffaSettimanale: 250, depositoCauzionale: 200, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "GRU-001", nome: "Generac 20kVA", categoriaId: categorie[5].id, marca: "Generac", modello: "20kVA", matricola: "AB789CD", tariffaGiornaliera: 90, tariffaSettimanale: 405, depositoCauzionale: 400, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "GRU-002", nome: "Honda EU30is", categoriaId: categorie[5].id, marca: "Honda", modello: "EU30is", matricola: "EF012GH", tariffaGiornaliera: 50, tariffaSettimanale: 225, depositoCauzionale: 200, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "CAR-001", nome: "Toyota 8FBE18", categoriaId: categorie[6].id, marca: "Toyota", modello: "8FBE18", matricola: "IL345MN", tariffaGiornaliera: 110, tariffaSettimanale: 495, depositoCauzionale: 500, ubicazione: "Magazzino Centrale", stato: "noleggiato" },
    { codiceInterno: "CAR-002", nome: "Jungheinrich EFG220", categoriaId: categorie[6].id, marca: "Jungheinrich", modello: "EFG220", matricola: "OP678QR", tariffaGiornaliera: 130, tariffaSettimanale: 585, depositoCauzionale: 600, ubicazione: "Sede operativa", stato: "disponibile" },
    { codiceInterno: "ATT-001", nome: "Betoniere 350L", categoriaId: categorie[7].id, marca: "Merlo", modello: "350", matricola: "ST901UV", tariffaGiornaliera: 35, tariffaSettimanale: 160, depositoCauzionale: 100, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "ATT-002", nome: "Sega da muro", categoriaId: categorie[7].id, marca: "Stihl", modello: "TS800", matricola: "WX234YZ", tariffaGiornaliera: 45, tariffaSettimanale: 200, depositoCauzionale: 150, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "ATT-003", nome: "Martello demolitore 30kg", categoriaId: categorie[7].id, marca: "Hilti", modello: "TE3000", matricola: "AB567CD", tariffaGiornaliera: 60, tariffaSettimanale: 270, depositoCauzionale: 250, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "ATT-004", nome: "Taglia-asfalto", categoriaId: categorie[7].id, marca: "Husqvarna", modello: "FS350", matricola: "EF890GH", tariffaGiornaliera: 70, tariffaSettimanale: 315, depositoCauzionale: 300, ubicazione: "Magazzino Centrale", stato: "non_disponibile" },
    { codiceInterno: "MIN-004", nome: "Komatsu PC18MR", categoriaId: categorie[0].id, marca: "Komatsu", modello: "PC18MR-3", matricola: "IL123MN", tariffaGiornaliera: 130, tariffaSettimanale: 585, depositoCauzionale: 500, ubicazione: "Magazzino Centrale", stato: "disponibile" },
    { codiceInterno: "PAL-003", nome: "Case 421F", categoriaId: categorie[1].id, marca: "Case", modello: "421F", matricola: "OP456QR", tariffaGiornaliera: 170, tariffaSettimanale: 765, depositoCauzionale: 700, ubicazione: "Cantiere Nord", stato: "noleggiato" },
    { codiceInterno: "COM-003", nome: "Dynapac CA15", categoriaId: categorie[4].id, marca: "Dynapac", modello: "CA15", matricola: "ST789UV", tariffaGiornaliera: 85, tariffaSettimanale: 385, depositoCauzionale: 350, ubicazione: "Cantiere Nord", stato: "noleggiato" },
    { codiceInterno: "GRU-003", nome: "Pramac P6000", categoriaId: categorie[5].id, marca: "Pramac", modello: "P6000", matricola: "WX012YZ", tariffaGiornaliera: 40, tariffaSettimanale: 180, depositoCauzionale: 150, ubicazione: "Magazzino Centrale", stato: "dismesso" },
    { codiceInterno: "PIA-004", nome: "Skyjack SJ3219", categoriaId: categorie[3].id, marca: "Skyjack", modello: "SJ3219", matricola: "AB345CD", tariffaGiornaliera: 95, tariffaSettimanale: 430, depositoCauzionale: 400, ubicazione: "Magazzino Centrale", stato: "disponibile" },
  ]

  for (const m of mezziData) {
    await prisma.mezzo.create({ data: m })
  }

  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const giorniAvanti = (n: number) => new Date(oggi.getTime() + n * 24 * 60 * 60 * 1000)
  const giorniFa = (n: number) => new Date(oggi.getTime() - n * 24 * 60 * 60 * 1000)

  await prisma.preventivo.create({
    data: {
      numero: 1, clienteId: clienti[0].id, validita: 30, sconto: 5, iva: 22, deposito: 200, stato: "accettato",
      dataCreazione: giorniFa(2),
      righe: {
        create: [
          { mezzoId: undefined, descrizione: "Bobcat E35 - 7 giorni", quantita: 1, prezzo: 840, dal: giorniAvanti(1), al: giorniAvanti(8) },
          { mezzoId: undefined, descrizione: "Dumper Mecalac A16 - 7 giorni", quantita: 1, prezzo: 1400, dal: giorniAvanti(1), al: giorniAvanti(8) },
        ],
      },
    },
  })

  await prisma.preventivo.create({
    data: {
      numero: 2, clienteId: clienti[2].id, validita: 30, stato: "inviato",
      dataCreazione: giorniFa(1),
      righe: {
        create: [
          { mezzoId: undefined, descrizione: "Pala Case 421F - 5 giorni", quantita: 1, prezzo: 850, dal: giorniAvanti(5), al: giorniAvanti(10) },
        ],
      },
    },
  })

  await prisma.preventivo.create({
    data: {
      numero: 3, clienteId: clienti[1].id, validita: 15, stato: "bozza",
      dataCreazione: oggi,
      righe: {
        create: [
          { mezzoId: undefined, descrizione: "Piattaforma Haulotte HA16 - 3 giorni", quantita: 1, prezzo: 570, dal: giorniAvanti(10), al: giorniAvanti(13) },
          { mezzoId: undefined, descrizione: "Compattatore Wacker - 3 giorni", quantita: 1, prezzo: 165, dal: giorniAvanti(10), al: giorniAvanti(13) },
        ],
      },
    },
  })

  await prisma.preventivo.create({
    data: {
      numero: 4, clienteId: clienti[3].id, validita: 30, sconto: 10, iva: 22, stato: "accettato",
      dataCreazione: giorniFa(5),
      righe: {
        create: [
          { mezzoId: undefined, descrizione: "Mini escavatore JCB 18Z-1 - 10 giorni", quantita: 1, prezzo: 950, dal: giorniAvanti(3), al: giorniAvanti(13) },
        ],
      },
    },
  })

  await prisma.preventivo.create({
    data: {
      numero: 5, clienteId: clienti[5].id, validita: 30, stato: "convertito",
      dataCreazione: giorniFa(7),
      righe: {
        create: [
          { mezzoId: undefined, descrizione: "Carrello Toyota 8FBE18 - 4 giorni", quantita: 1, prezzo: 440, dal: giorniFa(5), al: giorniFa(1) },
        ],
      },
    },
  })

  await prisma.preventivo.create({
    data: {
      numero: 6, clienteId: clienti[7].id, validita: 30, stato: "inviato",
      dataCreazione: giorniFa(3),
      righe: {
        create: [
          { mezzoId: undefined, descrizione: "Piattaforma Genie Z34/22 - 7 giorni", quantita: 1, prezzo: 1120, dal: giorniAvanti(7), al: giorniAvanti(14) },
          { mezzoId: undefined, descrizione: "Sega da muro Stihl - 7 giorni", quantita: 1, prezzo: 315, dal: giorniAvanti(7), al: giorniAvanti(14) },
        ],
      },
    },
  })

  await prisma.preventivo.create({
    data: {
      numero: 7, clienteId: clienti[8].id, validita: 30, stato: "bozza",
      dataCreazione: oggi,
      righe: {
        create: [
          { mezzoId: undefined, descrizione: "Dumper Thwaites 1.5T - 5 giorni", quantita: 2, prezzo: 1400, dal: giorniAvanti(2), al: giorniAvanti(7) },
        ],
      },
    },
  })

  await prisma.preventivo.create({
    data: {
      numero: 8, clienteId: clienti[10].id, validita: 30, sconto: 15, iva: 22, deposito: 50, stato: "accettato",
      dataCreazione: giorniFa(1),
      righe: {
        create: [
          { mezzoId: undefined, descrizione: "Martello demolitore Hilti - 4 giorni", quantita: 1, prezzo: 240, dal: giorniAvanti(4), al: giorniAvanti(8) },
        ],
      },
    },
  })

  const getMezzoByCod = async (codice: string) => {
    return prisma.mezzo.findUnique({ where: { codiceInterno: codice } })
  }

  const noleggiData = [
    { num: 1, clienteIdx: 0, mezzoCod: "MIN-001", inizio: -3, fine: 4, importo: 840, deposito: 200, stato: "in_corso", statoPag: "parzialmente_pagato" },
    { num: 2, clienteIdx: 2, mezzoCod: "PAL-001", inizio: -5, fine: 2, importo: 1050, deposito: 300, stato: "in_corso", statoPag: "da_pagare" },
    { num: 3, clienteIdx: 3, mezzoCod: "DUM-001", inizio: -7, fine: -1, importo: 1400, deposito: 400, stato: "completato", statoPag: "pagato", eff: -1 },
    { num: 4, clienteIdx: 5, mezzoCod: "COM-001", inizio: -8, fine: 0, importo: 600, deposito: 150, stato: "in_ritardo", statoPag: "da_pagare" },
    { num: 5, clienteIdx: 0, mezzoCod: "CAR-001", inizio: -4, fine: 3, importo: 770, deposito: 200, stato: "in_corso", statoPag: "pagato" },
    { num: 6, clienteIdx: 1, mezzoCod: "PAL-003", inizio: -10, fine: -3, importo: 1360, deposito: 350, stato: "completato", statoPag: "pagato", eff: -3 },
    { num: 7, clienteIdx: 4, mezzoCod: "COM-003", inizio: -2, fine: 5, importo: 595, deposito: 150, stato: "in_corso", statoPag: "da_pagare" },
    { num: 8, clienteIdx: 0, mezzoCod: "PAL-002", inizio: -15, fine: -8, importo: 1440, deposito: 500, stato: "completato", statoPag: "pagato", eff: -8 },
    { num: 9, clienteIdx: 7, mezzoCod: "DUM-002", inizio: -25, fine: -18, importo: 1120, deposito: 300, stato: "completato", statoPag: "pagato", eff: -18 },
    { num: 10, clienteIdx: 9, mezzoCod: "PIA-003", inizio: -30, fine: -23, importo: 680, deposito: 200, stato: "completato", statoPag: "pagato", eff: -23 },
  ]

  for (const n of noleggiData) {
    const mezzo = await getMezzoByCod(n.mezzoCod)
    if (mezzo) {
      await prisma.noleggio.create({
        data: {
          numero: n.num,
          clienteId: clienti[n.clienteIdx].id,
          dataInizio: giorniFa(Math.abs(n.inizio)),
          dataRestituzionePrev: n.fine >= 0 ? giorniAvanti(n.fine) : giorniFa(Math.abs(n.fine)),
          dataRestituzioneEff: n.eff ? giorniFa(Math.abs(n.eff)) : null,
          importo: n.importo,
          deposito: n.deposito,
          stato: n.stato,
          statoPagamento: n.statoPag,
          mezzi: { create: [{ mezzoId: mezzo.id }] },
        },
      })
    }
  }

  await prisma.impostazioni.update({ where: { id: "default" }, data: { progressivoNoleggio: 11 } })

  const manutenzioniData = [
    { mezzoCod: "MIN-003", tipo: "Tagliando completo", dataPrev: 5, stato: "programmata" },
    { mezzoCod: "PAL-001", tipo: "Revisione periodica", dataPrev: 12, stato: "programmata" },
    { mezzoCod: "DUM-001", tipo: "Manutenzione ordinaria", dataPrev: 3, stato: "programmata" },
    { mezzoCod: "COM-001", tipo: "Controllo periodico", dataPrev: -45, stato: "completata", dataEseg: -46, costo: 120, fornitore: "Officina Bianchi" },
    { mezzoCod: "CAR-001", tipo: "Tagliando", dataPrev: 15, stato: "programmata" },
    { mezzoCod: "MIN-001", tipo: "Manutenzione ordinaria", dataPrev: -60, stato: "completata", dataEseg: -61, costo: 350, fornitore: "Service Macchine SRL" },
    { mezzoCod: "PAL-003", tipo: "Riparazione idraulica", dataPrev: 1, costo: 250, stato: "in_corso_man", fornitore: "Officina Rossi" },
    { mezzoCod: "GRU-001", tipo: "Controllo periodico", dataPrev: 20, stato: "programmata" },
  ]

  for (const m of manutenzioniData) {
    const mezzo = await getMezzoByCod(m.mezzoCod)
    if (mezzo) {
      await prisma.manutenzione.create({
        data: {
          mezzoId: mezzo.id,
          tipo: m.tipo,
          dataPrevista: m.dataPrev >= 0 ? giorniAvanti(m.dataPrev) : giorniFa(Math.abs(m.dataPrev)),
          dataEseguita: m.dataEseg ? (m.dataEseg >= 0 ? giorniAvanti(m.dataEseg) : giorniFa(Math.abs(m.dataEseg))) : null,
          costo: m.costo || null,
          fornitore: m.fornitore || null,
          stato: m.stato,
        },
      })
    }
  }

  console.log("\u2705 Seed completato!")
  console.log("\ud83d\udc64 Utente: admin@gestione-mezzi.it / gestionaleauto@2026")
  await prisma.$disconnect()
}

main().catch(console.error)
