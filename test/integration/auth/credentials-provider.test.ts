import { authOptions } from '@/lib/auth'

describe('Credentials Provider Integration', () => {
    let credentialsProvider: any

    beforeEach(() => {
        // Set up environment variables for testing
        process.env.ALLOWED_ADMIN_EMAILS = 'admin@example.com,test@example.com'

        // Find the credentials provider from authOptions
        credentialsProvider = authOptions.providers?.find(
            provider => provider.id === 'credentials'
        )

        expect(credentialsProvider).toBeDefined()
    })

    afterEach(() => {
        delete process.env.ALLOWED_ADMIN_EMAILS
    })

    describe('provider configuration', () => {
        it('should have correct provider configuration', () => {
            expect(credentialsProvider.id).toBe('credentials')
            expect(credentialsProvider.name).toBe('Email and Password')
            expect(credentialsProvider.credentials).toEqual({
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'admin@example.com'
                },
                password: {
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Enter your password'
                }
            })
        })

        it('should have authorize function', () => {
            expect(typeof credentialsProvider.authorize).toBe('function')
        })
    })

    describe('authorize function behavior', () => {
        it('should authenticate valid credentials for allowed email', async () => {
            const result = await credentialsProvider.authorize({
                email: 'admin@example.com',
                password: 'password123'
            })

            expect(result).toEqual({
                id: 'admin@example.com',
                email: 'admin@example.com',
                name: 'Admin',
                image: expect.stringContaining('ui-avatars.com')
            })
        })

        it('should reject missing email', async () => {
            await expect(credentialsProvider.authorize({
                password: 'password123'
            })).rejects.toThrow()
        })

        it('should reject missing password', async () => {
            await expect(credentialsProvider.authorize({
                email: 'admin@example.com'
            })).rejects.toThrow()
        })

        it('should reject unauthorized email', async () => {
            await expect(credentialsProvider.authorize({
                email: 'unauthorized@example.com',
                password: 'password123'
            })).rejects.toThrow()
        })

        it('should reject invalid email format', async () => {
            await expect(credentialsProvider.authorize({
                email: 'invalid-email',
                password: 'password123'
            })).rejects.toThrow()
        })

        it('should reject short password', async () => {
            await expect(credentialsProvider.authorize({
                email: 'admin@example.com',
                password: '123'
            })).rejects.toThrow()
        })
    })
})