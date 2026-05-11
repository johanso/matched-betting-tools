"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { betStore, bonusStore, type Bet, type Bonus } from "@/lib/store"

function fmtEur(n: number) {
  return (n >= 0 ? "+" : "−") + "€" + Math.abs(n).toFixed(2)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

const STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-stone-100 text-stone-600 border-stone-200",
  ganada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  perdida: "bg-red-50 text-red-600 border-red-200",
  void: "bg-stone-100 text-stone-500 border-stone-200",
}

export default function CuentaPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [bonuses, setBonuses] = useState<Bonus[]>([])

  useEffect(() => {
    setBets(betStore.getAll())
    setBonuses(bonusStore.getAll())
  }, [])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const settled = useMemo(() => bets.filter(b => b.status !== 'pendiente' && b.profit != null), [bets])
  const totalProfit = useMemo(() => settled.reduce((s, b) => s + (b.profit ?? 0), 0), [settled])
  const monthlyProfit = useMemo(() => settled.filter(b => (b.settledAt ?? b.createdAt) >= startOfMonth).reduce((s, b) => s + (b.profit ?? 0), 0), [settled, startOfMonth])
  const activeBets = useMemo(() => bets.filter(b => b.status === 'pendiente').length, [bets])
  const activeBonuses = useMemo(() => bonuses.filter(b => b.status === 'activo'), [bonuses])
  const expiringBonuses = useMemo(() => activeBonuses.filter(b => b.expiresAt && daysUntil(b.expiresAt) <= 7), [activeBonuses])
  const recentBets = useMemo(() => [...bets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5), [bets])

  const stats = [
    {
      label: "Beneficio total",
      value: totalProfit,
      display: bets.length === 0 ? "—" : fmtEur(totalProfit),
      color: totalProfit >= 0 ? "text-emerald-600" : "text-red-500",
      sub: `${settled.length} apuestas liquidadas`,
    },
    {
      label: "Este mes",
      value: monthlyProfit,
      display: settled.filter(b => (b.settledAt ?? b.createdAt) >= startOfMonth).length === 0 ? "—" : fmtEur(monthlyProfit),
      color: monthlyProfit >= 0 ? "text-emerald-600" : "text-red-500",
      sub: `${settled.filter(b => (b.settledAt ?? b.createdAt) >= startOfMonth).length} liquidadas`,
    },
    {
      label: "Apuestas",
      display: bets.length.toString(),
      color: "text-stone-900",
      sub: `${activeBets} pendiente${activeBets !== 1 ? "s" : ""}`,
    },
    {
      label: "Bonos activos",
      display: activeBonuses.length.toString(),
      color: "text-stone-900",
      sub: expiringBonuses.length > 0
        ? `${expiringBonuses.length} caducan en ≤7 días`
        : "ninguno por caducar",
      warning: expiringBonuses.length > 0,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-3">Mi Cuenta</p>
        <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight md:text-4xl" style={{ fontStyle: "italic" }}>
          Resumen
        </h1>
        <p className="text-base text-stone-500 mt-2">Tu actividad de matched betting de un vistazo</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={cn("rounded-xl border bg-white px-5 py-4 shadow-sm", s.warning ? "border-amber-200" : "border-stone-200")}>
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{s.label}</p>
              {s.warning && (
                <span className="size-2 rounded-full bg-amber-400 mt-0.5 shrink-0" />
              )}
            </div>
            <p className={cn("text-2xl font-mono font-bold mt-2", s.color)}>{s.display}</p>
            <p className="text-xs text-stone-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent bets */}
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Apuestas recientes</p>
            <Link href="/cuenta/apuestas" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
              Ver todas →
            </Link>
          </div>

          {recentBets.length === 0 ? (
            <EmptyState
              icon={<IconBet />}
              title="Sin apuestas aún"
              action={{ label: "Nueva apuesta", href: "/cuenta/apuestas" }}
            />
          ) : (
            <div className="divide-y divide-stone-50">
              {recentBets.map((bet) => (
                <div key={bet.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{bet.event}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{bet.bookmaker} · {fmtDate(bet.createdAt)}</p>
                  </div>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border shrink-0", STATUS_COLORS[bet.status])}>
                    {bet.status}
                  </span>
                  {bet.profit != null ? (
                    <span className={cn("text-sm font-mono font-bold shrink-0 w-20 text-right", bet.profit >= 0 ? "text-emerald-600" : "text-red-500")}>
                      {fmtEur(bet.profit)}
                    </span>
                  ) : (
                    <span className="text-sm font-mono text-stone-300 shrink-0 w-20 text-right">—</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active bonuses */}
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Bonos activos</p>
            <Link href="/cuenta/bonos" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
              Gestionar →
            </Link>
          </div>

          {activeBonuses.length === 0 ? (
            <EmptyState
              icon={<IconGift />}
              title="Sin bonos activos"
              action={{ label: "Añadir bono", href: "/cuenta/bonos" }}
            />
          ) : (
            <div className="divide-y divide-stone-50">
              {activeBonuses.slice(0, 5).map((bonus) => {
                const days = bonus.expiresAt ? daysUntil(bonus.expiresAt) : null
                return (
                  <div key={bonus.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800">{bonus.bookmaker}</p>
                      <p className="text-xs text-stone-400 mt-0.5 capitalize">{bonus.type}</p>
                    </div>
                    <span className="text-base font-mono font-bold text-stone-900 shrink-0">€{bonus.value.toFixed(0)}</span>
                    {days !== null && (
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border shrink-0", days <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-stone-100 text-stone-500 border-stone-200")}>
                        {days}d
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New bet CTA */}
      <div className="mt-5">
        <Link
          href="/cuenta/apuestas"
          className="inline-flex items-center gap-2 px-5 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nueva apuesta
        </Link>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, action }: { icon: React.ReactNode; title: string; action: { label: string; href: string } }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <div className="size-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-1">
        {icon}
      </div>
      <p className="text-sm text-stone-500">{title}</p>
      <Link href={action.href} className="text-xs text-stone-400 hover:text-stone-600 underline transition-colors">
        {action.label}
      </Link>
    </div>
  )
}

function IconBet() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function IconGift() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  )
}
