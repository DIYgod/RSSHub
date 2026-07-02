import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';

export const baseUrl = 'https://makerworld.com';

const isForbidden = (error: unknown) => {
    const status = (error as { status?: number; statusCode?: number })?.status ?? (error as { status?: number; statusCode?: number })?.statusCode;
    return status === 403;
};

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
        return (await page.evaluate(type === 'html' ? () => document.documentElement.innerHTML : () => document.documentElement.textContent)) ?? '';
    } finally {
        await destroy();
    }
};

export const fetchJson = async (url: string, query?: Record<string, string>) => {
    const finalUrl = query ? `${url}?${new URLSearchParams(query).toString()}` : url;
    try {
        return await ofetch(finalUrl, {
            headers: {
                'User-Agent': config.trueUA,
            },
        });
    } catch (error) {
        if (!isForbidden(error)) {
            throw error;
        }
        const jsonStr = await fetchViaBrowser(finalUrl, 'json');
        return JSON.parse(jsonStr);
    }
};

export const getNextBuildId = () =>
    cache.tryGet('makerworld:nextBuildId', async () => {
        let response: string;
        try {
            response = await ofetch(`${baseUrl}/en`, {
                headers: {
                    'User-Agent': config.trueUA,
                },
            });
        } catch (error) {
            if (!isForbidden(error)) {
                throw error;
            }
            response = await fetchViaBrowser(`${baseUrl}/en`);
        }
        const $ = load(response);
        const nextData = JSON.parse($('script#__NEXT_DATA__').text());
        return nextData.buildId;
    });
