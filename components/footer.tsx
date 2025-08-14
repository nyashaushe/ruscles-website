import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <Image
                  src="/images/modern-logo.png"
                  alt="Ruscles Investments"
                  width={60}
                  height={45}
                  className="h-10 md:h-12 w-auto drop-shadow-lg"
                />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Ruscles Investments</h3>
                <p className="text-xs md:text-sm text-orange-400 font-semibold">SATISFACTION GUARANTEED</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional electrical and HVAC services with years of experience. We provide reliable solutions for all
              your electrical and cooling needs.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Electrical Wiring
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Electrical Repairs
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Air Conditioning
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Cold Rooms
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Refrigeration
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start space-x-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div>+263 732 591 600</div>
                  <div>+263 783 591 600</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="break-all">ruscleinvestments@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Mon-Fri: 8AM-6PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-400">
          <p>&copy; 2024 Ruscles Investments. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
