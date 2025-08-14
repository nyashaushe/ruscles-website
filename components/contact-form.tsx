"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { submitContactForm } from "@/actions/contact"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      const result = await submitContactForm(formData)
      if (result.success) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6 md:py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-green-800 mb-2">Thank You!</h3>
          <p className="text-green-700 text-sm md:text-base">
            Your message has been sent successfully. We'll get back to you within 24 hours with a detailed quote.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm md:text-base">
            First Name *
          </Label>
          <Input id="firstName" name="firstName" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm md:text-base">
            Last Name *
          </Label>
          <Input id="lastName" name="lastName" required className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-sm md:text-base">
            Email *
          </Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone" className="text-sm md:text-base">
            Phone Number *
          </Label>
          <Input id="phone" name="phone" type="tel" required className="mt-1" />
        </div>
      </div>

      <div>
        <Label htmlFor="service" className="text-sm md:text-base">
          Service Needed *
        </Label>
        <Select name="service" required>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electrical-wiring">Electrical Wiring</SelectItem>
            <SelectItem value="electrical-repairs">Electrical Repairs</SelectItem>
            <SelectItem value="air-conditioning">Air Conditioning</SelectItem>
            <SelectItem value="cold-rooms">Cold Rooms</SelectItem>
            <SelectItem value="refrigeration">Refrigeration (Fridges/Freezers)</SelectItem>
            <SelectItem value="maintenance">Maintenance Service</SelectItem>
            <SelectItem value="emergency">Emergency Service</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="propertyType" className="text-sm md:text-base">
          Property Type
        </Label>
        <Select name="propertyType">
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="residential">Residential</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="industrial">Industrial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="message" className="text-sm md:text-base">
          Project Description *
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Please describe your project or service needs in detail..."
          className="min-h-[100px] md:min-h-[120px] mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="timeline" className="text-sm md:text-base">
          Preferred Timeline
        </Label>
        <Select name="timeline">
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="When do you need this completed?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asap">As soon as possible</SelectItem>
            <SelectItem value="this-week">This week</SelectItem>
            <SelectItem value="next-week">Next week</SelectItem>
            <SelectItem value="this-month">This month</SelectItem>
            <SelectItem value="flexible">I'm flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox id="emergency" name="emergency" className="mt-1" />
        <Label htmlFor="emergency" className="text-xs md:text-sm leading-relaxed">
          This is an emergency situation requiring immediate attention
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox id="consent" name="consent" required className="mt-1" />
        <Label htmlFor="consent" className="text-xs md:text-sm leading-relaxed">
          I consent to being contacted about this inquiry *
        </Label>
      </div>

      <Button type="submit" className="w-full h-12 md:h-14 text-base md:text-lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message & Get Quote"}
      </Button>

      <p className="text-xs md:text-sm text-gray-500 text-center leading-relaxed">
        * Required fields. We'll respond within 24 hours with a detailed quote.
      </p>
    </form>
  )
}
