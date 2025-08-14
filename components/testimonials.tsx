import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "John Mukamuri",
      role: "Restaurant Owner",
      content:
        "Excellent service! They installed our cold room system perfectly and provided great after-sales support. Highly recommended!",
      rating: 5,
    },
    {
      name: "Sarah Chikwanha",
      role: "Homeowner",
      content:
        "Professional electrical work done on time and within budget. The team was courteous and cleaned up after themselves.",
      rating: 5,
    },
    {
      name: "Michael Tendai",
      role: "Office Manager",
      content:
        "Quick response for our AC emergency repair. They had us back up and running the same day. Great service!",
      rating: 5,
    },
  ]

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow h-full">
              <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                <div className="flex mb-3 md:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 md:mb-6 italic text-sm md:text-base leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm md:text-base">{testimonial.name}</p>
                  <p className="text-xs md:text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
