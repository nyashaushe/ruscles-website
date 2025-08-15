'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { z } from 'zod'
import { ValidationError, ValidationResult, validateForm as validateFormData } from '@/lib/utils/form-validation'
import { logError, getContextualErrorMessage } from '@/lib/utils/error-handling'
import { useErrorReporting } from './use-error-reporting'

export interface FormValidationOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
  showErrorsImmediately?: boolean
}

export interface FieldState {
  value: any
  error?: string
  touched: boolean
  dirty: boolean
}

export interface FormState<T> {
  values: Partial<T>
  errors: Record<string, string>
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  submitCount: number
}

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialValues: Partial<T> = {},
  options: FormValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    showErrorsImmediately = false
  } = options

  const { reportValidationError, reportFormError } = useErrorReporting()

  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    dirty: {},
    isValid: false,
    isSubmitting: false,
    submitCount: 0
  })

  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({})
  const validationCache = useRef<Record<string, { value: any; error?: string }>>({})

  // Validate a single field
  const validateField = useCallback((fieldName: keyof T, value: any): string | undefined => {
    try {
      // Check cache first
      const cacheKey = `${String(fieldName)}_${JSON.stringify(value)}`
      if (validationCache.current[cacheKey]) {
        return validationCache.current[cacheKey].error
      }

      // Get the field schema
      const fieldSchema = (schema as any).shape?.[fieldName]
      if (!fieldSchema) return undefined

      // Validate the field
      fieldSchema.parse(value)
      
      // Cache successful validation
      validationCache.current[cacheKey] = { value, error: undefined }
      return undefined
    } catch (error) {
      let errorMessage = 'Validation error'
      
      if (error instanceof z.ZodError) {
        errorMessage = error.errors[0]?.message || errorMessage
      }

      // Cache error
      const cacheKey = `${String(fieldName)}_${JSON.stringify(value)}`
      validationCache.current[cacheKey] = { value, error: errorMessage }
      
      // Report validation error for monitoring
      reportValidationError(String(fieldName), value, errorMessage, {
        schema: schema.constructor.name,
        formValues: formState.values
      })
      
      return errorMessage
    }
  }, [schema])

  // Validate entire form
  const validateForm = useCallback((): ValidationResult<T> => {
    try {
      const result = validateFormData(schema, formState.values)
      
      if (result.success) {
        setFormState(prev => ({
          ...prev,
          errors: {},
          isValid: true
        }))
      } else {
        const errors: Record<string, string> = {}
        result.errors?.forEach(error => {
          errors[error.field] = error.message
        })
        
        setFormState(prev => ({
          ...prev,
          errors,
          isValid: false
        }))
      }
      
      return result
    } catch (error) {
      const errorMessage = getContextualErrorMessage(error, 'form_validation')
      logError(error, { context: 'form_validation', formValues: formState.values })
      
      setFormState(prev => ({
        ...prev,
        errors: { general: errorMessage },
        isValid: false
      }))
      
      return {
        success: false,
        errors: [{ field: 'general', message: errorMessage, code: 'validation_error' }]
      }
    }
  }, [schema, formState.values])

  // Set field value with validation
  const setFieldValue = useCallback((fieldName: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [fieldName]: value },
      dirty: { ...prev.dirty, [fieldName]: true }
    }))

    if (validateOnChange) {
      // Clear existing timeout
      if (debounceTimeouts.current[String(fieldName)]) {
        clearTimeout(debounceTimeouts.current[String(fieldName)])
      }

      // Set new timeout for debounced validation
      debounceTimeouts.current[String(fieldName)] = setTimeout(() => {
        const error = validateField(fieldName, value)
        
        setFormState(prev => {
          const shouldShowError = showErrorsImmediately || prev.touched[String(fieldName)] || prev.submitCount > 0
          
          return {
            ...prev,
            errors: shouldShowError 
              ? { ...prev.errors, [fieldName]: error || '' }
              : prev.errors
          }
        })
      }, debounceMs)
    }
  }, [validateOnChange, validateField, debounceMs, showErrorsImmediately])

  // Set field as touched
  const setFieldTouched = useCallback((fieldName: keyof T, touched = true) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: touched }
    }))

    if (validateOnBlur && touched) {
      const value = formState.values[fieldName]
      const error = validateField(fieldName, value)
      
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [fieldName]: error || '' }
      }))
    }
  }, [validateOnBlur, validateField, formState.values])

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: keyof T) => {
    setFieldTouched(fieldName, true)
  }, [setFieldTouched])

  // Handle field change
  const handleFieldChange = useCallback((fieldName: keyof T, value: any) => {
    setFieldValue(fieldName, value)
  }, [setFieldValue])

  // Set multiple values at once
  const setValues = useCallback((values: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
      dirty: Object.keys(values).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), prev.dirty)
    }))
  }, [])

  // Reset form
  const resetForm = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues || initialValues
    
    setFormState({
      values: resetValues,
      errors: {},
      touched: {},
      dirty: {},
      isValid: false,
      isSubmitting: false,
      submitCount: 0
    })

    // Clear validation cache
    validationCache.current = {}
    
    // Clear debounce timeouts
    Object.values(debounceTimeouts.current).forEach(clearTimeout)
    debounceTimeouts.current = {}
  }, [initialValues])

  // Submit form
  const submitForm = useCallback(async (onSubmit: (values: T) => Promise<void> | void) => {
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1
    }))

    try {
      const validation = validateForm()
      
      if (!validation.success) {
        // Show all errors on submit
        const errors: Record<string, string> = {}
        validation.errors?.forEach(error => {
          errors[error.field] = error.message
        })
        
        setFormState(prev => ({
          ...prev,
          errors,
          isSubmitting: false
        }))
        
        return { success: false, errors: validation.errors }
      }

      await onSubmit(validation.data!)
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false
      }))
      
      return { success: true, data: validation.data }
    } catch (error) {
      const errorMessage = getContextualErrorMessage(error, 'form_submission')
      reportFormError(error, 'form_submission', formState.values)
      
      setFormState(prev => ({
        ...prev,
        errors: { general: errorMessage },
        isSubmitting: false
      }))
      
      return { success: false, error }
    }
  }, [validateForm, formState.values])

  // Get field props for easy integration with form inputs
  const getFieldProps = useCallback((fieldName: keyof T) => {
    return {
      value: formState.values[fieldName] || '',
      onChange: (value: any) => handleFieldChange(fieldName, value),
      onBlur: () => handleFieldBlur(fieldName),
      error: formState.errors[String(fieldName)],
      touched: formState.touched[String(fieldName)],
      dirty: formState.dirty[String(fieldName)]
    }
  }, [formState, handleFieldChange, handleFieldBlur])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(clearTimeout)
    }
  }, [])

  return {
    // Form state
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    dirty: formState.dirty,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    submitCount: formState.submitCount,
    
    // Actions
    setFieldValue,
    setFieldTouched,
    setValues,
    resetForm,
    validateField,
    validateForm,
    submitForm,
    
    // Helpers
    getFieldProps,
    handleFieldChange,
    handleFieldBlur,
    
    // Computed properties
    hasErrors: Object.keys(formState.errors).length > 0,
    isDirty: Object.values(formState.dirty).some(Boolean),
    canSubmit: formState.isValid && !formState.isSubmitting
  }
}