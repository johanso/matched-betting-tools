"use client"

import { Dialog } from "radix-ui"

export interface HelpSection {
  heading: string
  content: string
  example?: string
}

interface HelpPanelProps {
  title: string
  sections: HelpSection[]
}

export function HelpPanel({ title, sections }: HelpPanelProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="inline-flex items-center justify-center size-6 rounded-full border border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 transition-colors text-sm font-medium shrink-0 mt-1"
          aria-label="Ayuda"
        >
          ?
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/40 z-50
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
            duration-200"
        />
        <Dialog.Content
          className="fixed z-50 bg-white flex flex-col shadow-xl
            inset-x-0 bottom-0 rounded-t-2xl max-h-[88vh]
            md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
            md:max-w-lg md:w-full md:rounded-2xl md:max-h-[85vh]
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
            data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:slide-out-to-bottom-8
            md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-bottom-0
            md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95
            duration-200"
        >
          {/* Sticky header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
            <Dialog.Title
              className="font-display text-xl font-medium text-stone-900 leading-tight"
              style={{ fontStyle: "italic" }}
            >
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="size-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Dialog.Close>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
            {sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-stone-800 mb-1.5">{section.heading}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{section.content}</p>
                {section.example && (
                  <div className="mt-2.5 rounded-lg bg-stone-50 border border-stone-100 px-4 py-3">
                    <p className="text-xs font-mono text-stone-600 leading-relaxed">{section.example}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
