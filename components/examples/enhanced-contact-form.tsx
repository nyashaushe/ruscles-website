'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Send, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { useFormValidation } from '@/hooks/use-form-validation'
import { useToast } from '@/hooks/use-toast'
import { FormErrorBoundary } from '@/components/ui/form-error-boundary'
import { ValidationErrorDisplay } from '@/components/ui/validation-error-display'
import { ErrorRecovery } from '@/components/ui/error-recovery'
import { cn } from '@/lib/utils'

// Enhanced contact form schema with comprehensive validation
const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  serviceType: z.enum(['electrical', 'hvac', 'refrigeration', 'general'], {
    required_error: 'Please select a service type'
  }),
  
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  
  preferredContact: z.enum(['email', 'phone', 'either']).default('email'),
  
  newsletter: z.boolean().default(false)
})

type ContactFormData = z.infer<typeof contactFormSchema>

export function EnhancedContactForm() {
  const { toast } = useToast()
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<any>(null)
  const [showErrorRecovery, setShowErrorRecovery] = useState(false)

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    hasErrors,
    isDirty,
    canSubmit,
    setFieldValue,
    setFieldTouched,
    submitForm,
    resetForm,
    getFieldProps
  } = useFormValidation(contactFormSchema, {
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: undefined,
    urgency: 'medium',
    subject: '',
    message: '',
    preferredContact: 'email',
    newsletter: false
  }, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
    showErrorsImmediately: false
  })

  const handleSubmit = async (formData: ContactFormData) => {
    setSubmitStatus('idle')
    setSubmitError(null)
    setShowErrorRecovery(false)

    try {
      // Simulate API call with potential errors
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      setSubmitStatus('success')
      toast({
        title: 'Message sent successfully!',
        description: 'We\'ll get back to you within 24 hours.',
        variant: 'default',
      })

      // Reset form after successful submission
      setTimeout(() => {
        resetForm()
        setSubmitStatus('idle')
      }, 3000)

    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      setSubmitError(error)
      
      // Show error recovery for network errors
      if (error instanceof Error && (error.message.includes('Network') || error.message.includes('HTTP 5'))) {
        setShowErrorRecovery(true)
      } else {
        toast({
          title: 'Error sending message',
          description: 'Please check your input and try again.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleRetrySubmit = async () => {
    await handleSubmit(values as ContactFormData)
  }

  const getFieldError = (fieldName: keyof ContactFormData) => {
    return errors[fieldName] && touched[fieldName] ? errors[fieldName] : undefined
  }

  const getValidationErrors = () => {
    if (!hasErrors) return []
    
    return Object.entries(errors)
      .filter(([_, error]) => error)
      .map(([field, message]) => ({
        field,
        message,
        code: 'validation_error',
        value: values[field as keyof ContactFormData]
      }))
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <FormErrorBoundary formName="contact_form" showDetails={process.env.NODE_ENV === 'development'}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Contact Us
            {submitStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {submitStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
          </CardTitle>
          <CardDescription>
            Get in touch with our team for electrical, HVAC, and refrigeration services
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); submitForm(handleSubmit); }} className="space-y-6">
            {/* Success Status */}
            {submitStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your message has been sent successfully! We'll get back to you soon.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error Recovery */}
            {showErrorRecovery && submitError && (
              <ErrorRecovery
                error={submitError}
                onRetry={handleRetrySubmit}
                onCancel={() => setShowErrorRecovery(false)}
                title="Failed to Send Message"
                description="There was an issue sending your message. Would you like to try again?"
                maxRetries={3}
                autoRetry={false}
                showProgress={true}
              />
            )}

            {/* Validation Errors Summary */}
            {hasErrors && (
              <ValidationErrorDisplay
                errors={getValidationErrors()}
                title="Please fix the following errors"
                variant="card"
                collapsible={getValidationErrors().length > 3}
                showFieldNames={true}
                showErrorCodes={false}
                onFieldFocus={(fieldName) => {
                  const element = document.getElementById(fieldName)
                  element?.focus()
                }}
              />
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="required">Name</Label>
                <Input
                  id="name"
                  {...getFieldProps('name')}
                  placeholder="Your full name"
                  className={cn(getFieldError('name') && 'border-red-500 focus-visible:ring-red-500')}
                />
                {getFieldError('name') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('name')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="required">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...getFieldProps('email')}
                  placeholder="your.email@example.com"
                  className={cn(getFieldError('email') && 'border-red-500 focus-visible:ring-red-500')}
                />
                {getFieldError('email') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('email')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...getFieldProps('phone')}
                  placeholder="+1 (555) 123-4567"
                  className={cn(getFieldError('phone') && 'border-red-500 focus-visible:ring-red-500')}
                />
                {getFieldError('phone') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('phone')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  {...getFieldProps('company')}
                  placeholder="Your company name"
                  className={cn(getFieldError('company') && 'border-red-500 focus-visible:ring-red-500')}
                />
                {getFieldError('company') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('company')}
                  </p>
                )}
              </div>
            </div>

            {/* Service Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType" className="required">Service Type</Label>
                <Select
                  value={values.serviceType || ''}
                  onValueChange={(value) => setFieldValue('serviceType', value)}
                >
                  <SelectTrigger className={cn(getFieldError('serviceType') && 'border-red-500 focus:ring-red-500')}>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="refrigeration">Refrigeration</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError('serviceType') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('serviceType')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select
                  value={values.urgency}
                  onValueChange={(value) => setFieldValue('urgency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Badge variant={getUrgencyColor(values.urgency) as any}>
                    {values.urgency} priority
                  </Badge>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="required">Subject</Label>
              <Input
                id="subject"
                {...getFieldProps('subject')}
                placeholder="Brief description of your inquiry"
                className={cn(getFieldError('subject') && 'border-red-500 focus-visible:ring-red-500')}
              />
              {getFieldError('subject') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('subject')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="required">Message</Label>
              <Textarea
                id="message"
                {...getFieldProps('message')}
                placeholder="Please provide details about your service needs..."
                rows={5}
                className={cn(getFieldError('message') && 'border-red-500 focus-visible:ring-red-500')}
              />
              <div className="flex justify-between items-center">
                {getFieldError('message') ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('message')}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    {values.message?.length || 0}/2000 characters
                  </p>
                )}
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="space-y-2">
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <Select
                value={values.preferredContact}
                onValueChange={(value) => setFieldValue('preferredContact', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="either">Either Email or Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Newsletter Subscription */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="newsletter"
                checked={values.newsletter}
                onChange={(e) => setFieldValue('newsletter', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="newsletter" className="text-sm">
                Subscribe to our newsletter for service tips and updates
              </Label>
            </div>

            {/* Form Status */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {isValid && isDirty && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Form is valid
                  </>
                )}
                {hasErrors && (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    {Object.keys(errors).length} error(s) found
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {submitStatus === 'error' && !showErrorRecovery && (
                  <Button
                    type="button"
                    onClick={handleRetrySubmit}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}
                
                <Button
                  type="submit"
                  disabled={!canSubmit || showErrorRecovery}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormErrorBoundary>
  )
}