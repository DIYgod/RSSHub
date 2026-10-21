import Parser from 'rss-parser';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://oct0pu5.cn/';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/oct0pu5',
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
            source: ['oct0pu5.cn'],
            target: '/',
        },
    ],
    name: 'Oct的小破站',
    maintainers: ['octopus058', 'wiketool'],
    handler,
};

async function handler() {
    const response = await ofetch<string>(new URL('rss.xml', baseUrl).href);
    const feed = await new Parser().parseString(response);

    return {
        title: feed.title || 'Oct0pu5的博客',
        link: baseUrl,
        description: feed.description,
        item: feed.items.flatMap((item) => {
            if (!item.title || !item.link) {
                return [];
            }
            return {
                title: item.title,
                link: item.link,
                guid: item.guid,
                description: item['content:encoded'] || item.content,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                category: item.categories,
            };
        }),
    };
}
