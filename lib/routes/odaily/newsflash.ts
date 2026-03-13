import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/newsflash',
    categories: ['new-media'],
    example: '/odaily/newsflash',
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
            source: ['0daily.com/newsflash', '0daily.com/'],
        },
    ],
    name: '快讯',
    maintainers: ['nczitzk'],
    handler,
    url: '0daily.com/newsflash',
};

async function handler(ctx) {
    const currentUrl = `${rootUrl}/api/pp/api/info-flow/newsflash_columns/newsflashes?b_id=&per_page=${ctx.req.query('limit') ?? 100}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = response.data.data.items.map((item) => ({
        title: item.title,
        link: item.news_url,
        pubDate: timezone(parseDate(item.published_at), +8),
        description: `<p>${item.description}</p>`,
    }));

    return {
        title: '快讯 - Odaily星球日报',
        link: `${rootUrl}/newsflash`,
        item: items,
    };
}
