/**
 * Responsive behavior tests for WhatsApp Button component
 * Tests behavior across different screen sizes and device types
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsAppButton } from '@/components/whatsapp-button';

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

// Helper function to mock window.matchMedia
const mockMatchMedia = (matches: boolean, query?: string) => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((q) => ({
            matches: query ? q === query && matches : matches,
            media: q,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
};

// Helper function to mock viewport size
const mockViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height,
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));
};

describe('WhatsApp Button Responsive Behavior', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset to default desktop viewport
        mockViewport(1024, 768);
        mockMatchMedia(false);
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = '';
    });

    describe('Screen Size Adaptations', () => {
        it('should have correct sizing on mobile screens (< 640px)', () => {
            mockViewport(375, 667); // iPhone SE size

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should have base mobile size
            expect(button).toHaveClass('w-14', 'h-14');
            // Should maintain minimum touch target
            expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
        });

        it('should have correct sizing on tablet screens (640px - 1024px)', () => {
            mockViewport(768, 1024); // iPad size

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should have responsive sizing classes
            expect(button).toHaveClass('w-14', 'h-14', 'sm:w-16', 'sm:h-16');
        });

        it('should have correct sizing on desktop screens (> 1024px)', () => {
            mockViewport(1920, 1080); // Desktop size

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should have larger size on desktop
            expect(button).toHaveClass('sm:w-16', 'sm:h-16');
        });

        it('should maintain minimum touch target across all screen sizes', () => {
            const screenSizes = [
                { width: 320, height: 568 }, // iPhone 5
                { width: 375, height: 667 }, // iPhone SE
                { width: 414, height: 896 }, // iPhone 11 Pro Max
                { width: 768, height: 1024 }, // iPad
                { width: 1024, height: 768 }, // iPad Landscape
                { width: 1920, height: 1080 }, // Desktop
            ];

            screenSizes.forEach(({ width, height }) => {
                mockViewport(width, height);

                const { unmount } = render(<WhatsAppButton phoneNumber="+1234567890" />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');

                unmount();
            });
        });
    });

    describe('Position Behavior Across Screen Sizes', () => {
        const positions = [
            { position: 'bottom-right' as const, classes: ['bottom-6', 'right-6'] },
            { position: 'bottom-left' as const, classes: ['bottom-6', 'left-6'] },
            { position: 'top-right' as const, classes: ['top-6', 'right-6'] },
            { position: 'top-left' as const, classes: ['top-6', 'left-6'] },
        ];

        positions.forEach(({ position, classes }) => {
            it(`should maintain ${position} position on mobile`, () => {
                mockViewport(375, 667);

                render(<WhatsAppButton phoneNumber="+1234567890" position={position} />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                classes.forEach(className => {
                    expect(button).toHaveClass(className);
                });
            });

            it(`should maintain ${position} position on tablet`, () => {
                mockViewport(768, 1024);

                render(<WhatsAppButton phoneNumber="+1234567890" position={position} />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                classes.forEach(className => {
                    expect(button).toHaveClass(className);
                });
            });

            it(`should maintain ${position} position on desktop`, () => {
                mockViewport(1920, 1080);

                render(<WhatsAppButton phoneNumber="+1234567890" position={position} />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                classes.forEach(className => {
                    expect(button).toHaveClass(className);
                });
            });
        });
    });

    describe('Touch vs Mouse Interactions', () => {
        it('should handle touch events on mobile devices', async () => {
            mockViewport(375, 667);

            const { openWhatsApp } = await import('@/lib/utils/whatsapp');

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Simulate touch events
            fireEvent.touchStart(button);
            fireEvent.touchEnd(button);
            fireEvent.click(button);

            expect(openWhatsApp).toHaveBeenCalled();
        });

        it('should handle mouse events on desktop devices', async () => {
            mockViewport(1920, 1080);

            const { openWhatsApp } = await import('@/lib/utils/whatsapp');
            const user = userEvent.setup();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            await user.click(button);

            expect(openWhatsApp).toHaveBeenCalled();
        });

        it('should provide appropriate hover feedback on desktop', () => {
            mockViewport(1920, 1080);

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should have hover classes
            expect(button.className).toContain('hover:bg-[#20BA5A]');
            expect(button.className).toContain('hover:scale-110');
        });

        it('should handle focus appropriately across devices', async () => {
            const screenSizes = [
                { width: 375, height: 667, device: 'mobile' },
                { width: 768, height: 1024, device: 'tablet' },
                { width: 1920, height: 1080, device: 'desktop' },
            ];

            for (const { width, height, device } of screenSizes) {
                mockViewport(width, height);

                const { unmount } = render(<WhatsAppButton phoneNumber="+1234567890" />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

                // Should be focusable on all devices
                button.focus();
                expect(button).toHaveFocus();

                // Should have focus styles
                expect(button).toHaveClass('focus:outline-none', 'focus:ring-4');

                unmount();
            }
        });
    });

    describe('Icon and Text Scaling', () => {
        it('should scale icon appropriately on mobile', () => {
            mockViewport(375, 667);

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const icon = document.querySelector('svg');
            expect(icon).toHaveClass('w-6', 'h-6');
        });

        it('should scale icon appropriately on desktop', () => {
            mockViewport(1920, 1080);

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const icon = document.querySelector('svg');
            expect(icon).toHaveClass('sm:w-7', 'sm:h-7');
        });

        it('should maintain icon visibility across all screen sizes', () => {
            const screenSizes = [320, 375, 414, 768, 1024, 1920];

            screenSizes.forEach(width => {
                mockViewport(width, 768);

                const { unmount } = render(<WhatsAppButton phoneNumber="+1234567890" />);

                const icon = document.querySelector('svg');
                expect(icon).toBeInTheDocument();
                expect(icon).toHaveAttribute('aria-hidden', 'true');

                unmount();
            });
        });
    });

    describe('Z-Index and Layering', () => {
        it('should maintain proper z-index across screen sizes', () => {
            const screenSizes = [375, 768, 1024, 1920];

            screenSizes.forEach(width => {
                mockViewport(width, 768);

                const { unmount } = render(<WhatsAppButton phoneNumber="+1234567890" />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                expect(button).toHaveClass('z-50');

                unmount();
            });
        });

        it('should not interfere with page content on any screen size', () => {
            const screenSizes = [375, 768, 1024, 1920];

            screenSizes.forEach(width => {
                mockViewport(width, 768);

                const { unmount } = render(
                    <div>
                        <div style={{ height: '100vh', background: 'blue' }}>Page Content</div>
                        <WhatsAppButton phoneNumber="+1234567890" />
                    </div>
                );

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                const content = screen.getByText('Page Content');

                // Button should be positioned fixed and not affect content
                expect(button).toHaveClass('fixed');
                expect(content).toBeInTheDocument();

                unmount();
            });
        });
    });

    describe('Orientation Changes', () => {
        it('should handle portrait to landscape orientation change', () => {
            // Start in portrait
            mockViewport(375, 667);

            render(<WhatsAppButton phoneNumber="+1234567890" position="bottom-right" />);

            let button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('bottom-6', 'right-6');

            // Change to landscape
            mockViewport(667, 375);

            // Button should maintain position
            button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('bottom-6', 'right-6');
        });

        it('should handle landscape to portrait orientation change', () => {
            // Start in landscape
            mockViewport(667, 375);

            render(<WhatsAppButton phoneNumber="+1234567890" position="top-left" />);

            let button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('top-6', 'left-6');

            // Change to portrait
            mockViewport(375, 667);

            // Button should maintain position
            button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toHaveClass('top-6', 'left-6');
        });
    });

    describe('High DPI and Retina Display Support', () => {
        it('should render clearly on high DPI displays', () => {
            // Mock high DPI
            Object.defineProperty(window, 'devicePixelRatio', {
                writable: true,
                configurable: true,
                value: 2,
            });

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            const icon = document.querySelector('svg');

            // Should maintain crisp rendering
            expect(button).toBeInTheDocument();
            expect(icon).toBeInTheDocument();
        });

        it('should handle very high DPI displays', () => {
            // Mock very high DPI (like some modern phones)
            Object.defineProperty(window, 'devicePixelRatio', {
                writable: true,
                configurable: true,
                value: 3,
            });

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
        });
    });

    describe('Reduced Motion Preferences', () => {
        it('should respect prefers-reduced-motion setting', () => {
            mockMatchMedia(true, '(prefers-reduced-motion: reduce)');

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should still have transition classes (CSS handles the actual reduction)
            expect(button).toHaveClass('transition-all', 'duration-200');
        });

        it('should allow normal animations when reduced motion is not preferred', () => {
            mockMatchMedia(false, '(prefers-reduced-motion: reduce)');

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should have animation classes
            expect(button).toHaveClass('transition-all', 'duration-200');
        });
    });

    describe('Container Queries and Layout Adaptation', () => {
        it('should adapt to container constraints', () => {
            render(
                <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                    <WhatsAppButton phoneNumber="+1234567890" />
                </div>
            );

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Should maintain fixed positioning even in constrained container
            expect(button).toHaveClass('fixed');
        });

        it('should not overflow small containers', () => {
            render(
                <div style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                    <WhatsAppButton phoneNumber="+1234567890" />
                </div>
            );

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });

            // Fixed positioning should prevent overflow issues
            expect(button).toHaveClass('fixed');
        });
    });

    describe('Performance on Different Devices', () => {
        it('should render efficiently on low-end devices', () => {
            // Simulate slower device by mocking performance
            const startTime = performance.now();

            render(<WhatsAppButton phoneNumber="+1234567890" />);

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render quickly (this is a basic check)
            expect(renderTime).toBeLessThan(100); // 100ms threshold

            const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
            expect(button).toBeInTheDocument();
        });

        it('should handle rapid screen size changes', () => {
            const { rerender } = render(<WhatsAppButton phoneNumber="+1234567890" />);

            // Rapidly change screen sizes
            const sizes = [320, 768, 1024, 375, 1920];

            sizes.forEach(width => {
                mockViewport(width, 768);
                rerender(<WhatsAppButton phoneNumber="+1234567890" />);

                const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
                expect(button).toBeInTheDocument();
            });
        });
    });
});