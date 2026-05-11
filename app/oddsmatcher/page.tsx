export default function OddsMatcherPage() {
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

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-12 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-2">
          <svg className="size-7 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <p className="text-xl font-medium text-stone-800 font-display" style={{ fontStyle: "italic" }}>Próximamente</p>
          <p className="text-sm text-stone-400 mt-1.5 max-w-xs">
            El OddsMatcher está en desarrollo. Podrás encontrar y comparar cuotas de múltiples casas en tiempo real.
          </p>
        </div>
        <div className="mt-2 px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">En construcción</span>
        </div>
      </div>
    </div>
  )
}
