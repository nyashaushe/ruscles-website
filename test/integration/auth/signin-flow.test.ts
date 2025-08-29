import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SigninPage from '@/app/auth/signin/page'

// Mock NextAuth
vi.mock('next-auth/react', () => ({
    signIn: vi.fn(),
    getSession: vi.fn(),
    useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' }))
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    useSearchParams: vi.fn(() => ({
        get: vi.fn()
    }))
}))

const mockSignIn = vi.mocked(signIn)
const mockUseRouter = vi.mocked(useRouter)
const mockPush = vi.fn()

describe('Signin Flow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseRouter.mockReturnValue({
            push: mockPush,
            replace: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
            prefetch: vi.fn()
        } as any)
    })

    describe('Complete signin flow', () => {
        it('should complete successful credentials signin flow', async () => {
            const user = userEvent.setup()
            mockSignIn.mockResolvedValue({ ok: true, url: '/admin' })

            render(<SigninPage />)

            // Find and fill the credentials form
            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password')
            const submitButton = screen.getByRole('button', { name: /sign in with email/i })

            await user.type(emailInput, 'admin@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            // Verify signin was called with correct parameters
            expect(mockSignIn).toHaveBeenCalledWith('credentials', {
                email: 'admin@example.com',
                password: 'password123',
                redirect: false
            })

            // Wait for redirect
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/admin')
            })
        })

        it('should handle OAuth signin flow', async () => {
            const user = userEvent.setup()
            mockSignIn.mockResolvedValue({ ok: true })

            render(<SigninPage />)

            const oauthButton = screen.getByRole('button', { name: /continue with google/i })
            await user.click(oauthButton)

            expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/admin' })
        })

        it('should display error for failed credentials signin', async () => {
            const user = userEvent.setup()
            mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

            render(<SigninPage />)

            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password')
            const submitButton = screen.getByRole('button', { name: /sign in with email/i })

            await user.type(emailInput, 'admin@example.com')
            await user.type(passwordInput, 'wrongpassword')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
            })
        })

        it('should display error for unauthorized email', async () => {
            const user = userEvent.setup()
            mockSignIn.mockResolvedValue({ error: 'AccessDenied' })

            render(<SigninPage />)

            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password')
            const submitButton = screen.getByRole('button', { name: /sign in with email/i })

            await user.type(emailInput, 'unauthorized@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/not authorized to access this application/i)).toBeInTheDocument()
            })
        })

        it('should display error for configuration issues', async () => {
            const user = userEvent.setup()
            mockSignIn.mockResolvedValue({ error: 'Configuration' })

            render(<SigninPage />)

            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password')
            const submitButton = screen.getByRole('button', { name: /sign in with email/i })

            await user.type(emailInput, 'admin@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/authentication service is currently unavailable/i)).toBeInTheDocument()
            })
        })

        it('should show loading state during signin', async () => {
            const user = userEvent.setup()
            let resolveSignin: (value: any) => void
            mockSignIn.mockReturnValue(new Promise(resolve => {
                resolveSignin = resolve
            }))

            render(<SigninPage />)

            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password')
            const submitButton = screen.getByRole('button', { name: /sign in with email/i })

            await user.type(emailInput, 'admin@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            // Check loading state
            expect(screen.getByText('Signing in...')).toBeInTheDocument()
            expect(submitButton).toBeDisabled()

            // Resolve the signin
            resolveSignin!({ ok: true })

            await waitFor(() => {
                expect(screen.queryByText('Signing in...')).not.toBeInTheDocument()
            })
        })

        it('should validate form before submission', async () => {
            const user = userEvent.setup()
            render(<SigninPage />)

            const submitButton = screen.getByRole('button', { name: /sign in with email/i })
            await user.click(submitButton)

            // Should show validation errors
            expect(screen.getByText('Email is required')).toBeInTheDocument()
            expect(screen.getByText('Password is required')).toBeInTheDocument()

            // Should not call signIn
            expect(mockSignIn).not.toHaveBeenCalled()
        })

        it('should validate email format', async () => {
            const user = userEvent.setup()
            render(<SigninPage />)

            const emailInput = screen.getByLabelText('Email')
            const submitButton = screen.getByRole('button', { name: /sign in with email/i })

            await user.type(emailInput, 'invalid-email')
            await user.click(submitButton)

            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
            expect(mockSignIn).not.toHaveBeenCalled()
        })
    })

    describe('Accessibility', () => {
        it('should have proper form labels and structure', () => {
            render(<SigninPage />)

            expect(screen.getByLabelText('Email')).toBeInTheDocument()
            expect(screen.getByLabelText('Password')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /sign in with email/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
        })

        it('should announce errors to screen readers', async () => {
            const user = userEvent.setup()
            mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

            render(<SigninPage />)

            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password')
            const submitButton = screen.getByRole('button', { name: /sign in with email/i })

            await user.type(emailInput, 'admin@example.com')
            await user.type(passwordInput, 'wrongpassword')
            await user.click(submitButton)

            await waitFor(() => {
                const errorMessage = screen.getByText(/invalid email or password/i)
                expect(errorMessage).toHaveAttribute('role', 'alert')
            })
        })
    })
})