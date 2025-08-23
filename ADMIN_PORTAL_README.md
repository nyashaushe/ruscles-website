# Ruscles Investments - Admin Portal

## 🎯 Overview

The Ruscles Investments Admin Portal is a comprehensive business management system designed for electrical, HVAC, and refrigeration service companies. It provides a modern, responsive interface for managing customer inquiries, form submissions, projects, and business operations.

## 🚀 Features

### 📊 Dashboard
- **Real-time Statistics**: View total submissions, pending items, and active projects
- **Activity Feed**: Monitor recent customer interactions and system activities
- **Quick Actions**: Fast access to common tasks and views
- **Today's Tasks**: Schedule and task management overview

### 📝 Forms Management
- **Unified Form System**: Handle contact forms, service inquiries, and quote requests
- **Advanced Filtering**: Filter by status, priority, type, date range, and more
- **Bulk Operations**: Update multiple forms simultaneously
- **Response System**: Send responses via email, phone, or in-person
- **Status Tracking**: NEW → IN_PROGRESS → RESPONDED → COMPLETED → ARCHIVED
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT

### 👥 Customer Management
- **Customer Profiles**: Track customer information and history
- **Inquiry History**: View all past interactions and submissions
- **Contact Information**: Phone, email, and address management

### 🛠️ Project Management
- **Project Tracking**: Monitor active and completed projects
- **Service Categories**: Electrical, HVAC, Refrigeration
- **Timeline Management**: Track project milestones and deadlines

### 📚 Content Management
- **Blog Posts**: Create and manage educational content
- **Testimonials**: Customer reviews and feedback
- **Portfolio**: Showcase completed projects
- **Pages**: Manage website content and SEO

### 📈 Analytics & Reporting
- **Business Metrics**: Track performance and growth
- **Data Exports**: Generate reports in various formats
- **Scheduled Reports**: Automated report generation

### ⚙️ System Administration
- **User Management**: Admin, Editor, and User roles
- **Settings**: Business information and configuration
- **Notifications**: Real-time alerts and updates

## 🏗️ Technical Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Database abstraction and migrations
- **PostgreSQL**: Primary database (Neon)
- **TypeScript**: Full-stack type safety

### Database Schema
```sql
-- Core Tables
users              -- User management
form_submissions   -- Customer inquiries and forms
form_responses     -- Responses to submissions
content_items      -- Blog posts and content
testimonials       -- Customer reviews
portfolio_items    -- Project showcase
business_info      -- Company information
settings           -- System configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Vercel CLI (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ruscles-website
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your database URL
   DATABASE_URL="postgresql://..."
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed initial data
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access Admin Portal**
   ```
   http://localhost:3000/admin
   ```

## 📱 Usage Guide

### Managing Form Submissions

1. **View All Submissions**
   - Navigate to `/admin/forms`
   - Use tabs to filter by status (All, New, In Progress, Completed)

2. **Filter and Search**
   - Click "Filters" to open advanced filtering
   - Search by customer name, email, or message content
   - Filter by status, priority, type, or date range

3. **Bulk Operations**
   - Select multiple forms using checkboxes
   - Use bulk actions to update status, assign, tag, or archive

4. **Individual Form Management**
   - Click on any form to view details
   - Update status, priority, or add notes
   - Send responses to customers

### Dashboard Overview

1. **Statistics Cards**
   - Total Submissions: All-time form count
   - Pending Items: Items needing attention
   - Active Items: Currently being processed

2. **Quick Navigation**
   - Forms Management: New submission system
   - Traditional Inquiries: Legacy inquiry system
   - Quick Actions: Common tasks and views

3. **Activity Feed**
   - Recent form submissions
   - Status changes and updates
   - System notifications

### Content Management

1. **Blog Posts**
   - Create educational content
   - SEO optimization
   - Publishing workflow

2. **Testimonials**
   - Customer reviews
   - Rating system
   - Featured testimonials

3. **Portfolio**
   - Project showcase
   - Service categories
   - Image management

## 🔧 Configuration

### Business Information
Update company details in `/admin/settings`:
- Company name and contact information
- Business hours and location
- Service descriptions
- Social media links

### User Management
- **Admin**: Full system access
- **Editor**: Content management
- **User**: Limited access

### Email Notifications
Configure email settings for:
- New form submissions
- Status updates
- Customer responses

## 📊 API Endpoints

### Forms Management
```
GET    /api/forms              -- List form submissions
POST   /api/forms              -- Create new submission
GET    /api/forms/[id]         -- Get specific submission
PATCH  /api/forms/[id]         -- Update submission
POST   /api/forms/[id]/respond -- Send response
PATCH  /api/forms/bulk         -- Bulk operations
GET    /api/forms/stats        -- Form statistics
```

### Content Management
```
GET    /api/content            -- List content items
POST   /api/content            -- Create content
GET    /api/content/[id]       -- Get specific content
PATCH  /api/content/[id]       -- Update content
DELETE /api/content/[id]       -- Delete content
```

## 🚀 Deployment

### Vercel Deployment
1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Database Migration
```bash
# Production migration
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## 🔒 Security

### Authentication
- Session-based authentication
- Role-based access control
- Secure API endpoints

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Environment Variables
- Database credentials
- API keys and secrets
- Configuration settings

## 📈 Performance

### Optimization
- Server-side rendering (SSR)
- Static generation where possible
- Image optimization
- Code splitting

### Monitoring
- Error tracking
- Performance metrics
- User analytics

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check connection
   npx prisma db pull
   
   # Reset database
   npx prisma migrate reset
   ```

2. **Build Errors**
   ```bash
   # Clear cache
   rm -rf .next
   npm run build
   ```

3. **API Errors**
   - Check environment variables
   - Verify database schema
   - Review API route handlers

### Support
- Check logs in Vercel dashboard
- Review Prisma documentation
- Contact development team

## 🔄 Updates and Maintenance

### Regular Tasks
- Database backups
- Security updates
- Performance monitoring
- Content updates

### Version Control
- Feature branches
- Code reviews
- Automated testing
- Staging deployment

## 📞 Support

For technical support or questions:
- Email: admin@rusclesinvestments.com
- Documentation: [Internal Wiki]
- Issues: [GitHub Issues]

---

**Ruscles Investments Admin Portal** - Professional business management for service companies.
