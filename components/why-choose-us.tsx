import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Clock, Award, Wrench, Phone } from "lucide-react"

export function WhyChooseUs() {
  const reasons = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "Fully licensed professionals with comprehensive insurance coverage for your peace of mind.",
    },
    {
      icon: Users,
      title: "Experienced Team",
      description: "Years of experience in electrical and HVAC services with a proven track record.",
    },
    {
      icon: Clock,
      title: "24/7 Emergency Service",
      description: "Round-the-clock emergency services for urgent electrical and HVAC issues.",
    },
    {
      icon: Award,
      title: "Satisfaction Guaranteed",
      description: "We stand behind our work with a satisfaction guarantee on all services.",
    },
    {
      icon: Wrench,
      title: "Quality Workmanship",
      description: "High-quality materials and professional installation techniques every time.",
    },
    {
      icon: Phone,
      title: "Responsive Support",
      description: "Quick response times and excellent customer service for all your needs.",
    },
  ]

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Why Choose Ruscle Investments?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            We're committed to providing exceptional service and building long-term relationships with our clients
            through quality work and reliable support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reasons.map((reason, index) => (
            <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow h-full">
              <CardContent className="pt-6 md:pt-8 p-4 md:p-6">
                <reason.icon className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-blue-600 mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{reason.title}</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
