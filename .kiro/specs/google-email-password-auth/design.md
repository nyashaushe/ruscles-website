# Design Document

## Overview

This design implements Google email/password authentication as an additional login method alongside the existing Google OAuth. The solution uses NextAuth's Credentials provider to authenticate users directly with Google's authentication services while maintaining the same security controls and session management as the existing OAuth implementation.

## Architecture

### Authentication Flow
1. User visits signin page and sees both OAuth and email/password options
2. User enters Google email and password in the credentials form
3. NextAuth Credentials provider validates credentials against Google's authentication API
4. System checks if email is in allowed admin emails list
5. On success, creates JWT session compatible with existing OAuth sessions
6. User is redirected to admin dashboard

### Integration Points
- **NextAuth Configuration**: Extend existing `authOptions` with Credentials provider
- **Signin Page**: Add email/password form alongside existing Google OAuth button
- **Session Management**: Maintain compatibility with existing JWT session structure
- **Middleware**: No changes needed - existing middleware will work with both auth methods

## Components and Interfaces

### 1. NextAuth Credentials Provider
```typescript
interface CredentialsConfig {
  id: "credentials"
  name: "Email and Password"
  credentials: {
    email: { label: "Email", type: "email" }
    password: { label: "Password", type: "password" }
  }
  authorize: (credentials) => Promise<User | null>
}
```

### 2. Google Authentication Service
```typescript
interface GoogleAuthService {
  validateCredentials(email: string, password: string): Promise<GoogleUser | null>
}

interface GoogleUser {
  id: string
  email: string
  name: string
  image?: string
}
```

### 3. Enhanced Signin Form Component
```typescript
interface SigninFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading: boolean
  error?: string
}
```

### 4. Admin Email Validation
```typescript
interface AdminEmailValidator {
  isAllowedEmail(email: string): boolean
  getAllowedEmails(): string[]
}
```

## Data Models

### Session Structure (Unchanged)
The session structure remains the same to maintain compatibility:
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    image?: string
  }
  expires: string
}
```

### JWT Token Structure (Unchanged)
```typescript
interface JWT {
  user: {
    id: string
    email: string
    name: string
    image?: string
  }
  iat: number
  exp: number
}
```

## Error Handling

### Authentication Errors
1. **Invalid Credentials**: Clear message about incorrect email/password
2. **Unauthorized Email**: Message about contacting administrator for access
3. **Google API Errors**: Generic message about service unavailability
4. **Network Errors**: Retry suggestion with fallback to OAuth

### Form Validation
1. **Email Format**: Real-time validation with visual feedback
2. **Required Fields**: Clear indication of missing required information
3. **Rate Limiting**: Protection against brute force attempts

### Fallback Strategy
- If credentials authentication fails, users can still use Google OAuth
- Clear messaging about alternative authentication methods
- Graceful degradation if Google authentication services are unavailable

## Testing Strategy

### Unit Tests
1. **Credentials Provider**: Test authorization logic with valid/invalid credentials
2. **Email Validation**: Test allowed email checking logic
3. **Form Components**: Test form validation and submission
4. **Error Handling**: Test various error scenarios

### Integration Tests
1. **Authentication Flow**: End-to-end signin process
2. **Session Compatibility**: Verify sessions work with existing middleware
3. **Admin Access**: Test access to protected admin routes
4. **OAuth Compatibility**: Ensure both auth methods work together

### Security Tests
1. **Unauthorized Access**: Verify non-admin emails are rejected
2. **Session Security**: Test JWT token handling and expiration
3. **Input Validation**: Test against malicious input
4. **Rate Limiting**: Verify protection against brute force

### Manual Testing
1. **User Experience**: Test signin flow on various devices
2. **Error Messages**: Verify clear, helpful error messaging
3. **Accessibility**: Test keyboard navigation and screen readers
4. **Performance**: Verify reasonable response times

## Implementation Considerations

### Security
- Use Google's official authentication APIs for credential validation
- Implement rate limiting to prevent brute force attacks
- Maintain same session security as existing OAuth implementation
- Validate all inputs and sanitize error messages

### Performance
- Cache allowed email list to avoid repeated environment variable parsing
- Implement reasonable timeouts for Google API calls
- Use loading states to provide user feedback during authentication

### Accessibility
- Ensure form is keyboard navigable
- Provide proper ARIA labels and descriptions
- Support screen readers with appropriate announcements
- Maintain focus management during form submission

### Maintenance
- Keep credentials provider configuration alongside OAuth provider
- Use same callback structure for consistent session handling
- Maintain compatibility with existing middleware and route protection
- Document configuration requirements clearly