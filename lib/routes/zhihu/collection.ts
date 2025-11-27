import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { generateData } from './pin/utils';
import { header } from './utils';

export const route: Route = {
    path: '/collection/:id/:getAll?',
    categories: ['social-media'],
    example: '/zhihu/collection/26444956',
    parameters: { id: '收藏夹 id，可在收藏夹页面 URL 中找到', getAll: '获取全部收藏内容，任意值为打开' },
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/collection/:id'],
            target: '/collection/:id',
        },
    ],
    name: '收藏夹',
    maintainers: ['huruji', 'Colin-XKL', 'Fatpandac'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const getAll = ctx.req.param('getAll');

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/collections/${id}/items?offset=0&limit=20`,
        headers: {
            ...header,
            cookie: config.zhihu.cookies,
            Referer: `https://www.zhihu.com/collection/${id}`,
        },
    });

    const list = response.data.data;

    if (getAll) {
        const totals = response.data.paging.totals;

        const offsetList = [...Array.from({ length: Math.round(totals / 20) }).keys()].map((item) => item * 20).slice(1);
        const otherList = await Promise.all(
            offsetList.map((offset) =>
                cache.tryGet(`https://www.zhihu.com/api/v4/collections/${id}/items?offset=${offset}&limit=20`, async () => {
                    const response = await got({
                        method: 'get',
                        url: `https://www.zhihu.com/api/v4/collections/${id}/items?offset=${offset}&limit=20`,
                        headers: {
                            ...header,
                            cookie: config.zhihu.cookies,
                            Referer: `https://www.zhihu.com/collection/${id}`,
                        },
                    });

                    return response.data.data;
                })
            )
        ).then((item) => item.flat());
        list.push(...otherList);
    }

    const response2 = await got({
        method: 'get',
        url: `https://www.zhihu.com/collection/${id}`,
        headers: {
            ...header,
            Referer: `https://www.zhihu.com/collection/${id}`,
        },
    });

    const meta = response2.data;
    const $ = load(meta);
    const collection_title = $('.CollectionDetailPageHeader-title').text() + ' - 知乎收藏夹';
    const collection_description = $('.CollectionDetailPageHeader-description').text();

    const generateDataPin = (item) => generateData([item.content])[0];
    return {
        title: collection_title,
        link: `https://www.zhihu.com/collection/${id}`,
        description: collection_description,
        item:
            list &&
            list.map((item) =>
                item.content.type === 'pin'
                    ? generateDataPin(item)
                    : {
                          title: item.content.type === 'article' || item.content.type === 'zvideo' ? item.content.title : item.content.question.title,
                          link: item.content.url,
                          description: item.content.type === 'zvideo' ? `<img src=${item.content.video.url}/>` : item.content.content,
                          pubDate: parseDate((item.content.type === 'article' ? item.content.updated : item.content.updated_time) * 1000),
                      }
            ),
    };
}
