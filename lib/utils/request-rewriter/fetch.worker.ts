// Worker-compatible fetch wrapper
// Simplified version without proxy, rate limiting, or header-generator
import { config } from '@/config';
import logger from '@/utils/logger';

// Static browser headers (Chrome-like fingerprint)
const STATIC_BROWSER_HEADERS: Record<string, string> = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
};

const originalFetch = globalThis.fetch;

const wrappedFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);

    logger.debug(`Outgoing request: ${request.method} ${request.url}`);

    // Set User-Agent if not provided
    if (!request.headers.has('user-agent')) {
        request.headers.set('user-agent', config.ua);
    }

    // Set browser headers if not provided
    for (const [header, value] of Object.entries(STATIC_BROWSER_HEADERS)) {
        if (!request.headers.has(header)) {
            request.headers.set(header, value);
        }
    }

    // Set Referer if not provided
    if (!request.headers.get('referer')) {
        try {
            const urlHandler = new URL(request.url);
            request.headers.set('referer', urlHandler.origin);
        } catch {
            // ignore
        }
    }

    // Remove x-prefer-proxy header (not supported in Workers)
    if (request.headers.has('x-prefer-proxy')) {
        request.headers.delete('x-prefer-proxy');
    }

    return originalFetch(request);
};

export default wrappedFetch;
