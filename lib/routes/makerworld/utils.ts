import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://makerworld.com';

export const getNextBuildId = () =>
    cache.tryGet('makerworld:nextBuildId', async () => {
        const response = await ofetch(`${baseUrl}/en`, {
            headers: {
                'User-Agent': config.trueUA,
            },
        });
        const $ = load(response);
        const nextData = JSON.parse($('script#__NEXT_DATA__').text());
        return nextData.buildId;
    });
