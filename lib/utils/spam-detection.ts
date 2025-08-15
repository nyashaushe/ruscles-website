import { notificationsApi, SpamDetectionResult, FormSubmissionSpamCheck } from '@/lib/api/notifications'

export interface SpamCheckOptions {
  enableIpBlacklist?: boolean
  enableContentAnalysis?: boolean
  enableRateLimit?: boolean
  enableHoneypot?: boolean
}

export interface SpamIndicators {
  suspiciousKeywords: string[]
  repeatedSubmissions: boolean
  invalidEmail: boolean
  tooManyLinks: boolean
  suspiciousIp: boolean
  honeypotTriggered: boolean
  submissionTooFast: boolean
}

class SpamDetector {
  private suspiciousKeywords = [
    'viagra', 'cialis', 'casino', 'lottery', 'winner', 'congratulations',
    'click here', 'free money', 'make money fast', 'work from home',
    'guaranteed', 'no risk', 'limited time', 'act now', 'urgent',
    'bitcoin', 'cryptocurrency', 'investment opportunity', 'loan',
    'credit repair', 'debt relief', 'weight loss', 'miracle cure'
  ]

  private suspiciousPatterns = [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card patterns
    /\$\d+[,\d]*(\.\d{2})?/, // Money amounts
    /(https?:\/\/[^\s]+){3,}/, // Multiple URLs
    /[A-Z]{5,}/, // Excessive caps
    /(.)\1{4,}/, // Repeated characters
  ]

  private blockedDomains = [
    'tempmail.org', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ]

  // Analyze form submission for spam indicators
  analyzeSubmission(formData: Record<string, any>): SpamIndicators {
    const indicators: SpamIndicators = {
      suspiciousKeywords: [],
      repeatedSubmissions: false,
      invalidEmail: false,
      tooManyLinks: false,
      suspiciousIp: false,
      honeypotTriggered: false,
      submissionTooFast: false
    }

    // Check for suspicious keywords
    const textContent = Object.values(formData)
      .filter(value => typeof value === 'string')
      .join(' ')
      .toLowerCase()

    indicators.suspiciousKeywords = this.suspiciousKeywords.filter(keyword =>
      textContent.includes(keyword)
    )

    // Check for suspicious patterns
    const hasSuspiciousPatterns = this.suspiciousPatterns.some(pattern =>
      pattern.test(textContent)
    )

    if (hasSuspiciousPatterns) {
      indicators.suspiciousKeywords.push('suspicious_pattern')
    }

    // Check email validity and domain
    if (formData.email) {
      const email = formData.email.toLowerCase()
      const emailDomain = email.split('@')[1]
      
      indicators.invalidEmail = !this.isValidEmail(email)
      
      if (emailDomain && this.blockedDomains.includes(emailDomain)) {
        indicators.suspiciousKeywords.push('temp_email')
      }
    }

    // Check for too many links
    const linkCount = (textContent.match(/https?:\/\/[^\s]+/g) || []).length
    indicators.tooManyLinks = linkCount > 3

    // Check honeypot field (should be empty)
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      indicators.honeypotTriggered = true
    }

    // Check submission timing (if provided)
    if (formData.submissionTime && formData.pageLoadTime) {
      const timeDiff = formData.submissionTime - formData.pageLoadTime
      indicators.submissionTooFast = timeDiff < 3000 // Less than 3 seconds
    }

    return indicators
  }

  // Calculate spam score based on indicators
  calculateSpamScore(indicators: SpamIndicators): number {
    let score = 0

    // Keyword-based scoring
    score += indicators.suspiciousKeywords.length * 15

    // Pattern-based scoring
    if (indicators.tooManyLinks) score += 25
    if (indicators.invalidEmail) score += 30
    if (indicators.honeypotTriggered) score += 50
    if (indicators.submissionTooFast) score += 20
    if (indicators.repeatedSubmissions) score += 35
    if (indicators.suspiciousIp) score += 40

    return Math.min(score, 100) // Cap at 100
  }

  // Determine if submission is spam based on score
  isSpam(score: number): boolean {
    return score >= 60 // Threshold for spam classification
  }

  // Get human-readable reasons for spam classification
  getSpamReasons(indicators: SpamIndicators): string[] {
    const reasons: string[] = []

    if (indicators.suspiciousKeywords.length > 0) {
      reasons.push(`Contains suspicious keywords: ${indicators.suspiciousKeywords.join(', ')}`)
    }

    if (indicators.tooManyLinks) {
      reasons.push('Contains too many links')
    }

    if (indicators.invalidEmail) {
      reasons.push('Invalid email address format')
    }

    if (indicators.honeypotTriggered) {
      reasons.push('Honeypot field was filled (bot behavior)')
    }

    if (indicators.submissionTooFast) {
      reasons.push('Form submitted too quickly (bot behavior)')
    }

    if (indicators.repeatedSubmissions) {
      reasons.push('Multiple submissions from same source')
    }

    if (indicators.suspiciousIp) {
      reasons.push('Submission from suspicious IP address')
    }

    return reasons
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Check form submission for spam (main method)
  async checkFormSubmission(data: FormSubmissionSpamCheck): Promise<SpamDetectionResult> {
    try {
      // First, do local analysis
      const indicators = this.analyzeSubmission(data.submissionData)
      const localScore = this.calculateSpamScore(indicators)
      const localReasons = this.getSpamReasons(indicators)

      // If local analysis indicates high spam probability, return immediately
      if (localScore >= 80) {
        return {
          isSpam: true,
          confidence: localScore,
          reasons: localReasons,
          flagged: true
        }
      }

      // For borderline cases, use API for additional checks
      const apiResult = await notificationsApi.checkSpam(data)
      
      if (apiResult.success) {
        // Combine local and API results
        const combinedScore = Math.max(localScore, apiResult.data.confidence)
        const combinedReasons = [...new Set([...localReasons, ...apiResult.data.reasons])]

        return {
          isSpam: this.isSpam(combinedScore),
          confidence: combinedScore,
          reasons: combinedReasons,
          flagged: apiResult.data.flagged
        }
      }

      // Fallback to local analysis if API fails
      return {
        isSpam: this.isSpam(localScore),
        confidence: localScore,
        reasons: localReasons,
        flagged: localScore >= 60
      }
    } catch (error) {
      console.error('Spam detection error:', error)
      
      // Fallback to basic local analysis
      const indicators = this.analyzeSubmission(data.submissionData)
      const score = this.calculateSpamScore(indicators)
      
      return {
        isSpam: this.isSpam(score),
        confidence: score,
        reasons: this.getSpamReasons(indicators),
        flagged: false
      }
    }
  }

  // Flag a form submission as spam
  async flagAsSpam(formId: string, reason: string): Promise<void> {
    try {
      await notificationsApi.flagAsSpam(formId, reason)
    } catch (error) {
      console.error('Failed to flag as spam:', error)
      throw error
    }
  }
}

export const spamDetector = new SpamDetector()

// Utility function for easy spam checking
export async function checkForSpam(
  formId: string,
  submissionData: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<SpamDetectionResult> {
  return spamDetector.checkFormSubmission({
    formId,
    submissionData,
    ipAddress,
    userAgent
  })
}

// Utility function to add honeypot field to forms
export function addHoneypotField(): string {
  return `
    <input
      type="text"
      name="honeypot"
      style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
    />
  `
}