"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Inicio", icon: IconHome },
  { href: "/calculadora", label: "Calculadora", icon: IconCalculator },
  { href: "/oddsmatcher", label: "OddsMatcher", icon: IconChart },
  { href: "/dutching", label: "Dutching", icon: IconPercent },
  { href: "/conversor", label: "Conversor", icon: IconConvert },
]

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

export function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar — dark */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 w-56 h-full bg-stone-900 z-30">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-stone-800">
          <div
            className="text-lg font-medium text-white leading-tight font-display"
            style={{ fontStyle: "italic" }}
          >
            Matched Betting
          </div>
          <div className="text-xs text-stone-500 mt-1 font-sans uppercase tracking-widest">
            Herramientas
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
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
          })}
        </nav>

        <div className="px-5 py-4 border-t border-stone-800">
          <p className="text-xs text-stone-600">Solo para uso educativo</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 z-30">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
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
