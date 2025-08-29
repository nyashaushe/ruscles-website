import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    validatePhoneNumber,
    formatPhoneNumber,
    generateWhatsAppURL,
    isMobileDevice,
    openWhatsApp,
    detectPlatform,
    generatePlatformSpecificURL,
    getFallbackURL,
} from '@/lib/utils/whatsapp';

// Mock window and navigator for testing
const mockWindow = {
    location: { href: '' },
    open: vi.fn(),
};

const mockNavigator = {
    userAgent: '',
};

Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true,
});

Object.defineProperty(global, 'navigator', {
    value: mockNavigator,
    writable: true,
});

describe('WhatsApp Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWindow.location.href = '';
        mockNavigator.userAgent = '';
    });

    describe('validatePhoneNumber', () => {
        it('validates correct international phone numbers', () => {
            expect(validatePhoneNumber('+1234567890')).toBe(true);
            expect(validatePhoneNumber('+44123456789')).toBe(true);
            expect(validatePhoneNumber('+91987654321')).toBe(true);
            expect(validatePhoneNumber('+5511999887766')).toBe(true);
        });

        it('rejects invalid phone numbers', () => {
            expect(validatePhoneNumber('1234567890')).toBe(false); // No + prefix
            expect(validatePhoneNumber('+0123456789')).toBe(false); // Country code starts with 0
            expect(validatePhoneNumber('+123')).toBe(false); // Too short
            expect(validatePhoneNumber('+12345678901234567890')).toBe(false); // Too long
            expect(validatePhoneNumber('')).toBe(false); // Empty string
            expect(validatePhoneNumber('invalid')).toBe(false); // Non-numeric
        });

        it('handles phone numbers with formatting characters', () => {
            expect(validatePhoneNumber('+1 (234) 567-890')).toBe(true);
            expect(validatePhoneNumber('+44 123 456 789')).toBe(true);
            expect(validatePhoneNumber('+91-987-654-321')).toBe(true);
        });
    });

    describe('formatPhoneNumber', () => {
        it('removes + prefix and formatting characters', () => {
            expect(formatPhoneNumber('+1234567890')).toBe('1234567890');
            expect(formatPhoneNumber('+44123456789')).toBe('44123456789');
        });

        it('handles numbers with formatting characters', () => {
            expect(formatPhoneNumber('+1 (234) 567-890')).toBe('1234567890');
            expect(formatPhoneNumber('+44 123 456 789')).toBe('44123456789');
            expect(formatPhoneNumber('+91-987-654-321')).toBe('91987654321');
        });

        it('handles numbers without + prefix', () => {
            expect(formatPhoneNumber('1234567890')).toBe('1234567890');
            expect(formatPhoneNumber('44 123 456 789')).toBe('44123456789');
        });
    });

    describe('generateWhatsAppURL', () => {
        it('generates mobile WhatsApp URL', () => {
            const url = generateWhatsAppURL('+1234567890', 'Hello World', true);
            expect(url).toBe('whatsapp://send?phone=1234567890&text=Hello%20World');
        });

        it('generates web WhatsApp URL', () => {
            const url = generateWhatsAppURL('+1234567890', 'Hello World', false);
            expect(url).toBe('https://wa.me/1234567890?text=Hello%20World');
        });

        it('handles empty message', () => {
            const url = generateWhatsAppURL('+1234567890', '', false);
            expect(url).toBe('https://wa.me/1234567890?text=');
        });

        it('encodes special characters in message', () => {
            const message = 'Hello! How are you? I\'m interested in your services.';
            const url = generateWhatsAppURL('+1234567890', message, false);
            expect(url).toContain('Hello!%20How%20are%20you%3F%20I\'m%20interested%20in%20your%20services.');
        });

        it('throws error for invalid phone number', () => {
            expect(() => {
                generateWhatsAppURL('invalid', 'Hello');
            }).toThrow('Invalid phone number format. Use international format (+1234567890)');
        });

        it('defaults to web URL when isMobile not specified', () => {
            const url = generateWhatsAppURL('+1234567890', 'Hello');
            expect(url).toBe('https://wa.me/1234567890?text=Hello');
        });
    });

    describe('detectPlatform', () => {
        it('detects iOS devices correctly', () => {
            const iOSUserAgents = [
                'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
                'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
                'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
            ];

            iOSUserAgents.forEach(userAgent => {
                mockNavigator.userAgent = userAgent;
                const platform = detectPlatform();
                expect(platform.isIOS).toBe(true);
                expect(platform.isMobile).toBe(true);
                expect(platform.isAndroid).toBe(false);
                expect(platform.isDesktop).toBe(false);
                expect(platform.hasWhatsAppSupport).toBe(true);
                expect(platform.userAgent).toBe(userAgent);
            });
        });

        it('detects Android devices correctly', () => {
            const androidUserAgents = [
                'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
                'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
            ];

            androidUserAgents.forEach(userAgent => {
                mockNavigator.userAgent = userAgent;
                const platform = detectPlatform();
                expect(platform.isAndroid).toBe(true);
                expect(platform.isMobile).toBe(true);
                expect(platform.isIOS).toBe(false);
                expect(platform.isDesktop).toBe(false);
                expect(platform.hasWhatsAppSupport).toBe(true);
                expect(platform.userAgent).toBe(userAgent);
            });
        });

        it('detects desktop devices correctly', () => {
            const desktopUserAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            ];

            desktopUserAgents.forEach(userAgent => {
                mockNavigator.userAgent = userAgent;
                const platform = detectPlatform();
                expect(platform.isDesktop).toBe(true);
                expect(platform.isMobile).toBe(false);
                expect(platform.isIOS).toBe(false);
                expect(platform.isAndroid).toBe(false);
                expect(platform.hasWhatsAppSupport).toBe(true);
                expect(platform.userAgent).toBe(userAgent);
            });
        });

        it('detects other mobile devices correctly', () => {
            const otherMobileUserAgents = [
                'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900)',
                'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80)',
                'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 635)',
            ];

            otherMobileUserAgents.forEach(userAgent => {
                mockNavigator.userAgent = userAgent;
                const platform = detectPlatform();
                expect(platform.isMobile).toBe(true);
                expect(platform.isDesktop).toBe(false);
                expect(platform.hasWhatsAppSupport).toBe(true);
            });
        });

        it('handles SSR environment correctly', () => {
            const originalWindow = global.window;
            // @ts-ignore
            delete global.window;

            const platform = detectPlatform();
            expect(platform.isMobile).toBe(false);
            expect(platform.isIOS).toBe(false);
            expect(platform.isAndroid).toBe(false);
            expect(platform.isDesktop).toBe(true);
            expect(platform.hasWhatsAppSupport).toBe(false);
            expect(platform.userAgent).toBe('');

            global.window = originalWindow;
        });
    });

    describe('isMobileDevice', () => {
        it('detects mobile devices', () => {
            const mobileUserAgents = [
                'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
                'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
                'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
                'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
                'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900)',
                'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80)',
            ];

            mobileUserAgents.forEach(userAgent => {
                mockNavigator.userAgent = userAgent;
                expect(isMobileDevice()).toBe(true);
            });
        });

        it('detects desktop devices', () => {
            const desktopUserAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            ];

            desktopUserAgents.forEach(userAgent => {
                mockNavigator.userAgent = userAgent;
                expect(isMobileDevice()).toBe(false);
            });
        });

        it('returns false when window is undefined (SSR)', () => {
            const originalWindow = global.window;
            // @ts-ignore
            delete global.window;

            expect(isMobileDevice()).toBe(false);

            global.window = originalWindow;
        });
    });

    describe('generatePlatformSpecificURL', () => {
        it('generates mobile URL for mobile devices', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

            const url = generatePlatformSpecificURL('+1234567890', 'Hello World');
            expect(url).toBe('whatsapp://send?phone=1234567890&text=Hello%20World');
        });

        it('generates web URL for desktop devices', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            const url = generatePlatformSpecificURL('+1234567890', 'Hello World');
            expect(url).toBe('https://wa.me/1234567890?text=Hello%20World');
        });

        it('throws error for unsupported platforms', () => {
            const originalWindow = global.window;
            // @ts-ignore
            delete global.window;

            expect(() => {
                generatePlatformSpecificURL('+1234567890', 'Hello');
            }).toThrow('WhatsApp is not supported on this platform');

            global.window = originalWindow;
        });
    });

    describe('getFallbackURL', () => {
        it('always returns web URL regardless of platform', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

            const url = getFallbackURL('+1234567890', 'Hello World');
            expect(url).toBe('https://wa.me/1234567890?text=Hello%20World');
        });

        it('handles empty message', () => {
            const url = getFallbackURL('+1234567890');
            expect(url).toBe('https://wa.me/1234567890?text=');
        });
    });

    describe('openWhatsApp', () => {
        let mockAlert: any;
        let mockConsoleError: any;
        let mockConsoleWarn: any;

        beforeEach(() => {
            vi.useFakeTimers();
            mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => { });
            mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });

            // Mock document methods
            Object.defineProperty(document, 'hidden', {
                writable: true,
                value: false,
            });

            vi.spyOn(document, 'addEventListener').mockImplementation(() => { });
            vi.spyOn(document, 'removeEventListener').mockImplementation(() => { });
            vi.spyOn(window, 'addEventListener').mockImplementation(() => { });
            vi.spyOn(window, 'removeEventListener').mockImplementation(() => { });
        });

        afterEach(() => {
            vi.useRealTimers();
            mockAlert.mockRestore();
            mockConsoleError.mockRestore();
            mockConsoleWarn.mockRestore();
        });

        it('opens mobile app URL on mobile devices', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

            openWhatsApp('+1234567890', 'Hello');

            expect(mockWindow.location.href).toBe('whatsapp://send?phone=1234567890&text=Hello');
        });

        it('opens web URL on desktop devices', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            openWhatsApp('+1234567890', 'Hello');

            expect(mockWindow.open).toHaveBeenCalledWith(
                'https://wa.me/1234567890?text=Hello',
                '_blank'
            );
        });

        it('provides fallback to web version on mobile after timeout', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

            openWhatsApp('+1234567890', 'Hello');

            // Fast-forward time to trigger fallback
            vi.advanceTimersByTime(1500);

            expect(mockWindow.open).toHaveBeenCalledWith(
                'https://wa.me/1234567890?text=Hello',
                '_blank'
            );
        });

        it('clears fallback timer when page becomes hidden (app opened)', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            openWhatsApp('+1234567890', 'Hello');

            expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
        });

        it('handles popup blocked on desktop', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            // Mock window.open to return null (popup blocked)
            mockWindow.open.mockReturnValue(null);

            openWhatsApp('+1234567890', 'Hello');

            // Should fallback to location.href when popup is blocked
            expect(mockWindow.location.href).toBe('https://wa.me/1234567890?text=Hello');
        });

        it('handles unsupported platforms', () => {
            const originalWindow = global.window;
            // @ts-ignore
            delete global.window;

            openWhatsApp('+1234567890', 'Hello');

            expect(mockConsoleWarn).toHaveBeenCalledWith('WhatsApp is not supported on this platform');

            global.window = originalWindow;
        });

        it('handles errors with fallback alert', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            // Mock window.open to throw an error
            mockWindow.open.mockImplementation(() => {
                throw new Error('Test error');
            });

            openWhatsApp('+1234567890', 'Hello');

            expect(mockConsoleError).toHaveBeenCalledWith('Failed to open WhatsApp:', expect.any(Error));
            expect(mockAlert).toHaveBeenCalledWith(
                expect.stringContaining('Unable to open WhatsApp automatically')
            );
        });

        it('uses default empty message when none provided', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

            openWhatsApp('+1234567890');

            expect(mockWindow.open).toHaveBeenCalledWith(
                'https://wa.me/1234567890?text=',
                '_blank'
            );
        });

        it('handles Android devices correctly', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F)';

            openWhatsApp('+1234567890', 'Hello');

            expect(mockWindow.location.href).toBe('whatsapp://send?phone=1234567890&text=Hello');
        });

        it('sets up beforeunload listener on mobile', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

            openWhatsApp('+1234567890', 'Hello');

            expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
        });
    });
});