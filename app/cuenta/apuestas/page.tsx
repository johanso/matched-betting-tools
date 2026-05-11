"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { betStore, bonusStore, exportBetsCSV, type Bet, type BetMode, type BetStatus, type Bonus } from "@/lib/store"

const BOOKMAKERS = ["Bet365", "Betfair", "William Hill", "Codere", "Sportium", "Betway", "888sport", "Unibet", "Bwin"]
const EXCHANGES = ["Betfair", "OddJusta"]

const MODES: { value: BetMode; label: string }[] = [
  { value: "clasificatoria", label: "Clasificatoria" },
  { value: "free-bet", label: "Free Bet" },
  { value: "reembolso", label: "Reembolso" },
  { value: "dutching", label: "Dutching" },
  { value: "normal", label: "Normal" },
]
const MODE_TABS = [{ value: "todas", label: "Todas" }, ...MODES]
const STATUS_OPTS: { value: BetStatus | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Pendiente" },
  { value: "ganada", label: "Ganada" },
  { value: "perdida", label: "Perdida" },
  { value: "void", label: "Void" },
]

const STATUS_BADGE: Record<BetStatus, string> = {
  pendiente: "bg-stone-100 text-stone-600 border-stone-200",
  ganada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  perdida: "bg-red-50 text-red-600 border-red-200",
  void: "bg-stone-100 text-stone-400 border-stone-100",
}

interface BetForm {
  event: string; market: string; selection: string
  bookmaker: string; exchange: string
  mode: BetMode
  backStake: string; backOdds: string
  layStake: string; layOdds: string; commission: string
  freeBetValue: string
  bonusId: string; notes: string
}

const EMPTY_FORM: BetForm = {
  event: "", market: "", selection: "",
  bookmaker: "", exchange: "",
  mode: "clasificatoria",
  backStake: "", backOdds: "",
  layStake: "", layOdds: "", commission: "5",
  freeBetValue: "",
  bonusId: "", notes: "",
}

const hasLay = (m: BetMode) => m === "clasificatoria" || m === "free-bet" || m === "reembolso"

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

export default function ApuestasPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modeFilter, setModeFilter] = useState<BetMode | "todas">("todas")
  const [statusFilter, setStatusFilter] = useState<BetStatus | "todas">("todas")
  const [bookmakerFilter, setBookmakerFilter] = useState("")
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [form, setForm] = useState<BetForm>(EMPTY_FORM)

  useEffect(() => { refresh() }, [])

  function refresh() {
    setBets(betStore.getAll())
    setBonuses(bonusStore.getAll())
  }

  function set(k: keyof BetForm, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function openNew() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }

  function openEdit(bet: Bet) {
    setForm({
      event: bet.event, market: bet.market, selection: bet.selection,
      bookmaker: bet.bookmaker, exchange: bet.exchange ?? "",
      mode: bet.mode,
      backStake: bet.backStake.toString(), backOdds: bet.backOdds.toString(),
      layStake: bet.layStake?.toString() ?? "", layOdds: bet.layOdds?.toString() ?? "",
      commission: bet.commission?.toString() ?? "5",
      freeBetValue: bet.freeBetValue?.toString() ?? "",
      bonusId: bet.bonusId ?? "", notes: bet.notes ?? "",
    })
    setEditingId(bet.id)
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.event || !form.bookmaker || !form.backOdds) return
    const data: Omit<Bet, "id" | "createdAt"> = {
      event: form.event, market: form.market, selection: form.selection,
      bookmaker: form.bookmaker,
      exchange: form.exchange || undefined,
      mode: form.mode,
      backStake: parseFloat(form.backStake) || 0,
      backOdds: parseFloat(form.backOdds),
      layStake: form.layStake ? parseFloat(form.layStake) : undefined,
      layOdds: form.layOdds ? parseFloat(form.layOdds) : undefined,
      commission: form.commission ? parseFloat(form.commission) : undefined,
      freeBetValue: form.freeBetValue ? parseFloat(form.freeBetValue) : undefined,
      bonusId: form.bonusId || undefined,
      notes: form.notes || undefined,
      status: "pendiente",
    }
    if (editingId) {
      betStore.update(editingId, data)
    } else {
      betStore.create(data)
    }
    refresh()
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function handleSettle(id: string, winner: "back" | "lay" | "void") {
    betStore.settle(id, winner)
    setSettlingId(null)
    refresh()
  }

  function del(id: string) { betStore.delete(id); refresh() }

  const filtered = useMemo(() => {
    return [...bets]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter(b => {
        if (modeFilter !== "todas" && b.mode !== modeFilter) return false
        if (statusFilter !== "todas" && b.status !== statusFilter) return false
        if (bookmakerFilter && !b.bookmaker.toLowerCase().includes(bookmakerFilter.toLowerCase())) return false
        return true
      })
  }, [bets, modeFilter, statusFilter, bookmakerFilter])

  const activeBonuses = bonuses.filter(b => b.status === "activo" || b.status === "pendiente")
  const bookmakers = [...new Set(bets.map(b => b.bookmaker))]

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-3">Mi Cuenta</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight md:text-4xl" style={{ fontStyle: "italic" }}>
              Apuestas
            </h1>
            <p className="text-base text-stone-500 mt-2">Historial completo de tus apuestas</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {bets.length > 0 && (
              <button onClick={() => exportBetsCSV(bets)} className="flex items-center gap-2 px-3 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                CSV
              </button>
            )}
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Nueva apuesta
            </button>
          </div>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-stone-700">{editingId ? "Editar apuesta" : "Nueva apuesta"}</h2>
            <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: event, market, selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Evento">
                <input type="text" value={form.event} onChange={e => set("event", e.target.value)} required placeholder="Real Madrid vs Barcelona" className={ic} />
              </FormField>
              <FormField label="Mercado">
                <input type="text" value={form.market} onChange={e => set("market", e.target.value)} placeholder="1X2" className={ic} />
              </FormField>
              <FormField label="Selección">
                <input type="text" value={form.selection} onChange={e => set("selection", e.target.value)} placeholder="Real Madrid" className={ic} />
              </FormField>
            </div>

            {/* Row 2: bookmaker, exchange, mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Bookmaker">
                <input list="bk-list-b" value={form.bookmaker} onChange={e => set("bookmaker", e.target.value)} required placeholder="Bet365" className={ic} />
                <datalist id="bk-list-b">{BOOKMAKERS.map(b => <option key={b} value={b} />)}</datalist>
              </FormField>
              {hasLay(form.mode) && (
                <FormField label="Exchange">
                  <input list="ex-list" value={form.exchange} onChange={e => set("exchange", e.target.value)} placeholder="Betfair Exchange" className={ic} />
                  <datalist id="ex-list">{EXCHANGES.map(x => <option key={x} value={x} />)}</datalist>
                </FormField>
              )}
              <FormField label="Modo">
                <select value={form.mode} onChange={e => set("mode", e.target.value)} className={ic}>
                  {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </FormField>
            </div>

            {/* Row 3: stakes and odds */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField label={form.mode === "free-bet" ? "Free Bet €" : "Apuesta €"}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-mono">€</span>
                  <input type="number" value={form.backStake} onChange={e => set("backStake", e.target.value)} required min="0" step="0.01" placeholder="10.00" className={cn(ic, "pl-7")} />
                </div>
              </FormField>
              <FormField label="Cuota back">
                <input type="number" value={form.backOdds} onChange={e => set("backOdds", e.target.value)} required min="1.01" step="0.01" placeholder="2.00" className={ic} />
              </FormField>
              {hasLay(form.mode) && (
                <>
                  <FormField label="Lay stake €">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-mono">€</span>
                      <input type="number" value={form.layStake} onChange={e => set("layStake", e.target.value)} min="0" step="0.01" placeholder="10.20" className={cn(ic, "pl-7")} />
                    </div>
                  </FormField>
                  <FormField label="Cuota lay">
                    <input type="number" value={form.layOdds} onChange={e => set("layOdds", e.target.value)} min="1.01" step="0.01" placeholder="2.05" className={ic} />
                  </FormField>
                </>
              )}
            </div>

            {/* Row 4: commission, cashback, bonus, notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hasLay(form.mode) && (
                <FormField label="Comisión %">
                  <div className="relative">
                    <input type="number" value={form.commission} onChange={e => set("commission", e.target.value)} min="0" max="100" step="0.1" placeholder="5" className={cn(ic, "pr-7")} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-mono">%</span>
                  </div>
                </FormField>
              )}
              {form.mode === "reembolso" && (
                <FormField label="Reembolso €">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-mono">€</span>
                    <input type="number" value={form.freeBetValue} onChange={e => set("freeBetValue", e.target.value)} min="0" step="0.01" placeholder="10.00" className={cn(ic, "pl-7")} />
                  </div>
                </FormField>
              )}
              {activeBonuses.length > 0 && (
                <FormField label="Bono vinculado">
                  <select value={form.bonusId} onChange={e => set("bonusId", e.target.value)} className={ic}>
                    <option value="">Sin bono</option>
                    {activeBonuses.map(b => (
                      <option key={b.id} value={b.id}>{b.bookmaker} — {b.type} €{b.value}</option>
                    ))}
                  </select>
                </FormField>
              )}
              <FormField label="Notas" className="sm:col-span-2">
                <input type="text" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notas opcionales..." className={ic} />
              </FormField>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors">
                {editingId ? "Guardar cambios" : "Añadir apuesta"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode filter tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 mb-4 overflow-x-auto">
        {MODE_TABS.map(t => (
          <button key={t.value} onClick={() => setModeFilter(t.value as BetMode | "todas")}
            className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap",
              modeFilter === t.value ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-500 hover:text-stone-700"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as BetStatus | "todas")}
          className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-200">
          {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {bookmakers.length > 0 && (
          <select value={bookmakerFilter} onChange={e => setBookmakerFilter(e.target.value)}
            className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-200">
            <option value="">Todos los bookmakers</option>
            {bookmakers.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      {bets.length === 0 ? (
        <EmptyState onNew={openNew} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm py-12 text-center">
          <p className="text-stone-500">No hay apuestas con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  {["Fecha", "Evento", "Bookmaker", "Modo", "Back", "Lay", "Estado", "Profit", "Acciones"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(bet => (
                  <tr key={bet.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-3.5 text-sm text-stone-500 whitespace-nowrap">{fmtDate(bet.createdAt)}</td>
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <p className="text-sm font-medium text-stone-800 truncate">{bet.event}</p>
                      {bet.selection && <p className="text-xs text-stone-400 truncate">{bet.selection}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-stone-600 whitespace-nowrap">{bet.bookmaker}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 capitalize whitespace-nowrap">
                        {bet.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-mono text-stone-700 whitespace-nowrap">
                      €{bet.backStake.toFixed(2)} · {bet.backOdds.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-mono text-stone-500 whitespace-nowrap">
                      {bet.layStake ? `€${bet.layStake.toFixed(2)} · ${bet.layOdds?.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", STATUS_BADGE[bet.status])}>
                        {bet.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-sm whitespace-nowrap">
                      {bet.profit != null ? (
                        <span className={bet.profit >= 0 ? "text-emerald-600" : "text-red-500"}>
                          {bet.profit >= 0 ? "+" : "−"}€{Math.abs(bet.profit).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {bet.status === "pendiente" ? (
                        settlingId === bet.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleSettle(bet.id, "back")} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors whitespace-nowrap">
                              {bet.layStake ? "Back" : "Ganada"}
                            </button>
                            {bet.layStake && (
                              <button onClick={() => handleSettle(bet.id, "lay")} className="text-xs px-2 py-1 bg-stone-50 text-stone-700 border border-stone-200 rounded-md hover:bg-stone-100 transition-colors">
                                Lay
                              </button>
                            )}
                            {!bet.layStake && (
                              <button onClick={() => handleSettle(bet.id, "lay")} className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                                Perdida
                              </button>
                            )}
                            <button onClick={() => handleSettle(bet.id, "void")} className="text-xs px-2 py-1 text-stone-400 border border-stone-200 rounded-md hover:bg-stone-50 transition-colors">
                              Void
                            </button>
                            <button onClick={() => setSettlingId(null)} className="text-xs text-stone-300 hover:text-stone-500 transition-colors">✕</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSettlingId(bet.id)} className="text-xs text-stone-400 hover:text-emerald-600 transition-colors whitespace-nowrap">
                              Liquidar
                            </button>
                            <button onClick={() => openEdit(bet)} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">Editar</button>
                            <button onClick={() => del(bet.id)} className="text-xs text-stone-400 hover:text-red-500 transition-colors">Eliminar</button>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(bet)} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">Editar</button>
                          <button onClick={() => del(bet.id)} className="text-xs text-stone-400 hover:text-red-500 transition-colors">Eliminar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const ic = "w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all"

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm py-16 flex flex-col items-center justify-center text-center gap-2">
      <div className="size-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      </div>
      <p className="text-base font-medium text-stone-700">Sin apuestas aún</p>
      <p className="text-sm text-stone-400">Registra tu primera apuesta para empezar el seguimiento</p>
      <button onClick={onNew} className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors">
        Nueva apuesta
      </button>
    </div>
  )
}
