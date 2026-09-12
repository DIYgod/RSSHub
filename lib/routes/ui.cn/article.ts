import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/article',
    categories: ['design'],
    example: '/ui.cn/article',
    name: '推荐文章',
    maintainers: ['WenryXu'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.ui.cn';

    const response = await ofetch(`${baseUrl}/`);
    const $ = load(response);

    const list = $('#article .h-article-list li')
        .toArray()
        .map((item) => {
            const a = $(item).find('.ellipsis');
            const link = baseUrl + a.attr('href');
            return {
                title: a.text(),
                link,
                guid: link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch(item.link);
                const $detail = load(detail);

                return {
                    ...item,
                    description: $detail('.exp-content').html(),
                    pubDate: timezone(parseDate($detail('.works-top .time em').text().replaceAll('更新于：', '')), 8),
                };
            })
        )
    );

    return {
        title: '推荐文章 - UI 中国',
        link: `${baseUrl}/`,
        item: items,
    };
}
