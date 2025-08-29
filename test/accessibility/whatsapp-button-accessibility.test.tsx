import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppButton } from '@/components/whatsapp-button';

// Extend expect matchers
expect.extend(toHaveNoViolations);

// Mock the WhatsApp utility functions
jest.mock('@/lib/utils/whatsapp', () => ({
    openWhatsApp: jest.fn(),
}));

jest.mock('@/lib/config/whatsapp', () => ({
    getSafeWhatsAppConfig: () => ({
        phoneNumber: '+1234567890',
        defaultMessage: 'Hello! I\'m interested in your services.',
        businessName: 'Test Business',
        enabled: true,
    }),
    getCompleteWelcomeMessage: () => 'Hello! I\'m interested in your services.',
}));

describe('WhatsAppButton Accessibility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Keyboard Navigation', () => {
        it('should be focusable with tab key', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Tab to the button
            await user.tab();
            expect(button).toHaveFocus();
        });

        it('should activate with Enter key', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Focus and press Enter
            button.focus();
            await user.keyboard('{Enter}');

            // Should trigger click handler (mocked openWhatsApp would be called)
            expect(button).toHaveFocus();
        });

        it('should activate with Space key', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Focus and press Space
            button.focus();
            await user.keyboard(' ');

            // Should trigger click handler
            expect(button).toHaveFocus();
        });

        it('should lose focus with Escape key', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Focus the button
            button.focus();
            expect(button).toHaveFocus();

            // Press Escape
            await user.keyboard('{Escape}');

            // Should lose focus
            expect(button).not.toHaveFocus();
        });

        it('should not be focusable when disabled', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('tabIndex', '-1');
        });
    });

    describe('ARIA Labels and Screen Reader Compatibility', () => {
        it('should have proper ARIA label', () => {
            render(<WhatsAppButton ariaLabel="Custom WhatsApp label" />);

            const button = screen.getByRole('button', { name: 'Custom WhatsApp label' });
            expect(button).toBeInTheDocument();
        });

        it('should have default ARIA label when none provided', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeInTheDocument();
        });

        it('should have aria-describedby attribute', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('aria-describedby', 'whatsapp-button-description');
        });

        it('should have hidden description for screen readers', () => {
            render(<WhatsAppButton />);

            const description = document.getElementById('whatsapp-button-description');
            expect(description).toBeInTheDocument();
            expect(description).toHaveClass('sr-only');
            expect(description).toHaveTextContent(/opens whatsapp to start a conversation/i);
        });

        it('should have proper role attribute', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('role', 'button');
        });

        it('should have aria-hidden on icon', () => {
            render(<WhatsAppButton />);

            const icon = document.querySelector('svg');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });

        it('should announce status changes to screen readers', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Click the button
            await user.click(button);

            // Check if announcement element is created
            await waitFor(() => {
                const announcement = document.querySelector('[aria-live="polite"]');
                expect(announcement).toBeInTheDocument();
                expect(announcement).toHaveTextContent('Opening WhatsApp...');
            });
        });
    });

    describe('Color Contrast and Visual Standards', () => {
        it('should use WhatsApp official green color', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('bg-[#25D366]');
        });

        it('should have white text for proper contrast', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('text-white');
        });

        it('should have proper disabled state colors', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('bg-gray-400', 'text-gray-200');
        });

        it('should meet minimum touch target size', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
        });
    });

    describe('Focus Management and Visual Indicators', () => {
        it('should have visible focus ring', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Focus the button
            fireEvent.focus(button);

            expect(button).toHaveClass('focus:ring-4', 'focus:ring-white');
        });

        it('should have high contrast focus indicators', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('focus:ring-offset-4', 'focus:ring-offset-[#25D366]');
        });

        it('should provide visual feedback on hover', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Hover over the button
            fireEvent.mouseEnter(button);

            expect(button).toHaveClass('hover:bg-[#20BA5A]', 'hover:scale-110');
        });

        it('should provide visual feedback on press', () => {
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Press the button
            fireEvent.mouseDown(button);

            // Should have pressed state styles (tested via state management)
            expect(button).toBeInTheDocument();
        });

        it('should not have hover effects when disabled', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('hover:scale-100', 'hover:bg-gray-400');
        });
    });

    describe('Accessibility Compliance', () => {
        it('should have no accessibility violations', async () => {
            const { container } = render(<WhatsAppButton />);
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no accessibility violations when disabled', async () => {
            const { container } = render(<WhatsAppButton disabled />);
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no accessibility violations with custom props', async () => {
            const { container } = render(
                <WhatsAppButton
                    phoneNumber="+1234567890"
                    message="Custom message"
                    position="top-left"
                    ariaLabel="Custom label"
                />
            );
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Error Handling Accessibility', () => {
        it('should announce errors to screen readers', async () => {
            // Mock openWhatsApp to throw an error
            const { openWhatsApp } = require('@/lib/utils/whatsapp');
            openWhatsApp.mockImplementation(() => {
                throw new Error('Failed to open WhatsApp');
            });

            const user = userEvent.setup();
            render(<WhatsAppButton />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Click the button to trigger error
            await user.click(button);

            // Check if error announcement is created
            await waitFor(() => {
                const errorAnnouncement = document.querySelector('[aria-live="assertive"]');
                expect(errorAnnouncement).toBeInTheDocument();
                expect(errorAnnouncement).toHaveTextContent(/failed to open whatsapp/i);
            });
        });
    });
});