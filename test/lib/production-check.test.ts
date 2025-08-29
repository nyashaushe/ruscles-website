import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    validateCredentialsAuthConfig,
    validateGoogleAuthServiceConfig,
    checkProductionEnvironment
} from '@/lib/production-check'

describe('Production Check Utilities', () => {
    const originalEnv = process.env

    beforeEach(() => {
        // Reset environment variables
        process.env = { ...originalEnv }
    })

    afterEach(() => {
        process.env = originalEnv
    })

    describe('validateCredentialsAuthConfig', () => {
        it('should validate valid credentials configuration', () => {
            process.env.ALLOWED_ADMIN_EMAILS = 'admin@example.com,user@example.com'
            process.env.NEXTAUTH_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters'
            process.env.NEXTAUTH_URL = 'http://localhost:3000'

            const result = validateCredentialsAuthConfig()

            expect(result.isValid).toBe(true)
            expect(result.allowedEmailsCount).toBe(2)
            expect(result.errors).toHaveLength(0)
        })

        it('should detect missing ALLOWED_ADMIN_EMAILS', () => {
            delete process.env.ALLOWED_ADMIN_EMAILS
            process.env.NEXTAUTH_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters'
            process.env.NEXTAUTH_URL = 'http://localhost:3000'

            const result = validateCredentialsAuthConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('ALLOWED_ADMIN_EMAILS is required for credentials authentication')
        })

        it('should detect invalid email format', () => {
            process.env.ALLOWED_ADMIN_EMAILS = 'invalid-email,admin@example.com'
            process.env.NEXTAUTH_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters'
            process.env.NEXTAUTH_URL = 'http://localhost:3000'

            const result = validateCredentialsAuthConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors.some(error => error.includes('Invalid email format'))).toBe(true)
        })

        it('should detect short NEXTAUTH_SECRET', () => {
            process.env.ALLOWED_ADMIN_EMAILS = 'admin@example.com'
            process.env.NEXTAUTH_SECRET = 'short'
            process.env.NEXTAUTH_URL = 'http://localhost:3000'

            const result = validateCredentialsAuthConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('NEXTAUTH_SECRET should be at least 32 characters long for security')
        })

        it('should detect invalid NEXTAUTH_URL', () => {
            process.env.ALLOWED_ADMIN_EMAILS = 'admin@example.com'
            process.env.NEXTAUTH_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters'
            process.env.NEXTAUTH_URL = 'not-a-url'

            const result = validateCredentialsAuthConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('NEXTAUTH_URL must be a valid URL')
        })

        it('should detect duplicate emails', () => {
            process.env.ALLOWED_ADMIN_EMAILS = 'admin@example.com,Admin@Example.com'
            process.env.NEXTAUTH_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters'
            process.env.NEXTAUTH_URL = 'http://localhost:3000'

            const result = validateCredentialsAuthConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('ALLOWED_ADMIN_EMAILS contains duplicate email addresses')
        })
    })

    describe('validateGoogleAuthServiceConfig', () => {
        it('should validate complete Google OAuth configuration', () => {
            process.env.GOOGLE_CLIENT_ID = 'test-client-id'
            process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
            process.env.NODE_ENV = 'development'
            process.env.NEXTAUTH_URL = 'http://localhost:3000'
            process.env.NEXTAUTH_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters'

            const result = validateGoogleAuthServiceConfig()

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should warn about missing Google OAuth credentials', () => {
            delete process.env.GOOGLE_CLIENT_ID
            delete process.env.GOOGLE_CLIENT_SECRET

            const result = validateGoogleAuthServiceConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('GOOGLE_CLIENT_ID is recommended as fallback authentication method')
            expect(result.errors).toContain('GOOGLE_CLIENT_SECRET is recommended as fallback authentication method')
        })

        it('should detect production configuration issues', () => {
            process.env.NODE_ENV = 'production'
            process.env.NEXTAUTH_URL = 'http://localhost:3000'
            process.env.NEXTAUTH_SECRET = 'your-super-secret-key-change-this-in-production'
            process.env.GOOGLE_CLIENT_ID = 'test-client-id'
            process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'

            const result = validateGoogleAuthServiceConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('NEXTAUTH_URL should not use localhost in production')
            expect(result.errors).toContain('NEXTAUTH_SECRET must be changed from default value in production')
        })
    })

    describe('checkProductionEnvironment', () => {
        it('should validate complete production environment', () => {
            process.env.NEXTAUTH_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters'
            process.env.NEXTAUTH_URL = 'http://localhost:3000'
            process.env.GOOGLE_CLIENT_ID = 'test-client-id'
            process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
            process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
            process.env.ALLOWED_ADMIN_EMAILS = 'admin@example.com'

            const result = checkProductionEnvironment()

            expect(result).toBe(true)
        })

        it('should detect missing required environment variables', () => {
            delete process.env.NEXTAUTH_SECRET
            delete process.env.DATABASE_URL

            // Mock console.error to avoid test output noise
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const result = checkProductionEnvironment()

            expect(result).toBe(false)
            consoleSpy.mockRestore()
        })
    })
})