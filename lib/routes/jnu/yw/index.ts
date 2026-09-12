import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
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
        .map((item) => {
            const $item = $(item);
            const a = $item.find('h4.news_title a');
            return {
                title: a.text(),
                link: a.attr('href')!,
                description: $item.find('.news_abstract').text().trim(),
                pubDate: timezone(parseDate($item.find('.news_time').text().replace('发布日期：', ''), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.article').html() ?? item.description;
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
