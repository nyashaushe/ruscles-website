'use client';

import * as React from 'react';
import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '@/lib/utils/whatsapp';
import { getSafeWhatsAppConfig, getCompleteWelcomeMessage } from '@/lib/config/whatsapp';
import { cn } from '@/lib/utils';

/**
 * Position options for the WhatsApp button
 */
export type WhatsAppButtonPosition =
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left';

/**
 * Props for the WhatsApp button component
 */
export interface WhatsAppButtonProps {
    /** Business phone number in international format (+1234567890) - optional, uses env config if not provided */
    phoneNumber?: string;
    /** Pre-filled message when WhatsApp opens - optional, uses configured welcome message if not provided */
    message?: string;
    /** Position of the floating button */
    position?: WhatsAppButtonPosition;
    /** Additional CSS classes */
    className?: string;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Accessibility label for screen readers */
    ariaLabel?: string;
    /** Whether to use environment configuration (default: true) */
    useEnvConfig?: boolean;
}

/**
 * Position class mappings for the floating button
 */
const positionClasses: Record<WhatsAppButtonPosition, string> = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
};

/**
 * WhatsApp floating action button component
 * Provides a fixed-position button that opens WhatsApp with pre-filled message
 */
export function WhatsAppButton({
    phoneNumber: propPhoneNumber,
    message: propMessage,
    position = 'bottom-right',
    className,
    disabled = false,
    ariaLabel = 'Contact us on WhatsApp',
    useEnvConfig = true,
}: WhatsAppButtonProps) {
    const [isFocused, setIsFocused] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    // Get configuration from environment or use props
    const config = React.useMemo(() => {
        if (useEnvConfig) {
            return getSafeWhatsAppConfig();
        }
        return null;
    }, [useEnvConfig]);

    // Determine phone number and message to use
    const phoneNumber = propPhoneNumber || config?.phoneNumber || '';
    const message = React.useMemo(() => {
        if (propMessage) {
            return propMessage;
        }
        if (useEnvConfig && config?.enabled) {
            try {
                return getCompleteWelcomeMessage();
            } catch (error) {
                console.warn('Failed to get welcome message, using fallback:', error);
                return config?.defaultMessage || 'Hello! I\'m interested in your services.';
            }
        }
        return 'Hello! I\'m interested in your services.';
    }, [propMessage, useEnvConfig, config]);

    // Check if button should be disabled
    const isDisabled = disabled || !phoneNumber || (useEnvConfig && config && config.enabled === false);

    // Enhanced accessibility: Comprehensive ARIA description
    const ariaDescription = React.useMemo(() => {
        const businessName = config?.businessName || 'business';
        return `Opens WhatsApp to start a conversation with ${businessName}. Message will be pre-filled: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`;
    }, [config?.businessName, message]);

    const handleClick = () => {
        if (isDisabled) return;

        try {
            openWhatsApp(phoneNumber, message);
            // Announce to screen readers that WhatsApp is opening
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = 'Opening WhatsApp...';
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 3000);
        } catch (error) {
            console.error('Failed to open WhatsApp:', error);
            // Enhanced error handling with screen reader announcement
            const errorAnnouncement = document.createElement('div');
            errorAnnouncement.setAttribute('aria-live', 'assertive');
            errorAnnouncement.setAttribute('aria-atomic', 'true');
            errorAnnouncement.className = 'sr-only';
            errorAnnouncement.textContent = `Failed to open WhatsApp. Please contact us directly at ${phoneNumber}`;
            document.body.appendChild(errorAnnouncement);
            setTimeout(() => document.body.removeChild(errorAnnouncement), 5000);

            // Fallback: show alert with phone number
            alert(`Please contact us on WhatsApp: ${phoneNumber}`);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        // Enhanced keyboard navigation support
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsPressed(true);
            handleClick();
        }
        // Add Escape key to remove focus
        if (event.key === 'Escape') {
            buttonRef.current?.blur();
        }
    };

    const handleKeyUp = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            setIsPressed(false);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setIsPressed(false);
    };

    const handleMouseDown = () => {
        setIsPressed(true);
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    const handleMouseLeave = () => {
        setIsPressed(false);
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            disabled={isDisabled}
            aria-label={ariaLabel}
            aria-describedby="whatsapp-button-description"
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            className={cn(
                // Base styles
                'fixed z-50 flex items-center justify-center',
                'w-14 h-14 rounded-full shadow-lg',
                'transition-all duration-200 ease-in-out',

                // Enhanced focus management with high contrast ring
                'focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-[#25D366]',

                // WhatsApp official colors with WCAG AA compliant contrast
                'bg-[#25D366] text-white',

                // Enhanced hover effects with better visual feedback
                !isDisabled && [
                    'hover:bg-[#20BA5A] hover:scale-110 hover:shadow-xl',
                    'hover:ring-2 hover:ring-white hover:ring-opacity-30'
                ],

                // Enhanced active/pressed state
                isPressed && !isDisabled && 'scale-95 bg-[#1DA851]',

                // Enhanced focus state with additional visual indicators
                isFocused && !isDisabled && [
                    'ring-4 ring-white ring-offset-4 ring-offset-[#25D366]',
                    'shadow-2xl'
                ],

                // Disabled state with better contrast
                isDisabled && [
                    'opacity-60 cursor-not-allowed',
                    'bg-gray-400 text-gray-200',
                    'hover:scale-100 hover:bg-gray-400 hover:shadow-lg'
                ],

                // Position
                positionClasses[position],

                // Responsive sizing with better touch targets
                'sm:w-16 sm:h-16',

                // Ensure minimum touch target size (44px) for accessibility
                'min-w-[44px] min-h-[44px]',

                // Custom classes
                className
            )}
            title={`Contact us on WhatsApp${config?.businessName ? ` - ${config.businessName}` : ''}`}
        >
            <MessageCircle
                className={cn(
                    'w-6 h-6 sm:w-7 sm:h-7',
                    'transition-transform duration-200',
                    // Enhanced icon scaling for better visual feedback
                    !isDisabled && 'group-hover:scale-110',
                    isPressed && !isDisabled && 'scale-90',
                    isFocused && !isDisabled && 'scale-105'
                )}
                aria-hidden="true"
            />

            {/* Hidden description for screen readers */}
            <span
                id="whatsapp-button-description"
                className="sr-only"
            >
                {ariaDescription}
            </span>
        </button>
    );
}

/**
 * Default export for easier importing
 */
export default WhatsAppButton;