import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
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

    const items = await Promise.all(
        $('.box')
            .toArray()
            .map(async (item) => {
                item = $(item);
                const linkElem = item.find('.link-button');
                const storyUrl = 'https://daily.zhihu.com/api/7' + linkElem.attr('href');

                // Fetch full story content
                const storyJson = await cache.tryGet(storyUrl, async () => {
                    const response = await ofetch(storyUrl);
                    return response;
                });

                const storyTitle = storyJson.title;
                const storyContent = storyJson.body;

                return {
                    title: storyTitle,
                    description: storyContent,
                    link: storyJson.url,
                    pubDate: parseDate(storyJson.publish_time, 'X'),
                };
            })
    );

    return {
        title: '知乎日报',
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        image: 'http://static.daily.zhihu.com/img/new_home_v3/mobile_top_logo.png',
        item: items,
    };
}
