const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedFormData() {
  console.log('🌱 Seeding form submissions...')

  try {
    // Create sample form submissions
    const formSubmissions = [
      {
        type: 'CONTACT',
        status: 'NEW',
        priority: 'MEDIUM',
        customerInfo: JSON.stringify({
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567',
          company: 'Smith Enterprises',
          subject: 'Investment Inquiry',
          message: 'I am interested in learning more about your investment services and portfolio options. Could you please provide more information about your current offerings?'
        }),
        formData: JSON.stringify({
          serviceType: 'investment_consultation',
          investmentAmount: 50000,
          timeframe: '6_months'
        }),
        tags: JSON.stringify(['investment', 'consultation']),
        notes: ''
      },
      {
        type: 'SERVICE_INQUIRY',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        customerInfo: JSON.stringify({
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1 (555) 987-6543',
          company: null,
          subject: 'Portfolio Management Services',
          message: 'I need professional portfolio management services for my retirement account. I have approximately $250,000 to invest and am looking for a conservative approach.'
        }),
        formData: JSON.stringify({
          serviceType: 'portfolio_management',
          investmentAmount: 250000,
          riskTolerance: 'conservative'
        }),
        tags: JSON.stringify(['portfolio', 'retirement']),
        notes: 'Follow up scheduled for Friday'
      },
      {
        type: 'QUOTE_REQUEST',
        status: 'NEW',
        priority: 'URGENT',
        customerInfo: JSON.stringify({
          name: 'Robert Davis',
          email: 'robert.davis@company.com',
          phone: '+1 (555) 456-7890',
          company: 'Davis Holdings',
          subject: 'Urgent Investment Opportunity',
          message: 'I have received an urgent investment opportunity and need immediate consultation. Please contact me as soon as possible.'
        }),
        formData: JSON.stringify({
          serviceType: 'urgent_consultation',
          investmentAmount: 1000000,
          timeframe: 'immediate'
        }),
        tags: JSON.stringify(['urgent', 'large_investment']),
        notes: ''
      },
      {
        type: 'CONTACT',
        status: 'COMPLETED',
        priority: 'LOW',
        customerInfo: JSON.stringify({
          name: 'Emily Chen',
          email: 'emily.chen@gmail.com',
          phone: null,
          company: null,
          subject: 'Thank you for your services',
          message: 'I wanted to thank your team for the excellent service provided during my recent investment process. Everything went smoothly.'
        }),
        formData: JSON.stringify({
          serviceType: 'feedback',
          satisfaction: 'excellent'
        }),
        tags: JSON.stringify(['feedback', 'satisfied_customer']),
        notes: 'Responded with thank you email'
      },
      {
        type: 'SERVICE_INQUIRY',
        status: 'RESPONDED',
        priority: 'MEDIUM',
        customerInfo: JSON.stringify({
          name: 'Michael Brown',
          email: 'michael.brown@realestate.com',
          phone: '+1 (555) 234-5678',
          company: 'Brown Real Estate',
          subject: 'Real Estate Investment Options',
          message: 'I am interested in diversifying my portfolio with real estate investments. What options do you provide for real estate investment?'
        }),
        formData: JSON.stringify({
          serviceType: 'real_estate_investment',
          investmentAmount: 150000,
          propertyType: 'commercial'
        }),
        tags: JSON.stringify(['real_estate', 'diversification']),
        notes: 'Sent detailed real estate investment brochure'
      }
    ]

    // Insert form submissions
    for (const submission of formSubmissions) {
      await prisma.formSubmission.create({
        data: {
          ...submission,
          submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        }
      })
    }

    console.log(`✅ Created ${formSubmissions.length} form submissions`)
    console.log('🎉 Form data seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding form data:', error)
    throw error
  }
}

async function main() {
  await seedFormData()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

module.exports = { seedFormData }