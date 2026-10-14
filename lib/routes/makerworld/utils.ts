import { load } from 'cheerio';

import CaptchaError from '@/errors/types/captcha';
import cache from '@/utils/cache';
import { getPlaywrightPage } from '@/utils/playwright';

export const baseUrl = 'https://makerworld.com';

// makerworld.com sits behind a Cloudflare bot-management challenge that fingerprints the
// TLS/HTTP client itself rather than just headers, so a plain fetch always gets a 403 no
// matter what headers are sent. A real (stealth-patched) browser is required to pass it.
const fetchViaBrowser = async (url: string, type: 'html' | 'json' = 'html') => {
    const { page, destroy } = await getPlaywrightPage(url, {
        onBeforeLoad: async (page) => {
            const expectResourceTypes = new Set(['document', 'script', 'xhr', 'fetch']);
            await page.route('**/*', (route) => {
                const request = route.request();
                expectResourceTypes.has(request.resourceType()) ? route.continue() : route.abort();
            });
        },
    });
    try {
        return (await page.evaluate(type === 'html' ? () => document.documentElement.getHTML() : () => document.documentElement.textContent)) ?? '';
    } finally {
        await destroy();
    }
};

export const fetchJson = async (url: string, query?: Record<string, string>) => {
    const finalUrl = query ? `${url}?${new URLSearchParams(query).toString()}` : url;
    return JSON.parse(await fetchViaBrowser(finalUrl, 'json'));
};

export const getNextBuildId = () =>
    cache.tryGet('makerworld:nextBuildId', async () => {
        const response = await fetchViaBrowser(`${baseUrl}/en`);
        const $ = load(response);
        const pageData = $('script#__NEXT_DATA__').text();
        if (!pageData) {
            if (
                $('script')
                    .toArray()
                    .some((script) => $(script).attr('src')?.includes('/cdn-cgi/challenge-platform/') || $(script).text().includes('/cdn-cgi/challenge-platform/'))
            ) {
                throw new CaptchaError('MakerWorld returned a verification page. Its public page data is unavailable to this RSSHub instance.');
            }
            throw new Error('MakerWorld did not provide __NEXT_DATA__. Its public page layout may have changed.');
        }
        const nextData = JSON.parse(pageData);
        return nextData.buildId;
    });
