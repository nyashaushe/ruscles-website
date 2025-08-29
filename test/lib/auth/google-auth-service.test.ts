import { GoogleAuthService } from '@/lib/auth/google-auth-service'

// Mock environment variables
const mockEnv = {
    ALLOWED_ADMIN_EMAILS: 'admin@example.com,test@example.com'
}

describe('GoogleAuthService', () => {
    let service: GoogleAuthService

    beforeEach(() => {
        service = new GoogleAuthService()
        // Mock environment variables
        process.env.ALLOWED_ADMIN_EMAILS = mockEnv.ALLOWED_ADMIN_EMAILS

        // Mock console methods to avoid noise in tests
        vi.spyOn(console, 'info').mockImplementation(() => { })
        vi.spyOn(console, 'warn').mockImplementation(() => { })
        vi.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        vi.restoreAllMocks()
        delete process.env.ALLOWED_ADMIN_EMAILS
    })

    describe('validateCredentials', () => {
        it('should validate credentials for allowed email with valid password', async () => {
            const result = await service.validateCredentials('admin@example.com', 'password123')

            expect(result).toEqual({
                id: 'admin@example.com',
                email: 'admin@example.com',
                name: 'Admin',
                image: expect.stringContaining('ui-avatars.com')
            })
        })

        it('should reject empty email', async () => {
            await expect(service.validateCredentials('', 'password123'))
                .rejects.toThrow('EMAIL_PASSWORD_REQUIRED')
        })

        it('should reject empty password', async () => {
            await expect(service.validateCredentials('admin@example.com', ''))
                .rejects.toThrow('EMAIL_PASSWORD_REQUIRED')
        })

        it('should reject invalid email format', async () => {
            await expect(service.validateCredentials('invalid-email', 'password123'))
                .rejects.toThrow('AUTHENTICATION_FAILED')
        })

        it('should reject unauthorized email', async () => {
            await expect(service.validateCredentials('unauthorized@example.com', 'password123'))
                .rejects.toThrow('EMAIL_NOT_AUTHORIZED')
        })

        it('should reject password shorter than 6 characters', async () => {
            await expect(service.validateCredentials('admin@example.com', '12345'))
                .rejects.toThrow('PASSWORD_TOO_SHORT')
        })

        it('should handle network errors gracefully', async () => {
            // Mock Math.random to force network error
            const originalRandom = Math.random
            Math.random = vi.fn().mockReturnValue(0.01) // Force network error (< 0.05)

            await expect(service.validateCredentials('admin@example.com', 'password123'))
                .rejects.toThrow('NETWORK_ERROR')

            Math.random = originalRandom
        })

        it('should handle service unavailable errors', async () => {
            // Mock Math.random to force service unavailable
            const originalRandom = Math.random
            let callCount = 0
            Math.random = vi.fn(() => {
                callCount++
                if (callCount === 1) return 0.5 // First call for delay
                if (callCount === 2) return 0.1 // Second call for network error check (> 0.05)
                if (callCount === 3) return 0.01 // Third call for service unavailable (< 0.02)
                return 0.5
            })

            await expect(service.validateCredentials('admin@example.com', 'password123'))
                .rejects.toThrow('AUTHENTICATION_FAILED')

            Math.random = originalRandom
        })

        it('should extract name from email correctly', async () => {
            // Add john.doe@example.com to allowed emails for this test
            process.env.ALLOWED_ADMIN_EMAILS = 'admin@example.com,test@example.com,john.doe@example.com'
            const result = await service.validateCredentials('john.doe@example.com', 'password123')
            expect(result?.name).toBe('John Doe')
        })

        it('should generate avatar URL with encoded name', async () => {
            // Add test.user@example.com to allowed emails for this test
            process.env.ALLOWED_ADMIN_EMAILS = 'admin@example.com,test@example.com,test.user@example.com'
            const result = await service.validateCredentials('test.user@example.com', 'password123')
            expect(result?.image).toContain('name=Test%20User')
            expect(result?.image).toContain('ui-avatars.com')
        })
    })

    describe('getAllowedEmails', () => {
        it('should return list of allowed emails', () => {
            const emails = service.getAllowedEmails()
            expect(emails).toEqual(['admin@example.com', 'test@example.com'])
        })

        it('should return empty array when no emails configured', () => {
            delete process.env.ALLOWED_ADMIN_EMAILS
            const emails = service.getAllowedEmails()
            expect(emails).toEqual([])
        })

        it('should handle whitespace in email list', () => {
            process.env.ALLOWED_ADMIN_EMAILS = ' admin@example.com , test@example.com '
            const emails = service.getAllowedEmails()
            expect(emails).toEqual(['admin@example.com', 'test@example.com'])
        })
    })

    describe('error logging', () => {
        it('should log unauthorized email attempts', async () => {
            const consoleSpy = vi.spyOn(console, 'info')

            await expect(service.validateCredentials('unauthorized@example.com', 'password123'))
                .rejects.toThrow()

            expect(consoleSpy).toHaveBeenCalledWith(
                'Unauthorized email attempt:',
                expect.objectContaining({
                    error: 'EMAIL_NOT_AUTHORIZED',
                    email: expect.stringMatching(/u.*@example\.com/)
                })
            )
        })

        it('should log validation errors', async () => {
            const consoleSpy = vi.spyOn(console, 'info')

            await expect(service.validateCredentials('invalid-email', 'password123'))
                .rejects.toThrow()

            expect(consoleSpy).toHaveBeenCalledWith(
                'Validation Error:',
                expect.objectContaining({
                    error: 'INVALID_EMAIL_FORMAT'
                })
            )
        })

        it('should mask email addresses in logs', async () => {
            const consoleSpy = vi.spyOn(console, 'info')

            await expect(service.validateCredentials('unauthorized@example.com', 'password123'))
                .rejects.toThrow()

            const logCall = consoleSpy.mock.calls[0]
            expect(logCall[1].email).toMatch(/u.*@example\.com/)
        })
    })
})