/**
 * Email validation utility for admin authentication
 */
export class AdminEmailValidator {
    /**
     * Check if an email is in the allowed admin emails list
     */
    static isAllowedEmail(email: string): boolean {
        const allowedEmails = this.getAllowedEmails();
        return allowedEmails.includes(email.toLowerCase());
    }

    /**
     * Get all allowed admin emails from environment variable
     */
    static getAllowedEmails(): string[] {
        const emails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
        return emails.filter(email => email.length > 0);
    }

    /**
     * Validate email format
     */
    static isValidEmailFormat(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Comprehensive email validation (format + allowed list)
     */
    static validateEmail(email: string): { isValid: boolean; error?: string } {
        if (!email) {
            return { isValid: false, error: 'Email is required' };
        }

        if (!this.isValidEmailFormat(email)) {
            return { isValid: false, error: 'Invalid email format' };
        }

        if (!this.isAllowedEmail(email)) {
            return { isValid: false, error: 'Email not authorized for admin access' };
        }

        return { isValid: true };
    }
}