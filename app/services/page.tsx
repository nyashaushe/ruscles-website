import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Snowflake, Wrench, Settings, Thermometer, Refrigerator, Shield, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Professional Services - Ruscles Investments",
  description:
    "Comprehensive electrical and HVAC services including wiring, repairs, air conditioning, cold rooms, and refrigeration. Licensed professionals with 24/7 emergency service.",
}

export default function ServicesPage() {
  const services = [
    {
      icon: Zap,
      title: "Electrical Wiring",
      description:
        "Complete electrical wiring solutions for residential and commercial properties with code compliance.",
      features: [
        "New construction wiring",
        "Home rewiring projects",
        "Panel upgrades and installations",
        "Code compliance inspections",
        "Safety assessments",
        "Circuit installations",
      ],
      pricing: "Starting from $150",
      emergency: true,
    },
    {
      icon: Wrench,
      title: "Electrical Repairs",
      description: "Fast and reliable electrical repair services for all types of electrical issues and emergencies.",
      features: [
        "Fault diagnosis and repair",
        "Outlet and switch repairs",
        "Lighting fixture repairs",
        "Circuit breaker issues",
        "Power restoration",
        "Safety inspections",
      ],
      pricing: "Starting from $80",
      emergency: true,
    },
    {
      icon: Snowflake,
      title: "Air Conditioning",
      description: "Professional AC installation, maintenance, and repair services for optimal comfort and efficiency.",
      features: [
        "AC system installation",
        "Regular maintenance service",
        "Emergency repairs",
        "Energy efficiency optimization",
        "Duct cleaning and sealing",
        "Thermostat installation",
      ],
      pricing: "Starting from $200",
      emergency: true,
    },
    {
      icon: Thermometer,
      title: "Cold Rooms",
      description: "Specialized cold room design, installation, and maintenance for commercial and industrial use.",
      features: [
        "Custom design and build",
        "Temperature control systems",
        "Insulation installation",
        "Monitoring systems",
        "Maintenance contracts",
        "Emergency repairs",
      ],
      pricing: "Quote on request",
      emergency: true,
    },
    {
      icon: Refrigerator,
      title: "Refrigeration Services",
      description: "Complete refrigeration solutions for fridges, freezers, and commercial refrigeration units.",
      features: [
        "Fridge and freezer repairs",
        "Commercial refrigeration",
        "Preventive maintenance",
        "Compressor replacement",
        "Refrigerant services",
        "Energy efficiency upgrades",
      ],
      pricing: "Starting from $120",
      emergency: true,
    },
    {
      icon: Settings,
      title: "Maintenance Services",
      description: "Regular maintenance services to keep your electrical and HVAC systems running efficiently.",
      features: [
        "Scheduled maintenance plans",
        "Performance optimization",
        "System upgrades",
        "Preventive inspections",
        "Emergency support",
        "Warranty services",
      ],
      pricing: "Starting from $100",
      emergency: false,
    },
  ]

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Professional Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive electrical and HVAC services delivered by licensed professionals. We guarantee quality
            workmanship and customer satisfaction on every project.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <service.icon className="h-12 w-12 text-blue-600" />
                  {service.emergency && (
                    <Badge variant="destructive" className="text-xs">
                      24/7 Emergency
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <h4 className="font-semibold mb-3 text-gray-900">What's Included:</h4>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-blue-600">{service.pricing}</span>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/contact">Get Quote</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Guarantees */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Service Guarantees</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Licensed & Insured</h3>
              <p className="text-gray-600">All our technicians are fully licensed and insured for your protection.</p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Emergency Service</h3>
              <p className="text-gray-600">Round-the-clock emergency response for urgent electrical and HVAC issues.</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Satisfaction Guaranteed</h3>
              <p className="text-gray-600">We stand behind our work with a complete satisfaction guarantee.</p>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Service Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
              <p className="text-gray-600 text-sm">Call or fill out our contact form to describe your needs.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Assessment</h3>
              <p className="text-gray-600 text-sm">We provide a free on-site assessment and detailed quote.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Work</h3>
              <p className="text-gray-600 text-sm">
                Our licensed technicians complete the work to the highest standards.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Follow-up</h3>
              <p className="text-gray-600 text-sm">We ensure your complete satisfaction and provide ongoing support.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 text-gray-300">
            Contact us today for a free consultation and quote on any of our services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/contact">Get Free Quote</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
            >
              <Link href="tel:+263732591600">Call Now: +263 732 591 600</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
