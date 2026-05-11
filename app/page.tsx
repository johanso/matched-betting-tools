import Link from "next/link"

const tools = [
  {
    href: "/calculadora",
    title: "Calculadora",
    subtitle: "Apuesta clasificatoria, gratis y reembolso",
    description: "Calcula el lay stake óptimo para minimizar pérdidas en clasificatorias o maximizar ganancias con apuestas gratis.",
    badge: "3 modos",
  },
  {
    href: "/oddsmatcher",
    title: "OddsMatcher",
    subtitle: "Buscador de oportunidades",
    description: "Compara cuotas de bookmakers con las de exchanges para encontrar las mejores oportunidades de matched betting.",
    badge: "12 eventos",
  },
  {
    href: "/dutching",
    title: "Dutching",
    subtitle: "Cubre múltiples selecciones",
    description: "Distribuye una apuesta total entre varias selecciones para obtener el mismo beneficio sea cual sea el ganador.",
    badge: "Hasta 6 selec.",
  },
  {
    href: "/conversor",
    title: "Conversor de Cuotas",
    subtitle: "Decimal, fraccionaria y americana",
    description: "Convierte entre los tres formatos de cuotas más comunes con actualización en tiempo real.",
    badge: "Tiempo real",
  },
]

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Herramientas de Matched Betting</h1>
        <p className="text-zinc-400 text-sm mt-1.5">
          Calculadoras y utilidades para optimizar tus apuestas sin riesgo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-sm font-semibold text-white">{tool.title}</h2>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 shrink-0 ml-2">
                {tool.badge}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-2">{tool.subtitle}</p>
            <p className="text-xs text-zinc-400 leading-relaxed">{tool.description}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
              <span>Abrir herramienta</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/30 p-5">
        <h3 className="text-xs font-semibold text-zinc-300 mb-2">¿Qué es el Matched Betting?</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          El matched betting es una técnica que aprovecha las apuestas gratuitas y promociones de los bookmakers para
          generar beneficios consistentes cubriendo todos los resultados. Usando una apuesta en el bookmaker y una
          apuesta contraria (lay) en un exchange, se elimina prácticamente todo el riesgo.
        </p>
      </div>
    </div>
  )
}
