/**
 * Comprehensive unit tests for WhatsApp Button component
 * Tests rendering, interactions, props, and edge cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsAppButton, type WhatsAppButtonProps } from '@/components/whatsapp-button';

// Mock the WhatsApp utilities
vi.mock('@/lib/utils/whatsapp', () => ({
    openWhatsApp: vi.fn(),
}));

// Mock the WhatsApp config
vi.mock('@/lib/config/whatsapp', () => ({
    getSafeWhatsAppConfig: vi.fn(() => ({
        phoneNumber: '+1234567890',
        defaultMessage: 'Hello! I am interested in your services.',
        businessName: 'Test Business',
        enabled: true,
    })),
    getCompleteWelcomeMessage: vi.fn(() => 'Hello from Test Business! I am interested in your services.'),
}));

// Mock console methods
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

describe('WhatsAppButton Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockConsoleWarn.mockClear();
        mockConsoleError.mockClear();
    });

    afterEach(() => {
        mockConsoleWarn.mockRestore();
        mockConsoleError.mockRestore();
    });

    describe('Basic Rendering', () => {
        it('renders with default props', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('fixed', 'bottom-6', 'right-6');
        });

        it('renders with custom phone number', () => {
            render(<WhatsAppButton phoneNumber="+9876543210" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeInTheDocument();
        });

        it('renders with custom message', () => {
            render(<WhatsAppButton message="Custom test message" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeInTheDocument();
        });

        it('renders with custom aria label', () => {
            render(<WhatsAppButton ariaLabel="Custom WhatsApp Contact" />);

            const button = screen.getByRole('button', { name: 'Custom WhatsApp Contact' });
            expect(button).toBeInTheDocument();
        });

        it('renders with custom CSS classes', () => {
            render(<WhatsAppButton className="custom-class" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('custom-class');
        });
    });

    describe('Position Variants', () => {
        const positions: Array<{ position: WhatsAppButtonProps['position'], expectedClasses: string[] }> = [
            { position: 'bottom-right', expectedClasses: ['bottom-6', 'right-6'] },
            { position: 'bottom-left', expectedClasses: ['bottom-6', 'left-6'] },
            { position: 'top-right', expectedClasses: ['top-6', 'right-6'] },
            { position: 'top-left', expectedClasses: ['top-6', 'left-6'] },
        ];

        positions.forEach(({ position, expectedClasses }) => {
            it(`renders correctly in ${position} position`, () => {
                render(<WhatsAppButton position={position} />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                expectedClasses.forEach(className => {
                    expect(button).toHaveClass(className);
                });
            });
        });
    });

    describe('Disabled State', () => {
        it('renders as disabled when disabled prop is true', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute('tabIndex', '-1');
        });

        it('applies disabled styling when disabled', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('opacity-60', 'cursor-not-allowed');
        });

        it('is disabled when no phone number is provided and useEnvConfig is false', () => {
            render(<WhatsAppButton useEnvConfig={false} />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeDisabled();
        });
    });

    describe('Click Interactions', () => {
        it('calls openWhatsApp when clicked', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" message="Test message" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            expect(openWhatsApp).toHaveBeenCalledWith('+1234567890', 'Test message');
        });

        it('does not call openWhatsApp when disabled', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            expect(openWhatsApp).not.toHaveBeenCalled();
        });

        it('handles click errors gracefully', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            (openWhatsApp as any).mockImplementation(() => {
                throw new Error('Test error');
            });

            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            expect(mockConsoleError).toHaveBeenCalledWith('Failed to open WhatsApp:', expect.any(Error));
        });
    });

    describe('Keyboard Navigation', () => {
        it('activates with Enter key', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            button.focus();
            await user.keyboard('{Enter}');

            expect(openWhatsApp).toHaveBeenCalled();
        });

        it('activates with Space key', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            button.focus();
            await user.keyboard(' ');

            expect(openWhatsApp).toHaveBeenCalled();
        });

        it('loses focus with Escape key', async () => {
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            button.focus();
            expect(button).toHaveFocus();

            await user.keyboard('{Escape}');
            expect(button).not.toHaveFocus();
        });

        it('is focusable when enabled', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('tabIndex', '0');
        });

        it('is not focusable when disabled', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('tabIndex', '-1');
        });
    });

    describe('Focus and Hover States', () => {
        it('manages focus state correctly', async () => {
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            await user.tab();
            expect(button).toHaveFocus();

            await user.tab();
            expect(button).not.toHaveFocus();
        });

        it('manages pressed state on mouse interactions', async () => {
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Test mouse down and up
            fireEvent.mouseDown(button);
            fireEvent.mouseUp(button);

            // Test mouse leave
            fireEvent.mouseLeave(button);
        });
    });

    describe('Environment Configuration', () => {
        it('uses environment config by default', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeInTheDocument();
            expect(button).not.toBeDisabled();
        });

        it('ignores environment config when useEnvConfig is false', () => {
            render(<WhatsAppButton useEnvConfig={false} phoneNumber="+9876543210" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeInTheDocument();
        });

        it('handles missing environment config gracefully', () => {
            const { getSafeWhatsAppConfig } = require('@/lib/config/whatsapp');
            getSafeWhatsAppConfig.mockReturnValue({
                phoneNumber: '',
                defaultMessage: '',
                businessName: '',
                enabled: false,
            });

            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeDisabled();
        });
    });

    describe('Message Generation', () => {
        it('uses prop message when provided', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" message="Custom prop message" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            expect(openWhatsApp).toHaveBeenCalledWith('+1234567890', 'Custom prop message');
        });

        it('uses environment welcome message when no prop message', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            expect(openWhatsApp).toHaveBeenCalledWith('+1234567890', 'Hello from Test Business! I am interested in your services.');
        });

        it('falls back to default message when welcome message fails', async () => {
            const { getCompleteWelcomeMessage } = require('@/lib/config/whatsapp');
            getCompleteWelcomeMessage.mockImplementation(() => {
                throw new Error('Welcome message error');
            });

            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to get welcome message, using fallback:', expect.any(Error));
            expect(openWhatsApp).toHaveBeenCalledWith('+1234567890', 'Hello! I am interested in your services.');
        });
    });

    describe('Accessibility Features', () => {
        it('has proper ARIA attributes', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('aria-label', 'Contact us on WhatsApp');
            expect(button).toHaveAttribute('aria-describedby', 'whatsapp-button-description');
            expect(button).toHaveAttribute('role', 'button');
        });

        it('has hidden description for screen readers', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const description = document.getElementById('whatsapp-button-description');
            expect(description).toBeInTheDocument();
            expect(description).toHaveClass('sr-only');
            expect(description).toHaveTextContent(/Opens WhatsApp to start a conversation/);
        });

        it('has proper title attribute', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('title', 'Contact us on WhatsApp - Test Business');
        });

        it('icon has aria-hidden attribute', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const icon = document.querySelector('svg');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Styling and Visual States', () => {
        it('has correct base styling classes', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass(
                'fixed',
                'z-50',
                'flex',
                'items-center',
                'justify-center',
                'w-14',
                'h-14',
                'rounded-full',
                'shadow-lg',
                'bg-[#25D366]',
                'text-white'
            );
        });

        it('has correct responsive classes', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('sm:w-16', 'sm:h-16', 'min-w-[44px]', 'min-h-[44px]');
        });

        it('has correct focus styling classes', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass(
                'focus:outline-none',
                'focus:ring-4',
                'focus:ring-white',
                'focus:ring-offset-4',
                'focus:ring-offset-[#25D366]'
            );
        });

        it('has correct disabled styling when disabled', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass(
                'opacity-60',
                'cursor-not-allowed',
                'bg-gray-400',
                'text-gray-200'
            );
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('handles empty phone number gracefully', () => {
            render(<WhatsAppButton phoneNumber="" useEnvConfig={false} />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeDisabled();
        });

        it('handles very long messages', async () => {
            const longMessage = 'A'.repeat(1000);
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" message={longMessage} />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            expect(openWhatsApp).toHaveBeenCalledWith('+1234567890', longMessage);
        });

        it('handles special characters in message', async () => {
            const specialMessage = 'Hello! 🎉 How are you? I\'m interested in your services & products.';
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" message={specialMessage} />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            expect(openWhatsApp).toHaveBeenCalledWith('+1234567890', specialMessage);
        });
    });

    describe('Screen Reader Announcements', () => {
        it('creates success announcement when WhatsApp opens', async () => {
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            // Check if announcement element was created
            await waitFor(() => {
                const announcement = document.querySelector('[aria-live="polite"]');
                expect(announcement).toBeInTheDocument();
                expect(announcement).toHaveTextContent('Opening WhatsApp...');
            });
        });

        it('creates error announcement when WhatsApp fails to open', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            (openWhatsApp as any).mockImplementation(() => {
                throw new Error('Test error');
            });

            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            // Check if error announcement element was created
            await waitFor(() => {
                const errorAnnouncement = document.querySelector('[aria-live="assertive"]');
                expect(errorAnnouncement).toBeInTheDocument();
                expect(errorAnnouncement).toHaveTextContent(/Failed to open WhatsApp/);
            });
        });
    });
});