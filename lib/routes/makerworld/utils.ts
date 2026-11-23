import { load } from 'cheerio';

import CaptchaError from '@/errors/types/captcha';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://makerworld.com';

// TL;DR: TLSv1.3 works fine.
export const fetchJson = (url: string, query?: Record<string, string>) => ofetch(url, { query, minVersion: 'TLSv1.3' });

export const getNextBuildId = () =>
    cache.tryGet('makerworld:nextBuildId', async () => {
        const response = await ofetch(`${baseUrl}/en`, { minVersion: 'TLSv1.3' });
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
