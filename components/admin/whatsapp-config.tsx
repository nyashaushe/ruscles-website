'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import {
    getSafeWhatsAppConfig,
    getCompleteWelcomeMessage,
    checkEnvironmentVariables,
    WHATSAPP_ENV_VARS,
    WhatsAppConfig,
} from '@/lib/config/whatsapp';
import {
    validateCompleteConfig,
    formatValidationErrors,
    formatValidationWarnings,
} from '@/lib/utils/whatsapp-validation';
import { WhatsAppButton } from '@/components/whatsapp-button';

/**
 * WhatsApp Configuration Management Component
 * Allows testing and validation of WhatsApp configuration
 */
export function WhatsAppConfigManager() {
    const [config, setConfig] = React.useState<WhatsAppConfig | null>(null);
    const [testMessage, setTestMessage] = React.useState('');
    const [validationResult, setValidationResult] = React.useState<any>(null);
    const [envCheck, setEnvCheck] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    // Load configuration on mount
    React.useEffect(() => {
        try {
            const whatsappConfig = getSafeWhatsAppConfig();
            setConfig(whatsappConfig);

            // Validate configuration
            if (whatsappConfig.phoneNumber) {
                const validation = validateCompleteConfig({
                    phoneNumber: whatsappConfig.phoneNumber,
                    defaultMessage: whatsappConfig.defaultMessage,
                    businessName: whatsappConfig.businessName,
                });
                setValidationResult(validation);
            }

            // Check environment variables
            const envResult = checkEnvironmentVariables();
            setEnvCheck(envResult);
        } catch (error) {
            console.error('Failed to load WhatsApp configuration:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleTestMessage = () => {
        try {
            const message = getCompleteWelcomeMessage(testMessage);
            alert(`Test Message:\n\n${message}`);
        } catch (error) {
            alert(`Error generating message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleRefreshConfig = () => {
        setLoading(true);
        // Simulate refresh by reloading the component
        window.location.reload();
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2">Loading WhatsApp configuration...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Configuration Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        WhatsApp Configuration Status
                    </CardTitle>
                    <CardDescription>
                        Current status of your WhatsApp integration configuration
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Overall Status */}
                    <div className="flex items-center gap-2">
                        {config?.enabled ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">
                            WhatsApp Integration: {config?.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    {/* Configuration Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Business Phone Number</Label>
                            <p className="text-sm text-muted-foreground">
                                {config?.phoneNumber || 'Not configured'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Business Name</Label>
                            <p className="text-sm text-muted-foreground">
                                {config?.businessName || 'Not configured'}
                            </p>
                        </div>
                    </div>

                    {/* Environment Variables Check */}
                    {envCheck && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Environment Variables</Label>
                            {envCheck.isValid ? (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        All required environment variables are configured.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Missing required environment variables: {envCheck.missing.join(', ')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {envCheck.optional.length > 0 && (
                                <Alert>
                                    <AlertDescription>
                                        Optional variables not set: {envCheck.optional.join(', ')}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* Validation Results */}
                    {validationResult && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Configuration Validation</Label>
                            {validationResult.isValid ? (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>Configuration is valid.</AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="whitespace-pre-line">
                                            {formatValidationErrors(validationResult.errors)}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {validationResult.warnings?.length > 0 && (
                                <Alert>
                                    <AlertDescription>
                                        <div className="whitespace-pre-line">
                                            {formatValidationWarnings(validationResult.warnings)}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Message Testing */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Welcome Message</CardTitle>
                    <CardDescription>
                        Test how your welcome message will appear to users
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="test-message">Additional Message (Optional)</Label>
                        <Textarea
                            id="test-message"
                            placeholder="Enter additional message to append..."
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleTestMessage} disabled={!config?.enabled}>
                            Preview Message
                        </Button>
                        <Button variant="outline" onClick={handleRefreshConfig}>
                            Refresh Configuration
                        </Button>
                    </div>

                    {/* Current Default Message */}
                    <div>
                        <Label className="text-sm font-medium">Current Default Message</Label>
                        <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                            {config?.defaultMessage || 'No default message configured'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Live Preview */}
            {config?.enabled && config?.phoneNumber && (
                <Card>
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                        <CardDescription>
                            This is how the WhatsApp button will appear on your website
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
                            <WhatsAppButton
                                position="bottom-right"
                                useEnvConfig={true}
                            />
                            <p className="absolute top-4 left-4 text-sm text-muted-foreground">
                                Preview area - button appears in bottom right
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Environment Variables Reference */}
            <Card>
                <CardHeader>
                    <CardTitle>Environment Variables Reference</CardTitle>
                    <CardDescription>
                        Available environment variables for WhatsApp configuration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-sm font-medium text-red-600">Required</Label>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                <li><code>{WHATSAPP_ENV_VARS.BUSINESS_NUMBER}</code> - Business phone number in international format</li>
                            </ul>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-blue-600">Optional</Label>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                <li><code>{WHATSAPP_ENV_VARS.DEFAULT_MESSAGE}</code> - Default message for users</li>
                                <li><code>{WHATSAPP_ENV_VARS.BUSINESS_NAME}</code> - Business name for personalization</li>
                                <li><code>{WHATSAPP_ENV_VARS.ENABLED}</code> - Enable/disable WhatsApp functionality</li>
                                <li><code>{WHATSAPP_ENV_VARS.USE_CUSTOM_WELCOME}</code> - Use custom welcome message</li>
                                <li><code>{WHATSAPP_ENV_VARS.WELCOME_MESSAGE}</code> - Custom welcome message text</li>
                                <li><code>{WHATSAPP_ENV_VARS.INCLUDE_BUSINESS_NAME}</code> - Include business name in messages</li>
                                <li><code>{WHATSAPP_ENV_VARS.INCLUDE_TIMESTAMP}</code> - Include timestamp in messages</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default WhatsAppConfigManager;