import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import middleware from '@/middleware'
import { authOptions } from '@/lib/auth'

// Mock environment variables
vi.mock('process', () => ({
    env: {
        NEXTAUTH_SECRET: 'test-secret-key-for-testing',
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-client-secret',
        ALLOWED_ADMIN_EMAILS: 'admin@example.com,test@example.com'
    }
}))

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
    getToken: vi.fn()
}))

const mockGetToken = vi.mocked(getToken)

describe('Middleware and Session Compatibility', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Session structure compatibility', () => {
        it('should handle OAuth-created sessions in middleware', async () => {
            const oauthToken = {
                user: {
                    id: 'oauth-user-123',
                    email: 'admin@example.com',
                    name: 'OAuth Admin',
                    image: 'https://example.com/avatar.jpg'
                },
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
            }

            mockGetToken.mockResolvedValue(oauthToken)

            const request = new NextRequest('http://localhost:3000/admin/dashboard')
            Object.defineProperty(request, 'nextauth', {
                value: { token: oauthToken },
                writable: true
            })

            const response = await middleware(request)

            // Should allow access to admin routes
            expect(response?.status).not.toBe(307) // Not a redirect
        })

        it('should handle credentials-created sessions in middleware', async () => {
            const credentialsToken = {
                user: {
                    id: 'cred-user-456',
                    email: 'admin@example.com',
                    name: 'Credentials Admin',
                    image: undefined // Credentials might not have image
                },
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
            }

            mockGetToken.mockResolvedValue(credentialsToken)

            const request = new NextRequest('http://localhost:3000/admin/forms')
            Object.defineProperty(request, 'nextauth', {
                value: { token: credentialsToken },
                writable: true
            })

            const response = await middleware(request)

            // Should allow access to admin routes
            expect(response?.status).not.toBe(307) // Not a redirect
        })

        it('should redirect unauthenticated users from admin routes', async () => {
            mockGetToken.mockResolvedValue(null)

            const request = new NextRequest('http://localhost:3000/admin/dashboard')
            Object.defineProperty(request, 'nextauth', {
                value: { token: null },
                writable: true
            })

            const response = await middleware(request)

            // Should redirect to signin
            expect(response?.status).toBe(307)
            expect(response?.headers.get('location')).toBe('http://localhost:3000/auth/signin')
        })

        it('should allow access to non-admin routes without authentication', async () => {
            mockGetToken.mockResolvedValue(null)

            const request = new NextRequest('http://localhost:3000/about')
            Object.defineProperty(request, 'nextauth', {
                value: { token: null },
                writable: true
            })

            const response = await middleware(request)

            // Should not redirect
            expect(response?.status).not.toBe(307)
        })
    })

    describe('JWT token compatibility', () => {
        it('should create compatible JWT tokens for both auth methods', async () => {
            const { jwt: jwtCallback } = authOptions.callbacks!

            // Test OAuth user token creation
            const oauthUser = {
                id: 'oauth-123',
                email: 'admin@example.com',
                name: 'OAuth User',
                image: 'https://example.com/avatar.jpg'
            }

            const oauthToken = await jwtCallback!({
                token: {},
                user: oauthUser,
                account: { provider: 'google', type: 'oauth' },
                profile: undefined,
                isNewUser: false
            })

            // Test credentials user token creation
            const credentialsUser = {
                id: 'cred-456',
                email: 'admin@example.com',
                name: 'Credentials User',
                image: undefined
            }

            const credentialsToken = await jwtCallback!({
                token: {},
                user: credentialsUser,
                account: { provider: 'credentials', type: 'credentials' },
                profile: undefined,
                isNewUser: false
            })

            // Both tokens should have the same structure
            expect(oauthToken).toHaveProperty('user')
            expect(credentialsToken).toHaveProperty('user')

            // User objects should have consistent required fields
            expect(oauthToken.user).toHaveProperty('id')
            expect(oauthToken.user).toHaveProperty('email')
            expect(oauthToken.user).toHaveProperty('name')

            expect(credentialsToken.user).toHaveProperty('id')
            expect(credentialsToken.user).toHaveProperty('email')
            expect(credentialsToken.user).toHaveProperty('name')
        })

        it('should create compatible session objects for both auth methods', async () => {
            const { session: sessionCallback } = authOptions.callbacks!

            // Test OAuth session
            const oauthToken = {
                user: {
                    id: 'oauth-123',
                    email: 'admin@example.com',
                    name: 'OAuth User',
                    image: 'https://example.com/avatar.jpg'
                }
            }

            const oauthSession = await sessionCallback!({
                session: { expires: '2024-12-31' },
                token: oauthToken,
                user: undefined
            })

            // Test credentials session
            const credentialsToken = {
                user: {
                    id: 'cred-456',
                    email: 'admin@example.com',
                    name: 'Credentials User',
                    image: undefined
                }
            }

            const credentialsSession = await sessionCallback!({
                session: { expires: '2024-12-31' },
                token: credentialsToken,
                user: undefined
            })

            // Both sessions should have the same structure
            expect(oauthSession).toHaveProperty('user')
            expect(oauthSession).toHaveProperty('expires')
            expect(credentialsSession).toHaveProperty('user')
            expect(credentialsSession).toHaveProperty('expires')

            // User objects should be compatible
            expect(oauthSession.user).toHaveProperty('id')
            expect(oauthSession.user).toHaveProperty('email')
            expect(oauthSession.user).toHaveProperty('name')

            expect(credentialsSession.user).toHaveProperty('id')
            expect(credentialsSession.user).toHaveProperty('email')
            expect(credentialsSession.user).toHaveProperty('name')
        })
    })

    describe('Admin route protection consistency', () => {
        const adminRoutes = [
            '/admin',
            '/admin/dashboard',
            '/admin/forms',
            '/admin/forms/123',
            '/admin/forms/123/respond',
            '/admin/settings'
        ]

        adminRoutes.forEach(route => {
            it(`should protect ${route} consistently for both auth methods`, async () => {
                // Test with OAuth token
                const oauthToken = {
                    user: {
                        id: 'oauth-123',
                        email: 'admin@example.com',
                        name: 'OAuth User'
                    }
                }

                mockGetToken.mockResolvedValue(oauthToken)

                const oauthRequest = new NextRequest(`http://localhost:3000${route}`)
                Object.defineProperty(oauthRequest, 'nextauth', {
                    value: { token: oauthToken },
                    writable: true
                })

                const oauthResponse = await middleware(oauthRequest)

                // Test with credentials token
                const credentialsToken = {
                    user: {
                        id: 'cred-456',
                        email: 'admin@example.com',
                        name: 'Credentials User'
                    }
                }

                mockGetToken.mockResolvedValue(credentialsToken)

                const credentialsRequest = new NextRequest(`http://localhost:3000${route}`)
                Object.defineProperty(credentialsRequest, 'nextauth', {
                    value: { token: credentialsToken },
                    writable: true
                })

                const credentialsResponse = await middleware(credentialsRequest)

                // Both should have the same behavior (allow access)
                expect(oauthResponse?.status).toBe(credentialsResponse?.status)

                // Test without token
                mockGetToken.mockResolvedValue(null)

                const unauthRequest = new NextRequest(`http://localhost:3000${route}`)
                Object.defineProperty(unauthRequest, 'nextauth', {
                    value: { token: null },
                    writable: true
                })

                const unauthResponse = await middleware(unauthRequest)

                // Should redirect to signin
                expect(unauthResponse?.status).toBe(307)
                expect(unauthResponse?.headers.get('location')).toBe('http://localhost:3000/auth/signin')
            })
        })

        it('should handle expired tokens consistently', async () => {
            const expiredToken = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                    name: 'User'
                },
                exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
            }

            mockGetToken.mockResolvedValue(null) // getToken returns null for expired tokens

            const request = new NextRequest('http://localhost:3000/admin/dashboard')
            Object.defineProperty(request, 'nextauth', {
                value: { token: null },
                writable: true
            })

            const response = await middleware(request)

            // Should redirect to signin
            expect(response?.status).toBe(307)
            expect(response?.headers.get('location')).toBe('http://localhost:3000/auth/signin')
        })
    })

    describe('Session persistence and renewal', () => {
        it('should maintain session data across requests for both auth methods', async () => {
            const { jwt: jwtCallback, session: sessionCallback } = authOptions.callbacks!

            // Simulate OAuth session renewal
            const oauthToken = {
                user: {
                    id: 'oauth-123',
                    email: 'admin@example.com',
                    name: 'OAuth User',
                    image: 'https://example.com/avatar.jpg'
                },
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
            }

            // JWT callback should preserve existing token data
            const renewedOauthToken = await jwtCallback!({
                token: oauthToken,
                user: undefined,
                account: null,
                profile: undefined,
                isNewUser: false
            })

            expect(renewedOauthToken).toEqual(oauthToken)

            // Session callback should work with renewed token
            const oauthSession = await sessionCallback!({
                session: { expires: '2024-12-31' },
                token: renewedOauthToken,
                user: undefined
            })

            expect(oauthSession.user).toEqual(oauthToken.user)

            // Simulate credentials session renewal
            const credentialsToken = {
                user: {
                    id: 'cred-456',
                    email: 'admin@example.com',
                    name: 'Credentials User'
                },
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
            }

            const renewedCredentialsToken = await jwtCallback!({
                token: credentialsToken,
                user: undefined,
                account: null,
                profile: undefined,
                isNewUser: false
            })

            expect(renewedCredentialsToken).toEqual(credentialsToken)

            const credentialsSession = await sessionCallback!({
                session: { expires: '2024-12-31' },
                token: renewedCredentialsToken,
                user: undefined
            })

            expect(credentialsSession.user).toEqual(credentialsToken.user)
        })
    })

    describe('Error handling consistency', () => {
        it('should handle malformed tokens consistently', async () => {
            const malformedToken = {
                // Missing user property
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
            }

            mockGetToken.mockResolvedValue(malformedToken)

            const request = new NextRequest('http://localhost:3000/admin/dashboard')
            Object.defineProperty(request, 'nextauth', {
                value: { token: malformedToken },
                writable: true
            })

            // Middleware should still allow access if token exists
            // The actual validation happens in the auth callbacks
            const response = await middleware(request)
            expect(response?.status).not.toBe(307)
        })

        it('should handle network errors during token validation', async () => {
            mockGetToken.mockRejectedValue(new Error('Network error'))

            const request = new NextRequest('http://localhost:3000/admin/dashboard')
            Object.defineProperty(request, 'nextauth', {
                value: { token: null },
                writable: true
            })

            // Should treat as unauthenticated and redirect
            const response = await middleware(request)
            expect(response?.status).toBe(307)
        })
    })
})