import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category',
    categories: ['traditional-media'],
    example: '/whb/bihui',
    parameters: { category: '文汇报分类名，可在该分类的 URL 中找到（即 https://www.whb.cn/zhuzhan/:category/index.html)' },
    name: '分类',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();

    const base = 'https://www.whb.cn';
    const url = `${base}/zhuzhan/${category}/index.html`;

    const listResponse = await ofetch(url);
    const $ = load(listResponse);

    const categoryName = $('.title_jingpinhui > a').first().text();

    const list = $('.info_jingpinhui')
        .toArray()
        .map((item): DataItem => {
            const title = $(item).find('.title > a');
            return {
                title: title.text(),
                link: `${base}${title.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const dateAndAuthor = $('.content_other').text();
                const dateString = dateAndAuthor.split('\n', 1)[0].slice(3);

                item.author = dateAndAuthor.split(':').at(-1);
                item.description = $('.content_info').html();
                item.pubDate = timezone(parseDate(dateString, 'YYYY年MM月DD日 HH:mm:ss'), 8);

                return item;
            })
        )
    );

    return {
        title: `文汇报 - ${categoryName}`,
        link: url,
        item: items.filter((item) => item.description),
    };
}
