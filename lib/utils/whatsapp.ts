/**
 * WhatsApp utility functions for phone number validation and URL generation
 */

/**
 * Validates a phone number for WhatsApp compatibility
 * @param phoneNumber - Phone number in international format (+1234567890)
 * @returns boolean indicating if the phone number is valid
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters except the leading +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Must start with + and have 7-15 digits after country code
    const phoneRegex = /^\+[1-9]\d{6,14}$/;

    return phoneRegex.test(cleaned);
}

/**
 * Formats and sanitizes a phone number for WhatsApp URLs
 * @param phoneNumber - Raw phone number input
 * @returns Formatted phone number without + prefix
 */
export function formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except the leading +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Remove the + prefix for WhatsApp URL
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }

    return cleaned;
}

/**
 * Generates WhatsApp URL for both mobile and web platforms
 * @param phoneNumber - Phone number in international format
 * @param message - Pre-filled message (optional)
 * @param isMobile - Whether to generate mobile app URL or web URL
 * @returns WhatsApp URL string
 */
export function generateWhatsAppURL(
    phoneNumber: string,
    message: string = '',
    isMobile: boolean = false
): string {
    if (!validatePhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format. Use international format (+1234567890)');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);

    if (isMobile) {
        // Mobile app URL scheme
        return `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;
    } else {
        // Web URL
        return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    }
}

/**
 * Generates platform-specific WhatsApp URL based on automatic platform detection
 * @param phoneNumber - Phone number in international format
 * @param message - Pre-filled message (optional)
 * @returns WhatsApp URL string optimized for the current platform
 */
export function generatePlatformSpecificURL(
    phoneNumber: string,
    message: string = ''
): string {
    const platform = detectPlatform();

    if (!platform.hasWhatsAppSupport) {
        throw new Error('WhatsApp is not supported on this platform');
    }

    return generateWhatsAppURL(phoneNumber, message, platform.isMobile);
}

/**
 * Gets the fallback URL for unsupported platforms
 * @param phoneNumber - Phone number in international format
 * @returns Web-based WhatsApp URL as fallback
 */
export function getFallbackURL(phoneNumber: string, message: string = ''): string {
    // Always use web URL as fallback
    return generateWhatsAppURL(phoneNumber, message, false);
}

/**
 * Platform detection results
 */
export interface PlatformInfo {
    isMobile: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isDesktop: boolean;
    hasWhatsAppSupport: boolean;
    userAgent: string;
}

/**
 * Detects the user's platform and WhatsApp support capabilities
 * @returns PlatformInfo object with detailed platform information
 */
export function detectPlatform(): PlatformInfo {
    if (typeof window === 'undefined') {
        return {
            isMobile: false,
            isIOS: false,
            isAndroid: false,
            isDesktop: true,
            hasWhatsAppSupport: false,
            userAgent: '',
        };
    }

    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isDesktop = !isMobile;

    // WhatsApp is supported on most mobile platforms and desktop web
    const hasWhatsAppSupport = isMobile || isDesktop;

    return {
        isMobile,
        isIOS,
        isAndroid,
        isDesktop,
        hasWhatsAppSupport,
        userAgent,
    };
}

/**
 * Detects if the user is on a mobile device (legacy function for backward compatibility)
 * @returns boolean indicating if the device is mobile
 */
export function isMobileDevice(): boolean {
    return detectPlatform().isMobile;
}

/**
 * Opens WhatsApp with platform-specific behavior and fallback handling
 * @param phoneNumber - Phone number in international format
 * @param message - Pre-filled message (optional)
 */
export function openWhatsApp(phoneNumber: string, message: string = ''): void {
    const platform = detectPlatform();

    // Check if WhatsApp is supported on this platform
    if (!platform.hasWhatsAppSupport) {
        handleUnsupportedPlatform(phoneNumber, message);
        return;
    }

    try {
        if (platform.isMobile) {
            openWhatsAppOnMobile(phoneNumber, message, platform);
        } else {
            openWhatsAppOnDesktop(phoneNumber, message);
        }
    } catch (error) {
        console.error('Failed to open WhatsApp:', error);
        handleFallback(phoneNumber, message);
    }
}

/**
 * Opens WhatsApp on mobile devices with app detection and fallback
 * @param phoneNumber - Phone number in international format
 * @param message - Pre-filled message
 * @param platform - Platform information
 */
function openWhatsAppOnMobile(
    phoneNumber: string,
    message: string,
    platform: PlatformInfo
): void {
    const mobileUrl = generateWhatsAppURL(phoneNumber, message, true);

    // Try to open the mobile app
    window.location.href = mobileUrl;

    // Set up fallback to web version if app doesn't open
    const fallbackTimer = setTimeout(() => {
        try {
            const webUrl = getFallbackURL(phoneNumber, message);
            window.open(webUrl, '_blank');
        } catch (error) {
            console.error('Fallback failed:', error);
            handleFallback(phoneNumber, message);
        }
    }, 1500); // Increased timeout for better app detection

    // Clear the fallback timer if the page becomes hidden (app opened successfully)
    const handleVisibilityChange = () => {
        if (document.hidden) {
            clearTimeout(fallbackTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also clear timer if user navigates away
    const handleBeforeUnload = () => {
        clearTimeout(fallbackTimer);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
}

/**
 * Opens WhatsApp on desktop devices
 * @param phoneNumber - Phone number in international format
 * @param message - Pre-filled message
 */
function openWhatsAppOnDesktop(phoneNumber: string, message: string): void {
    const webUrl = generateWhatsAppURL(phoneNumber, message, false);

    // Open in new tab/window
    const newWindow = window.open(webUrl, '_blank');

    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked, try alternative approach
        window.location.href = webUrl;
    }
}

/**
 * Handles unsupported platforms
 * @param phoneNumber - Phone number in international format
 * @param message - Pre-filled message
 */
function handleUnsupportedPlatform(phoneNumber: string, message: string): void {
    console.warn('WhatsApp is not supported on this platform');

    // Show user-friendly message with contact information
    const contactMessage = `WhatsApp is not available on this platform.\n\nPlease contact us directly:\nPhone: ${phoneNumber}\nMessage: ${message}`;

    if (typeof window !== 'undefined' && window.alert) {
        alert(contactMessage);
    } else {
        console.log(contactMessage);
    }
}

/**
 * Handles fallback when all WhatsApp opening methods fail
 * @param phoneNumber - Phone number in international format
 * @param message - Pre-filled message
 */
function handleFallback(phoneNumber: string, message: string): void {
    const fallbackMessage = `Unable to open WhatsApp automatically.\n\nPlease contact us on WhatsApp:\nPhone: ${phoneNumber}\nMessage: ${message}`;

    if (typeof window !== 'undefined' && window.alert) {
        alert(fallbackMessage);
    } else {
        console.log(fallbackMessage);
    }
}