"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

function decimalToFractional(decimal: number): string {
  if (decimal <= 1) return "—"
  const num = decimal - 1
  const gcd = (a: number, b: number): number => (b < 0.001 ? a : gcd(b, a % b))
  const multiplier = Math.round(num * 100)
  const g = gcd(multiplier, 100)
  return `${Math.round(multiplier / g)}/${Math.round(100 / g)}`
}

function decimalToAmerican(decimal: number): string {
  if (decimal <= 1) return "—"
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`
  return `${Math.round(-100 / (decimal - 1))}`
}

function fractionalToDecimal(frac: string): number | null {
  const parts = frac.replace(/\s/g, "").split("/")
  if (parts.length !== 2) return null
  const num = parseFloat(parts[0])
  const den = parseFloat(parts[1])
  if (!num || !den || den === 0) return null
  return num / den + 1
}

function americanToDecimal(american: number): number | null {
  if (american === 0) return null
  if (american > 0) return american / 100 + 1
  return 100 / Math.abs(american) + 1
}

function impliedProbability(decimal: number): string {
  if (decimal <= 1) return "—"
  return ((1 / decimal) * 100).toFixed(1) + "%"
}

interface OddsState {
  decimal: string
  fractional: string
  american: string
}

type Source = "decimal" | "fractional" | "american"

function computeFromDecimal(d: number): OddsState {
  return {
    decimal: d.toFixed(3),
    fractional: decimalToFractional(d),
    american: decimalToAmerican(d),
  }
}

const PRESETS = [
  { label: "Evens", decimal: 2.0 },
  { label: "1/2", decimal: 1.5 },
  { label: "2/1", decimal: 3.0 },
  { label: "4/1", decimal: 5.0 },
  { label: "5/2", decimal: 3.5 },
  { label: "10/1", decimal: 11.0 },
]

export default function ConversorPage() {
  const [odds, setOdds] = useState<OddsState>({ decimal: "", fractional: "", american: "" })
  const [lastSource, setLastSource] = useState<Source | null>(null)

  function handleDecimalChange(value: string) {
    setLastSource("decimal")
    const d = parseFloat(value)
    if (!value) {
      setOdds({ decimal: "", fractional: "", american: "" })
      return
    }
    if (isNaN(d) || d <= 1) {
      setOdds({ decimal: value, fractional: "—", american: "—" })
      return
    }
    setOdds(computeFromDecimal(d))
  }

  function handleFractionalChange(value: string) {
    setLastSource("fractional")
    if (!value) {
      setOdds({ decimal: "", fractional: "", american: "" })
      return
    }
    const d = fractionalToDecimal(value)
    if (d === null || d <= 1) {
      setOdds({ decimal: "—", fractional: value, american: "—" })
      return
    }
    setOdds({ ...computeFromDecimal(d), fractional: value })
  }

  function handleAmericanChange(value: string) {
    setLastSource("american")
    if (!value) {
      setOdds({ decimal: "", fractional: "", american: "" })
      return
    }
    const a = parseFloat(value)
    if (isNaN(a) || a === 0) {
      setOdds({ decimal: "—", fractional: "—", american: value })
      return
    }
    const d = americanToDecimal(a)
    if (d === null || d <= 1) {
      setOdds({ decimal: "—", fractional: "—", american: value })
      return
    }
    setOdds({ ...computeFromDecimal(d), american: value })
  }

  function applyPreset(decimal: number) {
    setLastSource("decimal")
    setOdds(computeFromDecimal(decimal))
  }

  const decimalNum = parseFloat(odds.decimal)
  const implied = !isNaN(decimalNum) && decimalNum > 1 ? impliedProbability(decimalNum) : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Conversor de Cuotas</h1>
        <p className="text-zinc-400 text-sm mt-1">Convierte entre decimal, fraccionaria y americana en tiempo real</p>
      </div>

      {/* Main converter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Decimal */}
        <div className={cn(
          "rounded-lg border p-5 transition-colors",
          lastSource === "decimal" ? "border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-zinc-900/40"
        )}>
          <div className="mb-3">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-0.5">Decimal</label>
            <p className="text-[10px] text-zinc-600">Formato europeo estándar</p>
          </div>
          <input
            type="number"
            value={odds.decimal}
            onChange={(e) => handleDecimalChange(e.target.value)}
            placeholder="2.000"
            min="1.01"
            step="0.001"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-3 text-xl font-mono font-semibold text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors text-center"
          />
        </div>

        {/* Fractional */}
        <div className={cn(
          "rounded-lg border p-5 transition-colors",
          lastSource === "fractional" ? "border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-zinc-900/40"
        )}>
          <div className="mb-3">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-0.5">Fraccionaria</label>
            <p className="text-[10px] text-zinc-600">Formato británico (ej. 5/2)</p>
          </div>
          <input
            type="text"
            value={odds.fractional}
            onChange={(e) => handleFractionalChange(e.target.value)}
            placeholder="1/1"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-3 text-xl font-mono font-semibold text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors text-center"
          />
        </div>

        {/* American */}
        <div className={cn(
          "rounded-lg border p-5 transition-colors",
          lastSource === "american" ? "border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-zinc-900/40"
        )}>
          <div className="mb-3">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-0.5">Americana</label>
            <p className="text-[10px] text-zinc-600">Formato moneyline (ej. +150)</p>
          </div>
          <input
            type="number"
            value={odds.american}
            onChange={(e) => handleAmericanChange(e.target.value)}
            placeholder="+100"
            step="1"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-3 text-xl font-mono font-semibold text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors text-center"
          />
        </div>
      </div>

      {/* Implied probability */}
      {implied && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-5 py-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">Probabilidad implícita</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">1 / cuota decimal × 100</p>
          </div>
          <span className="text-2xl font-mono font-semibold text-white">{implied}</span>
        </div>
      )}

      {/* Presets */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Cuotas frecuentes</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.decimal)}
              className="px-3 py-1.5 rounded-md border border-zinc-700 text-xs font-mono text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
            >
              {preset.label}
              <span className="text-zinc-600 ml-1.5">{preset.decimal.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reference table */}
      <div className="mt-4 rounded-lg border border-zinc-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60">
          <h3 className="text-xs font-semibold text-zinc-400">Tabla de referencia</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-2.5">Decimal</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium px-3 py-2.5">Fraccionaria</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium px-3 py-2.5">Americana</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium px-3 py-2.5">Prob. implícita</th>
              </tr>
            </thead>
            <tbody>
              {[1.5, 1.8, 2.0, 2.5, 3.0, 4.0, 5.0, 10.0].map((d) => (
                <tr
                  key={d}
                  className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 cursor-pointer transition-colors"
                  onClick={() => applyPreset(d)}
                >
                  <td className="px-5 py-2.5 font-mono text-white font-semibold">{d.toFixed(2)}</td>
                  <td className="px-3 py-2.5 font-mono text-zinc-300">{decimalToFractional(d)}</td>
                  <td className="px-3 py-2.5 font-mono text-zinc-300">{decimalToAmerican(d)}</td>
                  <td className="px-3 py-2.5 font-mono text-zinc-400">{impliedProbability(d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
