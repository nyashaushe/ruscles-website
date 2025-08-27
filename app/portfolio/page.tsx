import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Portfolio & Case Studies - Ruscles Investments",
  description:
    "View our portfolio of successful electrical and HVAC projects. Case studies showcasing our expertise in residential and commercial installations.",
}

export default function PortfolioPage() {
  const projects = [
    {
      title: "Commercial Cold Room Installation",
      client: "Fresh Foods Supermarket",
      location: "Harare CBD",
      date: "March 2024",
      category: "Commercial Refrigeration",
      description:
        "Complete cold room installation for a major supermarket chain including temperature control systems, insulation, and monitoring equipment.",
      challenges: [
        "24-hour operation requirement",
        "Minimal business disruption",
        "Complex temperature zones",
        "Integration with existing systems",
      ],
      solutions: [
        "Phased installation approach",
        "Night and weekend work schedule",
        "Custom temperature control zones",
        "Seamless system integration",
      ],
      results: [
        "30% improvement in energy efficiency",
        "Zero downtime during installation",
        "Reduced food spoilage by 40%",
        "Client satisfaction: 100%",
      ],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', // Cold Room Installation
    },
    {
      title: "Residential Electrical Rewiring",
      client: "The Johnson Family",
      location: "Borrowdale",
      date: "February 2024",
      category: "Residential Electrical",
      description:
        "Complete home rewiring project for a 4-bedroom house including panel upgrade, new circuits, and smart home integration.",
      challenges: [
        "Old wiring system",
        "Family living on-site",
        "Smart home integration",
        "Code compliance requirements",
      ],
      solutions: [
        "Room-by-room rewiring approach",
        "Temporary power solutions",
        "Modern smart-ready infrastructure",
        "Full code compliance certification",
      ],
      results: [
        "100% code compliant installation",
        "Smart home ready infrastructure",
        "Improved electrical safety",
        "Increased property value by 15%",
      ],
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80', // Electrical Rewiring
    },
    {
      title: "Restaurant HVAC System Upgrade",
      client: "Bella Vista Restaurant",
      location: "Avondale",
      date: "January 2024",
      category: "Commercial HVAC",
      description:
        "Complete HVAC system upgrade for a busy restaurant including kitchen ventilation, dining area climate control, and energy-efficient units.",
      challenges: [
        "High-heat kitchen environment",
        "Customer comfort requirements",
        "Energy efficiency goals",
        "Noise level restrictions",
      ],
      solutions: [
        "Specialized kitchen ventilation system",
        "Zone-based climate control",
        "Energy-efficient equipment selection",
        "Sound-dampening installation",
      ],
      results: [
        "40% reduction in energy costs",
        "Improved kitchen working conditions",
        "Enhanced customer comfort",
        "Noise levels reduced by 50%",
      ],
    image: 'https://images.unsplash.com/photo-1581091012184-7e0cdfbb6795?auto=format&fit=crop&w=800&q=80', // Restaurant HVAC
    },
    {
      title: "Office Building Electrical Maintenance",
      client: "Corporate Plaza",
      location: "CBD",
      date: "Ongoing since 2023",
      category: "Maintenance Contract",
      description:
        "Comprehensive electrical maintenance contract for a 10-story office building including preventive maintenance, emergency repairs, and system upgrades.",
      challenges: [
        "24/7 building operations",
        "Multiple tenant requirements",
        "Aging electrical infrastructure",
        "Emergency response needs",
      ],
      solutions: [
        "Scheduled maintenance program",
        "Dedicated emergency response team",
        "Phased infrastructure upgrades",
        "Tenant-specific solutions",
      ],
      results: [
        "99.9% system uptime",
        "50% reduction in emergency calls",
        "Improved tenant satisfaction",
        "Extended equipment lifespan",
      ],
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80', // Electrical Maintenance
    },
    {
      title: "Industrial Freezer Installation",
      client: "Ice Cream Manufacturing Co.",
      location: "Industrial Area",
      date: "December 2023",
      category: "Industrial Refrigeration",
      description:
        "Large-scale industrial freezer installation for ice cream production including blast freezing capabilities and automated temperature control.",
      challenges: [
        "Extreme temperature requirements (-40°C)",
        "Production schedule constraints",
        "Food safety compliance",
        "Energy efficiency requirements",
      ],
      solutions: [
        "High-efficiency freezing systems",
        "Weekend installation schedule",
        "HACCP compliant installation",
        "Advanced energy management systems",
      ],
      results: [
        "Achieved -40°C target temperature",
        "25% improvement in freezing efficiency",
        "Full food safety compliance",
        "ROI achieved within 18 months",
      ],
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80', // Industrial Freezer
    },
    {
      title: "Residential AC Installation",
      client: "Multiple Homeowners",
      location: "Mount Pleasant",
      date: "November 2023",
      category: "Residential HVAC",
      description:
        "Multiple residential air conditioning installations in a new housing development including energy-efficient units and smart thermostats.",
      challenges: [
        "New construction coordination",
        "Multiple unit installations",
        "Energy efficiency requirements",
        "Coordinated scheduling",
      ],
      solutions: [
        "Streamlined installation process",
        "Bulk equipment procurement",
        "High-efficiency unit selection",
        "Project management coordination",
      ],
      results: [
        "15 homes completed on schedule",
        "Energy Star certified installations",
        "100% customer satisfaction",
        "Ongoing maintenance contracts secured",
      ],
    image: 'https://images.unsplash.com/photo-1508873699372-7aeab60b44c1?auto=format&fit=crop&w=800&q=80', // AC Installation
    },
  ]

  const stats = [
    { number: "500+", label: "Projects Completed" },
    { number: "100%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Emergency Support" },
    { number: "10+", label: "Years Experience" },
  ]

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Portfolio</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our successful projects and case studies showcasing our expertise in electrical and HVAC services
            across residential, commercial, and industrial sectors.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="space-y-12">
          {projects.map((project, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <CardDescription className="text-base">{project.description}</CardDescription>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {project.client}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {project.date}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Challenges</h4>
                        <ul className="space-y-1">
                          {project.challenges.map((challenge, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Solutions</h4>
                        <ul className="space-y-1">
                          {project.solutions.map((solution, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              {solution}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Results</h4>
                        <ul className="space-y-1">
                          {project.results.map((result, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="mt-20 bg-blue-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <p className="text-gray-600 italic mb-4">
                "Ruscles Investments transformed our restaurant's HVAC system. The improvement in kitchen conditions and
                energy savings exceeded our expectations. Professional service from start to finish."
              </p>
              <div className="font-semibold">- Maria Santos, Bella Vista Restaurant</div>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <p className="text-gray-600 italic mb-4">
                "The cold room installation was completed flawlessly with minimal disruption to our operations. The
                energy efficiency improvements have significantly reduced our operating costs."
              </p>
              <div className="font-semibold">- David Mukamuri, Fresh Foods Supermarket</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Let us help you achieve similar results with our professional electrical and HVAC services.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">Get Your Free Quote</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
