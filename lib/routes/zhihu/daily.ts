import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/daily',
    categories: ['social-media'],
    example: '/zhihu/daily',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['daily.zhihu.com/*'],
        },
    ],
    name: '知乎日报',
    maintainers: ['DHPO', 'pseudoyu'],
    handler,
    url: 'daily.zhihu.com/*',
};

async function handler() {
    const response = await ofetch('https://daily.zhihu.com/');

    const $ = load(response);

    const items = (
        await Promise.all(
            $('.box')
                .toArray()
                .map(async (item) => {
                    item = $(item);
                    const linkElem = item.find('.link-button');
                    const storyUrl = 'https://daily.zhihu.com/api/4' + linkElem.attr('href');

                    try {
                        const storyJson = await cache.tryGet(storyUrl, async () => {
                            const response = await ofetch(storyUrl);
                            return response;
                        });

                        return {
                            title: storyJson.title,
                            description: storyJson.body,
                            link: storyJson.url,
                            image: storyJson.image,
                            pubDate: storyJson.publish_time ? parseDate(storyJson.publish_time, 'X') : undefined,
                        };
                    } catch (error) {
                        logger.debug(`Failed to fetch story detail: ${storyUrl} - ${error instanceof Error ? error.message : String(error)}`);
                        return null;
                    }
                })
        )
    ).filter(Boolean);

    return {
        title: '知乎日报',
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        image: 'http://static.daily.zhihu.com/img/new_home_v3/mobile_top_logo.png',
        item: items,
    };
}
