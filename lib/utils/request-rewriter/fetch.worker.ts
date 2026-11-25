// Worker-compatible fetch wrapper
// Simplified version without proxy, rate limiting, or header-generator
import { config } from '@/config';
import { waitForHostRateLimit } from '@/utils/host-rate-limit';
import logger from '@/utils/logger';
import fetchWithPlaywrightRetry from '@/utils/playwright-fetch';
import limitResponseSize from '@/utils/request-rewriter/limit-response-size';

// Static browser headers (Chrome-like fingerprint)
const STATIC_BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';
const STATIC_BROWSER_HEADERS = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Google Chrome";v="139", "Chromium";v="139", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
};

const originalFetch = fetch;

// The platform fetch keeps every request header when a redirect leaves the origin, even Authorization and Cookie,
// so a request carrying a credential has its redirects followed here and the credential dropped once the origin changes
const CREDENTIAL_HEADERS = ['authorization', 'proxy-authorization', 'cookie'];
const REQUEST_BODY_HEADERS = ['content-encoding', 'content-language', 'content-location', 'content-length', 'content-type'];
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 20;

const fetchWithSafeRedirect = async (request: Request, credentialHeaders: string[]): Promise<Response> => {
    if (request.redirect !== 'follow' || credentialHeaders.every((header) => !request.headers.has(header))) {
        return originalFetch(request);
    }

    let { method, headers } = request;
    let body = request.body ? await request.arrayBuffer() : null;
    let url = request.url;
    for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
        // eslint-disable-next-line no-await-in-loop
        const response = await originalFetch(new Request(url, { method, headers, body, redirect: 'manual', signal: request.signal }));
        const location = response.headers.get('location');
        if (!REDIRECT_STATUSES.has(response.status) || !location) {
            return response;
        }
        // eslint-disable-next-line no-await-in-loop
        await response.body?.cancel();

        // https://fetch.spec.whatwg.org/#http-redirect-fetch
        const target = new URL(location, url);
        headers = new Headers(headers);
        if (target.origin !== new URL(url).origin) {
            for (const header of credentialHeaders) {
                headers.delete(header);
            }
        }
        if (response.status === 303 || ((response.status === 301 || response.status === 302) && method === 'POST')) {
            method = 'GET';
            body = null;
            for (const header of REQUEST_BODY_HEADERS) {
                headers.delete(header);
            }
        }
        logger.http(`Redirecting to ${target.href} for ${url}`);
        url = target.href;
    }
    throw new TypeError('Too many redirects');
};

const wrappedFetch = async (input: RequestInfo | URL, init?: RequestInit & { credentialHeaders?: string[]; maxResponseSize?: number }): Promise<Response> => {
    const request = new Request(input, init);

    const requestUrl = new URL(request.url);
    logger.debug(`Outgoing request: ${request.method} ${requestUrl.origin}${requestUrl.pathname}`);

    // Set User-Agent if not provided
    if (config.isDefaultUA) {
        if (!request.headers.get('user-agent')) {
            request.headers.set('user-agent', STATIC_BROWSER_UA);
        }

        // Set browser headers if not provided
        for (const [header, value] of Object.entries(STATIC_BROWSER_HEADERS)) {
            if (!request.headers.has(header)) {
                request.headers.set(header, value);
            }
        }
    } else if (!request.headers.get('user-agent')) {
        request.headers.set('user-agent', config.ua);
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

    await waitForHostRateLimit(request.url, config.requestRateLimits, request.signal);
    const credentialHeaders = [...CREDENTIAL_HEADERS, ...(init?.credentialHeaders ?? [])];
    return limitResponseSize(await fetchWithPlaywrightRetry(request, (request) => fetchWithSafeRedirect(request, credentialHeaders)), init?.maxResponseSize);
};

export default wrappedFetch;
