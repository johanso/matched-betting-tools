// ── Types ─────────────────────────────────────────────────────────────────────

export type BonusType = 'bienvenida' | 'recarga' | 'free-bet' | 'cashback' | 'otro'
export type BonusStatus = 'pendiente' | 'activo' | 'usado' | 'caducado'

export interface Bonus {
  id: string
  bookmaker: string
  type: BonusType
  status: BonusStatus
  value: number
  minOdds?: number
  rollover?: number
  expiresAt?: string
  notes?: string
  createdAt: string
}

export type BetStatus = 'pendiente' | 'ganada' | 'perdida' | 'void'
export type BetMode = 'clasificatoria' | 'free-bet' | 'reembolso' | 'dutching' | 'normal'

export interface Bet {
  id: string
  bonusId?: string
  bookmaker: string
  exchange?: string
  event: string
  market: string
  selection: string
  mode: BetMode
  backStake: number
  backOdds: number
  layStake?: number
  layOdds?: number
  commission?: number
  freeBetValue?: number
  status: BetStatus
  profit?: number
  settledAt?: string
  notes?: string
  createdAt: string
}

// ── Storage helpers ────────────────────────────────────────────────────────────

const KEYS = { bonuses: 'mb:bonuses', bets: 'mb:bets' }

function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function persist<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items))
}

// ── Bonus store ────────────────────────────────────────────────────────────────

export const bonusStore = {
  getAll(): Bonus[] {
    return load<Bonus>(KEYS.bonuses)
  },

  getById(id: string): Bonus | undefined {
    return load<Bonus>(KEYS.bonuses).find(b => b.id === id)
  },

  create(data: Omit<Bonus, 'id' | 'createdAt'>): Bonus {
    const bonus: Bonus = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    persist(KEYS.bonuses, [...load<Bonus>(KEYS.bonuses), bonus])
    return bonus
  },

  update(id: string, data: Partial<Omit<Bonus, 'id' | 'createdAt'>>): void {
    persist(KEYS.bonuses, load<Bonus>(KEYS.bonuses).map(b => b.id === id ? { ...b, ...data } : b))
  },

  delete(id: string): void {
    persist(KEYS.bonuses, load<Bonus>(KEYS.bonuses).filter(b => b.id !== id))
  },
}

// ── Bet store ──────────────────────────────────────────────────────────────────

export const betStore = {
  getAll(): Bet[] {
    return load<Bet>(KEYS.bets)
  },

  getById(id: string): Bet | undefined {
    return load<Bet>(KEYS.bets).find(b => b.id === id)
  },

  create(data: Omit<Bet, 'id' | 'createdAt'>): Bet {
    const bet: Bet = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    persist(KEYS.bets, [...load<Bet>(KEYS.bets), bet])
    return bet
  },

  update(id: string, data: Partial<Omit<Bet, 'id' | 'createdAt'>>): void {
    persist(KEYS.bets, load<Bet>(KEYS.bets).map(b => b.id === id ? { ...b, ...data } : b))
  },

  delete(id: string): void {
    persist(KEYS.bets, load<Bet>(KEYS.bets).filter(b => b.id !== id))
  },

  settle(id: string, winner: 'back' | 'lay' | 'void'): void {
    const bets = load<Bet>(KEYS.bets)
    const bet = bets.find(b => b.id === id)
    if (!bet) return
    let profit = 0
    let status: BetStatus = 'void'
    if (winner !== 'void') {
      profit = calculateSettleProfit(bet, winner)
      status = profit >= 0 ? 'ganada' : 'perdida'
    }
    persist(KEYS.bets, bets.map(b => b.id === id
      ? { ...b, profit, status, settledAt: new Date().toISOString() }
      : b
    ))
  },
}

// ── Profit calculation ─────────────────────────────────────────────────────────

export function calculateSettleProfit(bet: Bet, winner: 'back' | 'lay'): number {
  const layStake = bet.layStake ?? 0
  const layOdds = bet.layOdds ?? 0
  const comm = (bet.commission ?? 5) / 100
  const freeBet = bet.freeBetValue ?? 0

  if (!layStake) {
    return winner === 'back'
      ? bet.backStake * (bet.backOdds - 1)
      : -bet.backStake
  }

  if (winner === 'back') {
    const backWin = bet.mode === 'free-bet'
      ? freeBet * (bet.backOdds - 1)
      : bet.backStake * (bet.backOdds - 1)
    return backWin - layStake * (layOdds - 1)
  }

  const layWin = layStake * (1 - comm)
  const backLoss = bet.mode === 'free-bet' ? 0 : bet.backStake
  const cashback = bet.mode === 'reembolso' ? freeBet : 0
  return layWin - backLoss + cashback
}

// ── CSV export ─────────────────────────────────────────────────────────────────

export function exportBetsCSV(bets: Bet[]): void {
  const headers = [
    'Fecha', 'Evento', 'Mercado', 'Selección', 'Bookmaker', 'Exchange',
    'Modo', 'Back Stake', 'Back Odds', 'Lay Stake', 'Lay Odds',
    'Comisión %', 'Estado', 'Profit €',
  ]
  const rows = bets.map(b => [
    new Date(b.createdAt).toLocaleDateString('es-ES'),
    b.event,
    b.market,
    b.selection,
    b.bookmaker,
    b.exchange ?? '',
    b.mode,
    b.backStake.toFixed(2),
    b.backOdds.toFixed(3),
    b.layStake?.toFixed(2) ?? '',
    b.layOdds?.toFixed(3) ?? '',
    b.commission?.toString() ?? '',
    b.status,
    b.profit?.toFixed(2) ?? '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `apuestas-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
