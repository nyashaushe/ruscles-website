"use server"

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


    // Submit to the forms API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'CONTACT',
        customerInfo,
        formData: formDataPayload,
        priority: emergency ? 'URGENT' : 'MEDIUM',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit form')
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to submit form')
    }

    // Send contact email via EmailJS (do not block success)
    try {
      const { sendContactEmail } = await import('@/lib/emailjs');
      await sendContactEmail({
        firstName,
        lastName,
        email,
        phone,
        service,
        propertyType,
        message,
        timeline,
        emergency,
      });
    } catch (emailError) {
      console.error('EmailJS error:', emailError);
      // Do not block user success if email fails
    }

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
