import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import rssParser from '@/utils/rss-parser';

export const handler = async (ctx) => {
    const rootUrl = 'https://luolei.org';
    const { data: response } = await got(`${rootUrl}/rss.xml`);
    const feed = await rssParser.parseString(response);
    if (!feed.title) {
        throw new Error('The Luolei RSS feed is missing its title');
    }

    return {
        title: feed.title,
        description: feed.description,
        link: feed.link ?? rootUrl,
        language: feed.language,
        image: feed.image?.url,
        item: feed.items.slice(0, getRouteLimit(ctx, 50)).map((item) => {
            if (!item.title || !item.link) {
                throw new Error('The Luolei RSS feed contains an entry without a title or link');
            }
            const date = item.isoDate ?? item.pubDate;
            return {
                title: item.title,
                link: item.link,
                guid: item.guid,
                description: item['content:encoded'] ?? item.content,
                author: item.creator ?? item.author,
                category: item.categories,
                pubDate: date ? parseDate(date) : undefined,
            };
        }),
    };
};

export const route: Route = {
    path: '/',
    name: '文章',
    url: 'luolei.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/luolei',
    description: '',
    categories: ['blog'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['luolei.org'],
            target: '/',
        },
    ],
};
