"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, AlertTriangle, CheckCircle, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CsvRow = Record<string, string>

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      current += ch
    } else if (ch === "\n" && !inQuotes) {
      lines.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  if (current.trim()) lines.push(current)

  if (lines.length === 0) return { headers: [], rows: [] }

  function splitRow(row: string): string[] {
    const result: string[] = []
    let col = ""
    let inQ = false
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]
      if (ch === '"') {
        inQ = !inQ
      } else if (ch === "," && !inQ) {
        result.push(col.replace(/^"|"$/g, "").trim())
        col = ""
      } else {
        col += ch
      }
    }
    result.push(col.replace(/^"|"$/g, "").trim())
    return result
  }

  const headers = splitRow(lines[0])
  const rows = lines.slice(1).map(line => {
    const values = splitRow(line)
    const row: CsvRow = {}
    headers.forEach((h, i) => { row[h] = values[i] || "" })
    return row
  })
  return { headers, rows }
}

export default function ImportazionePage() {
  const [tipo, setTipo] = useState<"clienti" | "mezzi">("clienti")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CsvRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const expectedColumns = tipo === "clienti"
    ? ["nome", "tipo", "email", "telefono", "citta", "partitaIva", "codiceFiscale", "referente"]
    : ["nome", "codiceInterno", "categoria", "marca", "modello", "matricola", "tariffaGiornaliera", "stato"]

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const { headers, rows } = parseCsv(text)
      if (headers.length === 0) {
        toast.error("Il file CSV deve contenere almeno una colonna")
        return
      }
      setColumns(headers)
      setPreview(rows.slice(0, 6))

      const autoMapping: Record<string, string> = {}
      headers.forEach(h => {
        const key = h.toLowerCase().replace(/[\s_]/g, "")
        const match = expectedColumns.find(ec => ec.toLowerCase().replace(/[\s_]/g, "") === key)
        if (match) autoMapping[h] = match
        else autoMapping[h] = ""
      })
      setMapping(autoMapping)
    }
    reader.readAsText(f)
  }

  function downloadSample() {
    const header = tipo === "clienti"
      ? "nome,tipo,email,telefono,citta,partitaIva,codiceFiscale,referente"
      : "nome,codiceInterno,categoria,marca,modello,matricola,tariffaGiornaliera,stato"

    const sample = tipo === "clienti"
      ? `${header}\n"Rossi SRL","azienda","info@rossi.it","+39 059 123456","Modena","01234560321","","Mario Rossi"`
      : `${header}\n"MINI-ESC-01","ESC-001","Mini escavatori","Bobcat","E35","AB123CD",120,"disponibile"`

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `esempio_${tipo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setResult(null)

    const text = await file.text()
    const { rows: data } = parseCsv(text)

    try {
      const body = {
        tipo,
        mapping,
        dati: data,
      }

      const response = await fetch("/api/csv/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const res = await response.json()
      setResult(res)
      if (res.success > 0) toast.success(`Importati ${res.success} elementi`)
      if (res.errors.length > 0) toast.error(`${res.errors.length} errori`)
    } catch {
      toast.error("Errore durante l'importazione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-teal-100 flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4 text-teal-600" />
            </span>
            Importazione CSV
          </h2>
          <p className="text-sm text-secondary mt-1">Importa clienti o mezzi da file CSV</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadSample}>
          <Download className="h-4 w-4 mr-2" />
          Scarica esempio CSV
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipo di importazione</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={tipo} onValueChange={(v) => { if (v !== null) { setTipo(v as "clienti" | "mezzi"); setFile(null); setPreview([]); setResult(null) } }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clienti">Clienti</SelectItem>
                <SelectItem value="mezzi">Mezzi e attrezzature</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carica file</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">
                {file ? file.name : "Clicca per caricare un file CSV"}
              </p>
              {file && (
                <p className="text-xs text-secondary mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </CardContent>
        </Card>

        {columns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Associazione colonne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {columns.map((col) => (
                  <div key={col} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-40 truncate">{col}</span>
                    <span className="text-secondary">&rarr;</span>
                    <Select
                      value={mapping[col] || ""}
                      onValueChange={(v) => v !== null && setMapping({ ...mapping, [col]: v })}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Non importare" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Non importare</SelectItem>
                        {expectedColumns.map((ec) => (
                          <SelectItem key={ec} value={ec}>{ec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {preview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Anteprima ({preview.length} righe)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {columns.map((col) => (
                        <th key={col} className="text-left py-2 px-3 text-secondary font-medium text-xs uppercase">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        {columns.map((col) => (
                          <td key={col} className="py-2 px-3">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {preview.length > 0 && (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => { setFile(null); setPreview([]); setResult(null) }}>
              Annulla
            </Button>
            <Button onClick={handleImport} disabled={loading}>
              <Upload className="h-4 w-4 mr-2" />
              {loading ? "Importazione..." : `Importa ${preview.length} righe`}
            </Button>
          </div>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risultato importazione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">{result.success} elementi importati</span>
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-1 mt-3">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                  {result.errors.length > 10 && (
                    <p className="text-sm text-secondary">...e altri {result.errors.length - 10} errori</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
