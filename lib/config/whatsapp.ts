/**
 * WhatsApp configuration management
 * Handles environment variables, default messages, and business context
 */

import {
    validateCompleteConfig,
    WhatsAppConfigError,
    ValidationResult
} from '../utils/whatsapp-validation';

export interface WhatsAppConfig {
    phoneNumber: string;
    defaultMessage: string;
    businessName: string;
    enabled: boolean;
}

export interface WhatsAppWelcomeConfig {
    useCustomWelcome: boolean;
    welcomeMessage?: string;
    includeBusinessName: boolean;
    includeTimestamp: boolean;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<WhatsAppConfig> = {
    defaultMessage: "Hello! I'm interested in your services. Could you please provide more information?",
    businessName: "Business",
    enabled: true,
};

/**
 * Gets WhatsApp configuration from environment variables with validation
 * @returns WhatsAppConfig object with validated configuration
 * @throws Error if required configuration is missing or invalid
 */
export function getWhatsAppConfig(): WhatsAppConfig {
    const phoneNumber = process.env.WHATSAPP_BUSINESS_NUMBER;

    if (!phoneNumber) {
        throw new WhatsAppConfigError('WHATSAPP_BUSINESS_NUMBER environment variable is required');
    }

    const config: WhatsAppConfig = {
        phoneNumber,
        defaultMessage: process.env.WHATSAPP_DEFAULT_MESSAGE || DEFAULT_CONFIG.defaultMessage!,
        businessName: process.env.WHATSAPP_BUSINESS_NAME || DEFAULT_CONFIG.businessName!,
        enabled: process.env.WHATSAPP_ENABLED !== 'false', // Default to true unless explicitly disabled
    };

    // Validate the configuration
    const validationResult = validateCompleteConfig(config);
    if (!validationResult.isValid) {
        throw WhatsAppConfigError.fromValidationResult(validationResult);
    }

    return config;
}

/**
 * Validates WhatsApp configuration
 * @param config - WhatsApp configuration object
 * @returns Array of validation errors (empty if valid)
 */
export function validateWhatsAppConfig(config: WhatsAppConfig): string[] {
    const errors: string[] = [];

    // Validate phone number format
    if (!config.phoneNumber) {
        errors.push('Phone number is required');
    } else if (!isValidPhoneNumber(config.phoneNumber)) {
        errors.push('Phone number must be in international format (+1234567890)');
    }

    // Validate business name
    if (!config.businessName || config.businessName.trim().length === 0) {
        errors.push('Business name is required');
    }

    // Validate default message
    if (!config.defaultMessage || config.defaultMessage.trim().length === 0) {
        errors.push('Default message is required');
    } else if (config.defaultMessage.length > 1000) {
        errors.push('Default message must be less than 1000 characters');
    }

    return errors;
}

/**
 * Basic phone number validation for international format
 * @param phoneNumber - Phone number to validate
 * @returns boolean indicating if format is valid
 */
function isValidPhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters except the leading +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Must start with + and have 7-15 digits after country code
    const phoneRegex = /^\+[1-9]\d{6,14}$/;

    return phoneRegex.test(cleaned);
}

/**
 * Creates a personalized default message with business context
 * @param businessName - Name of the business
 * @param customMessage - Optional custom message to append
 * @returns Formatted message with business context
 */
export function createDefaultMessage(businessName: string, customMessage?: string): string {
    const greeting = `Hello! I'm interested in ${businessName}'s services.`;

    if (customMessage && customMessage.trim().length > 0) {
        return `${greeting} ${customMessage.trim()}`;
    }

    return `${greeting} Could you please provide more information?`;
}

/**
 * Gets a safe WhatsApp configuration with error handling
 * Returns default values if environment configuration fails
 * @returns WhatsAppConfig object (may contain default values if env config fails)
 */
export function getSafeWhatsAppConfig(): WhatsAppConfig {
    try {
        const config = getWhatsAppConfig();
        const errors = validateWhatsAppConfig(config);

        if (errors.length > 0) {
            console.warn('WhatsApp configuration validation errors:', errors);
            // Return disabled config if validation fails
            return {
                ...config,
                enabled: false,
            };
        }

        return config;
    } catch (error) {
        console.error('Failed to load WhatsApp configuration:', error);

        // Return minimal safe configuration
        return {
            phoneNumber: '',
            defaultMessage: DEFAULT_CONFIG.defaultMessage!,
            businessName: DEFAULT_CONFIG.businessName!,
            enabled: false,
        };
    }
}

/**
 * Customizable message templates for different contexts
 */
export const MESSAGE_TEMPLATES = {
    general: (businessName: string) =>
        `Hello! I'm interested in ${businessName}'s services. Could you please provide more information?`,

    investment: (businessName: string) =>
        `Hi! I'd like to learn more about the investment opportunities available through ${businessName}. Could you please share some details?`,

    consultation: (businessName: string) =>
        `Hello! I'm interested in scheduling a consultation with ${businessName}. When would be a good time to discuss my needs?`,

    support: (businessName: string) =>
        `Hi! I need some assistance with ${businessName}'s services. Could you please help me?`,

    custom: (businessName: string, message: string) =>
        `Hello! I'm contacting ${businessName} regarding: ${message}`,
};

/**
 * Gets a message template by type
 * @param type - Template type
 * @param businessName - Business name to include in message
 * @param customMessage - Custom message for 'custom' template type
 * @returns Formatted message string
 */
export function getMessageTemplate(
    type: keyof typeof MESSAGE_TEMPLATES,
    businessName: string,
    customMessage?: string
): string {
    if (type === 'custom') {
        if (!customMessage) {
            throw new Error('Custom message is required for custom template type');
        }
        return MESSAGE_TEMPLATES.custom(businessName, customMessage);
    }

    const template = MESSAGE_TEMPLATES[type] as (businessName: string) => string;
    return template(businessName);
}

/**
 * Gets welcome message configuration from environment variables
 * @returns WhatsAppWelcomeConfig object
 */
export function getWelcomeConfig(): WhatsAppWelcomeConfig {
    return {
        useCustomWelcome: process.env.WHATSAPP_USE_CUSTOM_WELCOME === 'true',
        welcomeMessage: process.env.WHATSAPP_WELCOME_MESSAGE,
        includeBusinessName: process.env.WHATSAPP_INCLUDE_BUSINESS_NAME !== 'false',
        includeTimestamp: process.env.WHATSAPP_INCLUDE_TIMESTAMP === 'true',
    };
}

/**
 * Creates a personalized welcome message based on configuration
 * @param config - WhatsApp configuration
 * @param welcomeConfig - Welcome message configuration
 * @param customMessage - Optional custom message to append
 * @returns Formatted welcome message
 */
export function createWelcomeMessage(
    config: WhatsAppConfig,
    welcomeConfig: WhatsAppWelcomeConfig,
    customMessage?: string
): string {
    let message = '';

    // Use custom welcome message if configured
    if (welcomeConfig.useCustomWelcome && welcomeConfig.welcomeMessage) {
        message = welcomeConfig.welcomeMessage;
    } else {
        // Use default message from config
        message = config.defaultMessage;
    }

    // Add business name context if enabled
    if (welcomeConfig.includeBusinessName && !message.includes(config.businessName)) {
        message = message.replace(
            /your services/gi,
            `${config.businessName}'s services`
        );
    }

    // Add timestamp if enabled
    if (welcomeConfig.includeTimestamp) {
        const timestamp = new Date().toLocaleString();
        message = `${message}\n\nSent at: ${timestamp}`;
    }

    // Append custom message if provided
    if (customMessage && customMessage.trim().length > 0) {
        message = `${message}\n\nAdditional message: ${customMessage.trim()}`;
    }

    return message;
}

/**
 * Gets a complete welcome message using current configuration
 * @param customMessage - Optional custom message to append
 * @returns Formatted welcome message with all configured options
 */
export function getCompleteWelcomeMessage(customMessage?: string): string {
    try {
        const config = getWhatsAppConfig();
        const welcomeConfig = getWelcomeConfig();

        return createWelcomeMessage(config, welcomeConfig, customMessage);
    } catch (error) {
        console.error('Failed to create welcome message:', error);

        // Return safe fallback message
        const fallbackBusinessName = process.env.WHATSAPP_BUSINESS_NAME || 'our business';
        return `Hello! I'm interested in ${fallbackBusinessName}'s services. Could you please provide more information?`;
    }
}

/**
 * Validates welcome message configuration
 * @param welcomeConfig - Welcome configuration to validate
 * @returns ValidationResult with any issues found
 */
export function validateWelcomeConfig(welcomeConfig: WhatsAppWelcomeConfig): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    // If custom welcome is enabled, validate the message
    if (welcomeConfig.useCustomWelcome) {
        if (!welcomeConfig.welcomeMessage || welcomeConfig.welcomeMessage.trim().length === 0) {
            errors.push({
                field: 'welcomeMessage',
                message: 'Welcome message is required when custom welcome is enabled',
                code: 'WELCOME_MESSAGE_REQUIRED',
            });
        } else if (welcomeConfig.welcomeMessage.length > 500) {
            errors.push({
                field: 'welcomeMessage',
                message: 'Welcome message should be less than 500 characters',
                code: 'WELCOME_MESSAGE_TOO_LONG',
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
 * Environment variable names for WhatsApp configuration
 */
export const WHATSAPP_ENV_VARS = {
    BUSINESS_NUMBER: 'WHATSAPP_BUSINESS_NUMBER',
    DEFAULT_MESSAGE: 'WHATSAPP_DEFAULT_MESSAGE',
    BUSINESS_NAME: 'WHATSAPP_BUSINESS_NAME',
    ENABLED: 'WHATSAPP_ENABLED',
    USE_CUSTOM_WELCOME: 'WHATSAPP_USE_CUSTOM_WELCOME',
    WELCOME_MESSAGE: 'WHATSAPP_WELCOME_MESSAGE',
    INCLUDE_BUSINESS_NAME: 'WHATSAPP_INCLUDE_BUSINESS_NAME',
    INCLUDE_TIMESTAMP: 'WHATSAPP_INCLUDE_TIMESTAMP',
} as const;

/**
 * Checks if all required environment variables are set
 * @returns Object with missing variables and validation status
 */
export function checkEnvironmentVariables(): {
    isValid: boolean;
    missing: string[];
    optional: string[];
} {
    const required = [WHATSAPP_ENV_VARS.BUSINESS_NUMBER];
    const optional = [
        WHATSAPP_ENV_VARS.DEFAULT_MESSAGE,
        WHATSAPP_ENV_VARS.BUSINESS_NAME,
        WHATSAPP_ENV_VARS.ENABLED,
        WHATSAPP_ENV_VARS.USE_CUSTOM_WELCOME,
        WHATSAPP_ENV_VARS.WELCOME_MESSAGE,
        WHATSAPP_ENV_VARS.INCLUDE_BUSINESS_NAME,
        WHATSAPP_ENV_VARS.INCLUDE_TIMESTAMP,
    ];

    const missing = required.filter(varName => !process.env[varName]);
    const optionalMissing = optional.filter(varName => !process.env[varName]);

    return {
        isValid: missing.length === 0,
        missing,
        optional: optionalMissing,
    };
}