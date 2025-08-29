/**
 * WhatsApp Debug Component
 * Shows configuration status and helps troubleshoot issues
 */

'use client';

import { useState } from 'react';
import { detectPlatform, generatePlatformSpecificURL, validatePhoneNumber } from '@/lib/utils/whatsapp';

interface WhatsAppDebugProps {
    phoneNumber?: string;
    message?: string;
}

export function WhatsAppDebug({ phoneNumber, message }: WhatsAppDebugProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-sm z-50"
            >
                Debug WhatsApp
            </button>
        );
    }

    const platform = detectPlatform();
    const testPhone = phoneNumber || '+263777123456';
    const testMessage = message || 'Hello from Ruscle Investments!';

    let generatedURL = '';
    let urlError = '';

    try {
        generatedURL = generatePlatformSpecificURL(testPhone, testMessage);
    } catch (error) {
        urlError = error instanceof Error ? error.message : 'Unknown error';
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">WhatsApp Debug Info</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Platform Detection */}
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold mb-2">Platform Detection</h3>
                            <div className="text-sm space-y-1">
                                <p>User Agent: <code className="bg-gray-200 px-1 rounded">{platform.userAgent}</code></p>
                                <p>Is Mobile: <span className={platform.isMobile ? 'text-green-600' : 'text-red-600'}>{platform.isMobile ? 'Yes' : 'No'}</span></p>
                                <p>Is iOS: <span className={platform.isIOS ? 'text-green-600' : 'text-gray-600'}>{platform.isIOS ? 'Yes' : 'No'}</span></p>
                                <p>Is Android: <span className={platform.isAndroid ? 'text-green-600' : 'text-gray-600'}>{platform.isAndroid ? 'Yes' : 'No'}</span></p>
                                <p>Is Desktop: <span className={platform.isDesktop ? 'text-green-600' : 'text-gray-600'}>{platform.isDesktop ? 'Yes' : 'No'}</span></p>
                                <p>WhatsApp Support: <span className={platform.hasWhatsAppSupport ? 'text-green-600' : 'text-red-600'}>{platform.hasWhatsAppSupport ? 'Yes' : 'No'}</span></p>
                            </div>
                        </div>

                        {/* Phone Number Validation */}
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold mb-2">Phone Number Validation</h3>
                            <div className="text-sm space-y-1">
                                <p>Phone: <code className="bg-gray-200 px-1 rounded">{testPhone}</code></p>
                                <p>Valid: <span className={validatePhoneNumber(testPhone) ? 'text-green-600' : 'text-red-600'}>{validatePhoneNumber(testPhone) ? 'Yes' : 'No'}</span></p>
                            </div>
                        </div>

                        {/* URL Generation */}
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold mb-2">URL Generation</h3>
                            <div className="text-sm space-y-2">
                                <p>Message: <code className="bg-gray-200 px-1 rounded">{testMessage}</code></p>
                                {urlError ? (
                                    <p className="text-red-600">Error: {urlError}</p>
                                ) : (
                                    <>
                                        <p>Generated URL:</p>
                                        <code className="bg-gray-200 p-2 rounded block break-all text-xs">{generatedURL}</code>
                                        <button
                                            onClick={() => window.open(generatedURL, '_blank')}
                                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                        >
                                            Test URL
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Environment Variables */}
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold mb-2">Environment Status</h3>
                            <div className="text-sm space-y-1">
                                <p>Phone from env: <span className={phoneNumber ? 'text-green-600' : 'text-red-600'}>{phoneNumber || 'Not provided'}</span></p>
                                <p>Message from env: <span className={message ? 'text-green-600' : 'text-red-600'}>{message ? 'Provided' : 'Using default'}</span></p>
                            </div>
                        </div>

                        {/* Browser Info */}
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold mb-2">Browser Info</h3>
                            <div className="text-sm space-y-1">
                                <p>Window width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px</p>
                                <p>Window height: {typeof window !== 'undefined' ? window.innerHeight : 'N/A'}px</p>
                                <p>Device pixel ratio: {typeof window !== 'undefined' ? window.devicePixelRatio : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}