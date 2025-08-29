/**
 * Server actions for WhatsApp configuration
 * Safely loads environment variables on the server side
 */

'use server';

export interface WhatsAppServerConfig {
    phoneNumber: string;
    defaultMessage: string;
    businessName: string;
    enabled: boolean;
}

/**
 * Gets WhatsApp configuration from server-side environment variables
 * This runs on the server and can safely access process.env
 */
export async function getWhatsAppServerConfig(): Promise<WhatsAppServerConfig> {
    return {
        phoneNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '',
        defaultMessage: process.env.WHATSAPP_DEFAULT_MESSAGE || "Hello! I'm interested in your investment services. Could you please provide more information?",
        businessName: process.env.WHATSAPP_BUSINESS_NAME || 'Ruscle Investments',
        enabled: process.env.WHATSAPP_ENABLED !== 'false'
    };
}