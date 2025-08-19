import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Snowflake, Shield, Clock } from "lucide-react"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Experts and Professionals in Electrical & HVAC Services</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Expert electrical wiring, repairs, air-conditioning, and refrigeration services. Satisfaction guaranteed
            with every project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/contact">Get Free Quote</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-white border-white hover:bg-white hover:text-blue-900 bg-transparent"
            >
              <Link href="/services">Our Services</Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-3 text-yellow-400" />
              <h3 className="font-semibold">Electrical</h3>
              <p className="text-sm text-blue-200">Wiring & Repairs</p>
            </div>
            <div className="text-center">
              <Snowflake className="h-12 w-12 mx-auto mb-3 text-blue-300" />
              <h3 className="font-semibold">HVAC</h3>
              <p className="text-sm text-blue-200">Installation & Service</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <h3 className="font-semibold">Licensed</h3>
              <p className="text-sm text-blue-200">Certified Professionals</p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-3 text-orange-400" />
              <h3 className="font-semibold">24/7</h3>
              <p className="text-sm text-blue-200">Emergency Service</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
