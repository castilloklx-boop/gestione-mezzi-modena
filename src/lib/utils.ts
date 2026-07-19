import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export function getStatoBadgeClass(stato: string): string {
  const map: Record<string, string> = {
    disponibile: "bg-green-100 text-green-800 border-green-200",
    prenotato: "bg-blue-100 text-blue-800 border-blue-200",
    noleggiato: "bg-purple-100 text-purple-800 border-purple-200",
    in_manutenzione: "bg-orange-100 text-orange-800 border-orange-200",
    non_disponibile: "bg-gray-100 text-gray-800 border-gray-200",
    dismesso: "bg-red-100 text-red-800 border-red-200",
    bozza: "bg-gray-100 text-gray-800 border-gray-200",
    inviato: "bg-blue-100 text-blue-800 border-blue-200",
    accettato: "bg-green-100 text-green-800 border-green-200",
    rifiutato: "bg-red-100 text-red-800 border-red-200",
    scaduto: "bg-orange-100 text-orange-800 border-orange-200",
    convertito: "bg-purple-100 text-purple-800 border-purple-200",
    programmato: "bg-blue-100 text-blue-800 border-blue-200",
    in_corso: "bg-green-100 text-green-800 border-green-200",
    completato: "bg-gray-100 text-gray-800 border-gray-200",
    in_ritardo: "bg-red-100 text-red-800 border-red-200",
    annullato: "bg-red-100 text-red-800 border-red-200",
    da_pagare: "bg-orange-100 text-orange-800 border-orange-200",
    parzialmente_pagato: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pagato: "bg-green-100 text-green-800 border-green-200",
    programmata: "bg-blue-100 text-blue-800 border-blue-200",
    in_corso_man: "bg-orange-100 text-orange-800 border-orange-200",
    completata: "bg-green-100 text-green-800 border-green-200",
    annullata: "bg-red-100 text-red-800 border-red-200",
    attivo: "bg-green-100 text-green-800 border-green-200",
    non_attivo: "bg-gray-100 text-gray-800 border-gray-200",
    privato: "bg-blue-100 text-blue-800 border-blue-200",
    azienda: "bg-purple-100 text-purple-800 border-purple-200",
  }
  return map[stato] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function getStatoLabel(stato: string): string {
  const map: Record<string, string> = {
    disponibile: "Disponibile",
    prenotato: "Prenotato",
    noleggiato: "Noleggiato",
    in_manutenzione: "In manutenzione",
    non_disponibile: "Non disponibile",
    dismesso: "Dismesso",
    bozza: "Bozza",
    inviato: "Inviato",
    accettato: "Accettato",
    rifiutato: "Rifiutato",
    scaduto: "Scaduto",
    convertito: "Convertito",
    programmato: "Programmato",
    in_corso: "In corso",
    completato: "Completato",
    in_ritardo: "In ritardo",
    annullato: "Annullato",
    da_pagare: "Da pagare",
    parzialmente_pagato: "Parzialmente pagato",
    pagato: "Pagato",
    programmata: "Programmata",
    in_corso_man: "In corso",
    completata: "Completata",
    annullata: "Annullata",
    attivo: "Attivo",
    non_attivo: "Non attivo",
    privato: "Privato",
    azienda: "Azienda",
  }
  return map[stato] || stato
}
