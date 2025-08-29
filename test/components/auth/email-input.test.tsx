import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailInput } from '@/components/auth/email-input'

describe('EmailInput', () => {
    it('renders with default label', () => {
        render(<EmailInput id="test-email" />)
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('renders with custom label', () => {
        render(<EmailInput id="test-email" label="Email Address" />)
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    })

    it('shows validation error for invalid email', async () => {
        const user = userEvent.setup()
        render(<EmailInput id="test-email" />)

        const input = screen.getByLabelText('Email')
        await user.type(input, 'invalid-email')

        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    it('shows no validation error for valid email', async () => {
        const user = userEvent.setup()
        render(<EmailInput id="test-email" />)

        const input = screen.getByLabelText('Email')
        await user.type(input, 'test@example.com')

        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    })

    it('displays custom error message', () => {
        render(<EmailInput id="test-email" error="Custom error message" />)
        expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('calls onChange handler', async () => {
        const handleChange = vi.fn()
        const user = userEvent.setup()

        render(<EmailInput id="test-email" onChange={handleChange} />)

        const input = screen.getByLabelText('Email')
        await user.type(input, 'test@example.com')

        expect(handleChange).toHaveBeenCalled()
    })
})