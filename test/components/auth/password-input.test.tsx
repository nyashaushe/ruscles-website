import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from '@/components/auth/password-input'

describe('PasswordInput', () => {
    it('renders with default label', () => {
        render(<PasswordInput id="test-password" />)
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('renders with custom label', () => {
        render(<PasswordInput id="test-password" label="Enter Password" />)
        expect(screen.getByLabelText('Enter Password')).toBeInTheDocument()
    })

    it('toggles password visibility', async () => {
        const user = userEvent.setup()
        render(<PasswordInput id="test-password" />)

        const input = screen.getByLabelText('Password') as HTMLInputElement
        const toggleButton = screen.getByLabelText('Show password')

        // Initially should be password type
        expect(input.type).toBe('password')

        // Click toggle to show password
        await user.click(toggleButton)
        expect(input.type).toBe('text')
        expect(screen.getByLabelText('Hide password')).toBeInTheDocument()

        // Click toggle to hide password
        await user.click(screen.getByLabelText('Hide password'))
        expect(input.type).toBe('password')
        expect(screen.getByLabelText('Show password')).toBeInTheDocument()
    })

    it('displays error message', () => {
        render(<PasswordInput id="test-password" error="Password is required" />)
        expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('calls onChange handler', async () => {
        const handleChange = vi.fn()
        const user = userEvent.setup()

        render(<PasswordInput id="test-password" onChange={handleChange} />)

        const input = screen.getByLabelText('Password')
        await user.type(input, 'password123')

        expect(handleChange).toHaveBeenCalled()
    })

    it('can disable toggle functionality', () => {
        render(<PasswordInput id="test-password" showToggle={false} />)
        expect(screen.queryByLabelText('Show password')).not.toBeInTheDocument()
    })
})