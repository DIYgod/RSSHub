import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { getHeaders } from './utils';

export const route: Route = {
    path: '/product/:id',
    categories: ['shopping'],
    example: '/smzdm/product/zm5vzpe',
    parameters: { id: '商品 id，网址上直接可以看到' },
    features: {
        requireConfig: [
            {
                name: 'SMZDM_COOKIE',
                optional: true,
                description: '什么值得买登录后的 Cookie 值',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['wiki.smzdm.com/p/:id'],
            target: '/product/:id',
        },
    ],
    name: '商品',
    maintainers: ['chesha1'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const link = `https://wiki.smzdm.com/p/${ctx.req.param('id')}`;

    const listUrl = `${link}/jiage/`;
    const response = await ofetch.raw(listUrl, {
        headers: getHeaders(),
    });
    const cookie = getHeaders().cookie || [...response.headers.getSetCookie().map((c) => c.split(';', 1)[0]), `x-waf-captcha-referer=${listUrl}`].join('; ');
    const $ = load(response._data);
    const title = $('title').text();

    // get simple info from list
    const items: DataItem[] = $('ul#feed-main-list li')
        .toArray()
        .map((elem) => {
            const altText = $(elem).find('img').attr('alt');
            const link = $(elem).find('h5.feed-block-title a').attr('href');
            const price = $(elem).find('.z-highlight').text();
            const title = altText + ' ' + price;
            const description = $(elem).find('.feed-block-descripe').text().replaceAll(/\s+/g, '');

            return {
                title,
                link,
                description,
            };
        });

    // get detail info from each item
    const out = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async (): Promise<any> => {
                const response = await ofetch(item.link!, {
                    headers: {
                        cookie,
                    },
                });
                const $ = load(response);

                // filter outdated articles
                if ($('span.old').length > 0) {
                    return null;
                }
                const pubDate = $('meta[name="weibo:webpage:create_at"]').attr('content');
                item.pubDate = pubDate;

                if (item.description === '阅读全文') {
                    item.description = $('p[itemprop="description"]').first().html() ?? undefined;
                }

                return item;
            }),
        { concurrency: 3 }
    );

    const filteredOut = out.filter((result) => result !== null);

    return {
        title,
        description: $('.pinpai-info').text(),
        image: $('.pp-img img').attr('src'),
        link,
        item: filteredOut,
    };
}
