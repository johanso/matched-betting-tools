"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { HelpPanel, type HelpSection } from "@/components/help-panel"

const DUTCHING_SECTIONS: HelpSection[] = [
  {
    heading: "¿Qué es el dutching?",
    content: "Distribuye tu apuesta entre varias selecciones de forma que el retorno sea idéntico independientemente de cuál gane.",
  },
  {
    heading: "Cómo funciona",
    content: "La fórmula calcula la apuesta proporcional para cada selección usando las cuotas inversas. Cuota más baja → apuesta mayor para igualar el retorno.",
    example: "€50 en tres selecciones a 2.0, 3.0, 4.0 → apuestas €24.24 · €16.16 · €12.12 → retorno fijo €48.48",
  },
  {
    heading: "Sobrerate",
    content: "La suma de las probabilidades implícitas (1 ÷ cuota) multiplicada por 100. Si es menor de 100% hay ventaja matemática. Por encima de 100%, el mercado tiene margen y tendrás pérdida garantizada.",
    example: "Sobrerate 98.5% → mercado favorable · Sobrerate 103% → pérdida garantizada",
  },
  {
    heading: "Cuándo usar dutching",
    content: "Útil cuando tienes una promoción de 'apuesta gratis si ganas con X selecciones' o cuando quieres cubrir varias opciones en una carrera o partido con cuotas similares.",
  },
]

interface Selection {
  id: number
  name: string
  odds: string
}

let nextId = 3

export default function DutchingPage() {
  const [totalStake, setTotalStake] = useState("")
  const [selections, setSelections] = useState<Selection[]>([
    { id: 1, name: "", odds: "" },
    { id: 2, name: "", odds: "" },
  ])

  function addSelection() {
    if (selections.length >= 6) return
    setSelections((prev) => [...prev, { id: nextId++, name: "", odds: "" }])
  }

  function removeSelection(id: number) {
    if (selections.length <= 2) return
    setSelections((prev) => prev.filter((s) => s.id !== id))
  }

  function update(id: number, field: "name" | "odds", value: string) {
    setSelections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const result = useMemo(() => {
    const stake = parseFloat(totalStake)
    if (!stake || stake <= 0) return null
    const valid = selections.filter((s) => parseFloat(s.odds) > 1)
    if (valid.length < 2) return null
    const oddsList = valid.map((s) => parseFloat(s.odds))
    const inverseSum = oddsList.reduce((sum, o) => sum + 1 / o, 0)
    const c = stake / inverseSum
    const items = valid.map((s, i) => ({
      name: s.name || `Selección ${i + 1}`,
      odds: oddsList[i],
      stake: c / oddsList[i],
      return: c,
    }))
    return { items, overround: inverseSum * 100, profit: c - stake, returnValue: c }
  }, [totalStake, selections])

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-3">Herramienta</p>
        <div className="flex items-start gap-3">
          <h1
            className="font-display text-3xl font-medium text-stone-900 tracking-tight md:text-4xl"
            style={{ fontStyle: "italic" }}
          >
            Dutching
          </h1>
          <HelpPanel title="Dutching" sections={DUTCHING_SECTIONS} />
        </div>
        <p className="text-base text-stone-500 mt-2">Distribuye tu apuesta para ganar lo mismo con cualquier resultado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Stake */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-3">
              Apuesta total
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-stone-400 font-mono">€</span>
              <input
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(e.target.value)}
                placeholder="50.00"
                min="0"
                step="0.01"
                className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-4 text-2xl font-mono font-bold text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Selections */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Selecciones</h2>
              <span className="text-sm font-mono text-stone-300">{selections.length} / 6</span>
            </div>

            <div className="space-y-3">
              {selections.map((sel, i) => (
                <div key={sel.id} className="flex items-center gap-2">
                  <span className="text-sm font-mono text-stone-300 w-5 shrink-0 text-center">{i + 1}</span>
                  <input
                    type="text"
                    value={sel.name}
                    onChange={(e) => update(sel.id, "name", e.target.value)}
                    placeholder={`Selección ${i + 1}`}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400 focus:bg-white transition-all min-w-0"
                  />
                  <input
                    type="number"
                    value={sel.odds}
                    onChange={(e) => update(sel.id, "odds", e.target.value)}
                    placeholder="2.50"
                    min="1.01"
                    step="0.01"
                    className="w-24 shrink-0 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-mono text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400 focus:bg-white transition-all text-center"
                  />
                  <button
                    onClick={() => removeSelection(sel.id)}
                    disabled={selections.length <= 2}
                    className="shrink-0 p-2 text-stone-300 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-red-50"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addSelection}
              disabled={selections.length >= 6}
              className={cn(
                "mt-4 w-full py-3 rounded-xl text-sm font-medium border-2 border-dashed transition-all",
                selections.length >= 6
                  ? "border-stone-100 text-stone-300 cursor-not-allowed"
                  : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700 hover:bg-stone-50"
              )}
            >
              + Añadir selección
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-5">Distribución</h2>

          {result ? (
            <div className="space-y-5">
              {/* Per-selection table */}
              <div className="rounded-xl border border-stone-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Selección</th>
                      <th className="text-right text-xs font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Cuota</th>
                      <th className="text-right text-xs font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Apuesta</th>
                      <th className="text-right text-xs font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Retorno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item, i) => (
                      <tr key={i} className="border-b border-stone-50 last:border-0">
                        <td className="px-4 py-3.5 text-sm font-medium text-stone-800 max-w-[120px] truncate">{item.name}</td>
                        <td className="px-4 py-3.5 text-right text-base font-mono text-stone-600">{item.odds.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-right text-base font-mono font-bold text-stone-900">€{item.stake.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-right text-base font-mono text-stone-600">€{item.return.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Sobrerate</p>
                  <p className={cn(
                    "text-2xl font-mono font-bold",
                    result.overround <= 100 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {result.overround.toFixed(1)}%
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    {result.overround <= 100 ? "Favorable" : "Desfavorable"}
                  </p>
                </div>
                <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Retorno fijo</p>
                  <p className="text-2xl font-mono font-bold text-stone-900">€{result.returnValue.toFixed(2)}</p>
                  <p className="text-xs text-stone-400 mt-1">por selección</p>
                </div>
              </div>

              {/* Net profit */}
              <div className={cn(
                "rounded-xl p-5 flex items-center justify-between border",
                result.profit >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
              )}>
                <div>
                  <p className={cn("text-sm font-semibold", result.profit >= 0 ? "text-emerald-700" : "text-red-700")}>
                    Beneficio neto
                  </p>
                  <p className={cn("text-xs mt-1", result.profit >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {result.overround <= 100 ? "Mercado favorable para dutching" : "Sobrerate > 100% — mercado desfavorable"}
                  </p>
                </div>
                <span className={cn(
                  "text-3xl font-mono font-bold",
                  result.profit >= 0 ? "text-emerald-700" : "text-red-600"
                )}>
                  {result.profit >= 0 ? "+" : "−"}€{Math.abs(result.profit).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-2">
                <svg className="size-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-base text-stone-500">Introduce la apuesta total y al menos 2 selecciones</p>
              <p className="text-sm text-stone-400">Las cuotas deben ser mayores que 1.00</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
