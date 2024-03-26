import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/column/:id',
    categories: ['new-media'],
    example: '/sspai/column/262',
    parameters: { id: '专栏 id' },
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
            source: ['sspai.com/column/:id'],
        },
    ],
    name: '专栏',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `https://sspai.com/column/${id}`;

    const desApi = `https://sspai.com/api/v1/special_columns/${id}`;
    let response = await got({
        method: 'get',
        url: desApi,
        headers: {
            Referer: link,
        },
    });

    const result = response.data;
    const title = result.title;
    const description = result.intro;

    const api = `https://sspai.com/api/v1/articles?offset=0&limit=10&special_column_ids=${id}&include_total=false`;
    response = await got({
        method: 'get',
        url: api,
        headers: {
            Referer: link,
        },
    });

    const list = response.data.list;

    const out = await Promise.all(
        list.map((item) => {
            const title = item.title;
            const date = item.created_at;
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second`;
            const itemUrl = `https://sspai.com/post/${item.id}`;
            const author = item.author.nickname;

            return cache.tryGet(`sspai: ${item.id}`, async () => {
                const response = await got(link);
                const description = response.data.data.body;

                const single = {
                    title,
                    link: itemUrl,
                    author,
                    description,
                    pubDate: parseDate(date * 1000),
                };
                return single;
            });
        })
    );

    return {
        title: `少数派专栏-${title}`,
        link,
        description,
        item: out,
    };
}
