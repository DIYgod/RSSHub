import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { config } from '@/config';

// App Store and Podcast use different bearer tokens
export const appstoreBearerToken = () =>
    cache.tryGet(
        'apple:podcast:bearer',
        async () => {
            const baseUrl = 'https://apps.apple.com';
            const response = await ofetch(`${baseUrl}/us/iphone/today`);
            const $ = load(response);

            const moduleAddress = new URL($('head script[type="module"]').attr('src'), baseUrl).href;
            const modulesResponse = await ofetch(moduleAddress, {
                parseResponse: (txt) => txt,
            });
            const bearerToken = modulesResponse.match(/="(eyJhbGci.*?)"/)[1];

            return bearerToken as string;
        },
        config.cache.contentExpire,
        false
    );
