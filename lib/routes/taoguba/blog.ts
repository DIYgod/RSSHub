import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { rootUrl, renderPostDetail } from './util';

export const route: Route = {
    path: '/blog/:id',
    categories: ['finance'],
    example: '/taoguba/blog/252069',
    parameters: { id: '博客 id，可在对应博客页中找到' },
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
            source: ['tgb.cn/blog/:id', 'tgb.cn/'],
        },
    ],
    name: '用户博客',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const currentUrl = `${rootUrl}/blog/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const author = $('meta[property="og:author"]').attr('content');

    let items = $('.tittle_data')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                title: a.text().trim(),
                link: `${rootUrl}/${a.attr('href')}`,
                author,
            };
        });

    items = await Promise.all(items.map(async (item) => await renderPostDetail(item)));

    return {
        title: `淘股吧 - ${author}`,
        description: $('meta[http-equiv="description"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content'),
        link: currentUrl,
        item: items,
    };
}
