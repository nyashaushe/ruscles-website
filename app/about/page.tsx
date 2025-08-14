import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Award, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us - Ruscles Investments",
  description:
    "Learn about Ruscles Investments, our history, team, and commitment to providing exceptional electrical and HVAC services.",
}

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To provide reliable, professional electrical and HVAC services that exceed customer expectations while maintaining the highest safety standards.",
    },
    {
      icon: Award,
      title: "Quality First",
      description:
        "We use only the best materials and proven techniques to ensure every project meets our high standards of quality and durability.",
    },
    {
      icon: Users,
      title: "Customer Focus",
      description:
        "Our customers are at the heart of everything we do. We listen, understand, and deliver solutions that meet their specific needs.",
    },
    {
      icon: Clock,
      title: "Reliability",
      description:
        "We show up on time, complete projects as promised, and provide ongoing support to ensure customer satisfaction.",
    },
  ]

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About Ruscles Investments</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for professional electrical and HVAC services. We've been serving our community with
            dedication, expertise, and a commitment to excellence.
          </p>
        </div>

        {/* Company Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Ruscles Investments was founded with a simple mission: to provide reliable, professional electrical and
                HVAC services that our customers can depend on. What started as a small local business has grown into a
                trusted name in the industry.
              </p>
              <p>
                Our team of experienced professionals brings years of expertise to every project, whether it's a simple
                electrical repair, a complex wiring installation, or a comprehensive HVAC system setup. We pride
                ourselves on our attention to detail, commitment to safety, and dedication to customer satisfaction.
              </p>
              <p>
                Today, we continue to serve residential and commercial clients with the same values that founded our
                company: integrity, quality workmanship, and exceptional service.
              </p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Licensed and insured professionals</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">24/7 emergency service availability</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Satisfaction guaranteed on all work</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Competitive pricing and free estimates</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-600">Years of experience in the industry</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-md">
                <CardContent className="pt-8">
                  <value.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Professional Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Our skilled technicians and support staff are the backbone of our success. Each team member brings
            expertise, professionalism, and a commitment to excellence to every project.
          </p>

          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Team Qualifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Electrical Team</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Licensed electricians</li>
                  <li>• Safety certified</li>
                  <li>• Ongoing training</li>
                  <li>• Code compliance experts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">HVAC Team</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• HVAC certified technicians</li>
                  <li>• Refrigeration specialists</li>
                  <li>• Energy efficiency experts</li>
                  <li>• Commercial experience</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Support Team</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Customer service focused</li>
                  <li>• Project coordination</li>
                  <li>• Quality assurance</li>
                  <li>• Emergency dispatch</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
