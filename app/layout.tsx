import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import AuthProvider from "@/components/providers/session-provider"
import { AdminLayoutWrapper } from "@/components/admin/admin-layout-wrapper"
import { Toaster } from "@/components/ui/toaster"
import { WhatsAppButton } from "@/components/whatsapp-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ruscle Investments - Experts and Professionals in  Electrical & HVAC Services",
  description:
    "Expert electrical wiring, repairs, air-conditioning, cold rooms, fridges, and freezer installation and repair services. Professional, reliable, satisfaction guaranteed.",
  keywords:
    "electrical services, HVAC, air conditioning, cold rooms, electrical wiring, electrical repairs, refrigeration, freezer repair",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <AdminLayoutWrapper
            navbar={<Navbar />}
            footer={<Footer />}
          >
            {children}
          </AdminLayoutWrapper>
          <WhatsAppButton
            position="bottom-right"
            className="z-[60]"
          />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
