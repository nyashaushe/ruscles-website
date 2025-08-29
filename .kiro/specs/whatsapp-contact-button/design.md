# Design Document

## Overview

The WhatsApp contact button will be implemented as a floating action button (FAB) that appears on all pages of the website. It will use WhatsApp's official API URL scheme to open conversations directly with the business number. The component will be responsive, accessible, and integrate seamlessly with the existing Next.js application architecture.

## Architecture

### Component Structure
- **WhatsAppButton**: Main floating button component
- **WhatsAppConfig**: Configuration interface for business settings
- **WhatsAppUtils**: Utility functions for URL generation and validation

### Integration Points
- Added to the root layout (`app/layout.tsx`) for global availability
- Configuration stored in environment variables or database
- Styled using Tailwind CSS to match existing design system

## Components and Interfaces

### WhatsAppButton Component
```typescript
interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
}
```

### Configuration Interface
```typescript
interface WhatsAppConfig {
  phoneNumber: string
  defaultMessage: string
  businessName: string
  enabled: boolean
}
```

### Utility Functions
```typescript
interface WhatsAppUtils {
  formatPhoneNumber: (phone: string) => string
  generateWhatsAppURL: (phone: string, message: string) => string
  validatePhoneNumber: (phone: string) => boolean
}
```

## Data Models

### Environment Configuration
```
WHATSAPP_BUSINESS_NUMBER=+1234567890
WHATSAPP_DEFAULT_MESSAGE=Hello! I'm interested in your services.
WHATSAPP_BUSINESS_NAME=Ruscle Investments
```

### URL Structure
WhatsApp uses the following URL format:
- Mobile: `whatsapp://send?phone={number}&text={message}`
- Web: `https://wa.me/{number}?text={message}`

## Error Handling

### Phone Number Validation
- Validate international format (+country code)
- Check for minimum/maximum length requirements
- Sanitize input to remove invalid characters

### Fallback Behavior
- If WhatsApp is not available, show contact information
- Graceful degradation for unsupported browsers
- Error logging for debugging purposes

### User Feedback
- Loading states during URL generation
- Success confirmation when WhatsApp opens
- Error messages for invalid configurations

## Testing Strategy

### Unit Tests
- Phone number validation functions
- URL generation logic
- Component rendering with different props

### Integration Tests
- Button click behavior
- WhatsApp URL opening
- Responsive design across devices

### Accessibility Tests
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

### Cross-browser Tests
- WhatsApp app detection
- Fallback to web version
- Mobile vs desktop behavior

## Implementation Details

### Positioning Strategy
- Fixed positioning using CSS `position: fixed`
- Z-index management to appear above other content
- Responsive positioning for mobile devices

### Styling Approach
- WhatsApp official green color (#25D366)
- Smooth hover and click animations
- Shadow effects for depth perception
- Icon from Lucide React or custom SVG

### Performance Considerations
- Lazy loading of WhatsApp icon
- Minimal bundle size impact
- No external API calls required
- Client-side URL generation

### Security Considerations
- Phone number sanitization
- Message encoding for URL safety
- No sensitive data exposure
- Input validation on all user inputs

## Mobile Optimization

### Touch Targets
- Minimum 44px touch target size
- Adequate spacing from screen edges
- Thumb-friendly positioning

### App Detection
- Detect WhatsApp app availability
- Fallback to web version when needed
- Platform-specific URL schemes

### Responsive Design
- Smaller button size on mobile
- Adjusted positioning for different screen sizes
- Optimized for both portrait and landscape modes