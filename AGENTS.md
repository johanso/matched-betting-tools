<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design System

Style: Vercel-inspired design
- Colors: Black (#000), White (#fff), Gray scale (zinc-*)
- Font: Geist Sans (already in Next.js 15)
- Borders: thin, 1px, zinc-200/800
- Radius: rounded-lg (8px) max, prefer sharp
- Shadows: minimal, subtle (shadow-sm)
- Dark mode: first-class support

## UI Rules
- No gradients, no heavy shadows
- Lots of whitespace
- Monospace for numbers and code (font-mono)
- Prefer zinc/neutral palette over blue defaults
- Buttons: solid black primary, ghost secondary
- Tables over cards when showing data