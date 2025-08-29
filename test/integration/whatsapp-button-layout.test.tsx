import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RootLayout from '@/app/layout';
import { WhatsAppButton } from '@/components/whatsapp-button';

// Mock the WhatsApp utilities
vi.mock('@/lib/utils/whatsapp', () => ({
    openWhatsApp: vi.fn(),
}));

// Mock the config utilities
vi.mock('@/lib/config/whatsapp', () => ({
    getSafeWhatsAppConfig: vi.fn(() => ({
        phoneNumber: '+1234567890',
        defaultMessage: 'Hello! I\'m interested in your services.',
        businessName: 'Ruscle Investments',
        enabled: true,
    })),
    getCompleteWelcomeMessage: vi.fn(() => 'Hello! I\'m interested in your services.'),
}));

// Mock Next.js components
vi.mock('next/font/google', () => ({
    Inter: () => ({ className: 'inter-font' }),
}));

vi.mock('@/components/navbar', () => ({
    Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('@/components/footer', () => ({
    Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/providers/session-provider', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/admin/admin-layout-wrapper', () => ({
    AdminLayoutWrapper: ({ children, navbar, footer }: any) => (
        <div>
            {navbar}
            <main>{children}</main>
            {footer}
        </div>
    ),
}));

vi.mock('@/components/ui/toaster', () => ({
    Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

describe('WhatsApp Button Layout Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders WhatsApp button in the root layout', () => {
        render(
            <RootLayout>
                <div>Test Page Content</div>
            </RootLayout>
        );

        // Verify the WhatsApp button is present
        const whatsappButton = screen.getByRole('button', { name: /contact us on whatsapp/i });
        expect(whatsappButton).toBeInTheDocument();
    });

    it('positions WhatsApp button correctly with proper z-index', () => {
        render(
            <RootLayout>
                <div>Test Page Content</div>
            </RootLayout>
        );

        const whatsappButton = screen.getByRole('button', { name: /contact us on whatsapp/i });

        // Check positioning classes
        expect(whatsappButton).toHaveClass('fixed');
        expect(whatsappButton).toHaveClass('bottom-6');
        expect(whatsappButton).toHaveClass('right-6');

        // Check z-index is properly set
        expect(whatsappButton).toHaveClass('z-[60]');
    });

    it('does not interfere with navbar navigation', () => {
        render(
            <RootLayout>
                <div>Test Page Content</div>
            </RootLayout>
        );

        // Verify navbar is present and accessible
        const navbar = screen.getByTestId('navbar');
        expect(navbar).toBeInTheDocument();

        // Verify WhatsApp button doesn't block navbar
        const whatsappButton = screen.getByRole('button', { name: /contact us on whatsapp/i });
        expect(whatsappButton).toBeInTheDocument();

        // Both should be visible and not overlapping in a problematic way
        expect(navbar).toBeVisible();
        expect(whatsappButton).toBeVisible();
    });

    it('renders with all layout components present', () => {
        render(
            <RootLayout>
                <div data-testid="page-content">Test Page Content</div>
            </RootLayout>
        );

        // Verify all layout components are present
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
        expect(screen.getByTestId('page-content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /contact us on whatsapp/i })).toBeInTheDocument();
    });

    it('maintains proper stacking order with other components', () => {
        render(
            <RootLayout>
                <div>Test Page Content</div>
            </RootLayout>
        );

        const whatsappButton = screen.getByRole('button', { name: /contact us on whatsapp/i });
        const toaster = screen.getByTestId('toaster');

        // WhatsApp button should have z-[60]
        expect(whatsappButton).toHaveClass('z-[60]');

        // Both components should be present
        expect(whatsappButton).toBeInTheDocument();
        expect(toaster).toBeInTheDocument();
    });

    it('is accessible via keyboard navigation', () => {
        render(
            <RootLayout>
                <div>Test Page Content</div>
            </RootLayout>
        );

        const whatsappButton = screen.getByRole('button', { name: /contact us on whatsapp/i });

        // Should be focusable
        whatsappButton.focus();
        expect(whatsappButton).toHaveFocus();

        // Should have proper focus styles
        expect(whatsappButton).toHaveClass('focus:outline-none');
        expect(whatsappButton).toHaveClass('focus:ring-4');
        expect(whatsappButton).toHaveClass('focus:ring-green-300');
    });

    it('works correctly across different page content', () => {
        const { rerender } = render(
            <RootLayout>
                <div data-testid="home-page">Home Page Content</div>
            </RootLayout>
        );

        // Verify button is present on home page
        expect(screen.getByRole('button', { name: /contact us on whatsapp/i })).toBeInTheDocument();
        expect(screen.getByTestId('home-page')).toBeInTheDocument();

        // Rerender with different page content
        rerender(
            <RootLayout>
                <div data-testid="about-page">About Page Content</div>
            </RootLayout>
        );

        // Verify button is still present on about page
        expect(screen.getByRole('button', { name: /contact us on whatsapp/i })).toBeInTheDocument();
        expect(screen.getByTestId('about-page')).toBeInTheDocument();
    });
});