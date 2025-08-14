import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Snowflake, Wrench, Settings, Thermometer, Refrigerator } from "lucide-react"
import Link from "next/link"

export function Services() {
  const services = [
    {
      icon: Zap,
      title: "Electrical Wiring",
      description: "Complete electrical wiring solutions for residential and commercial properties.",
      features: ["New installations", "Rewiring", "Panel upgrades", "Code compliance"],
    },
    {
      icon: Wrench,
      title: "Electrical Repairs",
      description: "Fast and reliable electrical repair services for all types of electrical issues.",
      features: ["Fault diagnosis", "Emergency repairs", "Safety inspections", "Maintenance"],
    },
    {
      icon: Snowflake,
      title: "Air Conditioning",
      description: "Professional AC installation, maintenance, and repair services.",
      features: ["AC installation", "Maintenance", "Repairs", "Energy efficiency"],
    },
    {
      icon: Thermometer,
      title: "Cold Rooms",
      description: "Specialized cold room installation and maintenance for commercial use.",
      features: ["Design & build", "Temperature control", "Insulation", "Monitoring systems"],
    },
    {
      icon: Refrigerator,
      title: "Refrigeration",
      description: "Complete refrigeration solutions for fridges, freezers, and commercial units.",
      features: ["Fridge repairs", "Freezer service", "Commercial units", "Preventive maintenance"],
    },
    {
      icon: Settings,
      title: "Maintenance",
      description: "Regular maintenance services to keep your systems running efficiently.",
      features: ["Scheduled maintenance", "Performance optimization", "System upgrades", "Emergency support"],
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Professional Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive electrical and HVAC services with guaranteed satisfaction. Our experienced team
            delivers quality workmanship on every project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <service.icon className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full bg-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/services">View All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
