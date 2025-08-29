/**
 * WhatsApp configuration validation and error handling utilities
 */

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
}

/**
 * Error codes for WhatsApp validation
 */
export const VALIDATION_ERRORS = {
    PHONE_REQUIRED: 'PHONE_REQUIRED',
    PHONE_INVALID_FORMAT: 'PHONE_INVALID_FORMAT',
    PHONE_TOO_SHORT: 'PHONE_TOO_SHORT',
    PHONE_TOO_LONG: 'PHONE_TOO_LONG',
    MESSAGE_REQUIRED: 'MESSAGE_REQUIRED',
    MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
    BUSINESS_NAME_REQUIRED: 'BUSINESS_NAME_REQUIRED',
    BUSINESS_NAME_TOO_LONG: 'BUSINESS_NAME_TOO_LONG',
} as const;

/**
 * Warning codes for WhatsApp validation
 */
export const VALIDATION_WARNINGS = {
    MESSAGE_TOO_SHORT: 'MESSAGE_TOO_SHORT',
    PHONE_UNUSUAL_FORMAT: 'PHONE_UNUSUAL_FORMAT',
    BUSINESS_NAME_TOO_SHORT: 'BUSINESS_NAME_TOO_SHORT',
} as const;

/**
 * Validates a phone number with detailed error reporting
 * @param phoneNumber - Phone number to validate
 * @returns ValidationResult with detailed feedback
 */
export function validatePhoneNumber(phoneNumber: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if phone number is provided
    if (!phoneNumber || phoneNumber.trim().length === 0) {
        errors.push({
            field: 'phoneNumber',
            message: 'Phone number is required',
            code: VALIDATION_ERRORS.PHONE_REQUIRED,
        });
        return { isValid: false, errors, warnings };
    }

    // Clean the phone number
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Check basic format (must start with +)
    if (!cleaned.startsWith('+')) {
        errors.push({
            field: 'phoneNumber',
            message: 'Phone number must start with + (international format)',
            code: VALIDATION_ERRORS.PHONE_INVALID_FORMAT,
        });
    }

    // Check length constraints
    const digitsOnly = cleaned.substring(1); // Remove the +
    if (digitsOnly.length < 7) {
        errors.push({
            field: 'phoneNumber',
            message: 'Phone number must have at least 7 digits after country code',
            code: VALIDATION_ERRORS.PHONE_TOO_SHORT,
        });
    } else if (digitsOnly.length > 15) {
        errors.push({
            field: 'phoneNumber',
            message: 'Phone number must have no more than 15 digits after country code',
            code: VALIDATION_ERRORS.PHONE_TOO_LONG,
        });
    }

    // Check for valid international format
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(cleaned)) {
        errors.push({
            field: 'phoneNumber',
            message: 'Phone number format is invalid. Use international format (+1234567890)',
            code: VALIDATION_ERRORS.PHONE_INVALID_FORMAT,
        });
    }

    // Add warnings for unusual but valid formats
    if (errors.length === 0) {
        // Check for very short numbers (might be valid but unusual)
        if (digitsOnly.length < 10) {
            warnings.push({
                field: 'phoneNumber',
                message: 'Phone number seems shorter than typical mobile numbers',
                code: VALIDATION_WARNINGS.PHONE_UNUSUAL_FORMAT,
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validates a message with detailed error reporting
 * @param message - Message to validate
 * @returns ValidationResult with detailed feedback
 */
export function validateMessage(message: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if message is provided
    if (!message || message.trim().length === 0) {
        errors.push({
            field: 'message',
            message: 'Default message is required',
            code: VALIDATION_ERRORS.MESSAGE_REQUIRED,
        });
        return { isValid: false, errors, warnings };
    }

    const trimmedMessage = message.trim();

    // Check length constraints
    if (trimmedMessage.length > 1000) {
        errors.push({
            field: 'message',
            message: 'Message must be less than 1000 characters',
            code: VALIDATION_ERRORS.MESSAGE_TOO_LONG,
        });
    }

    // Add warnings for very short messages
    if (trimmedMessage.length < 10) {
        warnings.push({
            field: 'message',
            message: 'Message seems very short. Consider adding more context.',
            code: VALIDATION_WARNINGS.MESSAGE_TOO_SHORT,
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validates a business name with detailed error reporting
 * @param businessName - Business name to validate
 * @returns ValidationResult with detailed feedback
 */
export function validateBusinessName(businessName: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if business name is provided
    if (!businessName || businessName.trim().length === 0) {
        errors.push({
            field: 'businessName',
            message: 'Business name is required',
            code: VALIDATION_ERRORS.BUSINESS_NAME_REQUIRED,
        });
        return { isValid: false, errors, warnings };
    }

    const trimmedName = businessName.trim();

    // Check length constraints
    if (trimmedName.length > 100) {
        errors.push({
            field: 'businessName',
            message: 'Business name must be less than 100 characters',
            code: VALIDATION_ERRORS.BUSINESS_NAME_TOO_LONG,
        });
    }

    // Add warnings for very short names
    if (trimmedName.length < 3) {
        warnings.push({
            field: 'businessName',
            message: 'Business name seems very short',
            code: VALIDATION_WARNINGS.BUSINESS_NAME_TOO_SHORT,
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validates complete WhatsApp configuration
 * @param config - Configuration object to validate
 * @returns ValidationResult with comprehensive feedback
 */
export function validateCompleteConfig(config: {
    phoneNumber: string;
    defaultMessage: string;
    businessName: string;
}): ValidationResult {
    const phoneValidation = validatePhoneNumber(config.phoneNumber);
    const messageValidation = validateMessage(config.defaultMessage);
    const businessValidation = validateBusinessName(config.businessName);

    const allErrors = [
        ...phoneValidation.errors,
        ...messageValidation.errors,
        ...businessValidation.errors,
    ];

    const allWarnings = [
        ...phoneValidation.warnings,
        ...messageValidation.warnings,
        ...businessValidation.warnings,
    ];

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
    };
}

/**
 * Formats validation errors for user display
 * @param errors - Array of validation errors
 * @returns Formatted error message string
 */
export function formatValidationErrors(errors: ValidationError[]): string {
    if (errors.length === 0) return '';

    const errorMessages = errors.map(error => `• ${error.message}`);
    return `Configuration errors:\n${errorMessages.join('\n')}`;
}

/**
 * Formats validation warnings for user display
 * @param warnings - Array of validation warnings
 * @returns Formatted warning message string
 */
export function formatValidationWarnings(warnings: ValidationWarning[]): string {
    if (warnings.length === 0) return '';

    const warningMessages = warnings.map(warning => `• ${warning.message}`);
    return `Configuration warnings:\n${warningMessages.join('\n')}`;
}

/**
 * Custom error class for WhatsApp configuration errors
 */
export class WhatsAppConfigError extends Error {
    public readonly errors: ValidationError[];
    public readonly warnings: ValidationWarning[];

    constructor(message: string, errors: ValidationError[] = [], warnings: ValidationWarning[] = []) {
        super(message);
        this.name = 'WhatsAppConfigError';
        this.errors = errors;
        this.warnings = warnings;
    }

    /**
     * Creates a WhatsAppConfigError from validation results
     * @param validationResult - Result from validation function
     * @returns WhatsAppConfigError instance
     */
    static fromValidationResult(validationResult: ValidationResult): WhatsAppConfigError {
        const message = formatValidationErrors(validationResult.errors);
        return new WhatsAppConfigError(message, validationResult.errors, validationResult.warnings);
    }
}

/**
 * Safely validates configuration with error handling
 * @param config - Configuration to validate
 * @returns ValidationResult (never throws)
 */
export function safeValidateConfig(config: {
    phoneNumber: string;
    defaultMessage: string;
    businessName: string;
}): ValidationResult {
    try {
        return validateCompleteConfig(config);
    } catch (error) {
        return {
            isValid: false,
            errors: [{
                field: 'general',
                message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                code: 'VALIDATION_FAILED',
            }],
            warnings: [],
        };
    }
}