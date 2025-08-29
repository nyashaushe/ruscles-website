/**
 * Integration tests for WhatsApp URL generation and platform detection
 * Tests the complete flow from platform detection to URL generation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    generateWhatsAppURL,
    generatePlatformSpecificURL,
    detectPlatform,
    openWhatsApp,
    getFallbackURL,
} from '@/lib/utils/whatsapp';

// Mock window and navigator
const mockWindow = {
    location: { href: '' },
    open: vi.fn(),
    alert: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
};

const mockNavigator = {
    userAgent: '',
};

const mockDocument = {
    hidden: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: vi.fn(() => ({
        setAttribute: vi.fn(),
        textContent: '',
        className: '',
    })),
    body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
    },
};

Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true,
});

Object.defineProperty(global, 'navigator', {
    value: mockNavigator,
    writable: true,
});

Object.defineProperty(global, 'document', {
    value: mockDocument,
    writable: true,
});

describe('WhatsApp URL Generation Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockWindow.location.href = '';
        mockNavigator.userAgent = '';
        mockDocument.hidden = false;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Platform-Specific URL Generation', () => {
        const testCases = [
            {
                name: 'iPhone',
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
                expectedPlatform: { isMobile: true, isIOS: true, isAndroid: false, isDesktop: false },
                expectedURL: 'whatsapp://send?phone=1234567890&text=Hello%20World',
            },
            {
                name: 'iPad',
                userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
                expectedPlatform: { isMobile: true, isIOS: true, isAndroid: false, isDesktop: false },
                expectedURL: 'whatsapp://send?phone=1234567890&text=Hello%20World',
            },
            {
                name: 'Android Phone',
                userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
                expectedPlatform: { isMobile: true, isIOS: false, isAndroid: true, isDesktop: false },
                expectedURL: 'whatsapp://send?phone=1234567890&text=Hello%20World',
            },
            {
                name: 'Android Tablet',
                userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36',
                expectedPlatform: { isMobile: true, isIOS: false, isAndroid: true, isDesktop: false },
                expectedURL: 'whatsapp://send?phone=1234567890&text=Hello%20World',
            },
            {
                name: 'Windows Desktop',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                expectedPlatform: { isMobile: false, isIOS: false, isAndroid: false, isDesktop: true },
                expectedURL: 'https://wa.me/1234567890?text=Hello%20World',
            },
            {
                name: 'macOS Desktop',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                expectedPlatform: { isMobile: false, isIOS: false, isAndroid: false, isDesktop: true },
                expectedURL: 'https://wa.me/1234567890?text=Hello%20World',
            },
            {
                name: 'Linux Desktop',
                userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                expectedPlatform: { isMobile: false, isIOS: false, isAndroid: false, isDesktop: true },
                expectedURL: 'https://wa.me/1234567890?text=Hello%20World',
            },
        ];

        testCases.forEach(({ name, userAgent, expectedPlatform, expectedURL }) => {
            it(`generates correct URL for ${name}`, () => {
                mockNavigator.userAgent = userAgent;

                const platform = detectPlatform();
                expect(platform.isMobile).toBe(expectedPlatform.isMobile);
                expect(platform.isIOS).toBe(expectedPlatform.isIOS);
                expect(platform.isAndroid).toBe(expectedPlatform.isAndroid);
                expect(platform.isDesktop).toBe(expectedPlatform.isDesktop);
                expect(platform.hasWhatsAppSupport).toBe(true);

                const url = generatePlatformSpecificURL('+1234567890', 'Hello World');
                expect(url).toBe(expectedURL);
            });
        });
    });

    describe('Complex Message Encoding', () => {
        const messageTestCases = [
            {
                name: 'simple text',
                message: 'Hello World',
                expectedEncoded: 'Hello%20World',
            },
            {
                name: 'special characters',
                message: 'Hello! How are you? I\'m interested.',
                expectedEncoded: 'Hello!%20How%20are%20you%3F%20I\'m%20interested.',
            },
            {
                name: 'emojis',
                message: 'Hello 👋 I\'m interested! 🎉',
                expectedEncoded: 'Hello%20%F0%9F%91%8B%20I\'m%20interested!%20%F0%9F%8E%89',
            },
            {
                name: 'line breaks',
                message: 'Hello\nI am interested\nin your services',
                expectedEncoded: 'Hello%0AI%20am%20interested%0Ain%20your%20services',
            },
            {
                name: 'business context',
                message: 'Hello from Ruscle Investments! I would like to know more about your services & pricing.',
                expectedEncoded: 'Hello%20from%20Ruscle%20Investments!%20I%20would%20like%20to%20know%20more%20about%20your%20services%20%26%20pricing.',
            },
        ];

        messageTestCases.forEach(({ name, message, expectedEncoded }) => {
            it(`correctly encodes ${name}`, () => {
                mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

                const url = generatePlatformSpecificURL('+1234567890', message);
                expect(url).toBe(`https://wa.me/1234567890?text=${expectedEncoded}`);
            });
        });
    });

    describe('Phone Number Format Handling', () => {
        const phoneTestCases = [
            {
                name: 'US number with formatting',
                input: '+1 (234) 567-8900',
                expectedFormatted: '12345678900',
            },
            {
                name: 'UK number with spaces',
                input: '+44 20 1234 5678',
                expectedFormatted: '442012345678',
            },
            {
                name: 'Brazil number with formatting',
                input: '+55 (11) 99999-8888',
                expectedFormatted: '5511999998888',
            },
            {
                name: 'India number with dashes',
                input: '+91-987-654-3210',
                expectedFormatted: '919876543210',
            },
            {
                name: 'Clean international format',
                input: '+1234567890',
                expectedFormatted: '1234567890',
            },
        ];

        phoneTestCases.forEach(({ name, input, expectedFormatted }) => {
            it(`handles ${name}`, () => {
                mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

                const url = generatePlatformSpecificURL(input, 'Hello');
                expect(url).toBe(`https://wa.me/${expectedFormatted}?text=Hello`);
            });
        });
    });

    describe('End-to-End URL Generation Flow', () => {
        it('generates mobile URL for iOS device with complex message', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)';

            const phoneNumber = '+1 (555) 123-4567';
            const message = 'Hello from Ruscle Investments! 👋\nI\'m interested in your services & would like to schedule a consultation.';

            const url = generatePlatformSpecificURL(phoneNumber, message);
            expect(url).toBe('whatsapp://send?phone=15551234567&text=Hello%20from%20Ruscle%20Investments!%20%F0%9F%91%8B%0AI\'m%20interested%20in%20your%20services%20%26%20would%20like%20to%20schedule%20a%20consultation.');
        });

        it('generates web URL for desktop with business context', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            const phoneNumber = '+44 20 7946 0958';
            const message = 'Good day! I found your website and I\'m interested in learning more about your investment opportunities. Could we schedule a call?';

            const url = generatePlatformSpecificURL(phoneNumber, message);
            expect(url).toBe('https://wa.me/442079460958?text=Good%20day!%20I%20found%20your%20website%20and%20I\'m%20interested%20in%20learning%20more%20about%20your%20investment%20opportunities.%20Could%20we%20schedule%20a%20call%3F');
        });
    });

    describe('Fallback URL Generation', () => {
        it('always generates web URL regardless of platform', () => {
            const testCases = [
                'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
                'Mozilla/5.0 (Linux; Android 11; SM-G991B)',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ];

            testCases.forEach(userAgent => {
                mockNavigator.userAgent = userAgent;

                const url = getFallbackURL('+1234567890', 'Hello World');
                expect(url).toBe('https://wa.me/1234567890?text=Hello%20World');
            });
        });
    });

    describe('Integration with openWhatsApp Function', () => {
        it('opens mobile app on iOS with fallback to web', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)';

            openWhatsApp('+1234567890', 'Hello World');

            // Should set mobile URL
            expect(mockWindow.location.href).toBe('whatsapp://send?phone=1234567890&text=Hello%20World');

            // Should set up fallback timer
            expect(mockDocument.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
            expect(mockWindow.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));

            // Advance timer to trigger fallback
            vi.advanceTimersByTime(1500);

            expect(mockWindow.open).toHaveBeenCalledWith('https://wa.me/1234567890?text=Hello%20World', '_blank');
        });

        it('opens web URL directly on desktop', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            openWhatsApp('+1234567890', 'Hello World');

            expect(mockWindow.open).toHaveBeenCalledWith('https://wa.me/1234567890?text=Hello%20World', '_blank');
        });

        it('handles popup blocking on desktop', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
            mockWindow.open.mockReturnValue(null); // Simulate popup blocked

            openWhatsApp('+1234567890', 'Hello World');

            // Should fallback to location.href when popup is blocked
            expect(mockWindow.location.href).toBe('https://wa.me/1234567890?text=Hello%20World');
        });

        it('clears fallback timer when page becomes hidden (app opened)', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)';

            let visibilityChangeHandler: () => void;
            mockDocument.addEventListener.mockImplementation((event, handler) => {
                if (event === 'visibilitychange') {
                    visibilityChangeHandler = handler as () => void;
                }
            });

            openWhatsApp('+1234567890', 'Hello World');

            // Simulate page becoming hidden (app opened)
            mockDocument.hidden = true;
            visibilityChangeHandler!();

            // Advance timer - should not trigger fallback
            vi.advanceTimersByTime(2000);

            expect(mockWindow.open).not.toHaveBeenCalled();
        });

        it('handles errors with fallback alert', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
            mockWindow.open.mockImplementation(() => {
                throw new Error('Test error');
            });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            openWhatsApp('+1234567890', 'Hello World');

            expect(consoleSpy).toHaveBeenCalledWith('Failed to open WhatsApp:', expect.any(Error));
            expect(mockWindow.alert).toHaveBeenCalledWith(
                expect.stringContaining('Unable to open WhatsApp automatically')
            );

            consoleSpy.mockRestore();
        });
    });

    describe('SSR Environment Handling', () => {
        it('handles server-side rendering environment', () => {
            const originalWindow = global.window;
            // @ts-ignore
            delete global.window;

            const platform = detectPlatform();
            expect(platform.isMobile).toBe(false);
            expect(platform.isDesktop).toBe(true);
            expect(platform.hasWhatsAppSupport).toBe(false);

            expect(() => {
                generatePlatformSpecificURL('+1234567890', 'Hello');
            }).toThrow('WhatsApp is not supported on this platform');

            global.window = originalWindow;
        });

        it('handles missing navigator in SSR', () => {
            const originalNavigator = global.navigator;
            // @ts-ignore
            delete global.navigator;

            const platform = detectPlatform();
            expect(platform.userAgent).toBe('');
            expect(platform.hasWhatsAppSupport).toBe(false);

            global.navigator = originalNavigator;
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('handles invalid phone numbers', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            expect(() => {
                generatePlatformSpecificURL('invalid-phone', 'Hello');
            }).toThrow('Invalid phone number format. Use international format (+1234567890)');
        });

        it('handles empty messages', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            const url = generatePlatformSpecificURL('+1234567890', '');
            expect(url).toBe('https://wa.me/1234567890?text=');
        });

        it('handles very long messages', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            const longMessage = 'A'.repeat(1000);
            const url = generatePlatformSpecificURL('+1234567890', longMessage);
            expect(url).toContain('text=' + encodeURIComponent(longMessage));
        });

        it('handles unusual user agents', () => {
            const unusualUserAgents = [
                '', // Empty user agent
                'CustomBot/1.0', // Custom bot
                'Mozilla/5.0 (Unknown Device)', // Unknown device
            ];

            unusualUserAgents.forEach(userAgent => {
                mockNavigator.userAgent = userAgent;

                const platform = detectPlatform();
                expect(platform.hasWhatsAppSupport).toBe(true); // Should still support WhatsApp
                expect(platform.isDesktop).toBe(true); // Should default to desktop
            });
        });
    });
});