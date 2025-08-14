import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Snowflake, Wrench, Settings, Thermometer, Refrigerator, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ModernServices() {
  const services = [
    {
      icon: Zap,
      title: "Electrical Wiring",
      description: "Complete electrical wiring solutions for residential and commercial properties.",
      features: ["New installations", "Rewiring", "Panel upgrades", "Code compliance"],
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: Wrench,
      title: "Electrical Repairs",
      description: "Fast and reliable electrical repair services for all types of electrical issues.",
      features: ["Fault diagnosis", "Emergency repairs", "Safety inspections", "Maintenance"],
      gradient: "from-blue-400 to-blue-600",
    },
    {
      icon: Snowflake,
      title: "Air Conditioning",
      description: "Professional AC installation, maintenance, and repair services.",
      features: ["AC installation", "Maintenance", "Repairs", "Energy efficiency"],
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      icon: Thermometer,
      title: "Cold Rooms",
      description: "Specialized cold room installation and maintenance for commercial use.",
      features: ["Design & build", "Temperature control", "Insulation", "Monitoring systems"],
      gradient: "from-purple-400 to-purple-600",
    },
    {
      icon: Refrigerator,
      title: "Refrigeration",
      description: "Complete refrigeration solutions for fridges, freezers, and commercial units.",
      features: ["Fridge repairs", "Freezer service", "Commercial units", "Preventive maintenance"],
      gradient: "from-green-400 to-green-600",
    },
    {
      icon: Settings,
      title: "Maintenance",
      description: "Regular maintenance services to keep your systems running efficiently.",
      features: ["Scheduled maintenance", "Performance optimization", "System upgrades", "Emergency support"],
      gradient: "from-orange-400 to-red-500",
    },
  ]

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Our Professional Services
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            We provide comprehensive electrical and HVAC services with guaranteed satisfaction. Our experienced team
            delivers quality workmanship on every project.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:-translate-y-1 md:hover:-translate-y-2 h-full"
            >
              <CardHeader className="relative overflow-hidden p-4 md:p-6">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                ></div>
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}
                >
                  <service.icon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
                <CardTitle className="text-lg md:text-xl group-hover:text-blue-600 transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm md:text-base">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <ul className="space-y-2 mb-4 md:mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r ${service.gradient} rounded-full mr-2 md:mr-3 flex-shrink-0`}
                      ></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-blue-50 transition-colors text-sm md:text-base"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
          >
            <Link href="/services">View All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
