import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/index/:cateid',
    categories: ['traditional-media'],
    example: '/zsnews/index/35',
    parameters: { cateid: '类别' },
    name: '中山网新闻',
    maintainers: ['laampui'],
    description: `| 35   | 36   | 37   | 38   | 39   |
| ---- | ---- | ---- | ---- | ---- |
| 本地 | 镇区 | 热点 | 社会 | 综合 |`,
    handler,
};

async function handler(ctx: Context) {
    const { cateid = '35' } = ctx.req.param();

    const response = await ofetch(`http://www.zsnews.cn/api/mobile/getlist.html?cateid=${cateid}`, { responseType: 'json' });

    const items = await Promise.all(
        response.map((item) =>
            cache.tryGet(item.url, async () => {
                try {
                    const detailResponse = await ofetch(item.url);
                    const $ = load(detailResponse);

                    return {
                        ...item,
                        description: $('.article-content').html(),
                        pubDate: timezone(parseDate($('.article-meta span').first().text().slice(5)), 8),
                        link: item.url,
                    };
                } catch {
                    return { ...item, link: item.url };
                }
            })
        )
    );

    return {
        title: '中山新闻',
        link: 'https://www.zsnews.cn/',
        item: items,
    };
}
