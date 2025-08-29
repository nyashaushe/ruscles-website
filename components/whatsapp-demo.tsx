'use client';

import { WhatsAppButton } from './whatsapp-button';

/**
 * Demo component showing WhatsApp button usage
 */
export function WhatsAppDemo() {
    return (
        <div className="relative min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    WhatsApp Button Demo
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Component Features</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>✅ Fixed positioning with configurable placement</li>
                        <li>✅ WhatsApp official colors (#25D366)</li>
                        <li>✅ Responsive design (mobile and desktop)</li>
                        <li>✅ Hover and focus effects</li>
                        <li>✅ Keyboard navigation support</li>
                        <li>✅ Platform detection (mobile app vs web)</li>
                        <li>✅ Customizable pre-filled messages</li>
                        <li>✅ Error handling and fallbacks</li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Try the Button</h2>
                    <p className="text-gray-700 mb-4">
                        The WhatsApp button is positioned in the bottom-right corner.
                        Click it to test the functionality (it will try to open WhatsApp with a demo message).
                    </p>
                    <p className="text-sm text-gray-500">
                        Note: The phone number used is a demo number (+1234567890).
                        In production, this would be configured with your business WhatsApp number.
                    </p>
                </div>
            </div>

            {/* WhatsApp Button - positioned fixed */}
            <WhatsAppButton
                phoneNumber="+1234567890"
                message="Hello! I'm interested in your services. I found you through your website."
                position="bottom-right"
                ariaLabel="Contact us on WhatsApp - Demo"
            />
        </div>
    );
}