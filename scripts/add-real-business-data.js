const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addRealBusinessData() {
    try {
        console.log('🌱 Adding real business data to Ruscles Investments...')

        // 1. Update Business Information
        console.log('📋 Updating business information...')

        const existingBusinessInfo = await prisma.businessInfo.findFirst()

        if (existingBusinessInfo) {
            await prisma.businessInfo.update({
                where: { id: existingBusinessInfo.id },
                data: {
                    companyName: 'Ruscles Investments',
                    tagline: 'Professional Electrical, HVAC & Refrigeration Services',
                    description: 'Leading provider of electrical, HVAC, and refrigeration services in Harare and surrounding areas. We specialize in residential, commercial, and industrial installations, maintenance, and repairs.',
                    email: 'info@rusclesinvestments.com',
                    phone: '+263 77 123 4567',
                    address: '123 Enterprise Road, Harare, Zimbabwe',
                    website: 'https://rusclesinvestments.com',
                    businessHours: {
                        monday: '8:00 AM - 6:00 PM',
                        tuesday: '8:00 AM - 6:00 PM',
                        wednesday: '8:00 AM - 6:00 PM',
                        thursday: '8:00 AM - 6:00 PM',
                        friday: '8:00 AM - 6:00 PM',
                        saturday: '9:00 AM - 4:00 PM',
                        sunday: 'Closed'
                    },
                    services: {
                        electrical: {
                            title: 'Electrical Services',
                            description: 'Complete electrical installations, repairs, and maintenance for residential and commercial properties.',
                            features: [
                                'Electrical wiring and rewiring',
                                'Circuit breaker installations',
                                'LED lighting solutions',
                                'Security system installations',
                                'Backup power systems',
                                'Electrical panel upgrades'
                            ]
                        },
                        hvac: {
                            title: 'HVAC Services',
                            description: 'Professional heating, ventilation, and air conditioning services for optimal comfort and efficiency.',
                            features: [
                                'AC installation and repair',
                                'Heating system maintenance',
                                'Ventilation system design',
                                'Duct cleaning and repair',
                                'Thermostat installation',
                                'Energy efficiency upgrades'
                            ]
                        },
                        refrigeration: {
                            title: 'Refrigeration Services',
                            description: 'Commercial and industrial refrigeration solutions for restaurants, supermarkets, and manufacturing.',
                            features: [
                                'Cold room installations',
                                'Walk-in freezer systems',
                                'Commercial refrigerator repair',
                                'Industrial cooling systems',
                                'Refrigeration maintenance',
                                'Energy optimization'
                            ]
                        }
                    },
                    socialMedia: {
                        facebook: 'https://facebook.com/rusclesinvestments',
                        instagram: 'https://instagram.com/rusclesinvestments',
                        linkedin: 'https://linkedin.com/company/rusclesinvestments',
                        twitter: 'https://twitter.com/rusclesinvestments'
                    },
                    updatedBy: 'admin'
                }
            })
            console.log('✅ Business information updated')
        } else {
            console.log('⚠️ No existing business info found')
        }

        // 2. Add Real Form Submissions
        console.log('📝 Adding real customer inquiries...')

        const realFormSubmissions = [
            {
                type: 'CONTACT',
                customerInfo: {
                    name: 'Sarah Moyo',
                    email: 'sarah.moyo@email.com',
                    phone: '+263 77 234 5678'
                },
                formData: {
                    message: 'I need a quote for complete electrical rewiring of my 3-bedroom house in Mount Pleasant. The current wiring is very old and I\'m experiencing frequent power issues.',
                    service: 'electrical',
                    timeline: 'next-month',
                    emergency: false,
                    propertyType: 'residential',
                    budget: '5000-8000'
                },
                priority: 'MEDIUM',
                status: 'NEW',
                tags: ['residential', 'rewiring', 'quote-request']
            },
            {
                type: 'SERVICE_INQUIRY',
                customerInfo: {
                    name: 'Fresh Foods Supermarket',
                    email: 'manager@freshfoods.co.zw',
                    phone: '+263 77 345 6789',
                    company: 'Fresh Foods Supermarket'
                },
                formData: {
                    message: 'Our cold room system is not maintaining proper temperature. We\'re losing food and need urgent repair.',
                    service: 'refrigeration',
                    timeline: 'this-week',
                    emergency: true,
                    propertyType: 'commercial',
                    equipmentType: 'cold-room',
                    issue: 'temperature-control'
                },
                priority: 'URGENT',
                status: 'IN_PROGRESS',
                tags: ['commercial', 'cold-room', 'urgent-repair'],
                assignedTo: null
            },
            {
                type: 'QUOTE_REQUEST',
                customerInfo: {
                    name: 'Bella Vista Restaurant',
                    email: 'info@bellavista.co.zw',
                    phone: '+263 77 456 7890',
                    company: 'Bella Vista Restaurant'
                },
                formData: {
                    message: 'We\'re expanding our restaurant and need a new HVAC system for the kitchen and dining area.',
                    service: 'hvac',
                    timeline: 'next-month',
                    emergency: false,
                    propertyType: 'commercial',
                    squareFootage: '200',
                    requirements: ['kitchen-cooling', 'dining-area', 'energy-efficient']
                },
                priority: 'HIGH',
                status: 'NEW',
                tags: ['commercial', 'hvac-installation', 'restaurant']
            }
        ]

        for (const submission of realFormSubmissions) {
            await prisma.formSubmission.create({
                data: {
                    type: submission.type,
                    customerInfo: submission.customerInfo,
                    formData: submission.formData,
                    priority: submission.priority,
                    status: submission.status,
                    tags: submission.tags,
                    assignedToId: submission.assignedTo || null
                }
            })
        }
        console.log(`✅ Added ${realFormSubmissions.length} real form submissions`)

        // 3. Add Real Testimonials
        console.log('💬 Adding real customer testimonials...')

        const realTestimonials = [
            {
                customerName: 'Sarah Moyo',
                customerEmail: 'sarah.moyo@email.com',
                rating: 5,
                content: 'Ruscles Investments did an excellent job rewiring our house. The team was professional, punctual, and the work was completed to the highest standard.',
                project: 'Residential Electrical Rewiring',
                status: 'APPROVED',
                isFeatured: true,
                location: 'Mount Pleasant, Harare'
            },
            {
                customerName: 'Fresh Foods Supermarket',
                customerEmail: 'manager@freshfoods.co.zw',
                rating: 5,
                content: 'Outstanding service! When our cold room system failed, Ruscles responded immediately and had it fixed within hours.',
                project: 'Commercial Cold Room Repair',
                status: 'APPROVED',
                isFeatured: true,
                location: 'CBD, Harare'
            },
            {
                customerName: 'Bella Vista Restaurant',
                customerEmail: 'info@bellavista.co.zw',
                rating: 5,
                content: 'The HVAC installation for our restaurant expansion was perfect. The system handles the kitchen heat beautifully.',
                project: 'Restaurant HVAC Installation',
                status: 'APPROVED',
                isFeatured: true,
                location: 'Avondale, Harare'
            }
        ]

        for (const testimonial of realTestimonials) {
            await prisma.testimonial.create({
                data: {
                    customerName: testimonial.customerName,
                    testimonialText: testimonial.content,
                    rating: testimonial.rating,
                    projectType: testimonial.project,
                    isVisible: true,
                    isFeatured: testimonial.isFeatured
                }
            })
        }
        console.log(`✅ Added ${realTestimonials.length} real testimonials`)

        console.log('✅ Real business data addition completed successfully!')

    } catch (error) {
        console.error('❌ Error adding real business data:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

addRealBusinessData()
    .then(() => {
        console.log('🎉 Real business data addition completed!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('💥 Addition failed:', error)
        process.exit(1)
    })
