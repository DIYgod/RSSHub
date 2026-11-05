import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/series/:id',
    categories: ['new-media'],
    example: '/sspai/series/77',
    parameters: { id: '专栏 id' },
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
            source: ['sspai.com/series/:id', 'sspai.com/series/:id/list', 'sspai.com/series/:id/metadata'],
        },
    ],
    name: '付费专栏文章更新',
    maintainers: ['TonyRL'],
    handler,
    url: 'sspai.com/series',
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const seriesInfo = await got.get(`https://sspai.com/api/v1/series/info/get?id=${id}&view=second`);
    const response = await got(`https://sspai.com/api/v1/series/article/search/page/get?series_id=${id}&weight=0&sort=desc&title=&limit=${getRouteLimit(ctx, 40)}&offset=0`);

    const items = await Promise.all(
        response.data.data.map(async (item) => {
            const description = item.probation
                ? await cache.tryGet(`sspai:series:public-body:v2:${item.id}`, async () => {
                      const res = await got(`https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`);
                      return res.data.data.body;
                  })
                : `<img src="https://cdn.sspai.com/${item.banner}">`;

            return {
                title: item.title_prefix ? `${item.title_prefix} - ${item.title}` : item.title,
                description,
                author: seriesInfo.data.data.author.nickname,
                link: `https://sspai.com/post/${item.id}`,
                pubDate: item.released_at ? parseDate(item.released_at * 1000) : undefined,
            };
        })
    );

    return {
        title: `${seriesInfo.data.data.title} - 少数派`,
        description: `${seriesInfo.data.data.description} - 少数派`,
        link: `https://sspai.com/series/${id}`,
        item: items,
    };
}
