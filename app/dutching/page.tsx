"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

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

  function updateSelection(id: number, field: "name" | "odds", value: string) {
    setSelections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const result = useMemo(() => {
    const stake = parseFloat(totalStake)
    if (!stake || stake <= 0) return null

    const valid = selections.filter((s) => {
      const o = parseFloat(s.odds)
      return o > 1
    })

    if (valid.length < 2) return null

    const oddsList = valid.map((s) => parseFloat(s.odds))
    const inverseSum = oddsList.reduce((sum, o) => sum + 1 / o, 0)
    const overround = inverseSum * 100
    const c = stake / inverseSum

    const items = valid.map((s, i) => ({
      name: s.name || `Selección ${i + 1}`,
      odds: oddsList[i],
      stake: c / oddsList[i],
      return: c,
    }))

    const profit = c - stake

    return { items, overround, profit, breakEven: inverseSum < 1 }
  }, [totalStake, selections])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dutching</h1>
        <p className="text-zinc-400 text-sm mt-1">Distribuye tu apuesta para ganar lo mismo con cualquier resultado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Total stake */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <label className="text-xs font-medium text-zinc-400 block mb-1.5">Apuesta total (€)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">€</span>
              <input
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(e.target.value)}
                placeholder="50.00"
                min="0"
                step="0.01"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-3 py-2 text-sm font-mono text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>

          {/* Selections */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Selecciones</h2>
              <span className="text-[10px] text-zinc-600">{selections.length} / 6</span>
            </div>

            {selections.map((sel, i) => (
              <div key={sel.id} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sel.name}
                      onChange={(e) => updateSelection(sel.id, "name", e.target.value)}
                      placeholder={`Selección ${i + 1}`}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors min-w-0"
                    />
                    <div className="relative w-24 shrink-0">
                      <input
                        type="number"
                        value={sel.odds}
                        onChange={(e) => updateSelection(sel.id, "odds", e.target.value)}
                        placeholder="2.50"
                        min="1.01"
                        step="0.01"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeSelection(sel.id)}
                  disabled={selections.length <= 2}
                  className="mt-0.5 p-2 text-zinc-600 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
                  title="Eliminar"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              onClick={addSelection}
              disabled={selections.length >= 6}
              className={cn(
                "w-full py-2 rounded-md text-xs font-medium border transition-colors",
                selections.length >= 6
                  ? "border-zinc-800 text-zinc-700 cursor-not-allowed"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              )}
            >
              + Añadir selección
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Resultados</h2>

          {result ? (
            <div className="space-y-4">
              {/* Per-selection table */}
              <div className="rounded-md border border-zinc-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left text-[11px] text-zinc-500 font-medium px-3 py-2">Selección</th>
                      <th className="text-right text-[11px] text-zinc-500 font-medium px-3 py-2">Cuota</th>
                      <th className="text-right text-[11px] text-zinc-500 font-medium px-3 py-2">Apuesta</th>
                      <th className="text-right text-[11px] text-zinc-500 font-medium px-3 py-2">Retorno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-3 py-2.5 text-white font-medium truncate max-w-[100px]">{item.name}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-zinc-300">{item.odds.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-white">€{item.stake.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-zinc-300">€{item.return.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Sobrerate total</span>
                  <span className={cn("font-mono font-semibold", result.overround > 100 ? "text-red-400" : "text-emerald-400")}>
                    {result.overround.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Retorno por selección</span>
                  <span className="font-mono text-white">€{(result.items[0]?.return ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-700">
                  <span className="text-zinc-300 font-medium text-xs">Beneficio neto</span>
                  <span
                    className={cn(
                      "font-mono font-semibold text-sm",
                      result.profit >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {result.profit >= 0 ? "+" : ""}€{result.profit.toFixed(2)}
                  </span>
                </div>
              </div>

              {result.overround > 100 && (
                <div className="rounded-md bg-red-950/30 border border-red-900/40 p-3">
                  <p className="text-xs text-red-400">
                    El sobrerate supera el 100% — el mercado no es favorable para dutching.
                    Busca mercados con sobrerate por debajo del 100%.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="text-zinc-600 text-xs mb-1">Introduce la apuesta total y al menos 2 selecciones</div>
              <div className="text-zinc-700 text-[10px]">Las cuotas deben ser mayores que 1.00</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
