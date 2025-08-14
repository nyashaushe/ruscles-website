import { ModernHero } from "@/components/modern-hero"
import { ModernServices } from "@/components/modern-services"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Testimonials } from "@/components/testimonials"
import { CTA } from "@/components/cta"

export default function HomePage() {
  return (
    <>
      <ModernHero />
      <ModernServices />
      <WhyChooseUs />
      <Testimonials />
      <CTA />
    </>
  )
}
