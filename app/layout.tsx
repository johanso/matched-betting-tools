import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Nav } from "@/components/nav"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Matched Betting Tools",
  description: "Herramientas profesionales de matched betting en español",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("dark", geistSans.variable, geistMono.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Nav />
        <main className="md:pl-56 pb-16 md:pb-0 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
