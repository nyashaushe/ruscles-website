import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us - Ruscles Investments",
  description:
    "Get in touch with Ruscles Investments for professional electrical and HVAC services. Free quotes and 24/7 emergency service available.",
}

export default function ContactPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to get started? Contact us today for a free consultation and quote. We're here to help with all your
            electrical and HVAC needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-blue-600" />
                    Phone Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-600">Primary: +263 732 591 600</p>
                    <p className="text-gray-600">Secondary: +263 783 591 600</p>
                    <p className="text-sm text-gray-500 mt-2">Available 24/7 for emergencies</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-blue-600" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">ruscleinvestments@gmail.com</p>
                  <p className="text-sm text-gray-500 mt-2">We respond within 24 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-600" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-gray-600">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p>Sunday: Emergency calls only</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We serve residential and commercial clients throughout the region. Contact us to confirm service
                    availability in your area.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Get a Free Quote</CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you with a detailed quote for your project.
                </p>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-16 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-red-800 mb-2">Emergency Service Available</h3>
          <p className="text-red-700 mb-4">
            For urgent electrical or HVAC emergencies, call us immediately at +263 732 591 600. We provide 24/7
            emergency response for critical issues.
          </p>
          <p className="text-sm text-red-600">
            Emergency services may include additional charges. Standard rates apply during business hours.
          </p>
        </div>
      </div>
    </div>
  )
}
