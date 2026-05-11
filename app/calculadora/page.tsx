"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

type Mode = "qualifying" | "freebet" | "moneyback"

interface CalcResult {
  layStake: number
  layLiability: number
  profitBackWins: number
  profitLayWins: number
}

function calcQualifying(backStake: number, backOdds: number, layOdds: number, commission: number): CalcResult {
  const comm = commission / 100
  const layStake = (backOdds * backStake) / (layOdds - comm)
  const layLiability = layStake * (layOdds - 1)
  const profitBackWins = backStake * (backOdds - 1) - layStake * (layOdds - 1)
  const profitLayWins = layStake * (1 - comm) - backStake
  return { layStake, layLiability, profitBackWins, profitLayWins }
}

function calcFreeBet(freeBet: number, backOdds: number, layOdds: number, commission: number): CalcResult {
  const comm = commission / 100
  const layStake = ((backOdds - 1) * freeBet) / (layOdds - comm)
  const layLiability = layStake * (layOdds - 1)
  const profitBackWins = freeBet * (backOdds - 1) - layStake * (layOdds - 1)
  const profitLayWins = layStake * (1 - comm)
  return { layStake, layLiability, profitBackWins, profitLayWins }
}

function calcMoneyBack(backStake: number, backOdds: number, layOdds: number, commission: number, cashback: number): CalcResult {
  const comm = commission / 100
  const layStake = (backOdds * backStake) / (layOdds - comm)
  const layLiability = layStake * (layOdds - 1)
  const profitBackWins = backStake * (backOdds - 1) - layStake * (layOdds - 1)
  const profitLayWins = layStake * (1 - comm) - backStake + cashback
  return { layStake, layLiability, profitBackWins, profitLayWins }
}

const fmt = (n: number) =>
  (n >= 0 ? "+" : "") + n.toFixed(2)

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const isPositive = value.startsWith("+")
  const isNegative = value.startsWith("-")
  return (
    <div className={cn("flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0", highlight && "py-3")}>
      <span className={cn("text-xs text-zinc-400", highlight && "text-zinc-300 font-medium")}>{label}</span>
      <span
        className={cn(
          "text-sm font-mono font-semibold",
          highlight ? "text-white text-base" : "",
          isPositive && !highlight ? "text-emerald-400" : "",
          isNegative && !highlight ? "text-red-400" : "",
          !isPositive && !isNegative && !highlight ? "text-white" : ""
        )}
      >
        {value}
      </span>
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  prefix?: string
  suffix?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-400 block mb-1.5">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs text-zinc-500 pointer-events-none font-mono">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0.00"}
          min="0"
          step="0.01"
          className={cn(
            "w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 text-sm font-mono text-white placeholder-zinc-700",
            "focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors",
            prefix ? "pl-7 pr-3" : "px-3",
            suffix ? "pr-8" : ""
          )}
        />
        {suffix && (
          <span className="absolute right-3 text-xs text-zinc-500 pointer-events-none font-mono">{suffix}</span>
        )}
      </div>
    </div>
  )
}

const tabs: { id: Mode; label: string; desc: string }[] = [
  { id: "qualifying", label: "Clasificatoria", desc: "Minimiza la pérdida" },
  { id: "freebet", label: "Apuesta Gratis", desc: "Maximiza el beneficio" },
  { id: "moneyback", label: "Reembolso", desc: "Calcula con cashback" },
]

export default function CalculadoraPage() {
  const [mode, setMode] = useState<Mode>("qualifying")
  const [backOdds, setBackOdds] = useState("")
  const [layOdds, setLayOdds] = useState("")
  const [commission, setCommission] = useState("5")
  const [backStake, setBackStake] = useState("")
  const [freeBet, setFreeBet] = useState("")
  const [cashback, setCashback] = useState("")

  const result = useMemo<CalcResult | null>(() => {
    const bo = parseFloat(backOdds)
    const lo = parseFloat(layOdds)
    const comm = parseFloat(commission)

    if (!bo || !lo || !comm || bo <= 1 || lo <= 1 || comm < 0 || lo <= comm / 100) return null

    if (mode === "qualifying") {
      const bs = parseFloat(backStake)
      if (!bs || bs <= 0) return null
      return calcQualifying(bs, bo, lo, comm)
    }
    if (mode === "freebet") {
      const fb = parseFloat(freeBet)
      if (!fb || fb <= 0) return null
      return calcFreeBet(fb, bo, lo, comm)
    }
    if (mode === "moneyback") {
      const bs = parseFloat(backStake)
      const cb = parseFloat(cashback) || 0
      if (!bs || bs <= 0) return null
      return calcMoneyBack(bs, bo, lo, comm, cb)
    }
    return null
  }, [mode, backOdds, layOdds, commission, backStake, freeBet, cashback])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Calculadora</h1>
        <p className="text-zinc-400 text-sm mt-1">Calcula el lay stake y beneficio esperado</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all text-center",
              mode === tab.id
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <div className="font-semibold">{tab.label}</div>
            <div className={cn("text-[10px] font-normal mt-0.5 hidden sm:block", mode === tab.id ? "text-zinc-500" : "text-zinc-600")}>
              {tab.desc}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Datos</h2>

          {mode === "qualifying" && (
            <NumberInput label="Apuesta Bookie (€)" value={backStake} onChange={setBackStake} prefix="€" placeholder="10.00" />
          )}
          {mode === "freebet" && (
            <NumberInput label="Valor Apuesta Gratis (€)" value={freeBet} onChange={setFreeBet} prefix="€" placeholder="10.00" />
          )}
          {mode === "moneyback" && (
            <NumberInput label="Apuesta Bookie (€)" value={backStake} onChange={setBackStake} prefix="€" placeholder="10.00" />
          )}

          <NumberInput label="Cuota Bookie (decimal)" value={backOdds} onChange={setBackOdds} placeholder="2.00" />
          <NumberInput label="Cuota Exchange (lay)" value={layOdds} onChange={setLayOdds} placeholder="2.05" />
          <NumberInput label="Comisión Exchange (%)" value={commission} onChange={setCommission} suffix="%" placeholder="5" />

          {mode === "moneyback" && (
            <NumberInput
              label="Reembolso si pierde (€)"
              value={cashback}
              onChange={setCashback}
              prefix="€"
              placeholder="10.00"
            />
          )}
        </div>

        {/* Results */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Resultados</h2>

          {result ? (
            <div>
              <div className="mb-2">
                <ResultRow label="Lay Stake" value={`€${result.layStake.toFixed(2)}`} />
                <ResultRow label="Responsabilidad Lay" value={`€${result.layLiability.toFixed(2)}`} />
              </div>
              <div className="mt-1 pt-1">
                <ResultRow
                  label="Si gana el bookie"
                  value={`€${fmt(result.profitBackWins)}`}
                />
                <ResultRow
                  label="Si gana el exchange"
                  value={`€${fmt(result.profitLayWins)}`}
                />
              </div>
              <div className="mt-2 pt-2 border-t border-zinc-700">
                <ResultRow
                  label="Beneficio neto"
                  value={`€${fmt((result.profitBackWins + result.profitLayWins) / 2)}`}
                  highlight
                />
              </div>

              {mode === "freebet" && (
                <div className="mt-3 rounded-md bg-emerald-950/40 border border-emerald-900/50 p-3">
                  <p className="text-xs text-emerald-400">
                    Retorno estimado:{" "}
                    <span className="font-mono font-semibold">
                      {((result.profitLayWins / parseFloat(freeBet || "1")) * 100).toFixed(1)}%
                    </span>{" "}
                    del valor de la apuesta gratis
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="text-zinc-600 text-xs mb-1">Completa los campos para ver los resultados</div>
              <div className="text-zinc-700 text-[10px]">Las cuotas deben ser mayores que 1.00</div>
            </div>
          )}
        </div>
      </div>

      {/* Formula Reference */}
      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
        <h3 className="text-xs font-semibold text-zinc-500 mb-2">Fórmula utilizada</h3>
        {mode === "qualifying" && (
          <p className="text-xs font-mono text-zinc-600">
            lay_stake = (cuota_back × apuesta) / (cuota_lay − comisión)
          </p>
        )}
        {mode === "freebet" && (
          <p className="text-xs font-mono text-zinc-600">
            lay_stake = ((cuota_back − 1) × apuesta_gratis) / (cuota_lay − comisión)
          </p>
        )}
        {mode === "moneyback" && (
          <p className="text-xs font-mono text-zinc-600">
            lay_stake = (cuota_back × apuesta) / (cuota_lay − comisión) · El reembolso se suma al resultado lay
          </p>
        )}
      </div>
    </div>
  )
}
