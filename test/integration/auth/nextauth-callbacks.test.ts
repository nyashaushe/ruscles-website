import { authOptions } from '@/lib/auth'
import { AdminEmailValidator } from '@/lib/auth/email-validator'

// Mock the email validator
vi.mock('@/lib/auth/email-validator')
const mockAdminEmailValidator = vi.mocked(AdminEmailValidator)

describe('NextAuth Callbacks Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('signIn callback', () => {
        const signInCallback = authOptions.callbacks?.signIn

        it('should allow credentials provider signin', async () => {
            const result = await signInCallback?.({
                user: { id: '1', email: 'admin@example.com', name: 'Admin' },
                account: { provider: 'credentials', type: 'credentials' },
                profile: undefined
            })

            expect(result).toBe(true)
        })

        it('should allow OAuth signin for authorized email', async () => {
            mockAdminEmailValidator.validateEmail.mockReturnValue({ isValid: true })

            const result = await signInCallback?.({
                user: { id: '1', email: 'admin@example.com', name: 'Admin' },
                account: { provider: 'google', type: 'oauth' },
                profile: { email: 'admin@example.com' }
            })

            expect(result).toBe(true)
            expect(mockAdminEmailValidator.validateEmail).toHaveBeenCalledWith('admin@example.com')
        })

        it('should deny OAuth signin for unauthorized email', async () => {
            mockAdminEmailValidator.validateEmail.mockReturnValue({
                isValid: false,
                error: 'Email not authorized for admin access'
            })

            const result = await signInCallback?.({
                user: { id: '1', email: 'unauthorized@example.com', name: 'User' },
                account: { provider: 'google', type: 'oauth' },
                profile: { email: 'unauthorized@example.com' }
            })

            expect(result).toBe(false)
        })

        it('should deny OAuth signin when user has no email', async () => {
            const result = await signInCallback?.({
                user: { id: '1', name: 'User' },
                account: { provider: 'google', type: 'oauth' },
                profile: {}
            })

            expect(result).toBe(false)
        })
    })

    describe('jwt callback', () => {
        const jwtCallback = authOptions.callbacks?.jwt

        it('should persist user data in token', async () => {
            const user = { id: '1', email: 'admin@example.com', name: 'Admin' }
            const token = {}

            const result = await jwtCallback?.({
                token,
                user,
                account: null,
                profile: undefined,
                isNewUser: false
            })

            expect(result).toEqual({
                user: user
            })
        })

        it('should preserve existing token when no user provided', async () => {
            const existingToken = {
                user: { id: '1', email: 'admin@example.com', name: 'Admin' },
                iat: 1234567890,
                exp: 1234567890
            }

            const result = await jwtCallback?.({
                token: existingToken,
                user: undefined,
                account: null,
                profile: undefined,
                isNewUser: false
            })

            expect(result).toEqual(existingToken)
        })
    })

    describe('session callback', () => {
        const sessionCallback = authOptions.callbacks?.session

        it('should send user properties to client', async () => {
            const token = {
                user: { id: '1', email: 'admin@example.com', name: 'Admin' }
            }
            const session = { expires: '2024-12-31' }

            const result = await sessionCallback?.({
                session,
                token,
                user: undefined
            })

            expect(result).toEqual({
                expires: '2024-12-31',
                user: { id: '1', email: 'admin@example.com', name: 'Admin' }
            })
        })

        it('should preserve session when no token user', async () => {
            const token = {}
            const session = { expires: '2024-12-31' }

            const result = await sessionCallback?.({
                session,
                token,
                user: undefined
            })

            expect(result).toEqual(session)
        })
    })

    describe('auth configuration', () => {
        it('should have correct pages configuration', () => {
            expect(authOptions.pages).toEqual({
                signIn: '/auth/signin',
                error: '/auth/error'
            })
        })

        it('should use JWT strategy', () => {
            expect(authOptions.session?.strategy).toBe('jwt')
        })

        it('should have 30-day session max age', () => {
            expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60)
        })

        it('should have both providers configured', () => {
            expect(authOptions.providers).toHaveLength(2)

            const googleProvider = authOptions.providers?.find(p => p.id === 'google')
            const credentialsProvider = authOptions.providers?.find(p => p.id === 'credentials')

            expect(googleProvider).toBeDefined()
            expect(credentialsProvider).toBeDefined()
        })

        it('should enable debug in development', () => {
            const originalEnv = process.env.NODE_ENV
            process.env.NODE_ENV = 'development'

            // Re-import to get updated config
            expect(authOptions.debug).toBe(true)

            process.env.NODE_ENV = originalEnv
        })
    })
})