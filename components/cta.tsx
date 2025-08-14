import { Button } from "@/components/ui/button"
import { Phone, Mail } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Ready to Get Started?</h2>
        <p className="text-lg md:text-xl mb-6 md:mb-8 text-blue-100 max-w-2xl mx-auto px-4">
          Contact us today for a free consultation and quote. Our team is ready to help with all your electrical and
          HVAC needs.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
          <Button
            size="lg"
            asChild
            className="bg-orange-500 hover:bg-orange-600 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
          >
            <Link href="/contact">Get Free Quote</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-white border-white hover:bg-white hover:text-blue-900 bg-transparent h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
          >
            <Link href="tel:+263732591600">
              <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Call Now
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center text-blue-200 text-sm md:text-base">
          <div className="flex items-center">
            <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            <span>+263 732 591 600</span>
          </div>
          <div className="flex items-center">
            <Mail className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="break-all sm:break-normal">ruscleinvestments@gmail.com</span>
          </div>
        </div>
      </div>
    </section>
  )
}
