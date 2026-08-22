import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:category?',
    categories: ['multimedia'],
    example: '/secshi',
    parameters: { category: '分类，见下表，默认为 `1`' },
    description: `| 电影 | 电视剧 | 动漫 | 综艺 | 短剧 | 网飞 |
| ---- | ------ | ---- | ---- | ---- | ---- |
| 1    | 2      | 3    | 4    | 5    | 30   |`,
    features: {
        antiCrawler: true,
    },
    name: '分类',
    maintainers: ['8430177'],
    handler,
    url: 'www.secshi.com',
};

async function handler(ctx: Context): Promise<Data> {
    const { category = '1' } = ctx.req.param();
    const baseUrl = 'https://www.secshi.com';
    const link = `${baseUrl}/go/${category}.html`;

    const initResponse = await ofetch.raw(link, {
        ignoreResponseError: true,
        redirect: 'manual',
    });
    const cookie = initResponse.headers
        .getSetCookie()
        .map((c) => c.split(';', 1)[0])
        .join('; ');
    const response = initResponse.ok ? (initResponse._data as string) : await ofetch(link, { headers: { Cookie: cookie } });

    const $ = load(response);

    const items = $('ul.hl-vod-list li.hl-list-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.hl-item-thumb');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, baseUrl).href,
                image: a.attr('data-original'),
            };
        });

    return {
        title: $('head title').text(),
        link,
        language: 'zh-CN',
        item: items,
    };
}
