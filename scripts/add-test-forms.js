const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestForms() {
    try {
        console.log('🌱 Adding test form submissions...')

        const testForms = [
            {
                type: 'CONTACT',
                customerInfo: {
                    name: 'John Smith',
                    email: 'john.smith@email.com',
                    phone: '+263 77 123 4567'
                },
                formData: {
                    message: 'I need a quote for electrical work in my new house. Looking for complete wiring installation.',
                    service: 'electrical',
                    timeline: 'next-month',
                    emergency: false
                },
                priority: 'MEDIUM',
                status: 'NEW'
            },
            {
                type: 'SERVICE_INQUIRY',
                customerInfo: {
                    name: 'Sarah Johnson',
                    email: 'sarah.johnson@email.com',
                    phone: '+263 77 234 5678',
                    company: 'Johnson Enterprises'
                },
                formData: {
                    message: 'Our office AC system is not working properly. Need urgent repair service.',
                    service: 'hvac',
                    timeline: 'this-week',
                    emergency: true,
                    propertyType: 'commercial'
                },
                priority: 'HIGH',
                status: 'NEW'
            },
            {
                type: 'QUOTE_REQUEST',
                customerInfo: {
                    name: 'David Moyo',
                    email: 'david.moyo@email.com',
                    phone: '+263 77 345 6789'
                },
                formData: {
                    message: 'Looking for a quote for cold room installation for my restaurant.',
                    service: 'refrigeration',
                    timeline: 'flexible',
                    emergency: false,
                    propertyType: 'commercial',
                    budget: '50000-100000'
                },
                priority: 'MEDIUM',
                status: 'IN_PROGRESS'
            },
            {
                type: 'CONTACT',
                customerInfo: {
                    name: 'Grace Sibanda',
                    email: 'grace.sibanda@email.com',
                    phone: '+263 77 456 7890'
                },
                formData: {
                    message: 'Need maintenance service for our HVAC system. Annual checkup required.',
                    service: 'hvac',
                    timeline: 'next-week',
                    emergency: false
                },
                priority: 'LOW',
                status: 'RESPONDED'
            },
            {
                type: 'SERVICE_INQUIRY',
                customerInfo: {
                    name: 'Michael Chen',
                    email: 'michael.chen@email.com',
                    phone: '+263 77 567 8901'
                },
                formData: {
                    message: 'Electrical panel upgrade needed for our factory. Industrial grade equipment.',
                    service: 'electrical',
                    timeline: 'next-month',
                    emergency: false,
                    propertyType: 'industrial'
                },
                priority: 'HIGH',
                status: 'NEW'
            }
        ]

        for (const formData of testForms) {
            await prisma.formSubmission.create({
                data: {
                    type: formData.type,
                    customerInfo: formData.customerInfo,
                    formData: formData.formData,
                    priority: formData.priority,
                    status: formData.status,
                    tags: [formData.formData.service],
                    notes: formData.status === 'RESPONDED' ? 'Initial response sent via email' : null
                }
            })
        }

        console.log('✅ Test form submissions added successfully!')
        console.log(`📊 Added ${testForms.length} test forms`)

    } catch (error) {
        console.error('❌ Error adding test forms:', error)
    } finally {
        await prisma.$disconnect()
    }
}

addTestForms()
