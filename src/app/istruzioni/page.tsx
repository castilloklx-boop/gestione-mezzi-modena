import Link from "next/link"
import { Truck, FileText, Calendar, Wrench, Users, LayoutDashboard, FileSpreadsheet, Settings, ArrowRight, Info } from "lucide-react"

const sezioni = [
  {
    icon: LayoutDashboard,
    titolo: "Dashboard",
    colore: "text-blue-600 bg-blue-50",
    descrizione: "Panoramica completa con KPI, grafico noleggi per mese e attivita recenti. Visualizza mezzi noleggiati, noleggi in corso, fatturato mensile e scadenze imminenti.",
    passi: ["Vedi subito quante restituzioni sono in scadenza", "Monitora il fatturato mensile stimato", "Controlla le manutenzioni programmate"],
  },
  {
    icon: Users,
    titolo: "Clienti",
    colore: "text-indigo-600 bg-indigo-50",
    descrizione: "Anagrafica completa con ricerca, filtri e storico noleggi. Ogni cliente ha dati anagrafici, contatti e riferimenti fiscali.",
    passi: ["Usa la barra di ricerca per trovare clienti velocemente", "Clicca su un cliente per vedere lo storico noleggi", "I clienti si possono creare anche durante l'inserimento di un preventivo o noleggio"],
  },
  {
    icon: Truck,
    titolo: "Mezzi e Attrezzature",
    colore: "text-amber-600 bg-amber-50",
    descrizione: "Catalogo completo con stato, ubicazione e storico manutenzione. Ogni mezzo ha tariffa giornaliera, settimanale e deposito cauzionale.",
    passi: ["Filtra per categoria per trovare mezzi specifici", "Visualizza subito lo stato: disponibile, noleggiato, in manutenzione", "Imposta le tariffe per il calcolo automatico dell'importo noleggio"],
  },
  {
    icon: FileText,
    titolo: "Preventivi",
    colore: "text-blue-600 bg-blue-50",
    descrizione: "Crea preventivi con righe multiple, calcolo automatico di IVA, sconto e deposito. Puoi aggiungere mezzi con tariffa precompilata o descrizioni libere.",
    passi: ["Clicca 'Nuovo preventivo' e seleziona il cliente (o creane uno nuovo al volo)", "Aggiungi mezzi: la tariffa si compila automaticamente", "Modifica quantita, prezzi, date a piacere", "Il totale si aggiorna in tempo reale con sconto e IVA"],
  },
  {
    icon: FileSpreadsheet,
    titolo: "Noleggi",
    colore: "text-green-600 bg-green-50",
    descrizione: "Gestisci noleggi con date, mezzi selezionabili, calcolo automatico dell'importo in base ai giorni. Gestisci stato noleggio e stato pagamento.",
    passi: ["Seleziona cliente e date di inizio/fine", "Scegli i mezzi disponibili dalla lista", "L'importo si calcola automaticamente: tariffa x giorni", "Usa il pulsante 'Completa' per chiudere un noleggio e liberare i mezzi"],
  },
  {
    icon: Calendar,
    titolo: "Calendario",
    colore: "text-purple-600 bg-purple-50",
    descrizione: "Vista mensile con tutti i noleggi e le manutenzioni. Naviga tra i mesi per vedere la pianificazione completa.",
    passi: ["Visualizza noleggi in azzurro e manutenzioni in arancione", "Naviga avanti e indietro tra i mesi", "Vedi subito eventuali conflitti di date e mezzi"],
  },
  {
    icon: Wrench,
    titolo: "Manutenzioni",
    colore: "text-orange-600 bg-orange-50",
    descrizione: "Pianifica e registra interventi di manutenzione ordinaria, tagliandi, riparazioni. Traccia costi e fornitori.",
    passi: ["Associa ogni intervento a un mezzo specifico", "Imposta la data prevista per il promemoria", "Registra il costo e il fornitore a intervento completato"],
  },
  {
    icon: FileSpreadsheet,
    titolo: "Importazione CSV",
    colore: "text-teal-600 bg-teal-50",
    descrizione: "Importa clienti o mezzi da file CSV con mappatura automatica delle colonne.",
    passi: ["Scarica il template di esempio", "Compila il CSV con i tuoi dati", "Carica il file e mappa le colonne"],
  },
  {
    icon: Settings,
    titolo: "Impostazioni",
    colore: "text-gray-600 bg-gray-50",
    descrizione: "Configura ragione sociale, partita IVA, aliquota IVA predefinita e condizioni di noleggio per i documenti stampati.",
    passi: ["Inserisci i dati della tua azienda", "Imposta l'aliquota IVA predefinita", "Scrivi le condizioni generali di noleggio"],
  },
]

const faq = [
  { d: "Come aggiungo un cliente durante la creazione di un preventivo?", r: "Clicca sull'icona con il + accanto al selettore cliente. Si apre una finestra dove inserire nome, tipo, telefono ed email. Il cliente viene creato e selezionato automaticamente." },
  { d: "Come si calcola l'importo del noleggio?", r: "L'importo viene calcolato automaticamente: tariffa giornaliera del mezzo x numero di giorni. Puoi sempre modificarlo manualmente o usare il pulsante di ricalcolo." },
  { d: "Posso stampare un preventivo?", r: "Sì, dalla pagina di dettaglio del preventivo clicca 'Stampa'. Si apre l'anteprima di stampa con intestazione aziendale e riepilogo importi." },
  { d: "Come chiudo un noleggio?", r: "Dal dettaglio del noleggio, clicca 'Completa', inserisci la data di restituzione effettiva e conferma. I mezzi tornano automaticamente disponibili." },
  { d: "Posso modificare un preventivo già creato?", r: "Sì, dal dettaglio del preventivo clicca 'Modifica'. Puoi cambiare cliente, righe, sconto, IVA e salvare le modifiche." },
]

export default function IstruzioniPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">GMM</h1>
              <p className="text-xs text-secondary">Gestione Mezzi Modena</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Accedi al sistema
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Info className="h-4 w-4" />
            Guida al sistema
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">
            Come usare Gestione Mezzi Modena
          </h2>
          <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Scopri come gestire la tua flotta di mezzi e attrezzature in modo semplice e professionale.
            Ogni sezione del sistema e spiegata qui sotto con istruzioni passo-passo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {sezioni.map((s) => (
            <div key={s.titolo} className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.colore}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{s.titolo}</h3>
              </div>
              <p className="text-sm text-secondary leading-relaxed mb-4">{s.descrizione}</p>
              <ul className="space-y-2">
                {s.passi.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                    <span className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-primary mt-0.5 shrink-0">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Domande frequenti</h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-border p-5 group">
                <summary className="text-sm font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                  {item.d}
                  <span className="text-secondary group-open:rotate-180 transition-transform">&#9660;</span>
                </summary>
                <p className="text-sm text-secondary mt-3 leading-relaxed">{item.r}</p>
              </details>
            ))}
          </div>
        </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Pronto per iniziare?</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Accedi con le credenziali demo per esplorare il sistema con dati di esempio già pronti.
          </p>
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-5 py-3 text-sm">
            <span className="text-blue-100">Email:</span>
            <code className="text-white font-mono font-bold">admin@gestione-mezzi.it</code>
            <span className="text-blue-100 ml-3">Password:</span>
            <code className="text-white font-mono font-bold">gestionaleauto@2026</code>
          </div>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50 transition-colors"
            >
              Vai al login
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 bg-white rounded-xl border border-border p-4 sm:p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Deploy su Vercel</h2>
          <p className="text-sm text-secondary mb-6 leading-relaxed">
            Il progetto supporta sia SQLite (sviluppo locale) che PostgreSQL (Vercel/produzione). Il file <code className="text-xs bg-slate-100 px-1 rounded">src/lib/prisma.ts</code> rileva automaticamente il tipo di database dalla URL.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">1. Crea database PostgreSQL</p>
              <p className="text-xs text-green-700">
                Usa <strong>Neon</strong> (gratuito, consigliato), <strong>Supabase</strong> o <strong>Railway</strong>. Ottieni la connection string PostgreSQL.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">2. Esegui db push + seed</p>
              <p className="text-xs text-green-700">
                <code className="text-xs bg-slate-100 px-1 rounded">{`DATABASE_URL="postgresql://..." npx prisma db push`}</code><br />
                Poi: <code className="text-xs bg-slate-100 px-1 rounded">{`DATABASE_URL="postgresql://..." npm run seed`}</code>
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">3. Vai su Vercel.com</p>
              <p className="text-xs text-green-700">
                Importa il repository GitHub. Vercel rileva automaticamente Next.js.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">4. Imposta variabili d&apos;ambiente</p>
              <p className="text-xs text-green-700">
                Su Vercel: Settings &rarr; Environment Variables. Aggiungi:<br />
                <code className="text-xs bg-slate-100 px-1 rounded">DATABASE_URL</code> = stringa PostgreSQL<br />
                <code className="text-xs bg-slate-100 px-1 rounded">AUTH_SECRET</code> = genera con <code className="text-xs bg-slate-100 px-1 rounded">openssl rand -base64 32</code>
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 md:col-span-2">
              <p className="text-sm font-semibold text-green-800 mb-2">5. Deploy!</p>
              <p className="text-xs text-green-700">
                Pusha su GitHub e Vercel fa il deploy automatico. Il progetto ha già <code className="text-xs bg-slate-100 px-1 rounded">vercel.json</code> con il comando di build corretto. Il codice rileva automaticamente PostgreSQL vs SQLite in base a DATABASE_URL.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-secondary">
        &copy; {new Date().getFullYear()} Gestione Mezzi Modena SRL &mdash; Tutti i diritti riservati
      </footer>
    </div>
  )
}
