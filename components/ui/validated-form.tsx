'use client'

import React, { forwardRef, useImperativeHandle } from 'react'
import { z } from 'zod'
import { useFormValidation } from '@/hooks/use-form-validation'
import { FormErrorBoundary, InlineFormError } from './form-error-boundary'
import { ValidationErrorDisplay } from './validation-error-display'
import { ErrorNotification } from './error-notification'
import { Button } from './button'
import { Input } from './input'
import { Textarea } from './textarea'
import { Label } from './label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Checkbox } from './checkbox'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Alert, AlertDescription } from './alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ValidatedFormProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>
  initialValues?: Partial<T>
  onSubmit: (values: T) => Promise<void> | void
  onError?: (error: any) => void
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  submitText?: string
  showValidationSummary?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
  disabled?: boolean
}

export interface ValidatedFormRef<T> {
  submit: () => Promise<void>
  reset: (values?: Partial<T>) => void
  setFieldValue: (field: keyof T, value: any) => void
  getValues: () => Partial<T>
  validate: () => boolean
}

function ValidatedFormComponent<T extends Record<string, any>>(
  {
    schema,
    initialValues = {},
    onSubmit,
    onError,
    children,
    className,
    title,
    description,
    submitText = 'Submit',
    showValidationSummary = true,
    validateOnChange = true,
    validateOnBlur = true,
    disabled = false,
  }: ValidatedFormProps<T>,
  ref: React.Ref<ValidatedFormRef<T>>
) {
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    hasErrors,
    isDirty,
    canSubmit,
    submitForm,
    resetForm,
    setFieldValue,
    validateForm,
    getFieldProps,
  } = useFormValidation(schema, initialValues, {
    validateOnChange,
    validateOnBlur,
    showErrorsImmediately: false,
  })

  useImperativeHandle(ref, () => ({
    submit: async () => {
      await submitForm(onSubmit)
    },
    reset: (newValues?: Partial<T>) => {
      resetForm(newValues)
    },
    setFieldValue,
    getValues: () => values,
    validate: () => {
      const result = validateForm()
      return result.success
    },
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await submitForm(onSubmit)
    } catch (error) {
      onError?.(error)
    }
  }

  const getValidationSummary = () => {
    if (!hasErrors || !showValidationSummary) return null

    const errorFields = Object.entries(errors).filter(([_, error]) => error)
    
    if (errorFields.length === 0) return null

    const validationErrors = errorFields.map(([field, message]) => ({
      field,
      message,
      code: 'validation_error'
    }))

    return (
      <ValidationErrorDisplay
        errors={validationErrors}
        title="Form Validation Errors"
        variant="card"
        collapsible={errorFields.length > 3}
        showFieldNames={true}
        className="mb-4"
      />
    )
  }

  return (
    <FormErrorBoundary formName={title}>
      <Card className={cn('w-full', className)}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {getValidationSummary()}
            
            <FormProvider
              values={values}
              errors={errors}
              touched={touched}
              getFieldProps={getFieldProps}
              disabled={disabled || isSubmitting}
            >
              {children}
            </FormProvider>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isValid && isDirty && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Form is valid
                  </>
                )}
                {hasErrors && (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    {Object.keys(errors).length} error(s)
                  </>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={!canSubmit || disabled}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  submitText
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormErrorBoundary>
  )
}

export const ValidatedForm = forwardRef(ValidatedFormComponent) as <T extends Record<string, any>>(
  props: ValidatedFormProps<T> & { ref?: React.Ref<ValidatedFormRef<T>> }
) => React.ReactElement

// Form context for field components
interface FormContextValue {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  getFieldProps: (field: string) => any
  disabled: boolean
}

const FormContext = React.createContext<FormContextValue | null>(null)

function FormProvider({
  values,
  errors,
  touched,
  getFieldProps,
  disabled,
  children,
}: FormContextValue & { children: React.ReactNode }) {
  return (
    <FormContext.Provider value={{ values, errors, touched, getFieldProps, disabled }}>
      {children}
    </FormContext.Provider>
  )
}

function useFormContext() {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error('Form field components must be used within a ValidatedForm')
  }
  return context
}

// Enhanced form field components with validation
export interface ValidatedFieldProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  className?: string
}

export function ValidatedInput({
  name,
  label,
  description,
  required,
  className,
  ...props
}: ValidatedFieldProps & React.ComponentProps<typeof Input>) {
  const { getFieldProps, disabled } = useFormContext()
  const fieldProps = getFieldProps(name)

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={required ? "after:content-['*'] after:text-destructive after:ml-1" : ''}>
          {label}
        </Label>
      )}
      <Input
        id={name}
        {...props}
        {...fieldProps}
        disabled={disabled || props.disabled}
        className={cn(fieldProps.error && 'border-destructive focus-visible:ring-destructive')}
      />
      {description && !fieldProps.error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {fieldProps.error && (
        <p className="text-sm text-destructive">{fieldProps.error}</p>
      )}
    </div>
  )
}

export function ValidatedTextarea({
  name,
  label,
  description,
  required,
  className,
  ...props
}: ValidatedFieldProps & React.ComponentProps<typeof Textarea>) {
  const { getFieldProps, disabled } = useFormContext()
  const fieldProps = getFieldProps(name)

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={required ? "after:content-['*'] after:text-destructive after:ml-1" : ''}>
          {label}
        </Label>
      )}
      <Textarea
        id={name}
        {...props}
        {...fieldProps}
        disabled={disabled || props.disabled}
        className={cn(fieldProps.error && 'border-destructive focus-visible:ring-destructive')}
      />
      {description && !fieldProps.error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {fieldProps.error && (
        <p className="text-sm text-destructive">{fieldProps.error}</p>
      )}
    </div>
  )
}

export function ValidatedSelect({
  name,
  label,
  description,
  required,
  className,
  children,
  placeholder,
  ...props
}: ValidatedFieldProps & {
  children: React.ReactNode
  placeholder?: string
}) {
  const { getFieldProps, disabled } = useFormContext()
  const fieldProps = getFieldProps(name)

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={required ? "after:content-['*'] after:text-destructive after:ml-1" : ''}>
          {label}
        </Label>
      )}
      <Select
        value={fieldProps.value || ''}
        onValueChange={fieldProps.onChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(fieldProps.error && 'border-destructive focus:ring-destructive')}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      {description && !fieldProps.error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {fieldProps.error && (
        <p className="text-sm text-destructive">{fieldProps.error}</p>
      )}
    </div>
  )
}

export function ValidatedCheckbox({
  name,
  label,
  description,
  className,
  ...props
}: ValidatedFieldProps & Omit<React.ComponentProps<typeof Checkbox>, 'checked' | 'onCheckedChange'>) {
  const { getFieldProps, disabled } = useFormContext()
  const fieldProps = getFieldProps(name)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          checked={fieldProps.value || false}
          onCheckedChange={fieldProps.onChange}
          disabled={disabled || props.disabled}
          {...props}
        />
        {label && (
          <Label htmlFor={name} className="text-sm font-normal">
            {label}
          </Label>
        )}
      </div>
      {description && !fieldProps.error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {fieldProps.error && (
        <p className="text-sm text-destructive">{fieldProps.error}</p>
      )}
    </div>
  )
}