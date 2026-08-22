import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zszcgd/:category?',
    categories: ['study'],
    example: '/chsi/zszcgd',
    parameters: { category: '分类，默认为招生政策' },
    name: '教育部阳光高考信息公开平台招生政策规定',
    maintainers: ['nczitzk'],
    description: `| 招生政策 | 深化考试招生制度改革 | 教育法律法规 |
| -------- | -------------------- | ------------ |
| dnzszc   | zdgg                 | jyflfg       |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = 'dnzszc' } = ctx.req.param();

    const rootUrl = 'https://gaokao.chsi.com.cn';
    const currentUrl = `${rootUrl}/gkxx/zszcgd/${category}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list: DataItem[] = $('.list ul li a')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = $item.attr('href')!;

            return {
                title: $item.text(),
                pubDate: timezone(parseDate($item.prev().text()), 8),
                link: link.includes('http') ? link : `${rootUrl}${link}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.list').html();

                return item;
            })
        )
    );

    return {
        title: `${$('.backb').text()} - 教育部阳光高考信息公开平台`,
        link: currentUrl,
        item: items,
    };
}
