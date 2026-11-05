import { load } from 'cheerio';
import type { Context } from 'hono';
import iconv from 'iconv-lite';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/headline',
    categories: ['bbs'],
    example: '/creaders/headline',
    name: '焦点新闻',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const currentUrl = 'https://news.creaders.net/headline/';

    const response = await ofetch(currentUrl, { responseType: 'arrayBuffer' });

    const $ = load(iconv.decode(Buffer.from(response), 'gbk'));
    const list: DataItem[] = $('ul.newslist li')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a').eq(1);

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(parseDate($item.find('time').text()), 8),
            };
        });

    const limit = getRouteLimit(ctx, 10);
    const selected = limit && ctx.req.query('sorted') !== 'false' ? list.toSorted((a, b) => Number(b.pubDate) - Number(a.pubDate)) : list;
    const items = await Promise.all(
        selected.slice(0, limit).map((item) =>
            cache.tryGet(item.link!, async () => {
                const res = await ofetch(item.link!, { responseType: 'arrayBuffer' });
                const content = load(iconv.decode(Buffer.from(res), 'gbk'));

                item.description = content('#newsContent').html();

                return item;
            })
        )
    );

    return {
        title: '万维读者 - 焦点新闻',
        link: currentUrl,
        item: items,
    };
}
