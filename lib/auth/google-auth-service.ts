export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    image?: string;
}

export interface GoogleAuthError {
    code: string;
    message: string;
    details?: any;
}

export class GoogleAuthService {
    /**
     * Validates Google email/password credentials
     * Note: This is a simplified implementation for demonstration purposes.
     * In production, you would typically integrate with:
     * - Firebase Authentication
     * - Google Identity Platform
     * - Your own user database with hashed passwords
     * - LDAP/Active Directory for enterprise
     * 
     * For this demo, we validate email authorization and require a minimum password length.
     */
    async validateCredentials(email: string, password: string): Promise<GoogleUser | null> {
        try {
            // Basic input validation
            if (!email || !password) {
                throw new Error('EMAIL_PASSWORD_REQUIRED');
            }

            // Basic email format validation
            if (!this.isValidEmail(email)) {
                throw new Error('INVALID_EMAIL_FORMAT');
            }

            // Check if email is in allowed admin emails
            if (!this.isAllowedEmail(email)) {
                throw new Error('EMAIL_NOT_AUTHORIZED');
            }

            // Basic password validation (minimum length)
            // In production, you would validate against your authentication system
            if (password.length < 6) {
                throw new Error('PASSWORD_TOO_SHORT');
            }

            // Simulate network delay and potential failures
            await this.simulateNetworkCall();

            // For demo purposes, we'll accept any password >= 6 chars for allowed emails
            // In production, you would validate the actual password
            return {
                id: email,
                email: email,
                name: this.extractNameFromEmail(email),
                image: this.generateAvatarUrl(email)
            };
        } catch (error) {
            this.logAuthenticationError(error, email);

            // Re-throw known errors, wrap unknown ones
            if (error instanceof Error && error.message.startsWith('EMAIL_') ||
                error instanceof Error && error.message.startsWith('PASSWORD_') ||
                error instanceof Error && error.message.startsWith('NETWORK_')) {
                throw error;
            }

            throw new Error('AUTHENTICATION_FAILED');
        }
    }

    /**
     * Simulates network call with potential failures for testing
     */
    private async simulateNetworkCall(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            const delay = Math.random() * 1000 + 500; // 500-1500ms

            setTimeout(() => {
                // Simulate occasional network failures (5% chance)
                if (Math.random() < 0.05) {
                    reject(new Error('NETWORK_ERROR'));
                    return;
                }

                // Simulate service unavailable (2% chance)
                if (Math.random() < 0.02) {
                    reject(new Error('SERVICE_UNAVAILABLE'));
                    return;
                }

                resolve();
            }, delay);
        });
    }

    /**
     * Logs authentication errors with appropriate detail level
     */
    private logAuthenticationError(error: any, email?: string): void {
        const logData = {
            error: error.message || error.toString(),
            email: email ? this.maskEmail(email) : undefined,
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        };

        // Log different error types at appropriate levels
        switch (error.message) {
            case 'EMAIL_NOT_AUTHORIZED':
                console.info('Unauthorized email attempt:', logData);
                break;
            case 'NETWORK_ERROR':
            case 'SERVICE_UNAVAILABLE':
                console.warn('Google Auth Service Error:', logData);
                break;
            case 'INVALID_EMAIL_FORMAT':
            case 'PASSWORD_TOO_SHORT':
                console.info('Validation Error:', logData);
                break;
            default:
                console.error('Google Auth Unknown Error:', logData);
        }
    }

    /**
     * Masks email for logging (keeps domain, masks local part)
     */
    private maskEmail(email: string): string {
        const [localPart, domain] = email.split('@');
        if (!domain) return '***';

        const maskedLocal = localPart.length > 2
            ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
            : '***';

        return `${maskedLocal}@${domain}`;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isAllowedEmail(email: string): boolean {
        const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
        return allowedEmails.includes(email.toLowerCase());
    }

    private extractNameFromEmail(email: string): string {
        const localPart = email.split('@')[0];
        // Convert common patterns to readable names
        return localPart
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    private generateAvatarUrl(email: string): string {
        const name = this.extractNameFromEmail(email);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285f4&color=fff&size=128`;
    }

    /**
     * Get list of allowed admin emails from environment variable
     */
    getAllowedEmails(): string[] {
        return process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();