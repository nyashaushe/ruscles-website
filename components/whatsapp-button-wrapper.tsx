/**
 * Server-side WhatsApp Button wrapper
 * Safely loads environment configuration and provides fallbacks
 */

import { WhatsAppButton } from './whatsapp-button';

interface WhatsAppButtonWrapperProps {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    className?: string;
}

export function WhatsAppButtonWrapper({
    position = 'bottom-right',
    className
}: WhatsAppButtonWrapperProps) {
    // Get configuration from environment variables directly on the server side
    const phoneNumber = process.env.WHATSAPP_BUSINESS_NUMBER;
    const defaultMessage = process.env.WHATSAPP_DEFAULT_MESSAGE || "Hello! I'm interested in your investment services. Could you please provide more information?";
    const businessName = process.env.WHATSAPP_BUSINESS_NAME || 'Ruscle Investments';
    const enabled = process.env.WHATSAPP_ENABLED !== 'false';

    // Don't render if disabled or no phone number
    if (!enabled || !phoneNumber) {
        console.warn('WhatsApp button disabled: missing configuration or explicitly disabled');
        return null;
    }

    return (
        <WhatsAppButton
            phoneNumber={phoneNumber}
            message={defaultMessage}
            position={position}
            className={className}
            useEnvConfig={false} // We're providing the config directly
            ariaLabel={`Contact ${businessName} on WhatsApp`}
        />
    );
}