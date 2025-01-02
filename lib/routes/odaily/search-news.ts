import { Route } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { rootUrl } from './utils';

export const route: Route = {
    path: '/search/news/:keyword',
    categories: ['new-media', 'popular'],
    example: '/odaily/search/news/RSS3',
    parameters: { keyword: '搜索关键字' },
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
            source: ['0daily.com/search/:keyword'],
        },
    ],
    name: '搜索快讯',
    maintainers: ['snowraincloud'],
    handler,
};

async function handler(ctx) {
    const currentUrl = `${rootUrl}/api/pp/api/search/entity-search?per_page=${ctx.req.query('limit') ?? 25}&keyword=${ctx.req.param('keyword')}&entity_type=newsflash`;

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
        link: `${rootUrl}/search/${ctx.req.param('keyword')}`,
        item: items,
    };
}
