import { FetchError } from 'ofetch';

export const baseUrl = 'https://xsijishe.com';

// Cloudflare challenges non-browser clients with 403 or 429, and answers requests from Cloudflare Workers with 520.
const blockedStatuses = new Set([403, 429, 520]);

export function isBlockedRequest(error: unknown) {
    return error instanceof FetchError && error.status !== undefined && blockedStatuses.has(error.status);
}

// What a browser page needs to pass the Cloudflare challenge and render; images and media are skipped.
export const browserResourceTypes = new Set(['document', 'script', 'xhr', 'fetch', 'stylesheet']);

export function toBrowserCookies(cookie: string) {
    return cookie
        .split(';')
        .map((entry) => entry.trim())
        .filter((entry) => entry.indexOf('=') > 0)
        .map((entry) => {
            const separator = entry.indexOf('=');
            return { name: entry.slice(0, separator), value: entry.slice(separator + 1), url: `${baseUrl}/` };
        });
}
