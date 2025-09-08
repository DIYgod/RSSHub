import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

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
    const key = 'zhihu:daily';
    const response = await cache.tryGet(key, async () => {
        const response = await ofetch('https://daily.zhihu.com/');
        return response;
    });

    const $ = load(response);

    const items = await Promise.all(
        $('.box')
            .toArray()
            .map(async (item) => {
                item = $(item);
                const linkElem = item.find('.link-button');
                const storyUrl = 'https://daily.zhihu.com' + linkElem.attr('href');

                // Fetch full story content
                const storyResponse = await cache.tryGet(storyUrl, async () => {
                    const response = await ofetch(storyUrl);
                    return response;
                });

                const $story = load(storyResponse);
                const storyTitle = $story('.DailyHeader-title').text();
                const storyContent = $story('.DailyRichText').html();

                return {
                    title: storyTitle,
                    description: storyContent,
                    link: storyUrl,
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
