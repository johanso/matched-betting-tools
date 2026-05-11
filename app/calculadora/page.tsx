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

function Field({ label, value, onChange, placeholder, prefix, suffix, note }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  prefix?: string
  suffix?: string
  note?: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-medium text-stone-600">{label}</label>
        {note && <span className="text-xs text-stone-400">{note}</span>}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-mono pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0.00"}
          min="0"
          step="0.01"
          className={cn(
            "w-full bg-white border border-stone-200 rounded-lg py-3 text-base font-mono text-stone-900",
            "placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400",
            "transition-all shadow-sm",
            prefix ? "pl-8 pr-4" : "px-4",
            suffix ? "pr-10" : ""
          )}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-mono pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

const tabs: { id: Mode; label: string; desc: string }[] = [
  { id: "qualifying", label: "Clasificatoria", desc: "Minimiza pérdida" },
  { id: "freebet", label: "Apuesta Gratis", desc: "Maximiza beneficio" },
  { id: "moneyback", label: "Reembolso", desc: "Con cashback" },
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
    if (!bo || !lo || !comm || bo <= 1 || lo <= 1) return null
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

  const avgProfit = result ? (result.profitBackWins + result.profitLayWins) / 2 : null

  function fmtProfit(n: number) {
    return (n >= 0 ? "+" : "") + "€" + Math.abs(n).toFixed(2)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-3">Herramienta</p>
        <h1
          className="font-display text-3xl font-medium text-stone-900 tracking-tight md:text-4xl"
          style={{ fontStyle: "italic" }}
        >
          Calculadora
        </h1>
        <p className="text-base text-stone-500 mt-2">Calcula el lay stake y beneficio esperado</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-stone-100 rounded-xl border border-stone-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-center",
              mode === tab.id
                ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-700"
            )}
          >
            <div>{tab.label}</div>
            <div className={cn(
              "text-xs font-normal mt-0.5 hidden sm:block",
              mode === tab.id ? "text-stone-400" : "text-stone-400"
            )}>
              {tab.desc}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Datos de entrada</h2>

          {mode === "qualifying" && (
            <Field label="Apuesta en el Bookie" value={backStake} onChange={setBackStake} prefix="€" placeholder="10.00" note="stake" />
          )}
          {mode === "freebet" && (
            <Field label="Valor de la Apuesta Gratis" value={freeBet} onChange={setFreeBet} prefix="€" placeholder="10.00" note="SNR" />
          )}
          {mode === "moneyback" && (
            <Field label="Apuesta en el Bookie" value={backStake} onChange={setBackStake} prefix="€" placeholder="10.00" note="stake" />
          )}

          <Field label="Cuota del Bookie" value={backOdds} onChange={setBackOdds} placeholder="2.00" note="decimal" />
          <Field label="Cuota del Exchange (lay)" value={layOdds} onChange={setLayOdds} placeholder="2.05" note="decimal" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Comisión Exchange" value={commission} onChange={setCommission} suffix="%" placeholder="5" />
            {mode === "moneyback" && (
              <Field label="Reembolso si pierde" value={cashback} onChange={setCashback} prefix="€" placeholder="10.00" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-5">Resultados</h2>

          {result ? (
            <div className="space-y-5">
              {/* Primary metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Lay Stake</p>
                  <p className="text-3xl font-mono font-bold text-stone-900">€{result.layStake.toFixed(2)}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Responsabilidad</p>
                  <p className="text-3xl font-mono font-bold text-stone-900">€{result.layLiability.toFixed(2)}</p>
                </div>
              </div>

              {/* Outcome scenarios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <div>
                    <p className="text-sm font-medium text-stone-700">Si gana el bookie</p>
                    <p className="text-xs text-stone-400 mt-0.5">Back gana · Lay pierde</p>
                  </div>
                  <span className={cn(
                    "text-xl font-mono font-bold",
                    result.profitBackWins >= 0 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {fmtProfit(result.profitBackWins)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <div>
                    <p className="text-sm font-medium text-stone-700">Si gana el exchange</p>
                    <p className="text-xs text-stone-400 mt-0.5">Back pierde · Lay gana</p>
                  </div>
                  <span className={cn(
                    "text-xl font-mono font-bold",
                    result.profitLayWins >= 0 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {fmtProfit(result.profitLayWins)}
                  </span>
                </div>
              </div>

              {/* Net profit */}
              <div className={cn(
                "flex items-center justify-between p-4 rounded-xl border",
                avgProfit !== null && avgProfit >= 0
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              )}>
                <p className={cn(
                  "text-sm font-semibold",
                  avgProfit !== null && avgProfit >= 0 ? "text-emerald-700" : "text-red-700"
                )}>
                  Beneficio neto esperado
                </p>
                <span className={cn(
                  "text-2xl font-mono font-bold",
                  avgProfit !== null && avgProfit >= 0 ? "text-emerald-700" : "text-red-600"
                )}>
                  {avgProfit !== null ? fmtProfit(avgProfit) : "—"}
                </span>
              </div>

              {mode === "freebet" && result && (
                <div className="text-center text-sm text-stone-500">
                  Retorno de la apuesta gratis:{" "}
                  <span className="font-mono font-semibold text-emerald-600">
                    {((result.profitLayWins / Math.max(parseFloat(freeBet || "1"), 0.01)) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-1">
                <svg className="size-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-base text-stone-500">Completa los campos para ver resultados</p>
              <p className="text-sm text-stone-400">Las cuotas deben ser mayores que 1.00</p>
            </div>
          )}
        </div>
      </div>

      {/* Formula reference */}
      <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 px-6 py-4">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Fórmula aplicada</p>
        {mode === "qualifying" && (
          <code className="text-sm font-mono text-stone-600">
            lay_stake = (cuota_back × apuesta) / (cuota_lay − comisión)
          </code>
        )}
        {mode === "freebet" && (
          <code className="text-sm font-mono text-stone-600">
            lay_stake = ((cuota_back − 1) × apuesta_gratis) / (cuota_lay − comisión)
          </code>
        )}
        {mode === "moneyback" && (
          <code className="text-sm font-mono text-stone-600">
            lay_stake = (cuota_back × apuesta) / (cuota_lay − comisión) — reembolso suma al resultado lay
          </code>
        )}
      </div>
    </div>
  )
}
