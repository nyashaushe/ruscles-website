/**
 * Tests for WhatsApp configuration and validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    getWhatsAppConfig,
    getSafeWhatsAppConfig,
    createDefaultMessage,
    getMessageTemplate,
    MESSAGE_TEMPLATES,
    createWelcomeMessage,
    getCompleteWelcomeMessage,
    validateWelcomeConfig,
    checkEnvironmentVariables,
    WHATSAPP_ENV_VARS,
    WhatsAppConfig,
    WhatsAppWelcomeConfig,
} from '../../lib/config/whatsapp';
import {
    validatePhoneNumber,
    validateMessage,
    validateBusinessName,
    validateCompleteConfig,
    formatValidationErrors,
    formatValidationWarnings,
    WhatsAppConfigError,
    VALIDATION_ERRORS,
    VALIDATION_WARNINGS,
} from '../../lib/utils/whatsapp-validation';

describe('WhatsApp Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset environment variables
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    describe('getWhatsAppConfig', () => {
        it('should return valid configuration when all env vars are set', () => {
            process.env.WHATSAPP_BUSINESS_NUMBER = '+1234567890';
            process.env.WHATSAPP_DEFAULT_MESSAGE = 'Hello from test';
            process.env.WHATSAPP_BUSINESS_NAME = 'Test Business';
            process.env.WHATSAPP_ENABLED = 'true';

            const config = getWhatsAppConfig();

            expect(config).toEqual({
                phoneNumber: '+1234567890',
                defaultMessage: 'Hello from test',
                businessName: 'Test Business',
                enabled: true,
            });
        });

        it('should use default values when optional env vars are missing', () => {
            process.env.WHATSAPP_BUSINESS_NUMBER = '+1234567890';

            const config = getWhatsAppConfig();

            expect(config.phoneNumber).toBe('+1234567890');
            expect(config.defaultMessage).toContain('interested in your services');
            expect(config.businessName).toBe('Business');
            expect(config.enabled).toBe(true);
        });

        it('should throw WhatsAppConfigError when phone number is missing', () => {
            delete process.env.WHATSAPP_BUSINESS_NUMBER;

            expect(() => getWhatsAppConfig()).toThrow(WhatsAppConfigError);
        });

        it('should throw WhatsAppConfigError when phone number is invalid', () => {
            process.env.WHATSAPP_BUSINESS_NUMBER = 'invalid-phone';

            expect(() => getWhatsAppConfig()).toThrow(WhatsAppConfigError);
        });

        it('should set enabled to false when explicitly disabled', () => {
            process.env.WHATSAPP_BUSINESS_NUMBER = '+1234567890';
            process.env.WHATSAPP_ENABLED = 'false';

            const config = getWhatsAppConfig();

            expect(config.enabled).toBe(false);
        });
    });

    describe('getSafeWhatsAppConfig', () => {
        it('should return valid config when environment is correct', () => {
            process.env.WHATSAPP_BUSINESS_NUMBER = '+1234567890';
            process.env.WHATSAPP_BUSINESS_NAME = 'Test Business';

            const config = getSafeWhatsAppConfig();

            expect(config.enabled).toBe(true);
            expect(config.phoneNumber).toBe('+1234567890');
        });

        it('should return disabled config when validation fails', () => {
            process.env.WHATSAPP_BUSINESS_NUMBER = 'invalid';

            const config = getSafeWhatsAppConfig();

            expect(config.enabled).toBe(false);
        });

        it('should return disabled config when environment is missing', () => {
            delete process.env.WHATSAPP_BUSINESS_NUMBER;

            const config = getSafeWhatsAppConfig();

            expect(config.enabled).toBe(false);
            expect(config.phoneNumber).toBe('');
        });
    });

    describe('createDefaultMessage', () => {
        it('should create message with business name', () => {
            const message = createDefaultMessage('Test Business');

            expect(message).toContain('Test Business');
            expect(message).toContain('interested in');
        });

        it('should append custom message when provided', () => {
            const message = createDefaultMessage('Test Business', 'I need help with pricing');

            expect(message).toContain('Test Business');
            expect(message).toContain('I need help with pricing');
        });

        it('should handle empty custom message', () => {
            const message = createDefaultMessage('Test Business', '   ');

            expect(message).toContain('Test Business');
            expect(message).toContain('Could you please provide more information?');
        });
    });

    describe('getMessageTemplate', () => {
        it('should return general template', () => {
            const message = getMessageTemplate('general', 'Test Business');

            expect(message).toContain('Test Business');
            expect(message).toContain('interested in');
        });

        it('should return investment template', () => {
            const message = getMessageTemplate('investment', 'Test Business');

            expect(message).toContain('Test Business');
            expect(message).toContain('investment opportunities');
        });

        it('should return custom template with message', () => {
            const message = getMessageTemplate('custom', 'Test Business', 'pricing information');

            expect(message).toContain('Test Business');
            expect(message).toContain('pricing information');
        });
    });

    describe('Welcome Message Configuration', () => {
        describe('createWelcomeMessage', () => {
            const mockConfig: WhatsAppConfig = {
                phoneNumber: '+1234567890',
                defaultMessage: 'Hello! I am interested in your services.',
                businessName: 'Test Business',
                enabled: true,
            };

            it('should use default message when custom welcome is disabled', () => {
                const welcomeConfig: WhatsAppWelcomeConfig = {
                    useCustomWelcome: false,
                    includeBusinessName: false,
                    includeTimestamp: false,
                };

                const message = createWelcomeMessage(mockConfig, welcomeConfig);

                expect(message).toBe(mockConfig.defaultMessage);
            });

            it('should use custom welcome message when enabled', () => {
                const welcomeConfig: WhatsAppWelcomeConfig = {
                    useCustomWelcome: true,
                    welcomeMessage: 'Custom welcome message',
                    includeBusinessName: false,
                    includeTimestamp: false,
                };

                const message = createWelcomeMessage(mockConfig, welcomeConfig);

                expect(message).toBe('Custom welcome message');
            });

            it('should include business name when enabled', () => {
                const welcomeConfig: WhatsAppWelcomeConfig = {
                    useCustomWelcome: false,
                    includeBusinessName: true,
                    includeTimestamp: false,
                };

                const message = createWelcomeMessage(mockConfig, welcomeConfig);

                expect(message).toContain('Test Business');
            });

            it('should include timestamp when enabled', () => {
                const welcomeConfig: WhatsAppWelcomeConfig = {
                    useCustomWelcome: false,
                    includeBusinessName: false,
                    includeTimestamp: true,
                };

                const message = createWelcomeMessage(mockConfig, welcomeConfig);

                expect(message).toContain('Sent at:');
            });

            it('should append custom message when provided', () => {
                const welcomeConfig: WhatsAppWelcomeConfig = {
                    useCustomWelcome: false,
                    includeBusinessName: false,
                    includeTimestamp: false,
                };

                const message = createWelcomeMessage(mockConfig, welcomeConfig, 'Additional info');

                expect(message).toContain('Additional message: Additional info');
            });
        });

        describe('validateWelcomeConfig', () => {
            it('should validate successful config', () => {
                const welcomeConfig: WhatsAppWelcomeConfig = {
                    useCustomWelcome: true,
                    welcomeMessage: 'Valid welcome message',
                    includeBusinessName: true,
                    includeTimestamp: false,
                };

                const result = validateWelcomeConfig(welcomeConfig);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should fail when custom welcome is enabled but message is missing', () => {
                const welcomeConfig: WhatsAppWelcomeConfig = {
                    useCustomWelcome: true,
                    includeBusinessName: true,
                    includeTimestamp: false,
                };

                const result = validateWelcomeConfig(welcomeConfig);

                expect(result.isValid).toBe(false);
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0].code).toBe('WELCOME_MESSAGE_REQUIRED');
            });

            it('should fail when welcome message is too long', () => {
                const welcomeConfig: WhatsAppWelcomeConfig = {
                    useCustomWelcome: true,
                    welcomeMessage: 'a'.repeat(501),
                    includeBusinessName: true,
                    includeTimestamp: false,
                };

                const result = validateWelcomeConfig(welcomeConfig);

                expect(result.isValid).toBe(false);
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0].code).toBe('WELCOME_MESSAGE_TOO_LONG');
            });
        });
    });

    describe('checkEnvironmentVariables', () => {
        it('should return valid when required vars are set', () => {
            process.env.WHATSAPP_BUSINESS_NUMBER = '+1234567890';

            const result = checkEnvironmentVariables();

            expect(result.isValid).toBe(true);
            expect(result.missing).toHaveLength(0);
        });

        it('should return invalid when required vars are missing', () => {
            delete process.env.WHATSAPP_BUSINESS_NUMBER;

            const result = checkEnvironmentVariables();

            expect(result.isValid).toBe(false);
            expect(result.missing).toContain(WHATSAPP_ENV_VARS.BUSINESS_NUMBER);
        });

        it('should list optional missing variables', () => {
            process.env.WHATSAPP_BUSINESS_NUMBER = '+1234567890';
            delete process.env.WHATSAPP_DEFAULT_MESSAGE;

            const result = checkEnvironmentVariables();

            expect(result.isValid).toBe(true);
            expect(result.optional).toContain(WHATSAPP_ENV_VARS.DEFAULT_MESSAGE);
        });
    });
});

describe('WhatsApp Validation', () => {
    describe('validatePhoneNumber', () => {
        it('should validate correct international phone number', () => {
            const result = validatePhoneNumber('+1234567890');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail for missing phone number', () => {
            const result = validatePhoneNumber('');

            expect(result.isValid).toBe(false);
            expect(result.errors[0].code).toBe(VALIDATION_ERRORS.PHONE_REQUIRED);
        });

        it('should fail for phone number without + prefix', () => {
            const result = validatePhoneNumber('1234567890');

            expect(result.isValid).toBe(false);
            expect(result.errors[0].code).toBe(VALIDATION_ERRORS.PHONE_INVALID_FORMAT);
        });

        it('should fail for too short phone number', () => {
            const result = validatePhoneNumber('+123456');

            expect(result.isValid).toBe(false);
            expect(result.errors[0].code).toBe(VALIDATION_ERRORS.PHONE_TOO_SHORT);
        });

        it('should fail for too long phone number', () => {
            const result = validatePhoneNumber('+1234567890123456');

            expect(result.isValid).toBe(false);
            expect(result.errors[0].code).toBe(VALIDATION_ERRORS.PHONE_TOO_LONG);
        });

        it('should warn for unusually short but valid phone number', () => {
            const result = validatePhoneNumber('+1234567');

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].code).toBe(VALIDATION_WARNINGS.PHONE_UNUSUAL_FORMAT);
        });
    });

    describe('validateMessage', () => {
        it('should validate correct message', () => {
            const result = validateMessage('Hello, I am interested in your services');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail for empty message', () => {
            const result = validateMessage('');

            expect(result.isValid).toBe(false);
            expect(result.errors[0].code).toBe(VALIDATION_ERRORS.MESSAGE_REQUIRED);
        });

        it('should fail for too long message', () => {
            const result = validateMessage('a'.repeat(1001));

            expect(result.isValid).toBe(false);
            expect(result.errors[0].code).toBe(VALIDATION_ERRORS.MESSAGE_TOO_LONG);
        });

        it('should warn for very short message', () => {
            const result = validateMessage('Hi');

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].code).toBe(VALIDATION_WARNINGS.MESSAGE_TOO_SHORT);
        });
    });

    describe('validateBusinessName', () => {
        it('should validate correct business name', () => {
            const result = validateBusinessName('Test Business Inc');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail for empty business name', () => {
            const result = validateBusinessName('');

            expect(result.isValid).toBe(false);
            expect(result.errors[0].code).toBe(VALIDATION_ERRORS.BUSINESS_NAME_REQUIRED);
        });

        it('should fail for too long business name', () => {
            const result = validateBusinessName('a'.repeat(101));

            expect(result.isValid).toBe(false);
            expect(result.errors[0].code).toBe(VALIDATION_ERRORS.BUSINESS_NAME_TOO_LONG);
        });

        it('should warn for very short business name', () => {
            const result = validateBusinessName('AB');

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].code).toBe(VALIDATION_WARNINGS.BUSINESS_NAME_TOO_SHORT);
        });
    });

    describe('validateCompleteConfig', () => {
        it('should validate complete valid configuration', () => {
            const config = {
                phoneNumber: '+1234567890',
                defaultMessage: 'Hello, I am interested in your services',
                businessName: 'Test Business',
            };

            const result = validateCompleteConfig(config);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should collect all validation errors', () => {
            const config = {
                phoneNumber: 'invalid',
                defaultMessage: '',
                businessName: '',
            };

            const result = validateCompleteConfig(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('formatValidationErrors', () => {
        it('should format errors correctly', () => {
            const errors = [
                { field: 'phone', message: 'Invalid phone', code: 'INVALID' },
                { field: 'message', message: 'Missing message', code: 'MISSING' },
            ];

            const formatted = formatValidationErrors(errors);

            expect(formatted).toContain('• Invalid phone');
            expect(formatted).toContain('• Missing message');
        });

        it('should return empty string for no errors', () => {
            const formatted = formatValidationErrors([]);

            expect(formatted).toBe('');
        });
    });

    describe('WhatsAppConfigError', () => {
        it('should create error from validation result', () => {
            const validationResult = {
                isValid: false,
                errors: [{ field: 'phone', message: 'Invalid phone', code: 'INVALID' }],
                warnings: [],
            };

            const error = WhatsAppConfigError.fromValidationResult(validationResult);

            expect(error).toBeInstanceOf(WhatsAppConfigError);
            expect(error.errors).toHaveLength(1);
            expect(error.message).toContain('Invalid phone');
        });
    });
});