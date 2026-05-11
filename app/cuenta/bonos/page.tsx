"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { bonusStore, type Bonus, type BonusStatus, type BonusType } from "@/lib/store"

const BOOKMAKERS = ["Bet365", "Betfair", "William Hill", "Codere", "Sportium", "Betway", "888sport", "Unibet", "Bwin"]
const TIPOS: { value: BonusType; label: string }[] = [
  { value: "bienvenida", label: "Bienvenida" },
  { value: "recarga", label: "Recarga" },
  { value: "free-bet", label: "Free Bet" },
  { value: "cashback", label: "Cashback" },
  { value: "otro", label: "Otro" },
]
const STATUS_TABS: { value: BonusStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "usado", label: "Usados" },
  { value: "caducado", label: "Caducados" },
]
const STATUS_BADGE: Record<BonusStatus, string> = {
  pendiente: "bg-stone-100 text-stone-600 border-stone-200",
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  usado: "bg-stone-100 text-stone-400 border-stone-100",
  caducado: "bg-red-50 text-red-600 border-red-200",
}

interface BonusForm {
  bookmaker: string
  type: BonusType
  status: BonusStatus
  value: string
  minOdds: string
  rollover: string
  expiresAt: string
  notes: string
}

const EMPTY_FORM: BonusForm = {
  bookmaker: "", type: "bienvenida", status: "activo",
  value: "", minOdds: "", rollover: "", expiresAt: "", notes: "",
}

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
}

export default function BonosPage() {
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<BonusStatus | "todos">("todos")
  const [form, setForm] = useState<BonusForm>(EMPTY_FORM)

  useEffect(() => { refresh() }, [])

  function refresh() { setBonuses(bonusStore.getAll()) }

  function set(k: keyof BonusForm, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function openNew() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }

  function openEdit(b: Bonus) {
    setForm({
      bookmaker: b.bookmaker, type: b.type, status: b.status,
      value: b.value.toString(), minOdds: b.minOdds?.toString() ?? "",
      rollover: b.rollover?.toString() ?? "", expiresAt: b.expiresAt?.slice(0, 10) ?? "",
      notes: b.notes ?? "",
    })
    setEditingId(b.id)
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.bookmaker || !form.value) return
    const data = {
      bookmaker: form.bookmaker,
      type: form.type,
      status: form.status,
      value: parseFloat(form.value),
      minOdds: form.minOdds ? parseFloat(form.minOdds) : undefined,
      rollover: form.rollover ? parseFloat(form.rollover) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      notes: form.notes || undefined,
    }
    if (editingId) {
      bonusStore.update(editingId, data)
    } else {
      bonusStore.create(data)
    }
    refresh()
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function markUsed(id: string) { bonusStore.update(id, { status: "usado" }); refresh() }
  function del(id: string) { bonusStore.delete(id); refresh() }

  const filtered = useMemo(() =>
    filter === "todos" ? bonuses : bonuses.filter(b => b.status === filter),
    [bonuses, filter]
  )

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filtered]
  )

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-3">Mi Cuenta</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight md:text-4xl" style={{ fontStyle: "italic" }}>
              Bonos
            </h1>
            <p className="text-base text-stone-500 mt-2">Gestiona y sigue el estado de tus bonos</p>
          </div>
          <button onClick={openNew} className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nuevo bono
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-stone-700">{editingId ? "Editar bono" : "Nuevo bono"}</h2>
            <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Bookmaker */}
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Bookmaker</label>
              <input list="bk-list" value={form.bookmaker} onChange={e => set("bookmaker", e.target.value)} required placeholder="Bet365"
                className={inputCls} />
              <datalist id="bk-list">{BOOKMAKERS.map(b => <option key={b} value={b} />)}</datalist>
            </div>

            {/* Tipo */}
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Tipo</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Estado</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls}>
                {STATUS_TABS.filter(s => s.value !== "todos").map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Valor €</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-mono">€</span>
                <input type="number" value={form.value} onChange={e => set("value", e.target.value)} required min="0" step="0.01" placeholder="10.00"
                  className={cn(inputCls, "pl-7")} />
              </div>
            </div>

            {/* Cuota mínima */}
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Cuota mínima</label>
              <input type="number" value={form.minOdds} onChange={e => set("minOdds", e.target.value)} min="1" step="0.01" placeholder="1.50"
                className={inputCls} />
            </div>

            {/* Rollover */}
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Rollover (x)</label>
              <input type="number" value={form.rollover} onChange={e => set("rollover", e.target.value)} min="0" step="1" placeholder="3"
                className={inputCls} />
            </div>

            {/* Caduca */}
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Caduca el</label>
              <input type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} className={inputCls} />
            </div>

            {/* Notas */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">Notas</label>
              <input type="text" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notas opcionales..."
                className={inputCls} />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-1">
              <button type="submit" className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors">
                {editingId ? "Guardar cambios" : "Añadir bono"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 mb-5 overflow-x-auto">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => setFilter(t.value)}
            className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap",
              filter === t.value ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-500 hover:text-stone-700"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <EmptyState
          title="Sin bonos"
          sub={filter === "todos" ? "Añade tu primer bono para empezar" : `No hay bonos con estado "${filter}"`}
          action={filter === "todos" ? { label: "Añadir bono", onClick: openNew } : undefined}
        />
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  {["Bookmaker", "Tipo", "Valor", "Estado", "Cuota mín.", "Caduca", "Notas", "Acciones"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(bonus => {
                  const days = bonus.expiresAt ? daysUntil(bonus.expiresAt) : null
                  return (
                    <tr key={bonus.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-stone-800">{bonus.bookmaker}</td>
                      <td className="px-4 py-3.5 text-sm text-stone-600 capitalize">{bonus.type}</td>
                      <td className="px-4 py-3.5 text-base font-mono font-bold text-stone-900">€{bonus.value.toFixed(0)}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", STATUS_BADGE[bonus.status])}>
                          {bonus.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-mono text-stone-600">
                        {bonus.minOdds ? bonus.minOdds.toFixed(2) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-stone-600 whitespace-nowrap">
                        {bonus.expiresAt ? (
                          <span className={cn(days !== null && days <= 7 && bonus.status === "activo" ? "text-amber-600 font-medium" : "")}>
                            {fmtDate(bonus.expiresAt)}
                            {days !== null && days <= 7 && bonus.status === "activo" && (
                              <span className="ml-1 text-xs text-amber-500">({days}d)</span>
                            )}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-stone-400 max-w-[160px] truncate">{bonus.notes ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {bonus.status === "activo" && (
                            <button onClick={() => markUsed(bonus.id)} className="text-xs text-stone-400 hover:text-emerald-600 transition-colors whitespace-nowrap">
                              Usar
                            </button>
                          )}
                          <button onClick={() => openEdit(bonus)} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
                            Editar
                          </button>
                          <button onClick={() => del(bonus.id)} className="text-xs text-stone-400 hover:text-red-500 transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const inputCls = "w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all"

function EmptyState({ title, sub, action }: { title: string; sub: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm py-16 flex flex-col items-center justify-center text-center gap-2">
      <div className="size-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      </div>
      <p className="text-base font-medium text-stone-700">{title}</p>
      <p className="text-sm text-stone-400">{sub}</p>
      {action && (
        <button onClick={action.onClick} className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors">
          {action.label}
        </button>
      )}
    </div>
  )
}
