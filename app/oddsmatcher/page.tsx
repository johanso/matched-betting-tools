"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface Match {
  id: number
  event: string
  sport: string
  backOdds: number
  layOdds: number
  profit: number
}

const MOCK_DATA: Match[] = [
  { id: 1, event: "Real Madrid vs Barcelona", sport: "Fútbol", backOdds: 2.50, layOdds: 2.55, profit: 1.23 },
  { id: 2, event: "Atletico Madrid vs Sevilla", sport: "Fútbol", backOdds: 1.90, layOdds: 1.96, profit: 0.85 },
  { id: 3, event: "Manchester City vs Arsenal", sport: "Fútbol", backOdds: 2.75, layOdds: 2.82, profit: 1.45 },
  { id: 4, event: "PSG vs Bayern Munich", sport: "Fútbol", backOdds: 2.30, layOdds: 2.36, profit: 1.15 },
  { id: 5, event: "Djokovic vs Alcaraz", sport: "Tenis", backOdds: 1.80, layOdds: 1.84, profit: 0.78 },
  { id: 6, event: "Sinner vs Medvedev", sport: "Tenis", backOdds: 2.10, layOdds: 2.16, profit: 1.05 },
  { id: 7, event: "Wimbledon: Final Femenina", sport: "Tenis", backOdds: 1.65, layOdds: 1.70, profit: 0.62 },
  { id: 8, event: "NBA: Lakers vs Celtics", sport: "Baloncesto", backOdds: 2.20, layOdds: 2.24, profit: 1.10 },
  { id: 9, event: "NBA: Warriors vs Bucks", sport: "Baloncesto", backOdds: 1.95, layOdds: 2.00, profit: 0.90 },
  { id: 10, event: "F1: GP Mónaco", sport: "Motor", backOdds: 3.50, layOdds: 3.60, profit: 2.20 },
  { id: 11, event: "MotoGP: GP España", sport: "Motor", backOdds: 4.20, layOdds: 4.35, profit: 2.80 },
  { id: 12, event: "Tour de Francia: Etapa 12", sport: "Ciclismo", backOdds: 5.00, layOdds: 5.20, profit: 3.50 },
]

type SortKey = "event" | "sport" | "backOdds" | "layOdds" | "rating" | "profit"
type SortDir = "asc" | "desc"
const SPORTS = ["Todos", "Fútbol", "Tenis", "Baloncesto", "Motor", "Ciclismo"]

function ratingStyle(r: number) {
  if (r >= 98) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (r >= 97) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-stone-100 text-stone-500 border-stone-200"
}

export default function OddsMatcherPage() {
  const [sport, setSport] = useState("Todos")
  const [sortKey, setSortKey] = useState<SortKey>("rating")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  const data = useMemo(() => {
    const filtered = sport === "Todos" ? MOCK_DATA : MOCK_DATA.filter((m) => m.sport === sport)
    return [...filtered].sort((a, b) => {
      const ra = (a.backOdds / a.layOdds) * 100
      const rb = (b.backOdds / b.layOdds) * 100
      if (sortKey === "event") return sortDir === "asc" ? a.event.localeCompare(b.event) : b.event.localeCompare(a.event)
      if (sortKey === "sport") return sortDir === "asc" ? a.sport.localeCompare(b.sport) : b.sport.localeCompare(a.sport)
      const va = sortKey === "rating" ? ra : (a[sortKey as keyof Match] as number)
      const vb = sortKey === "rating" ? rb : (b[sortKey as keyof Match] as number)
      return sortDir === "asc" ? va - vb : vb - va
    })
  }, [sport, sortKey, sortDir])

  const avgRating = data.length ? data.reduce((s, m) => s + (m.backOdds / m.layOdds) * 100, 0) / data.length : 0

  function Th({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <th
        onClick={() => handleSort(k)}
        className="text-left py-3.5 px-4 text-xs font-semibold text-stone-500 cursor-pointer hover:text-stone-800 select-none uppercase tracking-wider transition-colors whitespace-nowrap"
      >
        {label}
        <span className={cn("ml-1.5", active ? "text-stone-700" : "text-stone-300")}>
          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </th>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-3">Herramienta</p>
        <h1
          className="font-display text-3xl font-medium text-stone-900 tracking-tight md:text-4xl"
          style={{ fontStyle: "italic" }}
        >
          OddsMatcher
        </h1>
        <p className="text-base text-stone-500 mt-2">Encuentra las mejores oportunidades de matched betting</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Eventos", value: data.length.toString() },
          { label: "Rating medio", value: data.length ? avgRating.toFixed(1) + "%" : "—" },
          { label: "Mejor rating", value: data.length ? Math.max(...data.map((m) => (m.backOdds / m.layOdds) * 100)).toFixed(1) + "%" : "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">{s.label}</p>
            <p className="text-2xl font-mono font-bold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sport filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SPORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all border",
              sport === s
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-800"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th
                  onClick={() => handleSort("event")}
                  className="text-left py-3.5 pl-5 pr-4 text-xs font-semibold text-stone-500 cursor-pointer hover:text-stone-800 select-none uppercase tracking-wider transition-colors"
                >
                  Evento
                  <span className={cn("ml-1.5", sortKey === "event" ? "text-stone-700" : "text-stone-300")}>
                    {sortKey === "event" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                  </span>
                </th>
                <Th label="Deporte" k="sport" />
                <Th label="Back" k="backOdds" />
                <Th label="Lay" k="layOdds" />
                <Th label="Rating" k="rating" />
                <Th label="Beneficio" k="profit" />
              </tr>
            </thead>
            <tbody>
              {data.map((match) => {
                const rating = (match.backOdds / match.layOdds) * 100
                return (
                  <tr key={match.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 pl-5 pr-4">
                      <span className="text-base font-medium text-stone-800">{match.event}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-stone-500">{match.sport}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-base font-mono font-semibold text-stone-800">{match.backOdds.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-base font-mono text-stone-600">{match.layOdds.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-sm font-mono font-semibold px-2.5 py-1 rounded-full border",
                        ratingStyle(rating)
                      )}>
                        {rating.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 pr-5">
                      <span className="text-base font-mono font-bold text-emerald-600">+€{match.profit.toFixed(2)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-sm text-stone-400">
        * Beneficio estimado para una apuesta de €10 con comisión del 5%. Datos de ejemplo.
      </p>
    </div>
  )
}
