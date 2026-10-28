import { load } from 'cheerio';

import ofetch from '@/utils/ofetch';

export const getBmkgApiHeaders = async (pageUrl: string) => {
    const html = await ofetch<string>(pageUrl);
    const $ = load(html);
    const payload: unknown[] = JSON.parse($('#__NUXT_DATA__').text());
    const state = payload.find((value): value is Record<string, number> => typeof value === 'object' && value !== null && !Array.isArray(value) && Object.hasOwn(value, '$sauth-token'));
    const token = state ? payload[state['$sauth-token']] : undefined;
    if (typeof token !== 'string' || !token) {
        throw new Error('Unable to find the anonymous API session in the public BMKG page');
    }
    return { 'X-API-KEY': token };
};

export const fetchBmkgApi = async <T>(apiPath: string, pageUrl: string): Promise<T> => ofetch<T>(new URL(apiPath, pageUrl).href, { headers: await getBmkgApiHeaders(pageUrl) });
