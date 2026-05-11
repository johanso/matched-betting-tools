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

function ratingColor(r: number) {
  if (r >= 98) return "text-emerald-400"
  if (r >= 97) return "text-yellow-400"
  return "text-zinc-400"
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={cn("inline-block ml-1 text-[9px]", active ? "text-white" : "text-zinc-600")}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  )
}

export default function OddsMatcherPage() {
  const [sport, setSport] = useState("Todos")
  const [sortKey, setSortKey] = useState<SortKey>("rating")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const data = useMemo(() => {
    let filtered = sport === "Todos" ? MOCK_DATA : MOCK_DATA.filter((m) => m.sport === sport)
    return [...filtered].sort((a, b) => {
      const ra = (a.backOdds / a.layOdds) * 100
      const rb = (b.backOdds / b.layOdds) * 100
      const va = sortKey === "rating" ? ra : sortKey === "event" || sortKey === "sport" ? 0 : (a as never)[sortKey] as number
      const vb = sortKey === "rating" ? rb : sortKey === "event" || sortKey === "sport" ? 0 : (b as never)[sortKey] as number

      if (sortKey === "event") return sortDir === "asc" ? a.event.localeCompare(b.event) : b.event.localeCompare(a.event)
      if (sortKey === "sport") return sortDir === "asc" ? a.sport.localeCompare(b.sport) : b.sport.localeCompare(a.sport)
      return sortDir === "asc" ? va - vb : vb - va
    })
  }, [sport, sortKey, sortDir])

  const colHeader = (label: string, key: SortKey) => (
    <th
      className="text-left text-[11px] font-medium text-zinc-500 pb-3 cursor-pointer hover:text-zinc-300 transition-colors whitespace-nowrap select-none"
      onClick={() => handleSort(key)}
    >
      {label}
      <SortIcon active={sortKey === key} dir={sortDir} />
    </th>
  )

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">OddsMatcher</h1>
          <p className="text-zinc-400 text-sm mt-1">Encuentra las mejores oportunidades de matched betting</p>
        </div>

        {/* Sport filter */}
        <div className="flex flex-wrap gap-1.5">
          {SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
                sport === s
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Eventos", value: data.length.toString() },
          {
            label: "Rating promedio",
            value: data.length
              ? ((data.reduce((s, m) => s + (m.backOdds / m.layOdds) * 100, 0) / data.length).toFixed(1) + "%")
              : "—",
          },
          {
            label: "Mejor rating",
            value: data.length
              ? (Math.max(...data.map((m) => (m.backOdds / m.layOdds) * 100)).toFixed(1) + "%")
              : "—",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <div className="text-xs text-zinc-500 mb-0.5">{stat.label}</div>
            <div className="text-sm font-mono font-semibold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="text-left text-[11px] font-medium text-zinc-500 pb-3 pt-3 pl-4 cursor-pointer hover:text-zinc-300 transition-colors select-none" onClick={() => handleSort("event")}>
                  Evento <SortIcon active={sortKey === "event"} dir={sortDir} />
                </th>
                <th className="text-left text-[11px] font-medium text-zinc-500 pb-3 pt-3 cursor-pointer hover:text-zinc-300 transition-colors select-none" onClick={() => handleSort("sport")}>
                  Deporte <SortIcon active={sortKey === "sport"} dir={sortDir} />
                </th>
                {colHeader("Back", "backOdds")}
                {colHeader("Lay", "layOdds")}
                {colHeader("Rating", "rating")}
                {colHeader("Beneficio*", "profit")}
              </tr>
            </thead>
            <tbody>
              {data.map((match, i) => {
                const rating = (match.backOdds / match.layOdds) * 100
                return (
                  <tr
                    key={match.id}
                    className={cn(
                      "border-b border-zinc-800/50 last:border-0 transition-colors",
                      i % 2 === 0 ? "bg-transparent" : "bg-zinc-900/20",
                      "hover:bg-zinc-800/30"
                    )}
                  >
                    <td className="py-3 pl-4 pr-4">
                      <span className="text-xs text-white font-medium">{match.event}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-zinc-400">{match.sport}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono text-white">{match.backOdds.toFixed(2)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono text-zinc-300">{match.layOdds.toFixed(2)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn("text-xs font-mono font-semibold", ratingColor(rating))}>
                        {rating.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono text-emerald-400">+€{match.profit.toFixed(2)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-zinc-600">
        * Beneficio estimado para una apuesta de €10 con comisión del 5%. Datos de ejemplo.
      </p>
    </div>
  )
}
