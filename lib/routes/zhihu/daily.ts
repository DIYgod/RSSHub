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
        antiCrawler: false,
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
    // The v7 /stories/latest requires login; use v4 which is publicly accessible
    const listResponse = await ofetch('https://daily.zhihu.com/api/4/stories/latest');
    const stories = listResponse.stories ?? [];

    const items = await Promise.all(
        stories.map(async (story: { id: number; title: string; image?: string }) => {
            const storyUrl = `https://daily.zhihu.com/api/4/story/${story.id}`;

            const storyJson = await cache.tryGet(storyUrl, async () => {
                const response = await ofetch(storyUrl);
                return response;
            });

            return {
                title: storyJson.title ?? story.title,
                description: storyJson.body ?? '',
                link: storyJson.share_url ?? `https://daily.zhihu.com/story/${story.id}`,
                pubDate: parseDate(storyJson.publish_time, 'X'),
                image: storyJson.image ?? story.image,
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
