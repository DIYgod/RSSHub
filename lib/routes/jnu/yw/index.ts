import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yw/:type?',
    categories: ['university'],
    example: '/jnu/yw/col2',
    parameters: { type: '栏目，默认为 `col2`' },
    name: '暨南要闻',
    maintainers: ['hang333'],
    handler,
    description: `| 学校要闻 | 综合新闻 | 专题报道 | 深读暨南 | 学者视角 | 学事荟萃 | 媒体暨大 | 教学科研 | 光影暨南 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| col2     | col3     | col4     | col5     | col6     | col7     | col8     | col9     | col11    |`,
};

async function handler(ctx: Context) {
    const { type = 'col2' } = ctx.req.param();

    const link = `https://news.jnu.edu.cn/${type}.html`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('li.list_item')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('h4.news_title a');
            const date = $item
                .find('.news_time')
                .text()
                .match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0];
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, link).href,
                description: $item.find('.news_abstract').text().trim(),
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.article').html() ?? item.description;
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
