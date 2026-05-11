"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { HelpPanel, type HelpSection } from "@/components/help-panel"

const CONVERSOR_SECTIONS: HelpSection[] = [
  {
    heading: "Formato Decimal",
    content: "El más común en Europa. Incluye tu stake devuelto. Cuota 2.50 significa que por cada €1 apostado recibes €2.50 (ganancia neta de €1.50).",
    example: "Decimal 2.50 → ganancia neta €1.50 por €1 apostado",
  },
  {
    heading: "Formato Fraccionaria",
    content: "Estándar en el Reino Unido. El numerador es la ganancia neta y el denominador el stake. Evens equivale a 1/1 = decimal 2.00.",
    example: "5/2 → por €2 apostados ganas €5 · decimal = 5÷2 + 1 = 3.50",
  },
  {
    heading: "Formato Americana",
    content: "Moneyline. Positivo (+) indica ganancia por €100 apostados. Negativo (−) indica cuánto debes apostar para ganar €100.",
    example: "+150 → decimal 2.50 · −200 → decimal 1.50",
  },
  {
    heading: "Probabilidad implícita",
    content: "El porcentaje de probabilidad que la cuota refleja. Se calcula como 1 ÷ cuota × 100. Si tu estimación real es mayor, tienes una apuesta de valor (value bet).",
    example: "Cuota 3.00 → prob. implícita 33.3% · Si estimas 40% → hay valor",
  },
]

function gcd(a: number, b: number): number {
  return b < 0.001 ? a : gcd(b, a % b)
}

function decimalToFractional(d: number): string {
  if (d <= 1) return "—"
  const num = Math.round((d - 1) * 100)
  const g = gcd(num, 100)
  return `${num / g}/${100 / g}`
}

function decimalToAmerican(d: number): string {
  if (d <= 1) return "—"
  if (d >= 2) return `+${Math.round((d - 1) * 100)}`
  return `${Math.round(-100 / (d - 1))}`
}

function fractionalToDecimal(frac: string): number | null {
  const parts = frac.replace(/\s/g, "").split("/")
  if (parts.length !== 2) return null
  const n = parseFloat(parts[0]), d = parseFloat(parts[1])
  if (!n || !d || d === 0) return null
  return n / d + 1
}

function americanToDecimal(a: number): number | null {
  if (a === 0) return null
  return a > 0 ? a / 100 + 1 : 100 / Math.abs(a) + 1
}

function impliedProb(d: number): string {
  return d > 1 ? ((1 / d) * 100).toFixed(2) + "%" : "—"
}

interface OddsState { decimal: string; fractional: string; american: string }
type Source = "decimal" | "fractional" | "american"

function fromDecimal(d: number): OddsState {
  return { decimal: d.toFixed(3), fractional: decimalToFractional(d), american: decimalToAmerican(d) }
}

const PRESETS = [
  { label: "1/4", decimal: 1.25 },
  { label: "Evens", decimal: 2.0 },
  { label: "2/1", decimal: 3.0 },
  { label: "5/1", decimal: 6.0 },
  { label: "10/1", decimal: 11.0 },
  { label: "20/1", decimal: 21.0 },
]

const REF = [1.25, 1.5, 1.8, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 10.0, 15.0, 21.0]

export default function ConversorPage() {
  const [odds, setOdds] = useState<OddsState>({ decimal: "", fractional: "", american: "" })
  const [src, setSrc] = useState<Source | null>(null)

  function onDecimal(v: string) {
    setSrc("decimal")
    if (!v) { setOdds({ decimal: "", fractional: "", american: "" }); return }
    const d = parseFloat(v)
    if (isNaN(d) || d <= 1) { setOdds({ decimal: v, fractional: "—", american: "—" }); return }
    setOdds(fromDecimal(d))
  }

  function onFractional(v: string) {
    setSrc("fractional")
    if (!v) { setOdds({ decimal: "", fractional: "", american: "" }); return }
    const d = fractionalToDecimal(v)
    if (!d || d <= 1) { setOdds({ decimal: "—", fractional: v, american: "—" }); return }
    setOdds({ ...fromDecimal(d), fractional: v })
  }

  function onAmerican(v: string) {
    setSrc("american")
    if (!v) { setOdds({ decimal: "", fractional: "", american: "" }); return }
    const a = parseFloat(v)
    if (isNaN(a) || a === 0) { setOdds({ decimal: "—", fractional: "—", american: v }); return }
    const d = americanToDecimal(a)
    if (!d || d <= 1) { setOdds({ decimal: "—", fractional: "—", american: v }); return }
    setOdds({ ...fromDecimal(d), american: v })
  }

  function applyPreset(d: number) {
    setSrc("decimal")
    setOdds(fromDecimal(d))
  }

  const decNum = parseFloat(odds.decimal)
  const hasResult = !isNaN(decNum) && decNum > 1

  const converterFields = [
    { label: "Decimal", sub: "Formato europeo", value: odds.decimal, onChange: onDecimal, source: "decimal" as Source, type: "number", placeholder: "2.000" },
    { label: "Fraccionaria", sub: "Formato británico · ej. 5/2", value: odds.fractional, onChange: onFractional, source: "fractional" as Source, type: "text", placeholder: "1/1" },
    { label: "Americana", sub: "Moneyline · ej. +150 / -200", value: odds.american, onChange: onAmerican, source: "american" as Source, type: "number", placeholder: "+100" },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-3">Herramienta</p>
        <div className="flex items-start gap-3">
          <h1
            className="font-display text-3xl font-medium text-stone-900 tracking-tight md:text-4xl"
            style={{ fontStyle: "italic" }}
          >
            Conversor de Cuotas
          </h1>
          <HelpPanel title="Conversor de Cuotas" sections={CONVERSOR_SECTIONS} />
        </div>
        <p className="text-base text-stone-500 mt-2">Convierte entre decimal, fraccionaria y americana en tiempo real</p>
      </div>

      {/* Converter inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {converterFields.map((f) => (
          <div
            key={f.label}
            className={cn(
              "rounded-xl border p-5 transition-all",
              src === f.source
                ? "border-stone-400 bg-white shadow-md"
                : "border-stone-200 bg-white shadow-sm"
            )}
          >
            <div className="mb-4">
              <label className="text-sm font-semibold text-stone-700 block">{f.label}</label>
              <p className="text-xs text-stone-400 mt-0.5">{f.sub}</p>
            </div>
            <input
              type={f.type}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              placeholder={f.placeholder}
              step={f.type === "number" ? "any" : undefined}
              className={cn(
                "w-full rounded-lg border py-4 px-4 text-3xl font-mono font-bold text-center",
                "placeholder-stone-200 focus:outline-none transition-all",
                src === f.source
                  ? "border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-stone-200"
                  : "border-stone-100 bg-stone-50 text-stone-700 focus:ring-2 focus:ring-stone-100 focus:border-stone-300 focus:bg-white"
              )}
            />
          </div>
        ))}
      </div>

      {/* Implied probability */}
      {hasResult && (
        <div className="rounded-xl border border-stone-200 bg-white px-6 py-5 mb-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-600">Probabilidad implícita</p>
            <p className="text-sm text-stone-400 mt-1 font-mono">1 ÷ {decNum.toFixed(3)} × 100</p>
          </div>
          <span className="text-4xl font-mono font-bold text-stone-900">{impliedProb(decNum)}</span>
        </div>
      )}

      {/* Presets */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm mb-5">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Accesos rápidos</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const isActive = hasResult && Math.abs(decNum - p.decimal) < 0.001
            return (
              <button
                key={p.label}
                onClick={() => applyPreset(p.decimal)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                  isActive
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-800"
                )}
              >
                <span className="font-display" style={{ fontStyle: "italic" }}>{p.label}</span>
                <span className="font-mono text-stone-400 ml-2 text-xs">{p.decimal.toFixed(2)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reference table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Tabla de referencia — haz clic para cargar</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-6 py-3">Decimal</th>
                <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Fraccionaria</th>
                <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Americana</th>
                <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Prob. implícita</th>
              </tr>
            </thead>
            <tbody>
              {REF.map((d) => {
                const active = hasResult && Math.abs(decNum - d) < 0.001
                return (
                  <tr
                    key={d}
                    onClick={() => applyPreset(d)}
                    className={cn(
                      "border-b border-stone-50 last:border-0 cursor-pointer transition-colors",
                      active ? "bg-stone-100" : "hover:bg-stone-50"
                    )}
                  >
                    <td className="px-6 py-3.5 font-mono font-bold text-base text-stone-900">{d.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono text-base text-stone-600">{decimalToFractional(d)}</td>
                    <td className="px-4 py-3.5 font-mono text-base text-stone-600">{decimalToAmerican(d)}</td>
                    <td className="px-4 py-3.5 font-mono text-base text-stone-500">{impliedProb(d)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
