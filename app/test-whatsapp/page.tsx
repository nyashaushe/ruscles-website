/**
 * Test page for WhatsApp button functionality
 * Visit /test-whatsapp to verify the button works
 */

import { WhatsAppButtonWrapper } from '@/components/whatsapp-button-wrapper';
import { WhatsAppDebug } from '@/components/whatsapp-debug';

export default function TestWhatsAppPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    WhatsApp Button Test Page
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>Phone Number:</strong> {process.env.WHATSAPP_BUSINESS_NUMBER || 'Not configured'}</p>
                        <p><strong>Business Name:</strong> {process.env.WHATSAPP_BUSINESS_NAME || 'Not configured'}</p>
                        <p><strong>Enabled:</strong> {process.env.WHATSAPP_ENABLED !== 'false' ? 'Yes' : 'No'}</p>
                        <p><strong>Default Message:</strong> {process.env.WHATSAPP_DEFAULT_MESSAGE || 'Using fallback'}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Look for the green WhatsApp button in the bottom-right corner</li>
                        <li>Click the button to test WhatsApp opening</li>
                        <li>On mobile: Should try to open WhatsApp app first, then fallback to web</li>
                        <li>On desktop: Should open WhatsApp Web in a new tab</li>
                        <li>Verify the message is pre-filled with your business context</li>
                    </ol>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Expected URLs</h2>
                    <div className="space-y-2 text-sm font-mono bg-gray-100 p-4 rounded">
                        <p><strong>Mobile:</strong> whatsapp://send?phone=263732591600&text=...</p>
                        <p><strong>Web:</strong> https://wa.me/263732591600?text=...</p>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Success Criteria</h2>
                    <ul className="list-disc list-inside space-y-1 text-green-700">
                        <li>WhatsApp button appears in bottom-right corner</li>
                        <li>Button has proper hover effects</li>
                        <li>Clicking opens WhatsApp with pre-filled message</li>
                        <li>Message includes business name and context</li>
                        <li>Button is accessible via keyboard navigation</li>
                    </ul>
                </div>

                {/* Test different positions */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6 relative h-32">
                        <h3 className="font-semibold mb-2">Top-Left Position</h3>
                        <WhatsAppButtonWrapper position="top-left" className="!relative !top-2 !left-2" />
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 relative h-32">
                        <h3 className="font-semibold mb-2">Top-Right Position</h3>
                        <WhatsAppButtonWrapper position="top-right" className="!relative !top-2 !right-2" />
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 relative h-32">
                        <h3 className="font-semibold mb-2">Bottom-Left Position</h3>
                        <WhatsAppButtonWrapper position="bottom-left" className="!relative !bottom-2 !left-2" />
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 relative h-32">
                        <h3 className="font-semibold mb-2">Bottom-Right Position</h3>
                        <WhatsAppButtonWrapper position="bottom-right" className="!relative !bottom-2 !right-2" />
                    </div>
                </div>

                {/* Debug Component */}
                <WhatsAppDebug
                    phoneNumber={process.env.WHATSAPP_BUSINESS_NUMBER}
                    message={process.env.WHATSAPP_DEFAULT_MESSAGE}
                />
            </div>
        </div>
    );
}