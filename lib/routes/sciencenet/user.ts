import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/user/:id',
    categories: ['new-media'],
    example: '/sciencenet/user/tony8310',
    parameters: { id: '用户 id，可在对用户博客页 URL 中找到' },
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
            source: ['blog.sciencenet.cn/u/:id', 'blog.sciencenet.cn/'],
        },
    ],
    name: '用户博客',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 50;

    const rootUrl = 'https://blog.sciencenet.cn';
    const currentUrl = `${rootUrl}/u/${id}`;

    let response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    let $ = load(iconv.decode(response.data, 'gbk'));

    response = await got({
        method: 'get',
        url: $('.xg1 a').eq(1).attr('href'),
    });

    $ = load(response.data);

    let items = $('item')
        .slice(-limit)
        .toArray()
        .toReversed()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.find('title').text(),
                link: $item.find('guid').text(),
            };
        });

    if (!items.length) {
        throw new NotFoundError(`No blog entries found for user ${id}.`);
    }

    items = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`sciencenet:article:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, 'gbk'));

                return { author: content('.xs2').text(), description: content('#blog_article').html(), pubDate: timezone(parseDate(content('.xg1').eq(5).text()), 8) };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: `科学网 - ${items[0].author}的博文`,
        link: currentUrl,
        item: items,
    };
}
