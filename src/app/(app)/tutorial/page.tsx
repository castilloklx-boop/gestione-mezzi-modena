import type { Metadata } from "next"
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Calendar,
  Wrench,
  FileSpreadsheet,
  Settings,
  BookOpen,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Tutorial - Gestione Mezzi Modena",
}

const sezioni = [
  {
    icon: LayoutDashboard,
    titolo: "Dashboard",
    colore: "text-blue-600 bg-blue-50",
    passi: ["Panoramica KPI in tempo reale", "Grafico noleggi per mese", "Attivita recenti e scadenze"],
  },
  {
    icon: Users,
    titolo: "Clienti",
    colore: "text-indigo-600 bg-indigo-50",
    passi: ["Cerca per nome o email", "Filtra per tipo (privato/azienda)", "Crea nuovi clienti anche da preventivo/noleggio"],
  },
  {
    icon: Truck,
    titolo: "Mezzi",
    colore: "text-amber-600 bg-amber-50",
    passi: ["Filtra per categoria", "Visualizza stato e ubicazione", "Imposta tariffe per calcolo automatico"],
  },
  {
    icon: FileText,
    titolo: "Preventivi",
    colore: "text-blue-600 bg-blue-50",
    passi: ["Aggiungi righe con mezzi o descrizione libera", "Calcolo automatico di IVA e sconto", "Duplica preventivi simili", "Converti in noleggio"],
  },
  {
    icon: FileSpreadsheet,
    titolo: "Noleggi",
    colore: "text-green-600 bg-green-50",
    passi: ["Seleziona date e mezzi disponibili", "Importo calcolato automaticamente", "Completa il noleggio per liberare i mezzi"],
  },
  {
    icon: Calendar,
    titolo: "Calendario",
    colore: "text-purple-600 bg-purple-50",
    passi: ["Vista mensile di noleggi e manutenzioni", "Noleggi in azzurro, manutenzioni in arancione"],
  },
  {
    icon: Wrench,
    titolo: "Manutenzioni",
    colore: "text-orange-600 bg-orange-50",
    passi: ["Pianifica interventi per mezzo", "Registra costi e fornitori", "Traccia lo stato"],
  },
  {
    icon: FileSpreadsheet,
    titolo: "Importazione CSV",
    colore: "text-teal-600 bg-teal-50",
    passi: ["Scarica template di esempio", "Carica il CSV con i tuoi dati", "Mappa le colonne automaticamente"],
  },
  {
    icon: Settings,
    titolo: "Impostazioni",
    colore: "text-gray-600 bg-gray-50",
    passi: ["Configura dati aziendali", "Imposta aliquota IVA predefinita", "Scrivi condizioni di noleggio"],
  },
]

const shortcuts = [
  { d: "Aggiungere cliente in un form", r: "Clicca l'icona + accanto al selettore cliente per creare un nuovo cliente senza uscire dal form." },
  { d: "Calcolo importo noleggio", r: "Seleziona le date e i mezzi. L'importo si calcola da solo: tariffa giornaliera x numero giorni. Puoi sempre forzare un importo manuale." },
  { d: "Stampare un documento", r: "Da qualsiasi pagina di dettaglio (preventivo o noleggio), clicca 'Stampa' per l'anteprima con intestazione aziendale." },
  { d: "Chiudere un noleggio", r: "Dal dettaglio noleggio clicca 'Completa', inserisci la data effettiva. I mezzi tornano disponibili." },
  { d: "Modificare un preventivo", r: "Dal dettaglio preventivo clicca 'Modifica'. Puoi cambiare cliente, righe, importi e salvare." },
  { d: "Duplicare un preventivo", r: "Dal dettaglio o dalla lista preventivi, clicca 'Duplica'. Crea una copia in bozza con gli stessi dati." },
]

export default function TutorialPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </span>
          Tutorial
        </h2>
        <p className="text-sm text-secondary mt-1">Guida rapida all&apos;uso del sistema di gestione noleggio mezzi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sezioni.map((s) => (
          <div key={s.titolo} className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${s.colore}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{s.titolo}</h3>
            </div>
            <ul className="space-y-1.5">
              {s.passi.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-secondary">
                  <span className="h-4 w-4 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-primary mt-px shrink-0">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Scorciatoie e consigli</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortcuts.map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-accent/30 border border-border/50">
              <p className="text-sm font-medium text-foreground mb-1">{item.d}</p>
              <p className="text-xs text-secondary">{item.r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
