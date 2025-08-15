'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ValidatedForm, ValidatedInput, ValidatedTextarea, ValidatedSelect } from '@/components/ui/validated-form'
import { FormErrorBoundary } from '@/components/ui/form-error-boundary'
import { ErrorRecovery } from '@/components/ui/error-recovery'
import { ErrorNotification } from '@/components/ui/error-notification'
import { ValidationErrorDisplay } from '@/components/ui/validation-error-display'
import { useComprehensiveErrorHandling } from '@/components/providers/comprehensive-error-provider'
import { useNetworkErrorHandler } from '@/lib/utils/network-error-handler'
import { SelectItem } from '@/components/ui/select'
import { AlertTriangle, Bug, Network, FileX, Database } from 'lucide-react'

// Demo form schema
const demoFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.enum(['bug', 'feature', 'support'], {
    required_error: 'Please select a category'
  })
})

type DemoFormData = z.infer<typeof demoFormSchema>

export function CompleteErrorHandlingDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('form-validation')
  const [networkError, setNetworkError] = useState<any>(null)
  const [showErrorNotification, setShowErrorNotification] = useState(false)
  
  const {
    reportError,
    reportValidationError,
    reportNetworkError,
    reportFormError,
    reportFileUploadError,
    reportCriticalError,
    errorStats
  } = useComprehensiveErrorHandling()

  const { request, uploadFile } = useNetworkErrorHandler()

  // Demo functions that simulate different types of errors
  const simulateNetworkError = async () => {
    try {
      // Simulate a network request that fails
      await request('/api/nonexistent-endpoint', {
        method: 'POST',
        context: 'demo_network_error'
      })
    } catch (error) {
      setNetworkError(error)
      reportNetworkError(error, '/api/nonexistent-endpoint', 'POST')
    }
  }

  const simulateValidationError = () => {
    const validationErrors = [
      { field: 'email', message: 'Email format is invalid', code: 'invalid_format' },
      { field: 'password', message: 'Password must be at least 8 characters', code: 'min_length' },
      { field: 'confirmPassword', message: 'Passwords do not match', code: 'mismatch' }
    ]
    
    validationErrors.forEach(error => {
      reportValidationError(error.field, 'invalid_value', error.message, {
        formName: 'demo_form',
        errorCode: error.code
      })
    })
  }

  const simulateFileUploadError = () => {
    const mockFile = new File([''], 'large-file.pdf', { type: 'application/pdf' })
    const error = new Error('File size exceeds maximum limit of 10MB')
    reportFileUploadError(error, mockFile.name, 15 * 1024 * 1024, mockFile.type)
  }

  const simulateCriticalError = () => {
    const error = new Error('Database connection failed')
    reportCriticalError(error, {
      context: 'database_connection',
      severity: 'critical',
      affectedUsers: 'all'
    }, 'A critical system error occurred. Please contact support immediately.')
  }

  const simulateJavaScriptError = () => {
    // This will trigger the global error handler
    throw new Error('Simulated JavaScript runtime error')
  }

  const handleFormSubmit = async (data: DemoFormData) => {
    // Simulate form submission with potential errors
    if (data.email.includes('error')) {
      throw new Error('Simulated form submission error')
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submitted successfully:', data)
  }

  const handleFormError = (error: any) => {
    reportFormError(error, 'demo_form', { context: 'form_submission_demo' })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Complete Error Handling Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive demonstration of all error handling and validation features
        </p>
      </div>

      {/* Error Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Error Statistics</CardTitle>
          <CardDescription>Current error monitoring statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{errorStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{errorStats.recent}</div>
              <div className="text-sm text-muted-foreground">Recent (1h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{errorStats.bySeverity.critical || 0}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{errorStats.byCategory.network || 0}</div>
              <div className="text-sm text-muted-foreground">Network</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeDemo} onValueChange={setActiveDemo}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="form-validation">Form Validation</TabsTrigger>
          <TabsTrigger value="network-errors">Network Errors</TabsTrigger>
          <TabsTrigger value="error-recovery">Error Recovery</TabsTrigger>
          <TabsTrigger value="error-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="error-simulation">Error Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="form-validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Validation Demo</CardTitle>
              <CardDescription>
                Demonstrates comprehensive form validation with error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormErrorBoundary formName="demo-form" showDetails={true}>
                <ValidatedForm
                  schema={demoFormSchema}
                  onSubmit={handleFormSubmit}
                  onError={handleFormError}
                  title="Contact Form"
                  description="Fill out this form to see validation in action"
                  showValidationSummary={true}
                  validateOnChange={true}
                  validateOnBlur={true}
                >
                  <ValidatedInput
                    name="name"
                    label="Full Name"
                    placeholder="Enter your full name"
                    required
                  />
                  
                  <ValidatedInput
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email (try 'error@example.com' to simulate error)"
                    required
                  />
                  
                  <ValidatedSelect
                    name="category"
                    label="Category"
                    placeholder="Select a category"
                    required
                  >
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </ValidatedSelect>
                  
                  <ValidatedTextarea
                    name="message"
                    label="Message"
                    placeholder="Enter your message (minimum 10 characters)"
                    required
                  />
                </ValidatedForm>
              </FormErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network-errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Error Handling</CardTitle>
              <CardDescription>
                Demonstrates network error handling with retry mechanisms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={simulateNetworkError} variant="outline">
                <Network className="h-4 w-4 mr-2" />
                Simulate Network Error
              </Button>
              
              {networkError && (
                <ErrorRecovery
                  error={networkError}
                  onRetry={async () => {
                    setNetworkError(null)
                    await simulateNetworkError()
                  }}
                  onCancel={() => setNetworkError(null)}
                  title="Network Request Failed"
                  maxRetries={3}
                  autoRetry={true}
                  exponentialBackoff={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Recovery Demo</CardTitle>
              <CardDescription>
                Shows how errors can be recovered from with retry mechanisms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={simulateNetworkError} variant="outline">
                  <Network className="h-4 w-4 mr-2" />
                  Network Error
                </Button>
                <Button onClick={simulateFileUploadError} variant="outline">
                  <FileX className="h-4 w-4 mr-2" />
                  File Upload Error
                </Button>
                <Button onClick={simulateCriticalError} variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Critical System Error
                </Button>
                <Button onClick={simulateValidationError} variant="outline">
                  <Bug className="h-4 w-4 mr-2" />
                  Validation Errors
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Notifications</CardTitle>
              <CardDescription>
                Different types of error notifications and their behaviors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setShowErrorNotification(true)}
                variant="outline"
              >
                Show Error Notification
              </Button>
              
              {showErrorNotification && (
                <ErrorNotification
                  error={new Error('This is a sample error notification')}
                  title="Sample Error"
                  description="This demonstrates how error notifications appear to users"
                  retryable={true}
                  onRetry={() => console.log('Retry clicked')}
                  onDismiss={() => setShowErrorNotification(false)}
                  variant="banner"
                  showDetails={true}
                />
              )}
              
              <ValidationErrorDisplay
                errors={[
                  { field: 'email', message: 'Email format is invalid', code: 'invalid_format' },
                  { field: 'password', message: 'Password too short', code: 'min_length' }
                ]}
                title="Sample Validation Errors"
                variant="card"
                showFieldNames={true}
                showErrorCodes={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Simulation</CardTitle>
              <CardDescription>
                Simulate different types of errors to test the error handling system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={simulateNetworkError} 
                  variant="destructive"
                  className="justify-start"
                >
                  <Network className="h-4 w-4 mr-2" />
                  Network Error (404)
                </Button>
                
                <Button 
                  onClick={simulateValidationError} 
                  variant="destructive"
                  className="justify-start"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Validation Errors
                </Button>
                
                <Button 
                  onClick={simulateFileUploadError} 
                  variant="destructive"
                  className="justify-start"
                >
                  <FileX className="h-4 w-4 mr-2" />
                  File Upload Error
                </Button>
                
                <Button 
                  onClick={simulateCriticalError} 
                  variant="destructive"
                  className="justify-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Critical System Error
                </Button>
                
                <Button 
                  onClick={simulateJavaScriptError} 
                  variant="destructive"
                  className="justify-start"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  JavaScript Runtime Error
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Click any button above to simulate different error types</li>
                  <li>• Check the browser console for detailed error logs</li>
                  <li>• Error statistics will update in real-time</li>
                  <li>• All errors are logged for monitoring and debugging</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}