"use client"

import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Truck, CheckCircle, FileText, Calendar, Wrench, BookOpen } from "lucide-react"
import Link from "next/link"

const demoAccounts = [
  { email: "admin@gestione-mezzi.it", password: "gestionaleauto@2026", role: "Amministratore" },
]

const features = [
  { icon: FileText, label: "Gestione clienti e mezzi" },
  { icon: Calendar, label: "Preventivi e noleggi" },
  { icon: Wrench, label: "Manutenzione e calendario" },
  { icon: CheckCircle, label: "Import/export CSV" },
]

const guide = [
  { titolo: "Dashboard", descrizione: "Panoramica completa con KPI, grafici e attività recenti." },
  { titolo: "Clienti", descrizione: "Anagrafica clienti con ricerca, filtri e storico noleggi." },
  { titolo: "Mezzi", descrizione: "Catalogo mezzi con stato, ubicazione e tariffe." },
  { titolo: "Preventivi", descrizione: "Crea preventivi con righe, calcolo automatico IVA e sconto." },
  { titolo: "Noleggi", descrizione: "Gestisci date, mezzi e pagamento noleggi." },
  { titolo: "Calendario", descrizione: "Vista mensile di noleggi e manutenzioni." },
  { titolo: "Manutenzione", descrizione: "Pianifica e registra interventi con costi e fornitori." },
  { titolo: "Importazione CSV", descrizione: "Importa clienti o mezzi da file CSV." },
  { titolo: "Impostazioni", descrizione: "Configura dati aziendali, IVA e condizioni." },
]

export default function LoginPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) router.push("/")
  }, [session, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email o password non validi")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  function fillDemo(acc: { email: string; password: string }) {
    setEmail(acc.email)
    setPassword(acc.password)
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.03)_0%,transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">GMM</h1>
              <p className="text-xs text-secondary">Gestione Mezzi Modena</p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              Gestisci la tua flotta in modo semplice e professionale
            </h2>
            <p className="text-base text-secondary leading-relaxed mb-10">
              Il sistema di gestione completo per il noleggio di mezzi e
              attrezzature. Tieni traccia di clienti, preventivi, noleggi e
              manutenzione in un unico posto.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-xl bg-white/70 border border-border/50 p-4 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative text-sm text-secondary">
          &copy; {new Date().getFullYear()} Gestione Mezzi Modena SRL &mdash; Tutti i diritti riservati
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">GMM</h1>
                <p className="text-xs text-secondary">Gestione Mezzi Modena</p>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Accedi</CardTitle>
              <CardDescription className="text-sm">
                Inserisci le tue credenziali per accedere al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@gestione-mezzi.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </form>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-secondary text-center mb-3">Account dimostrativo</p>
                <div className="space-y-2">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc)}
                      className="w-full flex items-center justify-between rounded-lg border border-border/60 bg-accent/30 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <span className="font-mono text-xs text-foreground">{acc.email}</span>
                      <span className="text-xs text-secondary">{acc.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Link
            href="/istruzioni"
            className="block text-center rounded-lg border border-border bg-white p-4 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground mb-1">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Guida al sistema
            </div>
            <p className="text-xs text-secondary">
              Scopri come usare tutte le funzionalità del sistema
            </p>
          </Link>

          <div className="space-y-2">
            <h3 className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider text-center">Funzionalità principali</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {guide.map((g) => (
                <div key={g.titolo} className="bg-white rounded-lg border border-border/50 p-3">
                  <p className="text-xs font-semibold text-foreground mb-0.5">{g.titolo}</p>
                  <p className="text-[11px] text-secondary leading-tight">{g.descrizione}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-secondary lg:hidden">
            &copy; {new Date().getFullYear()} Gestione Mezzi Modena SRL
          </p>
        </div>
      </div>
    </div>
  )
}
