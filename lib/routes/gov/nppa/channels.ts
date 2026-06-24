import { load } from 'cheerio';
import type { Context } from 'hono';

import { type Data, type DataItem, type Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/nppa/xxfb/ywxx',
    parameters: { path: '路径，留空默认 `xxfb/ywxx`' },
    maintainers: ['y2361547758'],
    handler,
};

const host = 'https://www.nppa.gov.cn';

async function handler(ctx: Context): Promise<Data> {
    const { path = 'xxfb/ywxx' } = ctx.req.param();
    const link = `${host}/${path}/`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.m2nRcon li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                link: new URL(a.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('span').text().replaceAll(/[[\]]/g, '')), 8),
            };
        }) as DataItem[];

    return {
        title: `国家新闻出版署 - ${$('.m2nRt').text().trim()}`,
        link,
        item: await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const response = await ofetch(item.link!);
                    const $ = load(response);

                    item.title = $('.m3page_t').text().trim() || $('head title').text();
                    item.description = $('.m3pageEdit').html() ?? '';

                    return item;
                })
            )
        ),
    };
}
