<!-- BEGIN:nextjs-agent-rules -->
## Proyecto: Matched Betting Tools

App web de herramientas de matched betting en español. Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (estilo `radix-mira`, tema zinc), radix-ui (paquete monolítico v1).

**Rutas:**
- `/` — Dashboard con links a todas las herramientas
- `/calculadora` — Calculadora con 3 modos: clasificatoria, apuesta gratis, reembolso
- `/oddsmatcher` — Tabla de oportunidades con datos mock, filtro por deporte, columnas ordenables
- `/dutching` — Calculadora de dutching (2–6 selecciones)
- `/conversor` — Conversor de cuotas decimal ↔ fraccionaria ↔ americana

**Estructura clave:**
- `components/nav.tsx` — Sidebar fijo (desktop) + bottom nav (mobile), usa `usePathname`
- `lib/utils.ts` — Solo `cn()` (clsx + tailwind-merge)
- `components/ui/button.tsx` — Único componente shadcn instalado; importa `Slot` de `radix-ui`
- Alias `@/` → raíz del proyecto

**Convenciones:**
- Páginas interactivas: `"use client"` en el archivo de página directamente
- Fuentes: `--font-geist-sans` (sans) y `--font-geist-mono` (mono), cargadas en `app/layout.tsx`
- Dark mode: clase `dark` en `<html>`, variante CSS `@custom-variant dark (&:is(.dark *))`
- Importar de radix-ui como namespace: `import { Tabs } from "radix-ui"` → `Tabs.Root`, `Tabs.List`, etc.

---

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Sistema de diseño

**Estética:** Contraste split — sidebar oscuro (`bg-stone-900`) + contenido claro (`bg-stone-50`/`bg-white`).  
**Paleta:** Stone (warm neutral) + Emerald para positivos + Red para negativos. Sin zinc frío.

**Fuentes:**
- Display/títulos: Fraunces variable italic (`font-display`, variable `--font-fraunces`, cargada en layout.tsx)
- UI: Geist Sans (`--font-geist-sans`)
- Números/código: Geist Mono (`--font-geist-mono`)

**Escala tipográfica — solo clases estándar Tailwind, sin `text-[px]` arbitrarios:**
- `text-xs` (12px) — encabezados de columna en tablas (uppercase + tracking-wider), badges, pies de nota
- `text-sm` (14px) — etiquetas de inputs, texto secundario, nav items
- `text-base` (16px) — cuerpo, descripciones, datos de tabla
- `text-lg/xl` — subtítulos, títulos de card
- `text-3xl md:text-4xl` — títulos de página con `font-display italic`

**Sidebar:** `bg-stone-900`, texto `text-stone-300`, activo: `bg-stone-800 text-white border-l-2 border-emerald-500`  
**Contenido:** `bg-stone-50`, cards `bg-white shadow-sm`, borders `border-stone-200`  
**Botón primario:** `bg-stone-900 text-white hover:bg-stone-700`  
**Valores:** `font-mono`, positivos `text-emerald-600`, negativos `text-red-500`  
**Dark mode:** clase `dark` no usada actualmente. Variante disponible vía `@custom-variant dark (&:is(.dark *))`