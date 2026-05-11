"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { betStore, type Bet, type BetMode } from "@/lib/store"
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts"

const MODE_LABELS: Record<BetMode, string> = {
  clasificatoria: "Clasificatoria",
  "free-bet": "Free Bet",
  reembolso: "Reembolso",
  dutching: "Dutching",
  normal: "Normal",
}

const CHART_COLORS = ["#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0"]

function isoDay(iso: string) {
  return iso.slice(0, 10)
}

function fmtDay(isoDay: string) {
  return new Date(isoDay + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

export default function EstadisticasPage() {
  const [bets, setBets] = useState<Bet[]>([])

  useEffect(() => { setBets(betStore.getAll()) }, [])

  const settled = useMemo(() => bets.filter(b => b.status !== "pendiente" && b.profit != null), [bets])

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const totalProfit = useMemo(() => settled.reduce((s, b) => s + (b.profit ?? 0), 0), [settled])
  const totalStake = useMemo(() => bets.reduce((s, b) => s + b.backStake, 0), [bets])
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0

  const bestBookmaker = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of settled) map.set(b.bookmaker, (map.get(b.bookmaker) ?? 0) + (b.profit ?? 0))
    let best = { name: "—", profit: -Infinity }
    for (const [name, profit] of map) if (profit > best.profit) best = { name, profit }
    return best
  }, [settled])

  const bestMode = useMemo(() => {
    const map = new Map<BetMode, { total: number; count: number }>()
    for (const b of settled) {
      const cur = map.get(b.mode) ?? { total: 0, count: 0 }
      map.set(b.mode, { total: cur.total + (b.profit ?? 0), count: cur.count + 1 })
    }
    let best: { mode: string; avg: number } = { mode: "—", avg: -Infinity }
    for (const [mode, { total, count }] of map) {
      const avg = count > 0 ? total / count : -Infinity
      if (avg > best.avg) best = { mode: MODE_LABELS[mode], avg }
    }
    return best
  }, [settled])

  const streak = useMemo(() => {
    const sorted = [...settled].sort((a, b) => (a.settledAt ?? a.createdAt).localeCompare(b.settledAt ?? b.createdAt))
    let count = 0
    for (let i = sorted.length - 1; i >= 0; i--) {
      if ((sorted[i].profit ?? 0) > 0) count++
      else break
    }
    return count
  }, [settled])

  // ── P&L chart data (last 30 days cumulative) ───────────────────────────────
  const pnlChartData = useMemo(() => {
    const days: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      days.push(isoDay(d.toISOString()))
    }
    const profitByDay = new Map<string, number>()
    for (const b of settled) {
      const day = isoDay(b.settledAt ?? b.createdAt)
      profitByDay.set(day, (profitByDay.get(day) ?? 0) + (b.profit ?? 0))
    }
    let cumulative = 0
    return days.map(day => {
      cumulative += profitByDay.get(day) ?? 0
      return { date: fmtDay(day), cumulative: parseFloat(cumulative.toFixed(2)) }
    })
  }, [settled])

  // ── By bookmaker ───────────────────────────────────────────────────────────
  const bookmakerData = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of settled) map.set(b.bookmaker, (map.get(b.bookmaker) ?? 0) + (b.profit ?? 0))
    return [...map.entries()]
      .map(([name, profit]) => ({ name, profit: parseFloat(profit.toFixed(2)) }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 8)
  }, [settled])

  // ── By mode ────────────────────────────────────────────────────────────────
  const modeData = useMemo(() => {
    const map = new Map<BetMode, number>()
    for (const b of bets) map.set(b.mode, (map.get(b.mode) ?? 0) + 1)
    return [...map.entries()].map(([mode, count]) => ({ name: MODE_LABELS[mode], count }))
  }, [bets])

  const hasData = bets.length > 0

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-3">Mi Cuenta</p>
        <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight md:text-4xl" style={{ fontStyle: "italic" }}>
          Estadísticas
        </h1>
        <p className="text-base text-stone-500 mt-2">Métricas y gráficos de tu actividad</p>
      </div>

      {!hasData ? (
        <NoDataState />
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MetricCard label="ROI total" value={`${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`} color={roi >= 0 ? "text-emerald-600" : "text-red-500"} sub={`Sobre €${totalStake.toFixed(0)} invertidos`} />
            <MetricCard label="Mejor casa" value={bestBookmaker.name} color="text-stone-900" sub={bestBookmaker.profit !== -Infinity ? `€${bestBookmaker.profit.toFixed(2)} ganados` : "—"} />
            <MetricCard label="Modo más rentable" value={bestMode.mode} color="text-stone-900" sub={bestMode.avg !== -Infinity ? `Media €${bestMode.avg.toFixed(2)} / apuesta` : "—"} />
            <MetricCard label="Racha actual" value={streak.toString()} color={streak > 0 ? "text-emerald-600" : "text-stone-900"} sub={`apuesta${streak !== 1 ? "s" : ""} con profit > 0`} />
          </div>

          {/* P&L line chart */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">P&L acumulado</p>
                <p className="text-xs text-stone-400 mt-0.5">Últimos 30 días · liquidadas</p>
              </div>
              <span className={cn("text-xl font-mono font-bold", totalProfit >= 0 ? "text-emerald-600" : "text-red-500")}>
                {totalProfit >= 0 ? "+" : "−"}€{Math.abs(totalProfit).toFixed(2)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={pnlChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#a8a29e" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} width={52} />
                <Tooltip
                  contentStyle={{ border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 12, color: "#44403c" }}
                  formatter={(v) => [`€${Number(v).toFixed(2)}`, "P&L acumulado"]}
                />
                <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* By bookmaker */}
            <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-6">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">Beneficio por bookmaker</p>
              {bookmakerData.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-8">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={bookmakerData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#a8a29e" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} width={48} />
                    <Tooltip
                      contentStyle={{ border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 12, color: "#44403c" }}
                      formatter={(v) => [`€${Number(v).toFixed(2)}`, "Beneficio"]}
                    />
                    <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                      {bookmakerData.map((entry, i) => (
                        <Cell key={i} fill={entry.profit >= 0 ? CHART_COLORS[i % CHART_COLORS.length] : "#fca5a5"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* By mode */}
            <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-6">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">Apuestas por modo</p>
              {modeData.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-8">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={modeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#a8a29e" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                    <Tooltip
                      contentStyle={{ border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 12, color: "#44403c" }}
                      formatter={(v) => [Number(v), "Apuestas"]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value, color, sub }: { label: string; value: string; color: string; sub: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{label}</p>
      <p className={cn("text-xl font-mono font-bold mt-2 truncate", color)}>{value}</p>
      <p className="text-xs text-stone-400 mt-1">{sub}</p>
    </div>
  )
}

function NoDataState() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm py-20 flex flex-col items-center justify-center text-center gap-3">
      <div className="size-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
        <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      </div>
      <p className="text-lg font-medium text-stone-700 font-display" style={{ fontStyle: "italic" }}>Sin datos todavía</p>
      <p className="text-sm text-stone-400 max-w-xs">Registra tus primeras apuestas y liquidalas para ver gráficos y estadísticas aquí.</p>
    </div>
  )
}
