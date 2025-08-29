/**
 * WhatsApp Button with hardcoded configuration
 * This ensures the button always works with your business details
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
    // Your actual WhatsApp business configuration
    const config = {
        phoneNumber: '+263732591600', // Your actual WhatsApp number
        defaultMessage: "Hello! I'm interested in your investment services. Could you please provide more information?",
        businessName: 'Ruscle Investments',
        enabled: true
    };

    // Don't render if disabled
    if (!config.enabled) {
        return null;
    }

    return (
        <WhatsAppButton
            phoneNumber={config.phoneNumber}
            message={config.defaultMessage}
            position={position}
            className={className}
            useEnvConfig={false} // We're providing the config directly
            ariaLabel={`Contact ${config.businessName} on WhatsApp`}
        />
    );
}