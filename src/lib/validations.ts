import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Inserisci un email valida"),
  password: z.string().min(1, "Inserisci la password"),
})

export const clienteSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  tipo: z.string().default("privato"),
  partitaIva: z.string().optional().or(z.literal("")),
  codiceFiscale: z.string().optional().or(z.literal("")),
  referente: z.string().optional().or(z.literal("")),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  indirizzo: z.string().optional().or(z.literal("")),
  citta: z.string().optional().or(z.literal("")),
  cap: z.string().optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
  attivo: z.boolean().default(true),
})

export const mezzoSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  codiceInterno: z.string().min(1, "Il codice interno è obbligatorio"),
  categoriaId: z.string().min(1, "La categoria è obbligatoria"),
  marca: z.string().optional().or(z.literal("")),
  modello: z.string().optional().or(z.literal("")),
  matricola: z.string().optional().or(z.literal("")),
  descrizione: z.string().optional().or(z.literal("")),
  tariffaGiornaliera: z.coerce.number().min(0, "La tariffa deve essere >= 0"),
  tariffaSettimanale: z.coerce.number().min(0).optional().or(z.literal("")).transform(v => v === "" ? null : v),
  depositoCauzionale: z.coerce.number().min(0).default(0),
  ubicazione: z.string().optional().or(z.literal("")),
  stato: z.string().default("disponibile"),
  dataUltimaManutenzione: z.string().optional().or(z.literal("")),
  dataProssimaManutenzione: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
})

export const preventivoSchema = z.object({
  clienteId: z.string().min(1, "Il cliente è obbligatorio"),
  validita: z.coerce.number().min(1, "La validità deve essere >= 1"),
  sconto: z.coerce.number().min(0).default(0),
  iva: z.coerce.number().min(0).default(22),
  deposito: z.coerce.number().min(0).default(0),
  note: z.string().optional().or(z.literal("")),
  stato: z.string().default("bozza"),
  righe: z.array(z.object({
    mezzoId: z.string().optional().or(z.literal("")),
    descrizione: z.string().optional().or(z.literal("")),
    quantita: z.coerce.number().min(1).default(1),
    prezzo: z.coerce.number().min(0).default(0),
    dal: z.string().optional().or(z.literal("")),
    al: z.string().optional().or(z.literal("")),
  })).min(1, "Aggiungi almeno un mezzo"),
})

export const noleggioSchema = z.object({
  clienteId: z.string().min(1, "Il cliente è obbligatorio"),
  preventivoId: z.string().optional().or(z.literal("")),
  dataInizio: z.string().min(1, "La data di inizio è obbligatoria"),
  dataRestituzionePrev: z.string().min(1, "La data di restituzione è obbligatoria"),
  luogoConsegna: z.string().optional().or(z.literal("")),
  modalitaConsegna: z.string().optional().or(z.literal("")),
  referente: z.string().optional().or(z.literal("")),
  importo: z.coerce.number().min(0).default(0),
  deposito: z.coerce.number().min(0).default(0),
  stato: z.string().default("programmato"),
  statoPagamento: z.string().default("da_pagare"),
  noteConsegna: z.string().optional().or(z.literal("")),
  noteRestituzione: z.string().optional().or(z.literal("")),
  mezzoIds: z.array(z.string()).min(1, "Seleziona almeno un mezzo"),
})

export const manutenzioneSchema = z.object({
  mezzoId: z.string().min(1, "Il mezzo è obbligatorio"),
  tipo: z.string().min(1, "Il tipo di intervento è obbligatorio"),
  dataPrevista: z.string().min(1, "La data prevista è obbligatoria"),
  dataEseguita: z.string().optional().or(z.literal("")),
  costo: z.coerce.number().min(0).optional().or(z.literal("")).transform(v => v === "" ? null : v),
  fornitore: z.string().optional().or(z.literal("")),
  descrizione: z.string().optional().or(z.literal("")),
  stato: z.string().default("programmata"),
  note: z.string().optional().or(z.literal("")),
})

export type ClienteFormData = z.output<typeof clienteSchema>
export type MezzoFormData = z.output<typeof mezzoSchema>
export type PreventivoFormData = z.output<typeof preventivoSchema>
export type NoleggioFormData = z.output<typeof noleggioSchema>
export type ManutenzioneFormData = z.output<typeof manutenzioneSchema>
