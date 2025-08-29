# Implementation Plan

- [x] 1. Set up Google authentication service and credentials provider





  - Create Google authentication service utility for validating email/password credentials
  - Add NextAuth Credentials provider configuration to existing auth options
  - Implement email validation logic using ALLOWED_ADMIN_EMAILS environment variable
  - _Requirements: 1.2, 1.4, 3.1, 3.2, 4.1, 4.2_

- [x] 2. Create email/password signin form components





  - Build reusable email input component with validation
  - Build password input component with show/hide toggle functionality
  - Create signin form component that handles email/password submission
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Enhance signin page with dual authentication options





  - Modify existing signin page to display both OAuth and credentials options
  - Implement form submission handling with loading states and error display
  - Add responsive layout that works well on mobile and desktop devices
  - _Requirements: 1.1, 2.1, 2.6, 4.2_

- [x] 4. Implement error handling and user feedback





  - Create error message components for authentication failures
  - Add form validation with real-time feedback for email format
  - Implement proper error handling for Google API failures and network issues
  - _Requirements: 1.4, 2.5, 3.4, 4.5_

- [x] 5. Add environment variable validation and configuration





  - Update production check utility to validate credentials authentication requirements
  - Add configuration validation for Google authentication service setup
  - Update environment variable documentation and setup scripts
  - _Requirements: 4.3, 4.5_

- [x] 6. Create comprehensive test suite





  - Write unit tests for Google authentication service and email validation
  - Create integration tests for credentials provider and signin flow
  - Add component tests for signin form and error handling
  - _Requirements: 3.2, 3.3, 4.1, 4.2_

- [x] 7. Update middleware and session compatibility





  - Verify existing middleware works with credentials-based sessions
  - Test session creation and JWT token compatibility between auth methods
  - Ensure admin route protection works consistently for both authentication types
  - _Requirements: 3.2, 3.3, 4.2_