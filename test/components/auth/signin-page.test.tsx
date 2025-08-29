import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SignInPage from '@/app/auth/signin/page'

// Mock NextAuth
vi.mock('next-auth/react', () => ({
    signIn: vi.fn(),
    getSession: vi.fn().mockResolvedValue(null)
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn()
    })
}))

describe('SignInPage', () => {
    it('renders both authentication options', () => {
        render(<SignInPage />)

        // Check for main heading
        expect(screen.getByText('Admin Portal')).toBeInTheDocument()

        // Check for Google OAuth option
        expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
        expect(screen.getByText('Quick Sign In')).toBeInTheDocument()

        // Check for credentials form
        expect(screen.getByText('Sign in with Email')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    })

    it('displays responsive layout elements', () => {
        render(<SignInPage />)

        // Check for security indicators
        expect(screen.getByText('Secure Authentication')).toBeInTheDocument()
        expect(screen.getByText('Admin Access Only')).toBeInTheDocument()

        // Check for footer information
        expect(screen.getByText(/Only authorized accounts can access this portal/)).toBeInTheDocument()
    })

    it('has proper accessibility structure', () => {
        render(<SignInPage />)

        // Check for proper heading structure
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Admin Portal')

        // Check for form elements
        expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()

        // Check for buttons
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
    })
})