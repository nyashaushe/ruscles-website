"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      {/* Top contact bar - Hidden on mobile */}
      <div className="bg-blue-900 text-white py-2 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">+263 732 591 600 / +263 783 591 600</span>
              <span className="lg:hidden">+263 732 591 600</span>
            </div>
            <div className="flex items-center space-x-1 hidden lg:flex">
              <Mail className="h-4 w-4" />
              <span>ruscleinvestments@gmail.com</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <span>Satisfaction Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link href="/" className="flex items-center space-x-2 md:space-x-3">
              <div className="relative">
                <Image
                  src="/images/modern-logo.png"
                  alt="Ruscles Investments - Professional Electrical & HVAC Services"
                  width={80}
                  height={60}
                  className="h-12 md:h-16 w-auto drop-shadow-lg"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Ruscles Investments
                </h1>
                <p className="text-xs md:text-sm text-orange-600 font-semibold tracking-wide">
                  SATISFACTION GUARANTEED
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild size="sm" className="xl:h-10 xl:px-6">
                <Link href="/contact">Get Quote</Link>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden bg-transparent border-gray-300">
                  <Menu className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 pb-4 border-b">
                    <Image
                      src="/images/modern-logo.png"
                      alt="Ruscles Investments"
                      width={60}
                      height={45}
                      className="h-12 w-auto"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-blue-900">Ruscles Investments</h2>
                      <p className="text-xs text-orange-600 font-semibold">SATISFACTION GUARANTEED</p>
                    </div>
                  </div>

                  {/* Mobile Contact Info */}
                  <div className="space-y-3 pb-4 border-b">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>+263 732 591 600</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>ruscleinvestments@gmail.com</span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium text-gray-700 hover:text-blue-600 py-2 border-b border-gray-100 last:border-b-0"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Button asChild className="mt-6 w-full">
                    <Link href="/contact" onClick={() => setIsOpen(false)}>
                      Get Free Quote
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  )
}
