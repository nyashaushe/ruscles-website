import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Zap, Snowflake, Shield, Clock, ArrowRight } from "lucide-react"

export function ModernHero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-12 md:py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 md:top-20 left-5 md:left-10 w-16 h-16 md:w-32 md:h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-20 md:top-40 right-10 md:right-20 w-12 h-12 md:w-24 md:h-24 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-10 md:bottom-20 left-1/4 w-8 h-8 md:w-16 md:h-16 border border-white/20 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6 md:mb-8">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 mr-3 md:mr-4 border border-white/20">
                  <Image
                    src="/images/modern-logo.png"
                    alt="Ruscles Investments"
                    width={80}
                    height={60}
                    className="h-12 md:h-16 lg:h-20 w-auto drop-shadow-2xl"
                  />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                    Ruscles Investments
                  </h1>
                  <p className="text-orange-400 font-bold text-sm md:text-base lg:text-lg tracking-wide drop-shadow-md">
                    SATISFACTION GUARANTEED
                  </p>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                Professional
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Electrical & HVAC
                </span>
                Services
              </h2>

              <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Expert electrical wiring, repairs, air-conditioning, and refrigeration services. Modern solutions with
                guaranteed satisfaction.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start mb-8 md:mb-12">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
                >
                  <Link href="/contact" className="flex items-center">
                    Get Free Quote
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-white border-white/30 hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-sm h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
                >
                  <Link href="/services">Our Services</Link>
                </Button>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-white/10">
                <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-white/10">
                    <Zap className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 mx-auto mb-2 md:mb-3 text-yellow-400" />
                    <h3 className="font-semibold text-sm md:text-base lg:text-lg">Electrical</h3>
                    <p className="text-xs md:text-sm text-slate-300">Wiring & Repairs</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-white/10">
                    <Snowflake className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 mx-auto mb-2 md:mb-3 text-cyan-400" />
                    <h3 className="font-semibold text-sm md:text-base lg:text-lg">HVAC</h3>
                    <p className="text-xs md:text-sm text-slate-300">Installation & Service</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-white/10">
                    <Shield className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 mx-auto mb-2 md:mb-3 text-green-400" />
                    <h3 className="font-semibold text-sm md:text-base lg:text-lg">Licensed</h3>
                    <p className="text-xs md:text-sm text-slate-300">Certified Professionals</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-white/10">
                    <Clock className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 mx-auto mb-2 md:mb-3 text-orange-400" />
                    <h3 className="font-semibold text-sm md:text-base lg:text-lg">24/7</h3>
                    <p className="text-xs md:text-sm text-slate-300">Emergency Service</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
