import { AdminEmailValidator } from '@/lib/auth/email-validator'

describe('AdminEmailValidator', () => {
    const mockAllowedEmails = 'admin@example.com,test@example.com,user@domain.org'

    beforeEach(() => {
        process.env.ALLOWED_ADMIN_EMAILS = mockAllowedEmails
    })

    afterEach(() => {
        delete process.env.ALLOWED_ADMIN_EMAILS
    })

    describe('isValidEmailFormat', () => {
        it('should validate correct email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'admin+tag@example.org',
                'user123@test-domain.com'
            ]

            validEmails.forEach(email => {
                expect(AdminEmailValidator.isValidEmailFormat(email)).toBe(true)
            })
        })

        it('should reject invalid email formats', () => {
            const invalidEmails = [
                'invalid-email',
                '@example.com',
                'test@',
                'test.example.com',
                'test@.com',
                'test@example.',
                '',
                'test space@example.com'
            ]

            invalidEmails.forEach(email => {
                expect(AdminEmailValidator.isValidEmailFormat(email)).toBe(false)
            })
        })
    })

    describe('getAllowedEmails', () => {
        it('should return list of allowed emails', () => {
            const emails = AdminEmailValidator.getAllowedEmails()
            expect(emails).toEqual(['admin@example.com', 'test@example.com', 'user@domain.org'])
        })

        it('should return empty array when no emails configured', () => {
            delete process.env.ALLOWED_ADMIN_EMAILS
            const emails = AdminEmailValidator.getAllowedEmails()
            expect(emails).toEqual([])
        })

        it('should handle whitespace and empty entries', () => {
            process.env.ALLOWED_ADMIN_EMAILS = ' admin@example.com , , test@example.com , '
            const emails = AdminEmailValidator.getAllowedEmails()
            expect(emails).toEqual(['admin@example.com', 'test@example.com'])
        })

        it('should convert emails to lowercase', () => {
            process.env.ALLOWED_ADMIN_EMAILS = 'Admin@Example.COM,TEST@example.com'
            const emails = AdminEmailValidator.getAllowedEmails()
            expect(emails).toEqual(['admin@example.com', 'test@example.com'])
        })
    })

    describe('isAllowedEmail', () => {
        it('should return true for allowed emails', () => {
            expect(AdminEmailValidator.isAllowedEmail('admin@example.com')).toBe(true)
            expect(AdminEmailValidator.isAllowedEmail('test@example.com')).toBe(true)
        })

        it('should return false for non-allowed emails', () => {
            expect(AdminEmailValidator.isAllowedEmail('unauthorized@example.com')).toBe(false)
            expect(AdminEmailValidator.isAllowedEmail('hacker@malicious.com')).toBe(false)
        })

        it('should be case insensitive', () => {
            expect(AdminEmailValidator.isAllowedEmail('ADMIN@EXAMPLE.COM')).toBe(true)
            expect(AdminEmailValidator.isAllowedEmail('Test@Example.Com')).toBe(true)
        })

        it('should return false when no emails configured', () => {
            delete process.env.ALLOWED_ADMIN_EMAILS
            expect(AdminEmailValidator.isAllowedEmail('admin@example.com')).toBe(false)
        })
    })

    describe('validateEmail', () => {
        it('should return valid for correct and allowed email', () => {
            const result = AdminEmailValidator.validateEmail('admin@example.com')
            expect(result).toEqual({ isValid: true })
        })

        it('should return error for empty email', () => {
            const result = AdminEmailValidator.validateEmail('')
            expect(result).toEqual({
                isValid: false,
                error: 'Email is required'
            })
        })

        it('should return error for invalid email format', () => {
            const result = AdminEmailValidator.validateEmail('invalid-email')
            expect(result).toEqual({
                isValid: false,
                error: 'Invalid email format'
            })
        })

        it('should return error for unauthorized email', () => {
            const result = AdminEmailValidator.validateEmail('unauthorized@example.com')
            expect(result).toEqual({
                isValid: false,
                error: 'Email not authorized for admin access'
            })
        })

        it('should handle case insensitive validation', () => {
            const result = AdminEmailValidator.validateEmail('ADMIN@EXAMPLE.COM')
            expect(result).toEqual({ isValid: true })
        })
    })
})