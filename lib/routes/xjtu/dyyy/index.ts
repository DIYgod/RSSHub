import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.dyyy.xjtu.edu.cn';

export const route: Route = {
    path: '/dyyy/:path{.+}',
    categories: ['university'],
    example: '/xjtu/dyyy/index/xsxx',
    parameters: { path: '栏目路径，支持多级，不包括末尾的`.htm`' },
    name: '第一附属医院新闻',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const path = ctx.req.param('path');
    const targetUrl = `${baseUrl}/${path}.htm`;
    const response = await got(targetUrl);

    const $ = load(response.data);

    const items = $('.list_right_con div li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('a').attr('title')!,
                link: new URL($item.find('a').attr('href')!, targetUrl).href,
                pubDate: parseDate($item.find('.data').text()),
            };
        });

    const enrichedItems = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`xjtu:dyyy:content:v1:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const author = $('.content_source')
                    .text()
                    .match(/责任编辑：(.*)\(点击/)?.[1];
                const description = $('.content_con').html();
                if (!description?.trim()) {
                    throw new Error(`Unable to find article content at ${item.link}`);
                }
                return { author, description };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('head title').text(),
        link: targetUrl,
        item: enrichedItems,
    };
}
