import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    name: '日报',
    maintainers: ['DHPO', 'pseudoyu'],
    handler,
    url: 'daily.zhihu.com/*',
};

function getStoryContent(body?: string) {
    const $ = load(body ?? '', null, false);
    const authors = $('.answer > .meta > .author')
        .toArray()
        .map((element) => $(element).text().replace(/，$/, ''))
        .filter(Boolean);
    $('.headline, .answer > .meta').remove();
    return {
        author: [...new Set(authors)].join(', ') || undefined,
        description: $('.content-inner').html() ?? $.html(),
    };
}

async function handler() {
    const latest = await ofetch('https://daily.zhihu.com/api/4/stories/latest');

    const items = (
        await Promise.all(
            latest.stories.map(async (story) => {
                const storyUrl = `https://daily.zhihu.com/api/4/story/${story.id}`;

                try {
                    const storyJson = await cache.tryGet(storyUrl, async () => {
                        const response = await ofetch(storyUrl);
                        return response;
                    });

                    return {
                        title: storyJson.title,
                        ...getStoryContent(storyJson.body),
                        link: storyJson.url,
                        image: storyJson.image,
                        pubDate: storyJson.publish_time ? parseDate(storyJson.publish_time, 'X') : timezone(parseDate(latest.date, 'YYYYMMDD'), 8),
                    };
                } catch (error) {
                    logger.debug(`Failed to fetch story detail: ${storyUrl} - ${error instanceof Error ? error.message : String(error)}`);
                    return null;
                }
            })
        )
    ).filter((item) => item !== null);

    return {
        title: '知乎日报',
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        image: 'http://static.daily.zhihu.com/img/new_home_v3/mobile_top_logo.png',
        item: items,
    };
}
