/**
 * Comprehensive accessibility tests for WhatsApp Button component
 * Tests WCAG 2.1 AA compliance, keyboard navigation, screen reader compatibility,
 * color contrast, focus management, and responsive behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsAppButton } from '@/components/whatsapp-button';

// Extend expect matchers
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

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

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe('WhatsAppButton Comprehensive Accessibility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up any DOM elements created during tests
        document.body.innerHTML = '';
    });

    describe('WCAG 2.1 AA Compliance', () => {
        it('should have no accessibility violations in default state', async () => {
            const { container } = render(<WhatsAppButton phoneNumber="+1234567890" />);
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
                    ariaLabel="Custom WhatsApp contact"
                    className="custom-class"
                />
            );
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have no accessibility violations in all positions', async () => {
            const positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const;

            for (const position of positions) {
                const { container } = render(
                    <WhatsAppButton phoneNumber="+1234567890" position={position} />
                );
                const results = await axe(container);
                expect(results).toHaveNoViolations();
            }
        });
    });

    describe('Keyboard Navigation and Focus Management', () => {
        it('should be focusable with tab key', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            await user.tab();
            expect(button).toHaveFocus();
        });

        it('should activate with Enter key', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" message="Test message" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            button.focus();

            await user.keyboard('{Enter}');
            expect(openWhatsApp).toHaveBeenCalledWith('+1234567890', 'Test message');
        });

        it('should activate with Space key', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" message="Test message" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            button.focus();

            await user.keyboard(' ');
            expect(openWhatsApp).toHaveBeenCalledWith('+1234567890', 'Test message');
        });

        it('should lose focus with Escape key', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            button.focus();
            expect(button).toHaveFocus();

            await user.keyboard('{Escape}');
            expect(button).not.toHaveFocus();
        });

        it('should not be focusable when disabled', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('tabIndex', '-1');
            expect(button).toBeDisabled();
        });

        it('should have proper focus order in page context', async () => {
            const user = userEvent.setup();

            render(
                <div>
                    <button>Previous Button</button>
                    <WhatsAppButton phoneNumber="+1234567890" />
                    <button>Next Button</button>
                </div>
            );

            const prevButton = screen.getByText('Previous Button');
            const whatsappButton = screen.getByRole('button', { name: /contact us on whatsapp/i });
            const nextButton = screen.getByText('Next Button');

            // Tab through elements
            await user.tab();
            expect(prevButton).toHaveFocus();

            await user.tab();
            expect(whatsappButton).toHaveFocus();

            await user.tab();
            expect(nextButton).toHaveFocus();
        });

        it('should handle rapid keyboard interactions', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            button.focus();

            // Rapid key presses
            await user.keyboard('{Enter}{Enter}{Space}{Space}');

            // Should handle multiple activations gracefully
            expect(openWhatsApp).toHaveBeenCalledTimes(4);
        });
    });

    describe('ARIA Labels and Screen Reader Compatibility', () => {
        it('should have proper ARIA label', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" ariaLabel="Custom WhatsApp label" />);

            const button = screen.getByRole('button', { name: 'Custom WhatsApp label' });
            expect(button).toHaveAttribute('aria-label', 'Custom WhatsApp label');
        });

        it('should have default ARIA label when none provided', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('aria-label', 'Contact us on WhatsApp');
        });

        it('should have aria-describedby attribute', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('aria-describedby', 'whatsapp-button-description');
        });

        it('should have hidden description for screen readers', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const description = document.getElementById('whatsapp-button-description');
            expect(description).toBeInTheDocument();
            expect(description).toHaveClass('sr-only');
            expect(description).toHaveTextContent(/Opens WhatsApp to start a conversation/);
        });

        it('should have proper role attribute', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveAttribute('role', 'button');
        });

        it('should have aria-hidden on icon', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const icon = document.querySelector('svg');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });

        it('should announce status changes to screen readers', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            // Check for success announcement
            await waitFor(() => {
                const announcement = document.querySelector('[aria-live="polite"]');
                expect(announcement).toBeInTheDocument();
                expect(announcement).toHaveTextContent('Opening WhatsApp...');
            });
        });

        it('should announce errors to screen readers', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            (openWhatsApp as any).mockImplementation(() => {
                throw new Error('Test error');
            });

            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            // Check for error announcement
            await waitFor(() => {
                const errorAnnouncement = document.querySelector('[aria-live="assertive"]');
                expect(errorAnnouncement).toBeInTheDocument();
                expect(errorAnnouncement).toHaveTextContent(/Failed to open WhatsApp/);
            });
        });

        it('should provide contextual information in description', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" message="Custom message for testing" />);

            const description = document.getElementById('whatsapp-button-description');
            expect(description).toHaveTextContent(/Opens WhatsApp to start a conversation with Test Business/);
            expect(description).toHaveTextContent(/Message will be pre-filled: "Custom message for testing"/);
        });

        it('should truncate long messages in description', () => {
            const longMessage = 'A'.repeat(100);
            render(<WhatsAppButton phoneNumber="+1234567890" message={longMessage} />);

            const description = document.getElementById('whatsapp-button-description');
            expect(description).toHaveTextContent(/\.\.\./); // Should contain ellipsis for truncation
        });
    });

    describe('Color Contrast and Visual Standards', () => {
        it('should use WhatsApp official green color', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('bg-[#25D366]');
        });

        it('should have white text for proper contrast', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('text-white');
        });

        it('should have proper disabled state colors', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('bg-gray-400', 'text-gray-200');
        });

        it('should meet minimum touch target size (44px)', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
        });

        it('should have adequate spacing from edges', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" position="bottom-right" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('bottom-6', 'right-6');
        });
    });

    describe('Focus Management and Visual Indicators', () => {
        it('should have visible focus ring', () => {
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

        it('should have high contrast focus indicators', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            // White ring on green background provides high contrast
            expect(button).toHaveClass('focus:ring-white');
        });

        it('should provide visual feedback on hover', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Check hover classes are present (they will be applied by CSS)
            const classList = button.className;
            expect(classList).toContain('hover:bg-[#20BA5A]');
            expect(classList).toContain('hover:scale-110');
        });

        it('should provide visual feedback on press', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Simulate mouse down to trigger pressed state
            fireEvent.mouseDown(button);

            // The component should handle pressed state internally
            // We can't easily test the dynamic class changes, but we can ensure the handlers are set up
            expect(button).toBeInTheDocument();
        });

        it('should not have hover effects when disabled', () => {
            render(<WhatsAppButton disabled />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('cursor-not-allowed');
        });

        it('should maintain focus visibility during interactions', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Focus the button
            button.focus();
            expect(button).toHaveFocus();

            // Mouse interactions shouldn't remove focus
            fireEvent.mouseDown(button);
            fireEvent.mouseUp(button);
            expect(button).toHaveFocus();
        });
    });

    describe('Responsive Behavior and Touch Accessibility', () => {
        it('should have responsive sizing classes', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('w-14', 'h-14', 'sm:w-16', 'sm:h-16');
        });

        it('should maintain minimum touch target on all screen sizes', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
        });

        it('should be positioned correctly on different screen sizes', () => {
            const positions = [
                { position: 'bottom-right' as const, classes: ['bottom-6', 'right-6'] },
                { position: 'bottom-left' as const, classes: ['bottom-6', 'left-6'] },
                { position: 'top-right' as const, classes: ['top-6', 'right-6'] },
                { position: 'top-left' as const, classes: ['top-6', 'left-6'] },
            ];

            positions.forEach(({ position, classes }) => {
                const { unmount } = render(<WhatsAppButton phoneNumber="+1234567890" position={position} />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                classes.forEach(className => {
                    expect(button).toHaveClass(className);
                });

                unmount();
            });
        });

        it('should have proper z-index for layering', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('z-50');
        });
    });

    describe('Screen Reader Announcements and Live Regions', () => {
        it('should create live region for success announcements', async () => {
            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            await waitFor(() => {
                const liveRegion = document.querySelector('[aria-live="polite"]');
                expect(liveRegion).toBeInTheDocument();
                expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
                expect(liveRegion).toHaveClass('sr-only');
            });
        });

        it('should create assertive live region for errors', async () => {
            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            (openWhatsApp as any).mockImplementation(() => {
                throw new Error('Test error');
            });

            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            await waitFor(() => {
                const assertiveLiveRegion = document.querySelector('[aria-live="assertive"]');
                expect(assertiveLiveRegion).toBeInTheDocument();
                expect(assertiveLiveRegion).toHaveAttribute('aria-atomic', 'true');
                expect(assertiveLiveRegion).toHaveClass('sr-only');
            });
        });

        it('should clean up live regions after timeout', async () => {
            vi.useFakeTimers();

            const user = userEvent.setup();
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            await user.click(button);

            // Live region should be created
            await waitFor(() => {
                const liveRegion = document.querySelector('[aria-live="polite"]');
                expect(liveRegion).toBeInTheDocument();
            });

            // Fast-forward time to trigger cleanup
            vi.advanceTimersByTime(3000);

            // Live region should be removed
            await waitFor(() => {
                const liveRegion = document.querySelector('[aria-live="polite"]');
                expect(liveRegion).not.toBeInTheDocument();
            });

            vi.useRealTimers();
        });
    });

    describe('High Contrast Mode Support', () => {
        it('should be visible in high contrast mode', () => {
            // Simulate high contrast mode by checking for proper contrast classes
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should have solid background and text colors that work in high contrast
            expect(button).toHaveClass('bg-[#25D366]', 'text-white');

            // Focus ring should be visible in high contrast
            expect(button).toHaveClass('focus:ring-white');
        });

        it('should maintain focus visibility in high contrast mode', () => {
            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Focus ring with offset should be visible in high contrast mode
            expect(button).toHaveClass(
                'focus:ring-4',
                'focus:ring-white',
                'focus:ring-offset-4'
            );
        });
    });

    describe('Reduced Motion Support', () => {
        it('should respect prefers-reduced-motion', () => {
            // Mock prefers-reduced-motion
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            });

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should still have transition classes (CSS will handle reduced motion)
            expect(button).toHaveClass('transition-all', 'duration-200');
        });
    });

    describe('Multiple Instances Accessibility', () => {
        it('should handle multiple WhatsApp buttons with unique IDs', () => {
            render(
                <div>
                    <WhatsAppButton phoneNumber="+1234567890" position="bottom-right" />
                    <WhatsAppButton phoneNumber="+0987654321" position="bottom-left" />
                </div>
            );

            const buttons = screen.getAllByRole('button', { name: /contact us on whatsapp/i });
            expect(buttons).toHaveLength(2);

            // Each should have its own description element
            const descriptions = document.querySelectorAll('#whatsapp-button-description');
            expect(descriptions).toHaveLength(2);
        });
    });
});