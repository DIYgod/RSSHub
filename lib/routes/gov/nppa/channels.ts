import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import { type Data, type DataItem, type Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:path{.+}?',
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
            const dateText = $item.find('span').text().replaceAll(/[[\]]/g, '');
            return {
                link: new URL(a.attr('href')!, link).href,
                pubDate: dateText ? timezone(parseDate(dateText), 8) : undefined,
            };
        });

    return {
        title: `国家新闻出版署 - ${$('.m2nRt').text().trim()}`,
        link,
        item: await pMap(
            list,
            (item) =>
                cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    const title = $('.m3page_t').text();

                    return {
                        ...item,
                        title: /\S/.test(title) ? title : $('head title').text(),
                        description: $('.m3pageEdit').html(),
                    };
                }),
            { concurrency: 3 }
        ),
    };
}
