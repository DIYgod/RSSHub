import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/book/:id',
    categories: ['anime'],
    example: '/jjmhw/book/90',
    parameters: { id: '漫画 id，漫画主页的地址栏中' },
    radar: [
        {
            source: ['www.jjmhw.cc/book/:id'],
        },
    ],
    name: '漫画更新',
    maintainers: ['junfengP'],
    handler,
    url: 'www.jjmhw.cc',
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const baseUrl = 'https://www.jjmhw.cc';
    const link = `${baseUrl}/book/${id}`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('#detail-list-select > li > a')
        .toArray()
        .toReversed()
        .slice(0, getRouteLimit(ctx, 10))
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map(async (item) => {
            const description = await cache.tryGet(`${item.link}:description`, async () => {
                const response = await ofetch(item.link, { headerGeneratorOptions: PRESETS.MODERN_ANDROID });
                const $ = load(response);
                return $('#cp_img img, .comicpage img')
                    .toArray()
                    .map((ele) => `<img src="${$(ele).attr('data-original')}">`)
                    .join('');
            });
            return { ...item, description };
        })
    );

    return {
        title: `漫小肆 ${$('div.info > h1').text()}`,
        description: $('.content').text(),
        image: $('.cover img').attr('src'),
        link,
        item: items,
    };
}
