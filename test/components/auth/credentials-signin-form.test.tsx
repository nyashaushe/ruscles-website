import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import { CredentialsSigninForm } from '@/components/auth/credentials-signin-form'

// Mock NextAuth
vi.mock('next-auth/react', () => ({
    signIn: vi.fn()
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn()
    })
}))

const mockSignIn = vi.mocked(signIn)

describe('CredentialsSigninForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders form with email and password inputs', () => {
        render(<CredentialsSigninForm />)

        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('validates required fields', async () => {
        const user = userEvent.setup()
        render(<CredentialsSigninForm />)

        const submitButton = screen.getByRole('button', { name: /sign in/i })
        await user.click(submitButton)

        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('validates email format', async () => {
        const user = userEvent.setup()
        render(<CredentialsSigninForm />)

        const emailInput = screen.getByLabelText('Email')
        await user.type(emailInput, 'invalid-email')

        const submitButton = screen.getByRole('button', { name: /sign in/i })
        await user.click(submitButton)

        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    it('submits form with valid credentials', async () => {
        const user = userEvent.setup()
        mockSignIn.mockResolvedValue({ ok: true })

        render(<CredentialsSigninForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
            email: 'test@example.com',
            password: 'password123',
            redirect: false
        })
    })

    it('shows loading state during submission', async () => {
        const user = userEvent.setup()
        mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

        render(<CredentialsSigninForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        expect(screen.getByText('Signing in...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
    })

    it('displays error message on authentication failure', async () => {
        const user = userEvent.setup()
        mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

        render(<CredentialsSigninForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'wrongpassword')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
        })
    })

    it('calls onSuccess callback when provided', async () => {
        const user = userEvent.setup()
        const onSuccess = vi.fn()
        mockSignIn.mockResolvedValue({ ok: true })

        render(<CredentialsSigninForm onSuccess={onSuccess} />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled()
        })
    })
})