# Design Document

## Overview

The Form and Content Management System will be built as an integrated part of the existing admin portal, extending the current Next.js application with new pages and components. The system will use a modern, responsive design consistent with the existing admin interface, leveraging the current UI component library and design patterns.

The architecture will follow a modular approach with separate sections for form management and content management, each with their own dedicated pages and components. Real-time updates will be implemented using React state management and periodic data fetching.

## Architecture

### Frontend Architecture

The system will extend the existing admin portal structure:

```
app/admin/
├── forms/
│   ├── page.tsx (Forms dashboard)
│   ├── [id]/
│   │   └── page.tsx (Individual form details)
│   └── components/
│       ├── forms-table.tsx
│       ├── form-detail-view.tsx
│       └── response-composer.tsx
├── content/
│   ├── page.tsx (Content dashboard - enhanced)
│   ├── blog/
│   │   ├── page.tsx (Blog posts list)
│   │   ├── new/page.tsx (Create new post)
│   │   └── [id]/edit/page.tsx (Edit post)
│   ├── testimonials/
│   │   ├── page.tsx (Testimonials list)
│   │   └── new/page.tsx (Add testimonial)
│   ├── portfolio/
│   │   ├── page.tsx (Portfolio items list)
│   │   └── new/page.tsx (Add portfolio item)
│   └── pages/
│       ├── page.tsx (Static pages list)
│       └── [slug]/edit/page.tsx (Edit page content)
└── components/
    ├── rich-text-editor.tsx
    ├── image-upload.tsx
    ├── content-status-badge.tsx
    └── notification-center.tsx
```

### Data Layer

The system will use a combination of:
- **Local State Management**: React useState and useReducer for component-level state
- **Server State**: React Query/TanStack Query for server data fetching and caching
- **Real-time Updates**: Polling or WebSocket connections for live notifications
- **Form Handling**: React Hook Form for complex form validation and submission

### Backend Integration

The system will integrate with the existing backend through RESTful API endpoints:

```
/api/admin/forms/
├── GET / (List all forms with filtering)
├── GET /:id (Get specific form details)
├── PUT /:id (Update form status/notes)
└── POST /:id/respond (Send response to form submitter)

/api/admin/content/
├── blog/
│   ├── GET / (List blog posts)
│   ├── POST / (Create new post)
│   ├── PUT /:id (Update post)
│   └── DELETE /:id (Delete post)
├── testimonials/
├── portfolio/
└── pages/
```

## Components and Interfaces

### Form Management Components

#### FormsTable Component
- **Purpose**: Display all form submissions in a sortable, filterable table
- **Props**: 
  - `forms: FormSubmission[]`
  - `onStatusChange: (id: string, status: string) => void`
  - `onViewDetails: (id: string) => void`
- **Features**:
  - Status badges with color coding
  - Priority indicators
  - Quick action buttons
  - Search and filter controls
  - Pagination for large datasets

#### FormDetailView Component
- **Purpose**: Show complete form submission details and response interface
- **Props**:
  - `form: FormSubmission`
  - `responses: FormResponse[]`
  - `onSendResponse: (response: ResponseData) => void`
- **Features**:
  - Full form data display
  - Communication history timeline
  - Response composer with templates
  - Status update controls
  - Follow-up scheduling

#### ResponseComposer Component
- **Purpose**: Interface for composing and sending responses to form submissions
- **Props**:
  - `recipientEmail: string`
  - `formContext: FormSubmission`
  - `onSend: (response: ResponseData) => void`
- **Features**:
  - Rich text editor for responses
  - Email template selection
  - Attachment support
  - Send and schedule options

### Content Management Components

#### RichTextEditor Component
- **Purpose**: WYSIWYG editor for content creation and editing
- **Props**:
  - `content: string`
  - `onChange: (content: string) => void`
  - `placeholder?: string`
- **Features**:
  - Text formatting (bold, italic, headings)
  - Image insertion and management
  - Link insertion
  - Code block support
  - Preview mode

#### ImageUpload Component
- **Purpose**: Handle image uploads with optimization and preview
- **Props**:
  - `onUpload: (imageUrl: string) => void`
  - `maxSize?: number`
  - `acceptedTypes?: string[]`
- **Features**:
  - Drag and drop interface
  - Image preview and cropping
  - Automatic optimization
  - Progress indicators
  - Error handling

#### ContentStatusBadge Component
- **Purpose**: Display content publication status with appropriate styling
- **Props**:
  - `status: 'draft' | 'published' | 'scheduled' | 'archived'`
  - `scheduledDate?: Date`
- **Features**:
  - Color-coded status indicators
  - Scheduled publication dates
  - Hover tooltips with details

### Shared Components

#### NotificationCenter Component
- **Purpose**: Real-time notifications for new forms and content updates
- **Features**:
  - Toast notifications for new submissions
  - Notification history
  - Mark as read functionality
  - Sound and visual alerts
  - Notification preferences

## Data Models

### FormSubmission Model
```typescript
interface FormSubmission {
  id: string
  type: 'contact' | 'service_inquiry' | 'quote_request'
  submittedAt: Date
  status: 'new' | 'in_progress' | 'responded' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  customerInfo: {
    name: string
    email: string
    phone?: string
    company?: string
  }
  formData: Record<string, any>
  responses: FormResponse[]
  assignedTo?: string
  tags: string[]
  notes: string
  lastUpdated: Date
}
```

### FormResponse Model
```typescript
interface FormResponse {
  id: string
  formId: string
  respondedBy: string
  respondedAt: Date
  method: 'email' | 'phone' | 'in_person'
  content: string
  attachments?: string[]
}
```

### ContentItem Model
```typescript
interface ContentItem {
  id: string
  type: 'blog_post' | 'testimonial' | 'portfolio_item' | 'page_content'
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  publishedAt?: Date
  scheduledFor?: Date
  author: string
  tags: string[]
  categories: string[]
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}
```

### Testimonial Model
```typescript
interface Testimonial {
  id: string
  customerName: string
  customerTitle?: string
  customerCompany?: string
  customerPhoto?: string
  testimonialText: string
  rating?: number
  projectType?: string
  isVisible: boolean
  isFeatured: boolean
  displayOrder: number
  createdAt: Date
}
```

### PortfolioItem Model
```typescript
interface PortfolioItem {
  id: string
  title: string
  description: string
  serviceCategory: 'electrical' | 'hvac' | 'refrigeration'
  images: string[]
  thumbnailImage: string
  completionDate: Date
  clientName?: string
  projectValue?: number
  location?: string
  tags: string[]
  isVisible: boolean
  isFeatured: boolean
  displayOrder: number
  createdAt: Date
}
```

## Error Handling

### Form Submission Errors
- **Network Failures**: Retry mechanism with exponential backoff
- **Validation Errors**: Clear field-level error messages
- **Server Errors**: User-friendly error messages with support contact
- **Timeout Handling**: Progress indicators and timeout notifications

### Content Management Errors
- **Image Upload Failures**: File size and format validation with clear messages
- **Save Failures**: Auto-save functionality with conflict resolution
- **Publishing Errors**: Rollback mechanism for failed publications
- **Permission Errors**: Clear access control messages

### Data Integrity
- **Concurrent Editing**: Optimistic locking with conflict detection
- **Data Loss Prevention**: Auto-save drafts every 30 seconds
- **Backup and Recovery**: Version history for content items
- **Validation**: Client and server-side validation for all inputs

## Testing Strategy

### Unit Testing
- **Component Testing**: Jest and React Testing Library for all components
- **Hook Testing**: Custom hooks for data fetching and state management
- **Utility Testing**: Form validation, data transformation, and helper functions
- **API Integration**: Mock API responses for consistent testing

### Integration Testing
- **Form Workflow**: End-to-end form submission and response process
- **Content Publishing**: Complete content creation to publication workflow
- **User Interactions**: Multi-step processes and complex user flows
- **Real-time Features**: Notification delivery and real-time updates

### Performance Testing
- **Large Dataset Handling**: Forms and content lists with thousands of items
- **Image Upload Performance**: Multiple large image uploads
- **Search and Filter Performance**: Complex queries on large datasets
- **Real-time Update Performance**: High-frequency notification scenarios

### Accessibility Testing
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Screen Reader Compatibility**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG 2.1 AA compliance for all UI elements
- **Focus Management**: Logical focus order and visible focus indicators

## Security Considerations

### Authentication and Authorization
- **Role-based Access**: Different permission levels for different admin roles
- **Session Management**: Secure session handling with timeout
- **API Security**: JWT tokens with proper expiration and refresh
- **CSRF Protection**: Cross-site request forgery prevention

### Data Protection
- **Input Sanitization**: XSS prevention for all user inputs
- **File Upload Security**: Virus scanning and file type validation
- **Data Encryption**: Sensitive data encryption at rest and in transit
- **Audit Logging**: Track all admin actions for security monitoring

### Content Security
- **Content Validation**: Prevent malicious content injection
- **Image Processing**: Secure image handling and processing
- **Backup Security**: Encrypted backups with access controls
- **Version Control**: Secure version history with rollback capabilities