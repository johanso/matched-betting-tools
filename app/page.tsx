import Link from "next/link"

const tools = [
  {
    href: "/calculadora",
    title: "Calculadora",
    subtitle: "Clasificatoria · Apuesta gratis · Reembolso",
    description: "Calcula el lay stake óptimo para minimizar pérdidas en clasificatorias o maximizar el retorno de apuestas gratis.",
    badge: "3 modos",
    number: "01",
  },
  {
    href: "/oddsmatcher",
    title: "OddsMatcher",
    subtitle: "Buscador de oportunidades",
    description: "Compara cuotas de bookmakers con exchanges para encontrar las mejores oportunidades por rating y beneficio.",
    badge: "12 eventos",
    number: "02",
  },
  {
    href: "/dutching",
    title: "Dutching",
    subtitle: "Cubre múltiples selecciones",
    description: "Distribuye tu apuesta entre varias selecciones para obtener el mismo beneficio sea cual sea el ganador.",
    badge: "Hasta 6",
    number: "03",
  },
  {
    href: "/conversor",
    title: "Conversor",
    subtitle: "Decimal · Fraccionaria · Americana",
    description: "Convierte entre los tres formatos de cuotas más comunes al instante, con tabla de referencia incluida.",
    badge: "Tiempo real",
    number: "04",
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-4">
          Matched Betting Tools
        </p>
        <h1
          className="font-display text-4xl font-medium text-stone-900 leading-tight tracking-tight md:text-5xl"
          style={{ fontStyle: "italic" }}
        >
          Herramientas<br />
          <span className="text-stone-400">sin complicaciones.</span>
        </h1>
        <p className="text-base text-stone-500 mt-5 max-w-md leading-relaxed">
          Calculadoras y utilidades para optimizar tus apuestas sin riesgo,
          todo en un mismo lugar.
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative block rounded-xl border border-stone-200 bg-white p-6 hover:border-stone-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-5">
              <span className="text-sm font-mono text-stone-300 select-none">{tool.number}</span>
              <span className="text-xs font-medium bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full border border-stone-200">
                {tool.badge}
              </span>
            </div>
            <h2
              className="font-display text-2xl font-medium text-stone-900 mb-1.5 group-hover:text-stone-700 transition-colors"
              style={{ fontStyle: "italic" }}
            >
              {tool.title}
            </h2>
            <p className="text-sm font-medium text-stone-400 mb-3">{tool.subtitle}</p>
            <p className="text-sm text-stone-500 leading-relaxed">{tool.description}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-stone-400 group-hover:text-emerald-600 transition-colors">
              <span>Abrir herramienta</span>
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Explainer */}
      <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6">
        <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
          ¿Qué es el Matched Betting?
        </p>
        <p className="text-base text-stone-500 leading-relaxed">
          El matched betting aprovecha las apuestas gratuitas y promociones de bookmakers para generar
          beneficios consistentes cubriendo todos los resultados. Coloca una apuesta en el bookmaker y
          una apuesta contraria <span className="font-semibold text-stone-700">(lay)</span> en un exchange
          —eliminando prácticamente todo el riesgo.
        </p>
      </div>
    </div>
  )
}
