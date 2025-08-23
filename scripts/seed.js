const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        // Create default admin user
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@ruscles.com' },
            update: {},
            create: {
                email: 'admin@ruscles.com',
                name: 'Admin User',
                role: 'ADMIN',
                isActive: true,
            },
        });

        console.log('✅ Admin user created:', adminUser.email);

        // Create default business info
        const businessInfo = await prisma.businessInfo.upsert({
            where: { id: 'default' },
            update: {},
            create: {
                id: 'default',
                companyName: 'Ruscles Investments',
                tagline: 'Your Trusted Service Partner',
                description: 'Professional electrical, HVAC, and refrigeration services for residential, commercial, and industrial clients in Zimbabwe.',
                email: 'info@rusclesinvestments.com',
                phone: '+263 732 591 600',
                address: '112 2nd Street Parktown Waterfalls Harare',
                website: 'https://rusclesinvestments.com',
                socialMedia: {
                    facebook: 'https://facebook.com/rusclesinvestments',
                    twitter: 'https://twitter.com/ruscles',
                    linkedin: 'https://linkedin.com/company/rusclesinvestments',
                },
                businessHours: {
                    weekdays: '8:00 AM - 6:00 PM',
                    weekends: '9:00 AM - 4:00 PM',
                    emergency: '24/7 Available',
                },
                services: {
                    electrical: 'Professional electrical installations, maintenance, and repairs',
                    hvac: 'Heating, ventilation, and air conditioning services',
                    refrigeration: 'Commercial and industrial refrigeration solutions',
                },
                updatedBy: adminUser.id,
            },
        });

        console.log('✅ Business info created');

        // Create default settings
        const defaultSettings = [
            { key: 'site_title', value: 'Ruscles Investments - Professional Services', description: 'Website title' },
            { key: 'contact_email', value: 'info@rusclesinvestments.com', description: 'Primary contact email' },
            { key: 'business_hours', value: 'Monday-Friday: 8AM-6PM, Saturday: 9AM-4PM', description: 'Business hours' },
            { key: 'emergency_contact', value: '+263 732 591 600', description: 'Emergency contact number' },
            { key: 'timezone', value: 'Africa/Harare', description: 'Business timezone' },
            { key: 'currency', value: 'USD', description: 'Default currency' },
        ];

        for (const setting of defaultSettings) {
            await prisma.settings.upsert({
                where: { key: setting.key },
                update: { value: setting.value },
                create: {
                    ...setting,
                    isPublic: true,
                    updatedBy: adminUser.id,
                },
            });
        }

        console.log('✅ Default settings created');

        // Create sample testimonials
        const testimonials = [
            {
                customerName: 'John Smith',
                customerTitle: 'Property Manager',
                customerCompany: 'Smith Properties Ltd',
                testimonialText: 'Ruscles provided excellent electrical services for our commercial building. Professional, reliable, and completed the work on time.',
                rating: 5,
                projectType: 'Commercial Electrical',
                isVisible: true,
                isFeatured: true,
                displayOrder: 1,
            },
            {
                customerName: 'Sarah Johnson',
                customerTitle: 'Homeowner',
                customerCompany: '',
                testimonialText: 'Great HVAC installation service. The team was knowledgeable and kept our home clean throughout the process.',
                rating: 5,
                projectType: 'Residential HVAC',
                isVisible: true,
                isFeatured: true,
                displayOrder: 2,
            },
            {
                customerName: 'Mike Chen',
                customerTitle: 'Operations Director',
                customerCompany: 'Chen Manufacturing',
                testimonialText: 'Outstanding refrigeration system maintenance. They helped us avoid costly downtime with their preventive maintenance program.',
                rating: 5,
                projectType: 'Industrial Refrigeration',
                isVisible: true,
                isFeatured: false,
                displayOrder: 3,
            },
        ];

        for (const testimonial of testimonials) {
            await prisma.testimonial.create({
                data: testimonial,
            });
        }

        console.log('✅ Sample testimonials created');

        // Create sample portfolio items
        const portfolioItems = [
            {
                title: 'Commercial Office Complex Electrical Upgrade',
                description: 'Complete electrical system upgrade for a 5-story office building, including LED lighting, security systems, and backup power solutions.',
                serviceCategory: 'ELECTRICAL',
                images: ['/images/portfolio/office-electrical-1.jpg', '/images/portfolio/office-electrical-2.jpg'],
                thumbnailImage: '/images/portfolio/office-electrical-thumb.jpg',
                completionDate: new Date('2024-06-15'),
                clientName: 'Downtown Business Center',
                projectValue: 75000,
                location: 'Harare CBD',
                tags: ['commercial', 'electrical', 'upgrade', 'led-lighting'],
                isVisible: true,
                isFeatured: true,
                displayOrder: 1,
            },
            {
                title: 'Residential HVAC Installation',
                description: 'Modern HVAC system installation for a luxury residential home, featuring smart thermostats and energy-efficient units.',
                serviceCategory: 'HVAC',
                images: ['/images/portfolio/residential-hvac-1.jpg', '/images/portfolio/residential-hvac-2.jpg'],
                thumbnailImage: '/images/portfolio/residential-hvac-thumb.jpg',
                completionDate: new Date('2024-05-20'),
                clientName: 'Private Residence',
                projectValue: 25000,
                location: 'Borrowdale, Harare',
                tags: ['residential', 'hvac', 'smart-thermostat', 'energy-efficient'],
                isVisible: true,
                isFeatured: true,
                displayOrder: 2,
            },
            {
                title: 'Industrial Refrigeration System',
                description: 'Custom refrigeration system design and installation for a food processing facility, ensuring optimal temperature control.',
                serviceCategory: 'REFRIGERATION',
                images: ['/images/portfolio/industrial-refrigeration-1.jpg', '/images/portfolio/industrial-refrigeration-2.jpg'],
                thumbnailImage: '/images/portfolio/industrial-refrigeration-thumb.jpg',
                completionDate: new Date('2024-04-10'),
                clientName: 'Fresh Foods Processing',
                projectValue: 120000,
                location: 'Chitungwiza Industrial Area',
                tags: ['industrial', 'refrigeration', 'food-processing', 'temperature-control'],
                isVisible: true,
                isFeatured: false,
                displayOrder: 3,
            },
        ];

        for (const item of portfolioItems) {
            await prisma.portfolioItem.create({
                data: item,
            });
        }

        console.log('✅ Sample portfolio items created');

        // Create sample blog posts
        const blogPosts = [
            {
                type: 'BLOG_POST',
                title: 'The Importance of Regular HVAC Maintenance',
                slug: 'importance-of-regular-hvac-maintenance',
                content: `
          <h2>Why Regular HVAC Maintenance Matters</h2>
          <p>Regular HVAC maintenance is crucial for ensuring your system operates efficiently and lasts longer. Here are the key benefits:</p>
          <ul>
            <li>Improved energy efficiency</li>
            <li>Extended system lifespan</li>
            <li>Better indoor air quality</li>
            <li>Reduced repair costs</li>
          </ul>
          <p>At Ruscles, we recommend scheduling maintenance at least twice a year to keep your system running smoothly.</p>
        `,
                excerpt: 'Learn why regular HVAC maintenance is essential for your system\'s performance and longevity.',
                status: 'PUBLISHED',
                publishedAt: new Date('2024-06-01'),
                author: adminUser.id,
                tags: ['hvac', 'maintenance', 'energy-efficiency'],
                categories: ['service-tips'],
                featuredImage: '/images/blog/hvac-maintenance.jpg',
                seoTitle: 'HVAC Maintenance Guide - Ruscles Investments',
                seoDescription: 'Discover the importance of regular HVAC maintenance and how it can save you money in the long run.',
            },
            {
                type: 'BLOG_POST',
                title: 'Electrical Safety Tips for Homeowners',
                slug: 'electrical-safety-tips-homeowners',
                content: `
          <h2>Essential Electrical Safety Guidelines</h2>
          <p>Electrical safety should be a top priority for every homeowner. Follow these important safety tips:</p>
          <ul>
            <li>Never overload electrical outlets</li>
            <li>Use surge protectors for valuable electronics</li>
            <li>Keep electrical cords away from heat sources</li>
            <li>Hire licensed electricians for major work</li>
          </ul>
          <p>Remember, electrical work can be dangerous. When in doubt, always consult with a professional electrician.</p>
        `,
                excerpt: 'Essential electrical safety tips every homeowner should know to prevent accidents and ensure home safety.',
                status: 'PUBLISHED',
                publishedAt: new Date('2024-05-15'),
                author: adminUser.id,
                tags: ['electrical', 'safety', 'homeowner-tips'],
                categories: ['safety-guides'],
                featuredImage: '/images/blog/electrical-safety.jpg',
                seoTitle: 'Electrical Safety Guide for Homeowners - Ruscles',
                seoDescription: 'Learn essential electrical safety tips to keep your home and family safe from electrical hazards.',
            },
        ];

        for (const post of blogPosts) {
            const contentItem = await prisma.contentItem.create({
                data: post,
            });

            // Create blog post extension
            await prisma.blogPost.create({
                data: {
                    contentId: contentItem.id,
                    readingTime: Math.ceil(post.content.length / 200), // Rough estimate
                    viewCount: Math.floor(Math.random() * 100) + 10,
                },
            });
        }

        console.log('✅ Sample blog posts created');

        // Create sample page content
        const pageContent = [
            {
                slug: 'about',
                title: 'About Us',
                content: `
          <h1>About Ruscles Investments</h1>
          <p>Ruscles Investments is a leading provider of professional electrical, HVAC, and refrigeration services in Zimbabwe. With years of experience and a commitment to excellence, we deliver reliable solutions for residential, commercial, and industrial clients.</p>
          <h2>Our Mission</h2>
          <p>To provide high-quality, reliable, and innovative solutions that exceed customer expectations while maintaining the highest standards of safety and professionalism.</p>
          <h2>Our Values</h2>
          <ul>
            <li>Quality and reliability</li>
            <li>Customer satisfaction</li>
            <li>Safety first</li>
            <li>Innovation and technology</li>
          </ul>
        `,
                metaTitle: 'About Ruscles Investments - Professional Services',
                metaDescription: 'Learn about Ruscles Investments, your trusted partner for electrical, HVAC, and refrigeration services in Zimbabwe.',
                updatedBy: adminUser.id,
            },
            {
                slug: 'services',
                title: 'Our Services',
                content: `
          <h1>Our Services</h1>
          <p>Ruscles Investments offers comprehensive solutions across three main service areas:</p>
          <h2>Electrical Services</h2>
          <p>From residential wiring to complex industrial electrical systems, we handle all your electrical needs with precision and safety.</p>
          <h2>HVAC Services</h2>
          <p>Heating, ventilation, and air conditioning solutions designed for comfort and energy efficiency.</p>
          <h2>Refrigeration Services</h2>
          <p>Commercial and industrial refrigeration systems that keep your business running smoothly.</p>
        `,
                metaTitle: 'Services - Ruscles Investments',
                metaDescription: 'Comprehensive electrical, HVAC, and refrigeration services for residential, commercial, and industrial clients.',
                updatedBy: adminUser.id,
            },
        ];

        for (const page of pageContent) {
            await prisma.pageContent.create({
                data: page,
            });
        }

        console.log('✅ Sample page content created');

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Created:');
        console.log(`  - 1 admin user (${adminUser.email})`);
        console.log('  - 1 business info record');
        console.log(`  - ${defaultSettings.length} settings`);
        console.log(`  - ${testimonials.length} testimonials`);
        console.log(`  - ${portfolioItems.length} portfolio items`);
        console.log(`  - ${blogPosts.length} blog posts`);
        console.log(`  - ${pageContent.length} page content records`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
