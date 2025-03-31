export class LinkedInBotError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: any
    ) {
        super(message);
        this.name = 'LinkedInBotError';
    }
}

export const ErrorCodes = {
    NAVIGATION: 'ERR_NAVIGATION',
    FORM: 'ERR_FORM',
    FORM_VALIDATION: 'ERR_FORM_VALIDATION',
    SCRAPING: 'ERR_SCRAPING',
    NETWORK: 'ERR_NETWORK',
    AUTH: 'ERR_AUTH',
    VALIDATION: 'ERR_VALIDATION',
} as const;