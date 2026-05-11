"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const toolItems = [
  { href: "/", label: "Inicio", icon: IconHome },
  { href: "/calculadora", label: "Calculadora", icon: IconCalculator },
  { href: "/dutching", label: "Dutching", icon: IconPercent },
  { href: "/conversor", label: "Conversor", icon: IconConvert },
]

const accountItems = [
  { href: "/cuenta", label: "Resumen", icon: IconUser },
  { href: "/cuenta/bonos", label: "Bonos", icon: IconGift },
  { href: "/cuenta/apuestas", label: "Apuestas", icon: IconList },
  { href: "/cuenta/estadisticas", label: "Estadísticas", icon: IconBarChart },
]

const mobileItems = [
  { href: "/", label: "Inicio", icon: IconHome },
  { href: "/calculadora", label: "Calc.", icon: IconCalculator },
  { href: "/dutching", label: "Dutching", icon: IconPercent },
  { href: "/conversor", label: "Conversor", icon: IconConvert },
  { href: "/cuenta", label: "Cuenta", icon: IconUser },
]

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-stone-800 text-white border-l-2 border-emerald-500 pl-[10px]"
          : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-100 border-l-2 border-transparent pl-[10px]"
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-emerald-400" : "text-stone-500")} />
      {label}
    </Link>
  )
}

// ── Icon components ────────────────────────────────────────────────────────────

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function IconCalculator({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <rect x="7" y="5" width="10" height="4" rx="1" />
      <circle cx="8" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function IconPercent({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}

function IconConvert({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function IconGift({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  )
}

function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function IconBarChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

// ── Nav component ──────────────────────────────────────────────────────────────

export function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 w-56 h-full bg-stone-900 z-30">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-stone-800">
          <div className="text-lg font-medium text-white leading-tight font-display" style={{ fontStyle: "italic" }}>
            Matched Betting
          </div>
          <div className="text-xs text-stone-500 mt-1 font-sans uppercase tracking-widest">
            Herramientas
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {/* Tools group */}
          <div>
            <p className="px-3 mb-1.5 text-xs font-semibold text-stone-600 uppercase tracking-widest">Herramientas</p>
            <div className="space-y-0.5">
              {toolItems.map(({ href, label, icon }) => (
                <NavLink key={href} href={href} label={label} icon={icon} active={pathname === href} />
              ))}
              {/* OddsMatcher — disabled */}
              <span className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium border-l-2 border-transparent pl-[10px] opacity-40 cursor-not-allowed">
                <IconChart className="size-4 shrink-0 text-stone-600" />
                <span className="text-stone-600">OddsMatcher</span>
                <span className="ml-auto text-xs font-mono text-stone-700 bg-stone-800 px-1.5 py-0.5 rounded">soon</span>
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-stone-800" />

          {/* Account group */}
          <div>
            <p className="px-3 mb-1.5 text-xs font-semibold text-stone-600 uppercase tracking-widest">Mi Cuenta</p>
            <div className="space-y-0.5">
              {accountItems.map(({ href, label, icon }) => (
                <NavLink key={href} href={href} label={label} icon={icon} active={pathname === href} />
              ))}
            </div>
          </div>
        </nav>

        <div className="px-5 py-4 border-t border-stone-800">
          <p className="text-xs text-stone-600">Solo para uso educativo</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 z-30">
        <div className="flex items-center justify-around h-16">
          {mobileItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/cuenta'
              ? pathname.startsWith('/cuenta')
              : pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  active ? "text-emerald-400" : "text-stone-500 hover:text-stone-300"
                )}
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
