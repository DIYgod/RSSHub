import type { Page } from 'patchright';

import ofetch from '@/utils/ofetch';
import { parseCookieArray } from '@/utils/playwright-utils';

/**
 * Request a page with the cookies and user agent of a browser page, through the request rewriter instead of the
 * browser's own request context, so the response goes through the usual proxy, rate limit and response size settings.
 */
export const fetchWithPage = async (page: Page, url: string, { timeout }: { timeout?: number } = {}) => {
    const [cookies, userAgent] = await Promise.all([page.context().cookies(url), page.evaluate<string>('navigator.userAgent')]);
    const cookie = parseCookieArray(cookies);
    const response = await ofetch.raw<string, 'text'>(url, {
        headers: { 'user-agent': userAgent, ...(cookie && { cookie }) },
        responseType: 'text',
        timeout,
        ignoreResponseError: true,
    });
    return { ok: response.ok, status: response.status, text: response._data ?? '' };
};
