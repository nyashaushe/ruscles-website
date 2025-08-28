"use server"

import { prisma } from '@/lib/db'

export async function submitContactForm(formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const service = formData.get("service") as string
    const propertyType = formData.get("propertyType") as string
    const message = formData.get("message") as string
    const timeline = formData.get("timeline") as string
    const emergency = formData.get("emergency") === "on"
    const consent = formData.get("consent") === "on"

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !service || !message || !consent) {
      throw new Error("Missing required fields")
    }

    // Prepare the form submission data
    const customerInfo = {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      phone,
    }

    const formDataPayload = {
      service,
      propertyType,
      message,
      timeline,
      emergency,
    }


    // Submit directly to database
    const submission = await prisma.formSubmission.create({
      data: {
        type: 'CONTACT',
        customerInfo: JSON.stringify(customerInfo),
        formData: JSON.stringify(formDataPayload),
        priority: emergency ? 'URGENT' : 'MEDIUM',
        status: 'NEW',
        tags: '[]'
      }
    })



    return {
      success: true,
      message: "Thank you for your inquiry. We will contact you within 24 hours.",
    }
  } catch (error) {
    console.error("Form submission error:", error)
    return {
      success: false,
      message: "There was an error submitting your form. Please try again.",
    }
  }
}
