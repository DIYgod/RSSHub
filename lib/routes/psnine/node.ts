import type { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';

const handler = async (ctx) => {
    const { id = 'news', order = 'obdate' } = ctx.req.param();

    const rootUrl = 'https://www.psnine.com';
    const currentUrl = `${rootUrl}/node/${id}?ob=${order}`;
    const response = await ofetch(currentUrl);

    const $ = cheerio.load(response);

    $('.psnnode, .node').remove();

    const list = $('.title a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const meta = $item.parent().next();
            return {
                title: $item.text(),
                link: $item.attr('href'),
                pubDate: timezone(
                    parseDate(
                        meta
                            .contents()
                            .filter((_, i) => i.nodeType === 3)
                            .text()
                            .trim()
                            .split(/\s{2,}/)[0],
                        ['YYYY-MM-DD HH:mm', 'MM-DD HH:mm']
                    ),
                    8
                ),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $ = cheerio.load(detailResponse);

                item.author = $('a[itemprop="author"]').eq(0).text();
                item.description = $('div[itemprop="articleBody"]').html();

                return item;
            })
        )
    );

    return {
        title: `${$('title').text()} - PSN中文站`,
        link: currentUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/node/:id?/:order?',
    parameters: {
        id: '节点 id，见下表，默认为 news',
        order: '排序，`date` 即最新，默认为 `obdate` 即综合排序',
    },
    categories: ['game'],
    example: '/psnine/node/news',
    name: '节点',
    maintainers: ['betta-cyber', 'nczitzk'],
    handler,
    radar: [
        {
            source: ['psnine.com/node/:id'],
        },
    ],
};
